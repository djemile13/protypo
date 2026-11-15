/* Επίσημα θέματα προηγούμενων ετών (ΔΕΠΠΣ, Υπουργείο Παιδείας) με τις επίσημες απαντήσεις,
   και ενδεικτικά θέματα (window.SAMPLE_EXAMS).
   key: μία επιλογή (Α-Ε) ανά ερώτηση, με τη σειρά των ερωτήσεων. "-" = η ερώτηση δεν βαθμολογείται.
   greek: πόσες από τις πρώτες ερωτήσεις είναι Γλώσσα (οι υπόλοιπες είναι Μαθηματικά).
   groups: αν υπάρχουν, οι ερωτήσεις Ομάδας Β (3 μονάδες, 5 επιλογές). */
window.PAST_EXAMS = [
  { year: "2025", title: "Εξετάσεις 2025", answersPdf: true, pages: 9, total: 40, greek: 20, groupB: [[11, 20], [31, 40]],
    key: "ΒΔΔΔΓΒΔΑΓΒ" + "ΓΔΕΒΔΑΔΕΔΒ" + "ΓΔΔΓΒΔΒΔΒΔ" + "ΕΓΒΓΓΑΕΔΓΑ",
    note: "40 ερωτήσεις. Ομάδα Α: 2 μονάδες (4 επιλογές), Ομάδα Β: 3 μονάδες (5 επιλογές)." },
  { year: "2024", title: "Εξετάσεις 2024", answersPdf: true, pages: 6, total: 50, greek: 25,
    key: "ΑΒΔΓΒΔΒΒΓΑΔΑΑΔΔΒΑΓΔΑΓΒΑΓΓ" + "ΑΒΓΑΑΓΒΒΓΒΒΔΒΒΔΓΒΔΓΓΑΓΓΒΒ",
    note: "50 ερωτήσεις (25 Γλώσσα + 25 Μαθηματικά), 2 μονάδες η καθεμία." },
  { year: "2023", title: "Εξετάσεις 2023", answersPdf: true, pages: 7, total: 50, greek: 25,
    key: "ΑΓΒΑΑΓΔΒΑΔΓΑΓΑΒΓΔΑΒΔΓΓΓΒΑ" + "ΒΑΑΓΔΑΑΑΑΔΒΑΑΓΔΒΑΓΔΒΓΓΒΑΑ",
    note: "50 ερωτήσεις (25 Γλώσσα + 25 Μαθηματικά), 2 μονάδες η καθεμία." },
  { year: "2022", title: "Εξετάσεις 2022", answersPdf: true, pages: 8, total: 50, greek: 25,
    key: "ΔΒΑΒΒΓΓΔΓΒΔΓΔΑΑΒΒΓΔΑΓΓΑΔΔ" + "ΑΑΓΒΔΒΒΔΑΔΑΒΑΓΒΒΑΑΑΒΒΓΒΓΓ",
    note: "50 ερωτήσεις (25 Γλώσσα + 25 Μαθηματικά), 2 μονάδες η καθεμία." },
  { year: "2021", title: "Εξετάσεις 2021", answersPdf: true, pages: 6, total: 50, greek: 25,
    key: "ΓΑΒΑΔΓΑΒΔΓΒΒΓΓΑΓΒΔΓΓΔΑΒΒΑ" + "ΒΒΒΒΑΓΑΑΑΔΓΓΒΓΑΒΑΒΒΓΒΓΒΑΓ",
    note: "50 ερωτήσεις (25 Γλώσσα + 25 Μαθηματικά), 2 μονάδες η καθεμία." },
  { year: "2020", title: "Εξετάσεις 2020", answersPdf: true, pages: 12, total: 50, greek: 25,
    key: "ΔΑΒΑΑΒΓΔΔΓΒΒΑΓΑΒΑΓΔΒΔΔΓΒΓ" + "ΓΒΒΓΒΓΓΓΒΓΒΑΒΒΑΒΔΓΔΒΒΓΔΑΔ",
    note: "50 ερωτήσεις (25 Γλώσσα + 25 Μαθηματικά), 2 μονάδες η καθεμία." }
];

/* Ενδεικτικά θέματα. keySource: "official" = επίσημες απαντήσεις του εγγράφου,
   "app" = λύσεις που έγραψε η εφαρμογή (το έγγραφο δεν είχε απαντήσεις). */
