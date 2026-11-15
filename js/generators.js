/* Γεννήτριες τυχαίων ασκήσεων Μαθηματικών (Ομάδα Α).
   Κάθε γεννήτρια επιστρέφει { t, d, q, c: [σωστή, λάθος...], e }. */
(function () {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const fmt = n => Number(n).toLocaleString("el-GR", { maximumFractionDigits: 2 });
  const euro = n => Number(n).toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => (a * b) / gcd(a, b);

  // Συμπληρώνει λάθος επιλογές ώστε να είναι μοναδικές και διαφορετικές από τη σωστή.
  function choices(correct, wrongs, show, n = 4) {
    const seen = new Set([correct]);
    const out = [correct];
    for (const w of wrongs) {
      if (out.length >= n) break;
      if (w > 0 && !seen.has(w) && Number.isFinite(w)) { seen.add(w); out.push(w); }
    }
    let k = 1;
    while (out.length < n) {
      const w = correct + (k % 2 ? k : -k) * Math.max(1, Math.round(correct * 0.1));
      if (w > 0 && !seen.has(w)) { seen.add(w); out.push(w); }
      k++;
    }
    return out.map(show);
  }

  const gens = [
    function orderOps() {
      const a = R(10, 40), b = R(2, 9), c = R(2, 9), d = R(1, 9);
      const correct = a + b * c - d;
      const wrongLeft = (a + b) * c - d;
      return {
        t: "arith", d: 1,
        q: `Πόσο κάνει η παράσταση: ${a} + ${b} × ${c} − ${d} ;`,
        c: choices(correct, [wrongLeft, a + b * (c - d), correct + d * 2, correct - b], fmt),
        e: `Πρώτα ο πολλαπλασιασμός: ${b} × ${c} = ${b * c}. Μετά από αριστερά προς τα δεξιά: ${a} + ${b * c} = ${a + b * c}, ${a + b * c} − ${d} = ${correct}.`
      };
    },
    function fractionOf() {
      const n = pick([3, 4, 5, 6, 8]);
      const k = R(1, n - 1);
      const g = gcd(k, n);
      const kk = k / g, nn = n / g;
      const unit = R(3, 15);
      const N = nn * unit;
      const item = pick([["τους", "μαθητές μιας σχολικής εκδρομής", "είναι κορίτσια", "Πόσα είναι τα κορίτσια"], ["τα", "βιβλία μιας βιβλιοθήκης", "είναι παραμύθια", "Πόσα είναι τα παραμύθια"], ["τα", "δέντρα ενός κτήματος", "είναι ελιές", "Πόσες είναι οι ελιές"]]);
      const correct = kk * unit;
      return {
        t: "fractions", d: 1,
        q: `Από ${item[0]} ${N} ${item[1]}, τα ${kk}/${nn} ${item[2]}. ${item[3]};`,
        c: choices(correct, [N - correct, unit, N / kk, correct + unit], fmt),
        e: `Το 1/${nn} του ${N} είναι ${N} : ${nn} = ${unit}. Τα ${kk}/${nn} είναι ${unit} × ${kk} = ${correct}.`
      };
    },
    function discount() {
      const p = pick([10, 20, 25, 30, 40, 50]);
      const P = pick([20, 40, 60, 80, 120, 160, 240]);
      const off = (P * p) / 100;
      const correct = P - off;
      const obj = pick(["ένα μπουφάν", "ένα ζευγάρι παπούτσια", "ένα επιτραπέζιο παιχνίδι", "μια σχολική τσάντα"]);
      return {
        t: "percent", d: 1,
        q: `${obj[0].toUpperCase() + obj.slice(1)} κοστίζει ${P} € και πωλείται με έκπτωση ${p}%. Πόσο θα πληρώσουμε;`,
        c: choices(correct, [off, P - p, P + off, correct - off / 2], v => fmt(v) + " €"),
        e: `Έκπτωση: ${P} × ${p} : 100 = ${fmt(off)} €. Πληρώνουμε ${P} − ${fmt(off)} = ${fmt(correct)} €.`
      };
    },
    function speed() {
      const v = pick([40, 50, 60, 80, 90, 100]);
      const t = pick([[1.5, "1 ώρα και 30 λεπτά"], [2.5, "2 ώρες και 30 λεπτά"], [3, "3 ώρες"], [0.75, "45 λεπτά"], [1.25, "1 ώρα και 15 λεπτά"]]);
      const correct = v * t[0];
      return {
        t: "ratio", d: 1,
        q: `Ένα λεωφορείο κινείται με σταθερή ταχύτητα ${v} χλμ. την ώρα. Πόσα χιλιόμετρα θα διανύσει σε ${t[1]};`,
        c: choices(correct, [v * Math.floor(t[0]) + 30, v + 30, correct + v / 2, v * t[0] * 2], v2 => fmt(v2) + " χλμ."),
        e: `Απόσταση = ταχύτητα × χρόνος = ${v} × ${fmt(t[0])} = ${fmt(correct)} χλμ.`
      };
    },
    function busLcm() {
      const pairs = [[6, 8], [10, 15], [12, 20], [8, 12], [9, 12], [15, 20]];
      const [a, b] = pick(pairs);
      const L = lcm(a, b);
      const startH = R(7, 9);
      const toTime = m => `${String(startH + Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
      const correct = toTime(L);
      const wrongs = [toTime(a * b), toTime(a + b), toTime(Math.max(a, b) * 2 === L ? L + a : Math.max(a, b) * 2)];
      const set = [correct];
      for (const w of wrongs) if (!set.includes(w)) set.push(w);
      while (set.length < 4) { const w = toTime(L + 5 * set.length); if (!set.includes(w)) set.push(w); }
      return {
        t: "divis", d: 1,
        q: `Δύο φίλοι κάνουν γύρους σε έναν στίβο. Ο ένας κάνει έναν γύρο κάθε ${a} λεπτά και ο άλλος κάθε ${b} λεπτά. Ξεκίνησαν μαζί από την αφετηρία στις ${toTime(0)}. Ποια ώρα θα ξαναβρεθούν για πρώτη φορά μαζί στην αφετηρία;`,
        c: set,
        e: `Θα ξαναβρεθούν μετά από ΕΚΠ(${a}, ${b}) = ${L} λεπτά, δηλαδή στις ${correct}.`
      };
    },
    function rectangle() {
      const l = R(6, 20), w = R(3, l - 1);
      const askArea = Math.random() < 0.5;
      const area = l * w, per = 2 * (l + w);
      const correct = askArea ? area : per;
      return {
        t: "geometry", d: 1,
        q: askArea
          ? `Ένα ορθογώνιο δωμάτιο έχει μήκος ${l} μ. και πλάτος ${w} μ. Πόσα τετραγωνικά μέτρα πλακάκια χρειάζονται για το πάτωμα;`
          : `Ένα ορθογώνιο γήπεδο έχει μήκος ${l} μ. και πλάτος ${w} μ. Πόσα μέτρα θα τρέξει κάποιος, αν κάνει έναν γύρο γύρω γύρω;`,
        c: choices(correct, askArea ? [per, l + w, area * 2] : [area, l + w, per * 2], v => fmt(v) + (askArea ? " τ.μ." : " μ.")),
        e: askArea ? `Εμβαδόν = μήκος × πλάτος = ${l} × ${w} = ${area} τ.μ.` : `Περίμετρος = 2 × (${l} + ${w}) = ${per} μ.`
      };
    },
    function units() {
      const kinds = [
        () => { const x = R(2, 9) + pick([0.25, 0.5, 0.75]); return { q: `Πόσα μέτρα είναι τα ${fmt(x)} χιλιόμετρα;`, correct: x * 1000, wr: [x * 100, x * 10, x * 10000], unit: " μ.", e: `1 χλμ. = 1.000 μ., άρα ${fmt(x)} × 1.000 = ${fmt(x * 1000)} μ.` }; },
        () => { const x = R(1, 5) * 250 + 1000; return { q: `Πόσα κιλά είναι τα ${fmt(x)} γραμμάρια;`, correct: x / 1000, wr: [x / 100, x / 10, x / 10000], unit: " κιλά", e: `1 κιλό = 1.000 γρ., άρα ${fmt(x)} : 1.000 = ${fmt(x / 1000)} κιλά.` }; },
        () => { const h = R(1, 4), m = pick([15, 20, 30, 45]); return { q: `Πόσα λεπτά είναι ${h} ${h === 1 ? "ώρα" : "ώρες"} και ${m} λεπτά;`, correct: h * 60 + m, wr: [h * 100 + m, h * 60, h * 10 + m], unit: " λεπτά", e: `${h} × 60 = ${h * 60} λεπτά, συν ${m}: ${h * 60 + m} λεπτά.` }; },
        () => { const x = R(2, 8) * 0.25 + 1; return { q: `Πόσα ml είναι τα ${fmt(x)} λίτρα;`, correct: x * 1000, wr: [x * 100, x * 10, x * 10000], unit: " ml", e: `1 λίτρο = 1.000 ml, άρα ${fmt(x)} × 1.000 = ${fmt(x * 1000)} ml.` }; }
      ];
      const k = pick(kinds)();
      return { t: "measure", d: 1, q: k.q, c: choices(k.correct, k.wr, v => fmt(v) + k.unit), e: k.e };
    },
    function average() {
      const n = pick([4, 5]);
      const mean = R(12, 18);
      const vals = [];
      for (let i = 0; i < n - 1; i++) vals.push(mean + R(-4, 4));
      const last = mean * n - vals.reduce((a, b) => a + b, 0);
      if (last < 5 || last > 20) return average();
      vals.push(last);
      const sum = vals.reduce((a, b) => a + b, 0);
      return {
        t: "data", d: 1,
        q: `Οι βαθμοί μιας μαθήτριας σε ${n} διαγωνίσματα ήταν: ${vals.join(", ")}. Ποιος είναι ο μέσος όρος της;`,
        c: choices(mean, [sum, mean + 1, mean - 1, Math.max(...vals)], fmt),
        e: `Άθροισμα: ${vals.join(" + ")} = ${sum}. Μέσος όρος: ${sum} : ${n} = ${mean}.`
      };
    },
    function shopping() {
      const price = pick([0.45, 0.65, 0.8, 1.2, 1.35, 1.6, 2.25]);
      const q1 = R(3, 6);
      const other = pick([1.5, 2.1, 0.9, 3.4]);
      const pay = pick([10, 20]);
      const total = Math.round((price * q1 + other) * 100) / 100;
      if (total >= pay) return shopping();
      const correct = Math.round((pay - total) * 100) / 100;
      const item = pick(["κρουασάν", "χυμούς", "γιαούρτια", "κουλούρια"]);
      return {
        t: "decimals", d: 1,
        q: `Ο Κώστας αγόρασε ${q1} ${item} των ${euro(price)} το ένα και ένα περιοδικό των ${euro(other)}. Έδωσε ${pay} €. Πόσα ρέστα πήρε;`,
        c: choices(correct, [Math.round((pay - price * q1) * 100) / 100, Math.round((correct + 1) * 100) / 100, Math.round((correct - 0.5) * 100) / 100, total], euro),
        e: `${q1} × ${euro(price)} = ${euro(price * q1)}. Με το περιοδικό: ${euro(total)}. Ρέστα: ${pay} − ${fmt(total)} = ${euro(correct)}.`
      };
    },
    function missing() {
      const x = R(3, 12), a = R(3, 9), b = R(5, 30);
      const plus = Math.random() < 0.5;
      const res = plus ? a * x + b : a * x - b;
      if (res <= 0) return missing();
      return {
        t: "arith", d: 1,
        q: `Ποιος αριθμός λείπει από το κουτάκι; &nbsp; ${a} × □ ${plus ? "+" : "−"} ${b} = ${res}`,
        c: choices(x, [x + 1, x - 1, plus ? (res + b) / a : (res - b) / a, res - a], fmt),
        e: `${a} × □ = ${res} ${plus ? "−" : "+"} ${b} = ${a * x}, άρα □ = ${a * x} : ${a} = ${x}.`
      };
    }
  ];

  window.MATH_GENERATORS = gens;
  window.generateMathQuestion = function (topic) {
    let pool = gens;
    if (topic && topic !== "all") {
      const probe = gens.map(g => [g, g()]).filter(([, q]) => q.t === topic);
      if (!probe.length) return null;
      return { ...probe[Math.floor(Math.random() * probe.length)][1], id: "gen", generated: true };
    }
    return { ...pick(pool)(), id: "gen", generated: true };
  };
})();
