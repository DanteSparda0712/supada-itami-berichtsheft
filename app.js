'use strict';
(() => {
  const reports = Array.from(document.querySelectorAll('.report'));
  const search = document.getElementById('search');
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty-state');
  const expand = document.getElementById('expand-all');
  const themeToggle = document.getElementById('theme-toggle');
  let category = 'alle';
  let toastTimer;
  const normalize = (value) => value.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
  const searchable = new Map(reports.map(report => [report, normalize(report.textContent)]));

  function syncExpand() {
    const visible = reports.filter(report => !report.hidden);
    const allOpen = visible.length > 0 && visible.every(report => report.open);
    expand.setAttribute('aria-expanded', String(allOpen));
    expand.replaceChildren(document.createTextNode(allOpen ? 'Alle Berichte schließen ' : 'Alle Berichte öffnen '));
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = allOpen ? '−' : '+';
    expand.append(icon);
    expand.disabled = visible.length === 0;
  }

  function filterReports() {
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let visibleCount = 0;
    for (const report of reports) {
      const matches = (category === 'alle' || report.dataset.category === category) && words.every(word => searchable.get(report).includes(word));
      report.hidden = !matches;
      if (matches) visibleCount++;
    }
    count.textContent = visibleCount + (visibleCount === 1 ? ' Bericht' : ' Berichte') + (visibleCount < reports.length ? ' von ' + reports.length : '');
    empty.hidden = visibleCount !== 0;
    syncExpand();
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    category = chip.dataset.filter;
    chips.forEach(button => {
      const selected = button === chip;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    filterReports();
  }));
  search.addEventListener('input', filterReports);
  document.getElementById('reset-filters').addEventListener('click', () => {
    search.value = '';
    chips[0].click();
    search.focus();
  });
  expand.addEventListener('click', () => {
    const visible = reports.filter(report => !report.hidden);
    const shouldOpen = !visible.every(report => report.open);
    visible.forEach(report => { report.open = shouldOpen; });
    syncExpand();
  });
  reports.forEach(report => report.addEventListener('toggle', syncExpand));

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Dunkles Farbschema einschalten' : 'Helles Farbschema einschalten');
    document.querySelector('meta[name="theme-color"]').content = isLight ? '#f2eee5' : '#111114';
  }
  let savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('supada-itami-theme') || 'dark'; } catch {}
  setTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem('supada-itami-theme', next); } catch {}
  });

  function notify(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  }

  document.getElementById('download').addEventListener('click', () => {
    const exported = JSON.parse(document.getElementById('report-data').textContent);
    const text = 'Berichtsheft für Zenkai DE\nSupada Itami · Bestätigter Genin\n\nFiktive Musterberichte für dein Rollenspiel.\n\n' + exported.map((report, index) => 'Bericht ' + (index + 1) + ' — ' + report.title + '\n\n' + report.paragraphs.join('\n\n') + '\n\nErgebnis: ' + report.result + '\nVerletzungen: ' + report.injuries).join('\n\n────────────────────\n\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Berichtsheft_Supada_Itami.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Alle vier Berichte wurden zum Herunterladen bereitgestellt.');
  });
  let printState = null;
  function preparePrint() {
    if (printState) return;
    printState = reports.map(report => ({report, open: report.open, hidden: report.hidden}));
    reports.forEach(report => { report.open = true; report.hidden = false; });
  }
  function restorePrint() {
    if (!printState) return;
    printState.forEach(state => { state.report.open = state.open; state.report.hidden = state.hidden; });
    printState = null;
    syncExpand();
  }
  addEventListener('beforeprint', preparePrint);
  addEventListener('afterprint', restorePrint);
  document.getElementById('print').addEventListener('click', () => { preparePrint(); window.print(); });
  syncExpand();
})();