window.SAMPLE_EXAMS = [
  { year: "ind-math-2021", title: "Μαθηματικά: ενδεικτικά ΔΕΠΠΣ 2021", subject: "math", pages: 5, total: 20, keySource: "official", minutes: 60,
    key: "ΒΓΑΔΓΑΒΓΔΑΒΒΔΔΔΔΓΒΑΓ" },
  { year: "ind-math-2020", title: "Μαθηματικά: ενδεικτικά ΔΕΠΠΣ 2020", subject: "math", pages: 4, total: 12, keySource: "official", minutes: 40,
    key: "ΔΒΔΔΓΓΑΓΒΒΓΔ" },
  { year: "ind-math-25", title: "Μαθηματικά: 25 θέματα (συλλογή)", subject: "math", pages: 5, total: 25, keySource: "official", minutes: 75,
    key: "ΒΔΓΑΓΒΓΓΑΔΒΔΔΑΔΒΓΑΓΔΑΒΒΒΔ", note: "Περιέχει και λίγες ασκήσεις με γράμματα (x, y), λίγο πάνω από την ύλη του Δημοτικού." },
  { year: "ind-paidika", title: "«Τα παιδικά μου παιχνίδια» (ΔΕΠΠΣ 2021)", subject: "greek", pages: 4, total: 10, keySource: "official", minutes: 30,
    key: "ΓΔΒΓΔΒΓΔΓΒ" },
  { year: "ind-xenopoulos", title: "Ξενόπουλος, «Αυτοβιογραφία» (ΔΕΠΠΣ 2021)", subject: "greek", pages: 4, total: 13, keySource: "app", minutes: 35,
    key: "ΔΓΓΓ-ΑΓΔΒΓΓΑΓ" },
  { year: "ind-stoixeio", title: "«Το στοιχειό» (ΔΕΠΠΣ 2021)", subject: "greek", pages: 4, total: 10, keySource: "app", minutes: 30,
    key: "ΒΓΒΑΓΑΓΒΔΓ" },
  { year: "ind-dynatos", title: "«Ο πιο δυνατός από όλους» (ΔΕΠΠΣ 2021)", subject: "greek", pages: 4, total: 10, keySource: "app", minutes: 30,
    key: "ΒΔΒΑΓΑΔΓΑΒ" },
  { year: "ind-flyaros", title: "Θεόφραστος, «Ο φλύαρος»", subject: "greek", pages: 3, total: 10, keySource: "app", minutes: 30,
    key: "ΓΓΑΔΑΓΑΒΓΑ" },
  { year: "ind-stefanidi", title: "«Γνωριμία με την Κατερίνα Στεφανίδη»", subject: "greek", pages: 4, total: 10, keySource: "app", minutes: 30,
    key: "ΓΑΒΑΒΒ-ΑΒΑ" },
  { year: "ind-arion", title: "«Ο Αρίων και το δελφίνι»", subject: "greek", pages: 4, total: 10, keySource: "app", minutes: 30,
    key: "ΒΑΔΒΒΒΓΒΒΒ" },
  { year: "ind-paidia", title: "«Γίνετε σαν τα παιδιά»", subject: "greek", pages: 4, total: 10, keySource: "app", minutes: 30,
    key: "-ΔΒΓ-ΓΓΓΓΒ" },
  { year: "ind-ixorypansi", title: "«Ηχορρύπανση»", subject: "greek", pages: 3, total: 10, keySource: "app", minutes: 30,
    key: "ΑΓΔΔΒΔΑΒΒΑ" },
  { year: "ind-hobbit", title: "Τόλκιν, «Οι Χόμπιτ»", subject: "greek", pages: 3, total: 10, keySource: "app", minutes: 30,
    key: "ΑΒΓΓΓΒΒΒΒΒ" },
  { year: "ind-ereuna", title: "Παιδικά ατυχήματα (έρευνα)", subject: "greek", pages: 2, total: 8, keySource: "app", minutes: 25,
    key: "ΑΑΒ-ΒΑΒΑ" },
  { year: "ind-thalassa", title: "Καρκαβίτσας, «Η θάλασσα»", subject: "greek", pages: 3, total: 5, keySource: "app", minutes: 15,
    key: "ΓΓΓΓΒ" }
];
window.SAMPLE_EXAMS.forEach(e => { e.greek = e.subject === "greek" ? e.total : 0; e.sample = true; });
