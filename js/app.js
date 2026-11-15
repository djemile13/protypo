/* Πρότυπο Γυμνάσιο: εφαρμογή μελέτης. Απλή εφαρμογή μίας σελίδας, χωρίς εξαρτήσεις. */
(function () {
  "use strict";

  // ---------- Βοηθητικά ----------
  const $ = sel => document.querySelector(sel);
  const app = () => $("#app");
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε"];
  const SUBJ = { math: "Μαθηματικά", greek: "Γλώσσα" };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

  const topicTitle = (subject, t) => {
    const list = subject === "math" ? window.MATH_TOPICS : window.GREEK_TOPICS;
    const f = list.find(x => x.id === t);
    return f ? f.title : t;
  };

  // ---------- Αποθήκευση ----------
  const KEY = "protypo.v1";
  function load() {
    try { return Object.assign({ stats: {}, history: [], mistakes: {}, exam: null }, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (e) { return { stats: {}, history: [], mistakes: {}, exam: null }; }
  }
  let store = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ιδιωτική περιήγηση */ } }

  function record(inst, correct) {
    const k = inst.subject + ":" + inst.t;
    const s = store.stats[k] || (store.stats[k] = { n: 0, ok: 0 });
    s.n++; if (correct) s.ok++;
    if (correct) delete store.mistakes[inst.key];
    else store.mistakes[inst.key] = { ...inst.src, subject: inst.subject, textId: inst.textId || null, key: inst.key };
    save();
  }

  // ---------- Δημιουργία ερωτήσεων ----------
  function makeInstance(src, subject, extra = {}) {
    const order = shuffle(src.c.map((_, i) => i));
    return {
      key: src.key || (src.id && src.id !== "gen" ? subject + ":" + src.id : subject + ":gen:" + hash(src.q)),
      subject, t: src.t, d: src.d || 1, q: src.q, e: src.e,
      choices: order.map(i => src.c[i]), answer: order.indexOf(0),
      textId: extra.textId || src.textId || null, src
    };
  }
  const textById = id => window.GREEK_TEXTS.find(t => t.id === id);
  const textQuestions = txt => txt.questions.map((q, i) => ({ ...q, id: txt.id + "q" + i, textId: txt.id }));

  // ---------- Ύλη που έχει διδαχτεί ----------
  const allTopics = subject => (subject === "math" ? window.MATH_TOPICS : window.GREEK_TOPICS).map(t => t.id);
  const sylList = subject => (store.syllabus && store.syllabus[subject]) || null; // null = όλη η ύλη
  const inSyl = (subject, t) => { const l = sylList(subject); return !l || l.includes(t); };
  const sylCount = subject => { const l = sylList(subject); return l ? l.length : allTopics(subject).length; };
  function genFromSyllabus() {
    for (const t of shuffle(allTopics("math").filter(t => inSyl("math", t)))) {
      const g = window.generateMathQuestion(t);
      if (g) return g;
    }
    return null;
  }

  function mathPool(topic, d) {
    return window.MATH_BANK.filter(q => (!topic || topic === "all" || q.t === topic) && (!d || q.d === d));
  }
  function greekPool(topic, d) {
    const fromTexts = window.GREEK_TEXTS.flatMap(textQuestions);
    return window.GREEK_BANK.concat(fromTexts).filter(q => (!topic || topic === "all" || q.t === topic) && (!d || q.d === d));
  }

  function buildPractice(subject, topic, count = 10) {
    let srcs;
    if (subject === "math") {
      srcs = sample(mathPool(topic), count);
      // συμπλήρωση με τυχαίες ασκήσεις από τις γεννήτριες
      let guard = 0;
      while (srcs.length < count && guard++ < 50) {
        const g = window.generateMathQuestion(topic);
        if (!g) break;
        srcs.push(g);
      }
      if (topic === "all" || !topic) {
        const gen = [1, 2, 3].map(genFromSyllabus).filter(Boolean);
        srcs = shuffle(sample(mathPool("all").filter(q => inSyl("math", q.t)), count - gen.length).concat(gen));
      }
    } else if (topic && topic.startsWith("text:")) {
      srcs = textQuestions(textById(topic.slice(5)));
    } else {
      srcs = sample(topic === "all" ? window.GREEK_BANK.filter(q => inSyl("greek", q.t)) : greekPool(topic), count);
    }
    return srcs.map(s => makeInstance(s, subject));
  }

  function buildExam(mode) {
    const qs = [];
    if (mode === "full" || mode === "greek") {
      // Τα κείμενα κατανόησης μπαίνουν μόνο αν η «Κατανόηση κειμένου» είναι στην ύλη.
      const texts = inSyl("greek", "comprehension") ? sample(window.GREEK_TEXTS, 2) : [];
      const tq = texts.flatMap(textQuestions);
      const d1 = tq.filter(q => q.d === 1).length;
      const need1 = Math.max(0, 10 - d1), need2 = Math.max(0, 10 - (tq.length - d1));
      const bank = window.GREEK_BANK.filter(q => inSyl("greek", q.t));
      const g = sample(bank.filter(q => q.d === 1), need1).concat(sample(bank.filter(q => q.d === 2), need2));
      tq.concat(g).forEach(s => qs.push(makeInstance(s, "greek")));
    }
    if (mode === "full" || mode === "math") {
      const pool = mathPool("all").filter(q => inSyl("math", q.t));
      const gen = [0, 1, 2].map(genFromSyllabus).filter(Boolean);
      const a = sample(pool.filter(q => q.d === 1), 10 - gen.length).concat(gen);
      // Αν η ύλη έχει λίγες ερωτήσεις Ομάδας Α, συμπληρώνουμε με νέες από τις γεννήτριες.
      for (let k = 0; a.length < 10 && k < 30; k++) { const x = genFromSyllabus(); if (!x) break; if (!a.some(y => y.q === x.q)) a.push(x); }
      const b = sample(pool.filter(q => q.d === 2), 10);
      a.concat(b).forEach(s => qs.push(makeInstance(s, "math")));
    }
    // Χρόνος: 75΄ ανά 20 ερωτήσεις, αναλογικά αν η ύλη δίνει λιγότερες.
    const full = mode === "full" ? 40 : 20;
    const minutes = qs.length >= full ? full * 3.75 : Math.max(10, Math.round((qs.length * 3.75) / 5) * 5);
    return { mode, qs, answers: qs.map(() => null), flags: qs.map(() => false), cur: 0, start: Date.now(), end: Date.now() + minutes * 60000, minutes };
  }
  const points = inst => (inst.d === 2 ? 3 : 2);

  // ---------- Απόδοση ερωτήσεων ----------
  function choiceList(inst, chosen, reveal, name) {
    return `<div class="choices" role="radiogroup">` + inst.choices.map((c, i) => {
      let cls = "choice";
      if (chosen === i) cls += " chosen";
      if (reveal) { if (i === inst.answer) cls += " correct"; else if (chosen === i) cls += " wrong"; }
      return `<button class="${cls}" data-${name}="${i}" ${reveal ? "disabled" : ""} role="radio" aria-checked="${chosen === i}"><span class="letter">${LETTERS[i]}</span><span>${c}</span></button>`;
    }).join("") + `</div>`;
  }
  function textPanel(textId, open = true) {
    const t = textById(textId);
    if (!t) return "";
    return `<details class="text-panel" ${open ? "open" : ""}><summary>📖 Κείμενο: «${t.title}» <small>(${t.type})</small></summary><div class="text-body">${t.html}</div></details>`;
  }

  // ---------- Σελίδες ----------
  function nav(active) {
    document.querySelectorAll(".topnav a").forEach(a => a.classList.toggle("active", a.dataset.nav === active));
  }

  function home() {
    nav("home");
    const hist = store.history;
    const last = hist[hist.length - 1];
    const totals = Object.values(store.stats).reduce((a, s) => ({ n: a.n + s.n, ok: a.ok + s.ok }), { n: 0, ok: 0 });
    const mistakes = Object.keys(store.mistakes).length;
    app().innerHTML = `
<section class="hero">
  <h1>Προετοιμασία για το Πρότυπο Γυμνάσιο</h1>
  <p>Θεωρία, ασκήσεις με λύσεις και προσομοιώσεις εξετάσεων σε <b>Μαθηματικά</b> και <b>Γλώσσα</b>.</p>
  <div class="stats-row">
    <div class="stat"><b>${totals.n}</b><span>απαντήσεις</span></div>
    <div class="stat"><b>${totals.n ? Math.round((100 * totals.ok) / totals.n) + "%" : "–"}</b><span>επιτυχία</span></div>
    <div class="stat"><b>${hist.length}</b><span>προσομοιώσεις</span></div>
    <div class="stat"><b>${last ? last.score + "/" + last.max : "–"}</b><span>τελευταία</span></div>
  </div>
</section>
${store.exam ? `<a class="banner" href="#/exam/run">⏱️ Έχεις μια προσομοίωση σε εξέλιξη. Συνέχισε!</a>` : ""}
${store.official ? `<a class="banner" href="#/past/${store.official.year}">⏱️ Έχεις μισοτελειωμένα θέματα. Συνέχισε!</a>` : ""}
<div class="grid">
  <a class="card math" href="#/learn/math"><div class="ic">📐</div><h3>Θεωρία Μαθηματικών</h3><p>10 ενότητες με κανόνες και λυμένα παραδείγματα</p></a>
  <a class="card greek" href="#/learn/greek"><div class="ic">📚</div><h3>Θεωρία Γλώσσας</h3><p>Κατανόηση κειμένου, γραμματική, σύνταξη, λεξιλόγιο</p></a>
  <a class="card" href="#/practice"><div class="ic">✏️</div><h3>Εξάσκηση</h3><p>Ασκήσεις ανά ενότητα, με άμεση διόρθωση και λύση</p></a>
  <a class="card exam" href="#/exam"><div class="ic">⏱️</div><h3>Προσομοίωση εξέτασης</h3><p>40 ερωτήσεις, 150 λεπτά, όπως στις πραγματικές εξετάσεις</p></a>
  <a class="card" href="#/mistakes"><div class="ic">🔁</div><h3>Τα λάθη μου</h3><p>${mistakes ? mistakes + " ερωτήσεις για επανάληψη" : "Εδώ θα μαζεύονται οι ερωτήσεις που έχασες"}</p></a>
  <a class="card" href="#/progress"><div class="ic">📊</div><h3>Η πρόοδός μου</h3><p>Επιτυχία ανά ενότητα και ιστορικό προσομοιώσεων</p></a>
  <a class="card" href="#/past"><div class="ic">🗂️</div><h3>Παλιά & ενδεικτικά θέματα</h3><p>Τα επίσημα θέματα 2020–2025 και 15 ενδεικτικά διαγωνίσματα, με χρονόμετρο και αυτόματη διόρθωση</p></a>
  <a class="card" href="#/syllabus"><div class="ic">📋</div><h3>Η ύλη μου</h3><p>${sylCount("math") === allTopics("math").length && sylCount("greek") === allTopics("greek").length ? "Διάλεξε μόνο τις ενότητες που έχεις διδαχτεί" : sylCount("math") + " ενότητες Μαθηματικών και " + sylCount("greek") + " Γλώσσας"}</p></a>
  <a class="card" href="#/learn/math/tips"><div class="ic">💡</div><h3>Πώς είναι η εξέταση</h3><p>Δομή, βαθμολόγηση και στρατηγικές</p></a>
</div>`;
  }

  function learnList(subject) {
    nav(subject);
    const lessons = subject === "math" ? window.MATH_LESSONS : window.GREEK_LESSONS;
    app().innerHTML = `<h1>${subject === "math" ? "📐 Θεωρία Μαθηματικών" : "📚 Θεωρία Γλώσσας"}</h1>
<div class="list">${Object.entries(lessons).map(([id, l], i) => `<a class="list-item" href="#/learn/${subject}/${id}"><span class="num">${i + 1}</span><span>${l.title}</span><span class="arrow">›</span></a>`).join("")}</div>`;
  }

  function lesson(subject, id) {
    nav(subject);
    const lessons = subject === "math" ? window.MATH_LESSONS : window.GREEK_LESSONS;
    const l = lessons[id];
    if (!l) return notFound();
    const ids = Object.keys(lessons);
    const idx = ids.indexOf(id);
    const topics = (subject === "math" ? window.MATH_TOPICS : window.GREEK_TOPICS).map(t => t.id);
    const practiceTopic = topics.includes(id) ? id : (id === "textTypes" ? "comprehension" : null);
    app().innerHTML = `<a class="back" href="#/learn/${subject}">‹ ${SUBJ[subject]}: όλες οι ενότητες</a>
<article class="lesson"><h1>${l.title}</h1>${l.html}</article>
<div class="actions">
  ${practiceTopic ? `<a class="btn primary" href="#/practice/${subject}/${practiceTopic}">✏️ Εξάσκηση σε αυτή την ενότητα</a>` : `<a class="btn primary" href="#/exam">⏱️ Κάνε μια προσομοίωση</a>`}
  ${idx < ids.length - 1 ? `<a class="btn" href="#/learn/${subject}/${ids[idx + 1]}">Επόμενη ενότητα ›</a>` : ""}
</div>`;
    window.scrollTo(0, 0);
  }

  function practiceMenu() {
    nav("practice");
    const count = (subject, t) => (subject === "math" ? mathPool(t).length : greekPool(t).length);
    const acc = (subject, t) => { const s = store.stats[subject + ":" + t]; return s && s.n ? `<span class="pct ${s.ok / s.n >= 0.7 ? "good" : s.ok / s.n >= 0.5 ? "mid" : "bad"}">${Math.round((100 * s.ok) / s.n)}%</span>` : ""; };
    app().innerHTML = `<h1>✏️ Εξάσκηση</h1>
<p class="muted">Διάλεξε ενότητα. Κάθε σειρά έχει έως 10 ερωτήσεις. Μετά από κάθε απάντηση βλέπεις αμέσως αν ήταν σωστή και τη λύση.</p>
${sylSummary()}
<div class="two-col">
  <section>
    <h2>📐 Μαθηματικά</h2>
    <div class="list">
      <a class="list-item hl" href="#/practice/math/all"><span>🎲 Ανάμεικτες ερωτήσεις</span><span class="arrow">›</span></a>
      ${window.MATH_TOPICS.map(t => `<a class="list-item${inSyl("math", t.id) ? "" : " off"}" href="#/practice/math/${t.id}"><span>${t.title}${inSyl("math", t.id) ? "" : " <small>(εκτός ύλης)</small>"}</span><small>${count("math", t.id)}+</small>${acc("math", t.id)}<span class="arrow">›</span></a>`).join("")}
    </div>
  </section>
  <section>
    <h2>📚 Γλώσσα</h2>
    <h3>Κατανόηση κειμένου</h3>
    <div class="list">
      ${window.GREEK_TEXTS.map(t => `<a class="list-item" href="#/practice/greek/text:${t.id}"><span>«${t.title}»<br><small>${t.type}</small></span><span class="arrow">›</span></a>`).join("")}
    </div>
    <h3>Γραμματική & λεξιλόγιο</h3>
    <div class="list">
      <a class="list-item hl" href="#/practice/greek/all"><span>🎲 Ανάμεικτες ερωτήσεις</span><span class="arrow">›</span></a>
      ${window.GREEK_TOPICS.filter(t => t.id !== "comprehension").map(t => `<a class="list-item${inSyl("greek", t.id) ? "" : " off"}" href="#/practice/greek/${t.id}"><span>${t.title}${inSyl("greek", t.id) ? "" : " <small>(εκτός ύλης)</small>"}</span><small>${count("greek", t.id)}</small>${acc("greek", t.id)}<span class="arrow">›</span></a>`).join("")}
    </div>
  </section>
</div>`;
  }

  // ---------- Εξάσκηση (μία ερώτηση τη φορά) ----------
  let session = null;
  function startPractice(subject, topic, preset) {
    const qs = preset || buildPractice(subject, topic);
    if (!qs.length) return notFound();
    let title;
    if (preset) title = "Επανάληψη λαθών";
    else if (topic.startsWith("text:")) title = "«" + textById(topic.slice(5)).title + "»";
    else title = topic === "all" ? SUBJ[subject] + ": ανάμεικτες" : topicTitle(subject, topic);
    session = { subject, topic, qs, i: 0, chosen: null, results: [], title, again: preset ? "#/mistakes" : "#/practice/" + subject + "/" + topic };
    renderPractice();
  }
  function renderPractice() {
    nav("practice");
    const s = session, inst = s.qs[s.i];
    const revealed = s.chosen !== null;
    const correct = revealed && s.chosen === inst.answer;
    const hasText = !!inst.textId;
    app().innerHTML = `<div class="practice-head"><a class="back" href="#/practice">‹ Εξάσκηση</a><span>${s.title}</span><span class="counter">${s.i + 1} / ${s.qs.length}</span></div>
<div class="progressbar"><div style="width:${(100 * s.i) / s.qs.length}%"></div></div>
<div class="${hasText ? "with-text" : ""}">
  ${hasText ? textPanel(inst.textId, true) : ""}
  <div class="qcard">
    <div class="qmeta">${inst.subject === "math" ? "📐" : "📚"} ${topicTitle(inst.subject, inst.t)} · ${inst.d === 2 ? "Ομάδα Β" : "Ομάδα Α"}</div>
    <div class="qtext">${inst.q}</div>
    ${choiceList(inst, s.chosen, revealed, "pick")}
    ${revealed ? `<div class="feedback ${correct ? "ok" : "no"}"><b>${correct ? "✅ Σωστά!" : "❌ Όχι ακριβώς. Η σωστή απάντηση είναι η " + LETTERS[inst.answer] + "."}</b><p>${inst.e}</p></div>
    <div class="actions"><button class="btn primary" id="next">${s.i < s.qs.length - 1 ? "Επόμενη ›" : "Αποτελέσματα"}</button></div>` : ""}
  </div>
</div>`;
    app().querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => {
      if (s.chosen !== null) return;
      s.chosen = +b.dataset.pick;
      const ok = s.chosen === inst.answer;
      s.results.push(ok);
      record(inst, ok);
      renderPractice();
      const fb = app().querySelector(".feedback"); if (fb) fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
    const nx = $("#next");
    if (nx) nx.addEventListener("click", () => { if (s.i < s.qs.length - 1) { s.i++; s.chosen = null; renderPractice(); window.scrollTo(0, 0); } else practiceDone(); });
  }
  function practiceDone() {
    const s = session, ok = s.results.filter(Boolean).length, n = s.results.length;
    const pct = n ? Math.round((100 * ok) / n) : 0;
    app().innerHTML = `<div class="result-card">
  <div class="big">${ok} / ${n}</div>
  <p>${pct >= 90 ? "🌟 Εξαιρετικά!" : pct >= 70 ? "👏 Πολύ καλά!" : pct >= 50 ? "💪 Καλή προσπάθεια, συνέχισε!" : "📖 Ξαναδιάβασε τη θεωρία και δοκίμασε πάλι."}</p>
  <div class="actions center">
    <a class="btn primary" href="${s.again}" id="again">🔄 Νέα σειρά</a>
    <a class="btn" href="#/practice">Άλλη ενότητα</a>
    ${s.subject && s.topic && !s.topic.startsWith("text:") && s.topic !== "all" ? `<a class="btn" href="#/learn/${s.subject}/${s.topic}">📖 Θεωρία</a>` : ""}
  </div>
</div>`;
    $("#again").addEventListener("click", e => { e.preventDefault(); if (location.hash === s.again) route(); else location.hash = s.again; });
  }

  // ---------- Προσομοίωση ----------
  function examMenu() {
    nav("exam");
    app().innerHTML = `<h1>⏱️ Προσομοίωση εξέτασης</h1>
<p class="muted">Οι προσομοιώσεις ακολουθούν τη δομή των εξετάσεων: σε κάθε μάθημα 10 ερωτήσεις Ομάδας Α (2 μονάδες) και 10 ερωτήσεις Ομάδας Β (3 μονάδες, πιο απαιτητικές). Οι απαντήσεις και οι λύσεις εμφανίζονται στο τέλος.</p>
${store.exam ? `<a class="banner" href="#/exam/run">⏱️ Έχεις μια προσομοίωση σε εξέλιξη. Συνέχισε!</a>` : ""}
${sylSummary()}
<div class="grid">
  <button class="card exam" data-mode="full"><div class="ic">🎓</div><h3>Πλήρης εξέταση</h3><p>40 ερωτήσεις (20 Γλώσσα + 20 Μαθηματικά)<br><b>150 λεπτά · 100 μονάδες</b></p></button>
  <button class="card math" data-mode="math"><div class="ic">📐</div><h3>Μόνο Μαθηματικά</h3><p>20 ερωτήσεις<br><b>75 λεπτά · 50 μονάδες</b></p></button>
  <button class="card greek" data-mode="greek"><div class="ic">📚</div><h3>Μόνο Γλώσσα</h3><p>2 κείμενα + 10 ερωτήσεις γραμματικής<br><b>75 λεπτά · 50 μονάδες</b></p></button>
</div>
<div class="note"><b>Συμβουλές:</b> Βρες ένα ήσυχο μέρος, έχε πρόχειρο χαρτί και μολύβι και μη χρησιμοποιήσεις κομπιουτεράκι. Αν κολλήσεις σε μια ερώτηση, σημείωσέ την με 🚩 και γύρνα αργότερα.</div>`;
    app().querySelectorAll("[data-mode]").forEach(b => {
      const m = b.dataset.mode;
      if ((m !== "greek" && !sylCount("math")) || (m !== "math" && !sylCount("greek"))) { b.disabled = true; b.title = "Δεν έχει επιλεγεί ύλη"; }
    });
    app().querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
      if (store.exam && !confirmInline(b, "Θα χαθεί η προσομοίωση που είναι σε εξέλιξη. Πάτα ξανά για επιβεβαίωση.")) return;
      store.exam = buildExam(b.dataset.mode); save();
      location.hash = "#/exam/run";
    }));
  }
  function confirmInline(el, msg) {
    if (el.dataset.confirm === "1") return true;
    el.dataset.confirm = "1";
    const p = document.createElement("p"); p.className = "warn"; p.textContent = msg; el.appendChild(p);
    return false;
  }

  let timer = null;
  function fmtTime(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h ? h + ":" : "") + String(m).padStart(h ? 2 : 1, "0") + ":" + String(ss).padStart(2, "0");
  }
  function examRun() {
    nav("exam");
    const ex = store.exam;
    if (!ex) { location.hash = "#/exam"; return; }
    if (Date.now() >= ex.end) return submitExam(true);
    const inst = ex.qs[ex.cur];
    const answered = ex.answers.filter(a => a !== null).length;
    const hasText = !!inst.textId;
    const section = inst.subject === "greek" ? "Γλώσσα" : "Μαθηματικά";
    app().innerHTML = `<div class="exam-bar">
  <span class="timer" id="timer">⏱️ ${fmtTime(ex.end - Date.now())}</span>
  <span>Απαντήθηκαν: <b>${answered}/${ex.qs.length}</b></span>
  <button class="btn small danger" id="submit">Παράδοση</button>
</div>
<div class="qgrid">${ex.qs.map((q, i) => `<button class="qnum ${i === ex.cur ? "cur" : ""} ${ex.answers[i] !== null ? "done" : ""} ${ex.flags[i] ? "flag" : ""} ${q.subject}" data-go="${i}" title="${SUBJ[q.subject]}">${i + 1}</button>`).join("")}</div>
<div id="confirm"></div>
<div class="${hasText ? "with-text" : ""}">
  ${hasText ? textPanel(inst.textId, true) : ""}
  <div class="qcard">
    <div class="qmeta">Ερώτηση ${ex.cur + 1} · ${section} · ${inst.d === 2 ? "Ομάδα Β · 3 μονάδες" : "Ομάδα Α · 2 μονάδες"}</div>
    <div class="qtext">${inst.q}</div>
    ${choiceList(inst, ex.answers[ex.cur], false, "ans")}
    <div class="actions spread">
      <button class="btn" id="prev" ${ex.cur === 0 ? "disabled" : ""}>‹ Προηγούμενη</button>
      <button class="btn ${ex.flags[ex.cur] ? "flagged" : ""}" id="flag">🚩 ${ex.flags[ex.cur] ? "Σημειωμένη" : "Σημείωση"}</button>
      <button class="btn primary" id="nextq" ${ex.cur === ex.qs.length - 1 ? "disabled" : ""}>Επόμενη ›</button>
    </div>
  </div>
</div>`;
    const go = i => { ex.cur = i; save(); examRun(); window.scrollTo(0, 0); };
    app().querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(+b.dataset.go)));
    app().querySelectorAll("[data-ans]").forEach(b => b.addEventListener("click", () => {
      const v = +b.dataset.ans;
      ex.answers[ex.cur] = ex.answers[ex.cur] === v ? null : v; save(); examRun();
    }));
    $("#prev").addEventListener("click", () => go(ex.cur - 1));
    $("#nextq").addEventListener("click", () => go(ex.cur + 1));
    $("#flag").addEventListener("click", () => { ex.flags[ex.cur] = !ex.flags[ex.cur]; save(); examRun(); });
    $("#submit").addEventListener("click", () => {
      const left = ex.qs.length - answered;
      $("#confirm").innerHTML = `<div class="confirm">${left ? `Έχεις αφήσει <b>${left}</b> ερωτήσεις αναπάντητες. ` : ""}Θέλεις σίγουρα να παραδώσεις;
<button class="btn small danger" id="yes">Ναι, παράδοση</button> <button class="btn small" id="no">Όχι, συνεχίζω</button></div>`;
      $("#yes").addEventListener("click", () => submitExam(false));
      $("#no").addEventListener("click", () => { $("#confirm").innerHTML = ""; });
    });
    clearInterval(timer);
    timer = setInterval(() => {
      const el = $("#timer");
      if (!el || !store.exam) { clearInterval(timer); return; }
      const left = store.exam.end - Date.now();
      el.textContent = "⏱️ " + fmtTime(left);
      el.classList.toggle("low", left < 10 * 60000);
      if (left <= 0) { clearInterval(timer); submitExam(true); }
    }, 1000);
  }

  function submitExam(timeUp) {
    clearInterval(timer);
    const ex = store.exam;
    if (!ex) return;
    const by = { math: { s: 0, m: 0, ok: 0, n: 0 }, greek: { s: 0, m: 0, ok: 0, n: 0 } };
    ex.qs.forEach((inst, i) => {
      const b = by[inst.subject], p = points(inst), ok = ex.answers[i] === inst.answer;
      b.m += p; b.n++;
      if (ok) { b.s += p; b.ok++; }
      record(inst, ok);
    });
    const score = by.math.s + by.greek.s, max = by.math.m + by.greek.m;
    const entry = { date: Date.now(), mode: ex.mode, score, max, math: by.math.m ? by.math.s : null, greek: by.greek.m ? by.greek.s : null, mins: Math.round((Math.min(Date.now(), ex.end) - ex.start) / 60000) };
    store.history.push(entry);
    store.lastExam = { ...ex, timeUp, entry };
    store.exam = null;
    save();
    location.hash = "#/exam/result";
    if (location.hash === "#/exam/result") examResult();
  }

  function examResult() {
    nav("exam");
    const r = store.lastExam;
    if (!r) { location.hash = "#/exam"; return; }
    const e = r.entry;
    const topics = {};
    r.qs.forEach((inst, i) => {
      const k = inst.subject + ":" + inst.t;
      const t = topics[k] || (topics[k] = { subject: inst.subject, t: inst.t, ok: 0, n: 0 });
      t.n++; if (r.answers[i] === inst.answer) t.ok++;
    });
    const weak = Object.values(topics).filter(t => t.ok / t.n < 0.6).sort((a, b) => a.ok / a.n - b.ok / b.n);
    let lastText = null;
    app().innerHTML = `<div class="result-card">
  ${r.timeUp ? `<p class="warn">⏰ Ο χρόνος τελείωσε και η εξέταση παραδόθηκε αυτόματα.</p>` : ""}
  <div class="big">${e.score} <small>/ ${e.max}</small></div>
  <div class="stats-row">
    ${e.greek !== null ? `<div class="stat"><b>${e.greek}/50</b><span>Γλώσσα</span></div>` : ""}
    ${e.math !== null ? `<div class="stat"><b>${e.math}/50</b><span>Μαθηματικά</span></div>` : ""}
    <div class="stat"><b>${e.mins}΄</b><span>χρόνος</span></div>
  </div>
  ${weak.length ? `<p><b>Ενότητες για επανάληψη:</b> ${weak.map(t => `<a href="#/learn/${t.subject}/${t.t}">${topicTitle(t.subject, t.t)}</a> (${t.ok}/${t.n})`).join(", ")}</p>` : `<p>🌟 Καμία αδύναμη ενότητα σε αυτή την προσομοίωση!</p>`}
  <div class="actions center"><a class="btn primary" href="#/exam">Νέα προσομοίωση</a><a class="btn" href="#/mistakes">🔁 Τα λάθη μου</a></div>
</div>
<h2>Αναλυτική διόρθωση</h2>
<div class="review">${r.qs.map((inst, i) => {
      const a = r.answers[i], ok = a === inst.answer;
      let head = "";
      if (inst.textId && inst.textId !== lastText) { head = textPanel(inst.textId, false); }
      lastText = inst.textId;
      return `${head}<div class="qcard review-item ${ok ? "ok" : "no"}">
  <div class="qmeta">${i + 1}. ${SUBJ[inst.subject]} · ${topicTitle(inst.subject, inst.t)} · ${ok ? "✅ +" + points(inst) : a === null ? "⚪ Αναπάντητη" : "❌ 0"}</div>
  <div class="qtext">${inst.q}</div>
  ${choiceList(inst, a, true, "x")}
  <div class="feedback ${ok ? "ok" : "no"}"><p>${inst.e}</p></div>
</div>`;
    }).join("")}</div>`;
    window.scrollTo(0, 0);
  }

  // ---------- Λάθη, πρόοδος, παλιά θέματα ----------
  function mistakes() {
    nav("mistakes");
    const list = Object.values(store.mistakes);
    app().innerHTML = `<h1>🔁 Τα λάθη μου</h1>
${list.length ? `<p class="muted">Έχεις ${list.length} ερωτήσεις που απάντησες λάθος. Όταν απαντήσεις σωστά μια ερώτηση, φεύγει από τη λίστα.</p>
<div class="actions"><button class="btn primary" id="redo">✏️ Εξάσκηση στα λάθη (έως 10)</button></div>
<div class="list">${list.map(q => `<div class="list-item static"><span>${q.subject === "math" ? "📐" : "📚"}</span><span>${q.q.replace(/<[^>]+>/g, " ").slice(0, 120)}${q.q.length > 120 ? "…" : ""}</span><small>${topicTitle(q.subject, q.t)}</small></div>`).join("")}</div>`
        : `<div class="empty">🎉 Δεν έχεις λάθη για επανάληψη. Κάνε μια <a href="#/practice">εξάσκηση</a> ή μια <a href="#/exam">προσομοίωση</a>!</div>`}`;
    const b = $("#redo");
    if (b) b.addEventListener("click", () => {
      const qs = sample(list, 10).map(q => makeInstance(q, q.subject, { textId: q.textId }));
      startPractice(null, null, qs);
    });
  }

  function progress() {
    nav("progress");
    const row = (subject, t) => {
      const s = store.stats[subject + ":" + t.id];
      if (!s || !s.n) return `<tr><td>${t.title}</td><td>–</td><td><div class="bar"><div style="width:0"></div></div></td></tr>`;
      const p = Math.round((100 * s.ok) / s.n);
      return `<tr><td><a href="#/practice/${subject}/${t.id}">${t.title}</a></td><td>${s.ok}/${s.n}</td><td><div class="bar ${p >= 70 ? "good" : p >= 50 ? "mid" : "bad"}"><div style="width:${p}%"></div><span>${p}%</span></div></td></tr>`;
    };
    const modeName = { full: "Πλήρης", math: "Μαθηματικά", greek: "Γλώσσα" };
    app().innerHTML = `<h1>📊 Η πρόοδός μου</h1>
<div class="two-col">
<section><h2>📐 Μαθηματικά</h2><table class="tbl prog"><tr><th>Ενότητα</th><th>Σωστές</th><th>Επιτυχία</th></tr>${window.MATH_TOPICS.map(t => row("math", t)).join("")}</table></section>
<section><h2>📚 Γλώσσα</h2><table class="tbl prog"><tr><th>Ενότητα</th><th>Σωστές</th><th>Επιτυχία</th></tr>${window.GREEK_TOPICS.map(t => row("greek", t)).join("")}</table></section>
</div>
<h2>Ιστορικό προσομοιώσεων</h2>
${store.history.length ? `<table class="tbl"><tr><th>Ημερομηνία</th><th>Είδος</th><th>Γλώσσα</th><th>Μαθ.</th><th>Σύνολο</th><th>Χρόνος</th></tr>
${store.history.slice().reverse().map(h => `<tr><td>${new Date(h.date).toLocaleDateString("el-GR")}</td><td>${modeName[h.mode] || (h.mode.startsWith("past") ? ((pastByYear(h.mode.slice(4)) || {}).title || h.mode.slice(4)) : h.mode)}</td><td>${h.greek ?? "–"}</td><td>${h.math ?? "–"}</td><td><b>${h.score}/${h.max}</b></td><td>${h.mins}΄</td></tr>`).join("")}</table>` : `<p class="muted">Δεν έχεις κάνει ακόμη προσομοίωση.</p>`}
<div class="actions"><button class="btn small danger" id="reset">Διαγραφή όλης της προόδου</button></div>`;
    $("#reset").addEventListener("click", e => {
      if (!confirmInline(e.currentTarget, "Πάτα ξανά για να διαγραφούν όλα τα στατιστικά, τα λάθη και το ιστορικό.")) return;
      store = { stats: {}, history: [], mistakes: {}, exam: null, official: null }; save(); progress();
    });
  }

  // ---------- Επίσημα θέματα προηγούμενων ετών ----------
  const allPast = () => (window.PAST_EXAMS || []).concat(window.SAMPLE_EXAMS || []);
  const pastByYear = y => allPast().find(e => String(e.year) === String(y));
  const isGroupB = (ex, n) => (ex.groupB || []).some(([a, b]) => n >= a && n <= b);
  const pastPoints = (ex, n) => (ex.groupB ? (isGroupB(ex, n) ? 3 : 2) : 2);
  const pastChoices = (ex, n) => (ex.groupB && isGroupB(ex, n) ? 5 : 4);
  const graded = (ex, i) => ex.key[i] !== "-";
  const isRight = (ex, a, i) => a !== null && LETTERS[a] === ex.key[i];
  const range = (a, b) => (b < a ? [] : Array.from({ length: b - a + 1 }, (_, i) => a + i));
  const pagesHtml = ex => range(1, ex.pages).map(p => `<img src="past/${ex.year}/page${p}.jpg" alt="${ex.title}, σελίδα ${p}" loading="lazy">`).join("");

  function past() {
    nav("past");
    const done = y => store.history.filter(h => h.mode === "past" + y);
    const best = e => { const h = done(e.year); return h.length ? `<p><b>Καλύτερη επίδοση: ${Math.max(...h.map(x => x.score))}/100</b> (${h.length} ${h.length === 1 ? "φορά" : "φορές"})</p>` : ""; };
    const links = [
      ["Όλα τα θέματα (σελίδα ΔΕΠΠΣ)", "https://depps.minedu.gov.gr/?page_id=7669"],
      ["Ενδεικτικά θέματα 2021", "https://depps.minedu.gov.gr/?page_id=10245"],
      ["Ενδεικτικά θέματα 2020", "https://depps.minedu.gov.gr/?page_id=9705"]
    ];
    const sampleRow = e => {
      const h = done(e.year), b = h.length ? Math.max(...h.map(x => x.score)) : null;
      return `<a class="list-item" href="#/past/${e.year}"><span>${e.title}<br><small>${e.total} ερωτήσεις · ~${e.minutes}΄${e.keySource === "app" ? " · λύσεις της εφαρμογής" : ""}</small></span>${b !== null ? `<span class="pct ${b >= 70 ? "good" : b >= 50 ? "mid" : "bad"}">${b}/100</span>` : ""}<span class="arrow">›</span></a>`;
    };
    const S = window.SAMPLE_EXAMS || [];
    app().innerHTML = `<h1>🗂️ Παλιά θέματα</h1>
<p class="muted">Τα επίσημα θέματα των εξετάσεων για τα Πρότυπα Γυμνάσια, όπως τα δημοσίευσε η ΔΕΠΠΣ του Υπουργείου Παιδείας. Λύσε τα στην εφαρμογή με χρονόμετρο: βλέπεις τις σελίδες των θεμάτων, συμπληρώνεις το φύλλο απαντήσεων και στο τέλος η εφαρμογή τα διορθώνει.</p>
${store.official ? `<a class="banner" href="#/past/${store.official.year}">⏱️ Έχεις μισοτελειωμένα θέματα: ${(pastByYear(store.official.year) || {}).title}. Συνέχισε!</a>` : ""}
<h2>Επίσημες εξετάσεις</h2>
<div class="grid">${window.PAST_EXAMS.map(e => `<div class="card exam past-card">
  <h3>📝 ${e.title}</h3>
  <p>${e.note}</p>
  ${best(e)}
  <div class="actions"><a class="btn primary small" href="#/past/${e.year}">Λύσε τα θέματα</a>
  <a class="btn small" href="past/${e.year}/themata-${e.year}.pdf" target="_blank" rel="noopener">PDF θεμάτων</a>
  <a class="btn small" href="past/${e.year}/apantiseis-${e.year}.pdf" target="_blank" rel="noopener">PDF απαντήσεων</a></div>
</div>`).join("")}</div>
${S.length ? `<h2>Ενδεικτικά θέματα</h2>
<p class="muted">Μικρότερα διαγωνίσματα για εξάσκηση ανά μάθημα. Όπου το έγγραφο δεν είχε απαντήσεις, τις έχει γράψει η εφαρμογή και σημειώνεται «λύσεις της εφαρμογής». Ερωτήσεις με περισσότερες από μία σωστές απαντήσεις δεν βαθμολογούνται.</p>
<div class="two-col">
  <section><h3>📚 Γλώσσα</h3><div class="list">${S.filter(e => e.subject === "greek").map(sampleRow).join("")}</div></section>
  <section><h3>📐 Μαθηματικά</h3><div class="list">${S.filter(e => e.subject === "math").map(sampleRow).join("")}</div></section>
</div>` : ""}
<h2>Στον ιστότοπο του Υπουργείου</h2>
<div class="list">${links.map(([t, u]) => `<a class="list-item" href="${u}" target="_blank" rel="noopener"><span>📄 ${t}</span><span class="arrow">↗</span></a>`).join("")}</div>`;
  }

  function pastSetup(year) {
    nav("past");
    const ex = pastByYear(year);
    if (!ex) return notFound();
    if (store.official && String(store.official.year) === String(year)) return pastRun();
    const order = ex.sample
      ? `Έχει ${ex.total} ερωτήσεις ${ex.subject === "greek" ? "Γλώσσας" : "Μαθηματικών"}.`
      : `Πρώτα είναι οι ερωτήσεις Γλώσσας (1–${ex.greek}) και μετά των Μαθηματικών (${ex.greek + 1}–${ex.total}).`;
    const times = ex.sample ? [ex.minutes, 0] : [150, 120, 0];
    app().innerHTML = `<a class="back" href="#/past">‹ Παλιά θέματα</a>
<h1>📝 ${ex.title}</h1>
${ex.note ? `<p>${ex.note}</p>` : ""}
<p class="muted">${order} Διάβασε τα θέματα στις σελίδες και σημείωσε την απάντησή σου στο φύλλο απαντήσεων.</p>
${ex.keySource === "app" ? `<p class="note">Το έγγραφο δεν είχε απαντήσεις, οπότε τις έγραψε η εφαρμογή. ${ex.key.includes("-") ? "Οι ερωτήσεις που μπορούν να έχουν δύο σωστές απαντήσεις δεν βαθμολογούνται." : ""}</p>` : ""}
${store.official ? `<p class="warn">Έχεις ήδη άλλα θέματα σε εξέλιξη. Αν ξεκινήσεις αυτά, θα χαθούν.</p>` : ""}
<div class="actions">${times.map((m, i) => `<button class="btn ${i === 0 ? "primary" : ""}" data-min="${m}">${m ? `⏱️ Με χρονόμετρο ${m} λεπτών` : "Χωρίς χρονόμετρο"}</button>`).join("")}</div>`;
    app().querySelectorAll("[data-min]").forEach(b => b.addEventListener("click", () => {
      const m = +b.dataset.min;
      store.official = { year: ex.year, answers: Array(ex.total).fill(null), start: Date.now(), end: m ? Date.now() + m * 60000 : null };
      save(); pastRun();
    }));
  }

  function pastRun() {
    nav("past");
    const st = store.official, ex = pastByYear(st.year);
    if (!ex) { store.official = null; save(); return past(); }
    if (st.end && Date.now() >= st.end) return pastSubmit(true);
    const answered = st.answers.filter(a => a !== null).length;
    const row = n => {
      const k = pastChoices(ex, n), a = st.answers[n - 1];
      return `<div class="sheet-row" id="sr${n}"><span class="sheet-n">${n}</span>${LETTERS.slice(0, k).map((L, i) => `<button class="bubble ${a === i ? "on" : ""}" data-q="${n}" data-l="${i}" aria-label="Ερώτηση ${n}, ${L}">${L}</button>`).join("")}</div>`;
    };
    const sections = [];
    if (ex.greek) sections.push(`<h3>📚 Γλώσσα</h3>${range(1, ex.greek).map(row).join("")}`);
    if (ex.total > ex.greek) sections.push(`<h3>📐 Μαθηματικά</h3>${range(ex.greek + 1, ex.total).map(row).join("")}`);
    app().innerHTML = `<div class="exam-bar">
  <span class="timer" id="timer">${st.end ? "⏱️ " + fmtTime(st.end - Date.now()) : ex.title}</span>
  <span>Απαντήθηκαν: <b id="cnt">${answered}/${ex.total}</b></span>
  <button class="btn small danger" id="submit">Παράδοση</button>
</div>
<div id="confirm"></div>
<div class="past-layout">
  <div class="pages">${pagesHtml(ex)}</div>
  <aside class="sheet" id="sheet">
    <button class="sheet-toggle" id="sheetToggle">📝 Φύλλο απαντήσεων <span id="cnt2">${answered}/${ex.total}</span></button>
    <div class="sheet-body">${sections.join("")}</div>
  </aside>
</div>`;
    app().querySelectorAll(".bubble").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.q, l = +b.dataset.l;
      st.answers[n - 1] = st.answers[n - 1] === l ? null : l; save();
      document.querySelectorAll(`#sr${n} .bubble`).forEach((x, i) => x.classList.toggle("on", st.answers[n - 1] === i));
      const c = st.answers.filter(a => a !== null).length + "/" + ex.total;
      $("#cnt").textContent = c; $("#cnt2").textContent = c;
    }));
    $("#sheetToggle").addEventListener("click", () => $("#sheet").classList.toggle("open"));
    $("#submit").addEventListener("click", () => {
      const left = ex.total - st.answers.filter(a => a !== null).length;
      $("#confirm").innerHTML = `<div class="confirm">${left ? `Έχεις αφήσει <b>${left}</b> ερωτήσεις αναπάντητες. ` : ""}Θέλεις σίγουρα να παραδώσεις;
<button class="btn small danger" id="yes">Ναι, παράδοση</button> <button class="btn small" id="no">Όχι, συνεχίζω</button></div>`;
      $("#yes").addEventListener("click", () => pastSubmit(false));
      $("#no").addEventListener("click", () => { $("#confirm").innerHTML = ""; });
      window.scrollTo(0, 0);
    });
    clearInterval(timer);
    if (st.end) timer = setInterval(() => {
      const el = $("#timer");
      if (!el || !store.official) { clearInterval(timer); return; }
      const left = store.official.end - Date.now();
      el.textContent = "⏱️ " + fmtTime(left);
      el.classList.toggle("low", left < 10 * 60000);
      if (left <= 0) { clearInterval(timer); pastSubmit(true); }
    }, 1000);
  }

  function pastSubmit(timeUp) {
    clearInterval(timer);
    const st = store.official; if (!st) return;
    const ex = pastByYear(st.year);
    let g = 0, m = 0, gMax = 0, mMax = 0;
    st.answers.forEach((a, i) => {
      if (!graded(ex, i)) return;
      const n = i + 1, p = pastPoints(ex, n), ok = isRight(ex, a, i);
      if (n <= ex.greek) { gMax += p; if (ok) g += p; } else { mMax += p; if (ok) m += p; }
    });
    // κλίμακα 0–100
    const scale = 100 / Math.max(1, gMax + mMax);
    const entry = { date: Date.now(), mode: "past" + st.year, score: Math.round((g + m) * scale), max: 100, greek: gMax ? Math.round(g * scale) : null, math: mMax ? Math.round(m * scale) : null, mins: Math.round(((st.end ? Math.min(Date.now(), st.end) : Date.now()) - st.start) / 60000) };
    store.history.push(entry);
    store.lastOfficial = { ...st, timeUp, entry, gMax: Math.round(gMax * scale), mMax: Math.round(mMax * scale), right: { g: g / 2, m: m / 2 } };
    store.official = null; save();
    location.hash = "#/past/result";
    if (location.hash === "#/past/result") pastResult();
  }

  function pastResult() {
    nav("past");
    const r = store.lastOfficial;
    if (!r) { location.hash = "#/past"; return; }
    const ex = pastByYear(r.year), e = r.entry;
    if (!ex) { location.hash = "#/past"; return; }
    const cell = n => {
      const i = n - 1, a = r.answers[i], k = ex.key[i];
      if (!graded(ex, i)) return `<div class="rcell skip"><b>${n}</b><span>${a === null ? "–" : LETTERS[a]}</span><small class="muted">δεν μετρά</small></div>`;
      const ok = isRight(ex, a, i);
      return `<div class="rcell ${ok ? "ok" : a === null ? "skip" : "no"}"><b>${n}</b><span>${a === null ? "–" : LETTERS[a]}</span>${ok ? "" : `<small>σωστό: ${k}</small>`}</div>`;
    };
    const wrong = r.answers.filter((a, i) => graded(ex, i) && !isRight(ex, a, i)).length;
    const both = e.greek !== null && e.math !== null;
    app().innerHTML = `<div class="result-card">
  ${r.timeUp ? `<p class="warn">⏰ Ο χρόνος τελείωσε και τα θέματα παραδόθηκαν αυτόματα.</p>` : ""}
  <p>${ex.title}</p>
  <div class="big">${e.score} <small>/ 100</small></div>
  <div class="stats-row">
    ${both ? `<div class="stat"><b>${e.greek}/${r.gMax}</b><span>Γλώσσα</span></div><div class="stat"><b>${e.math}/${r.mMax}</b><span>Μαθηματικά</span></div>` : ""}
    <div class="stat"><b>${e.mins}΄</b><span>χρόνος</span></div>
  </div>
  ${ex.groupB ? "" : `<p class="muted small">Κάθε ερώτηση μετρά το ίδιο. Η βαθμολογία έχει μετατραπεί σε κλίμακα 0–100.</p>`}
  ${ex.keySource === "app" ? `<p class="muted small">Οι σωστές απαντήσεις είναι λύσεις της εφαρμογής, γιατί το έγγραφο δεν είχε επίσημες.</p>` : ""}
  <div class="actions center"><a class="btn primary" href="#/past">Άλλα θέματα</a><a class="btn" href="past/${r.year}/themata-${r.year}.pdf" target="_blank" rel="noopener">PDF θεμάτων</a></div>
</div>
<h2>Το φύλλο απαντήσεών σου</h2>
<p class="muted">${wrong ? `Ξαναδές τις ${wrong} ερωτήσεις με κόκκινο ή γκρι στις σελίδες των θεμάτων.` : "🌟 Όλες σωστές!"}</p>
${ex.greek ? `<h3>📚 Γλώσσα</h3><div class="rgrid">${range(1, ex.greek).map(cell).join("")}</div>` : ""}
${ex.total > ex.greek ? `<h3>📐 Μαθηματικά</h3><div class="rgrid">${range(ex.greek + 1, ex.total).map(cell).join("")}</div>` : ""}
<details class="text-panel"><summary>📄 Σελίδες θεμάτων</summary><div class="pages">${pagesHtml(ex)}</div></details>`;
    window.scrollTo(0, 0);
  }

  function sylSummary() {
    const m = sylCount("math"), g = sylCount("greek");
    const M = allTopics("math").length, G = allTopics("greek").length;
    if (m === M && g === G) return `<div class="note">📋 Οι ερωτήσεις έρχονται από όλη την ύλη. <a href="#/syllabus">Διάλεξε μόνο όσα έχεις διδαχτεί</a>.</div>`;
    return `<div class="note">📋 <b>Η ύλη μου:</b> ${m}/${M} ενότητες Μαθηματικών, ${g}/${G} ενότητες Γλώσσας. Οι προσομοιώσεις και οι ανάμεικτες ερωτήσεις έχουν μόνο αυτές. <a href="#/syllabus">Αλλαγή</a></div>`;
  }

  function syllabus() {
    nav("syllabus");
    const col = (subject, icon) => {
      const list = subject === "math" ? window.MATH_TOPICS : window.GREEK_TOPICS;
      const n = subject === "math" ? (t => mathPool(t).length) : (t => greekPool(t).length);
      return `<section>
    <h2>${icon} ${SUBJ[subject]}</h2>
    <div class="actions"><button class="btn small" data-all="${subject}">Όλες</button><button class="btn small" data-none="${subject}">Καμία</button></div>
    <div class="list">${list.map(t => `<label class="list-item check"><input type="checkbox" data-s="${subject}" value="${t.id}" ${inSyl(subject, t.id) ? "checked" : ""}><span>${t.title}</span><small>${n(t.id)} ερ.</small></label>`).join("")}</div>
  </section>`;
    };
    app().innerHTML = `<h1>📋 Η ύλη μου</h1>
<p class="muted">Τσέκαρε τις ενότητες που έχει διδαχτεί το παιδί μέχρι τώρα. Οι προσομοιώσεις και οι ανάμεικτες ερωτήσεις της εξάσκησης θα έχουν μόνο αυτές. Οι υπόλοιπες ενότητες μένουν διαθέσιμες στην εξάσκηση ανά ενότητα. Αν η ύλη είναι μικρή, η προσομοίωση βγαίνει με λιγότερες ερωτήσεις και λιγότερο χρόνο.</p>
<div class="two-col">${col("math", "📐")}${col("greek", "📚")}</div>
<p id="sylmsg" class="muted"></p>
<div class="actions"><a class="btn primary" href="#/exam">⏱️ Προσομοίωση</a><a class="btn" href="#/practice">✏️ Εξάσκηση</a></div>`;
    const write = () => {
      const syl = {};
      ["math", "greek"].forEach(s => {
        const on = [...app().querySelectorAll(`input[data-s="${s}"]:checked`)].map(i => i.value);
        syl[s] = on.length === allTopics(s).length ? null : on;
      });
      store.syllabus = syl.math || syl.greek ? syl : null;
      save();
      $("#sylmsg").textContent = "✔️ Αποθηκεύτηκε: " + sylCount("math") + " ενότητες Μαθηματικών, " + sylCount("greek") + " ενότητες Γλώσσας.";
    };
    app().querySelectorAll("input[data-s]").forEach(i => i.addEventListener("change", write));
    app().querySelectorAll("[data-all],[data-none]").forEach(b => b.addEventListener("click", () => {
      const s = b.dataset.all || b.dataset.none;
      app().querySelectorAll(`input[data-s="${s}"]`).forEach(i => { i.checked = !!b.dataset.all; });
      write();
    }));
  }

  function notFound() { app().innerHTML = `<div class="empty">Η σελίδα δεν βρέθηκε. <a href="#/">Αρχική</a></div>`; }

  // ---------- Δρομολόγηση ----------
  function route() {
    clearInterval(timer);
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").filter(Boolean).map(decodeURIComponent);
    const [a, b, c] = parts;
    if (!a) return home();
    if (a === "learn" && (b === "math" || b === "greek")) return c ? lesson(b, c) : learnList(b);
    if (a === "practice") {
      if (!b) return practiceMenu();
      if (b === "math" || b === "greek") return startPractice(b, c || "all");
    }
    if (a === "exam") {
      if (b === "run") return examRun();
      if (b === "result") return examResult();
      return examMenu();
    }
    if (a === "mistakes") return mistakes();
    if (a === "syllabus") return syllabus();
    if (a === "progress") return progress();
    if (a === "past") return b === "result" ? pastResult() : b ? pastSetup(b) : past();
    notFound();
  }
  window.addEventListener("hashchange", route);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", route); else route();
})();
