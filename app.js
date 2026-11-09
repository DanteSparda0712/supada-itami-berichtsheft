'use strict';

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'supada-itami-reports-v1';
const REPORT_COUNT = reports.length;
const LAST_CHAPTER = reports[REPORT_COUNT - 1].id;
const BOOK_OPENING_MS = 620;
const state = { phase: 'cover', chapter: 0, view: 'reader', search: '', category: 'Alle', custom: {}, motionOff: false };
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const leaf = '<svg class="leaf" aria-hidden="true"><use href="assets/konoha-emblem.svg#leaf"/></svg>';
const isRank = report => report.category === 'Rangaufstieg';
const dateText = date => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2100-12-31') return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const report of reports) {
      const item = saved[report.id];
      if (item && typeof item.title === 'string' && typeof item.body === 'string' && item.title.trim() && item.body.trim() && item.title.length <= 120 && item.body.length <= 8000) {
        state.custom[report.id] = { title: item.title, body: item.body, date: validDate(item.date) ? item.date : report.date };
      }
    }
  }
} catch { /* Reading the original chapters also works without browser storage. */ }
function getReport(id) {
  const original = reports.find(report => report.id === Number(id));
  if (!original) return null;
  const custom = state.custom[original.id];
  return { ...original, ...custom, title: isRank(original) ? original.title : custom?.title || original.title, date: isRank(original) ? original.date : custom?.date || original.date };
}
function paragraphs(body) { return body.split(/\n\s*\n/).map(text => `<p>${escapeHtml(text)}</p>`).join(''); }

let openingTimer, toastTimer;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
try { state.motionOff = localStorage.getItem('supada-itami-motion') === 'off' || motionPreference.matches; } catch { state.motionOff = motionPreference.matches; }
function setMotion(off) {
  state.motionOff = off;
  document.body.classList.toggle('still', off);
  $('motion-toggle').setAttribute('aria-pressed', String(off));
  $('motion-toggle').setAttribute('aria-label', off ? 'Buchanimation einschalten' : 'Buchanimation ausschalten');
  $('motion-label').textContent = off ? 'Animation aus' : 'Animation an';
  if (off && state.phase === 'opening') finishOpening();
}
setMotion(state.motionOff);
motionPreference.addEventListener('change', event => { if (event.matches) setMotion(true); });
function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500);
}
function writeRoute(hash) { if (location.hash !== hash) history.pushState(null, '', hash); }

function renderContents() {
  const search = state.search.trim().toLocaleLowerCase('de');
  const visible = reports.map(report => getReport(report.id)).filter(report => (state.category === 'Alle' || report.category === state.category) && (!search || `${report.title} ${report.body} ${report.category} ${dateText(report.date)}`.toLocaleLowerCase('de').includes(search)));
  $('chapter-list').innerHTML = visible.map(report => `<li><button class="chapter-item${isRank(report) ? ' rank-item' : ''}" type="button" data-chapter="${report.id}"${state.chapter === report.id ? ' aria-current="page"' : ''}><span class="chapter-index">${String(report.id).padStart(2, '0')}</span><span class="chapter-summary"><span class="chapter-title">${escapeHtml(report.title)}</span><span class="chapter-meta">${dateText(report.date)} · ${escapeHtml(report.category)}</span></span></button></li>`).join('');
  $('empty-state').hidden = visible.length > 0;
  $('chapter-list').hidden = visible.length === 0;
  $('result-count').textContent = visible.length === REPORT_COUNT ? `${REPORT_COUNT} Kapitel · Mein Weg als Shinobi` : `${visible.length} von ${REPORT_COUNT} Kapiteln`;
  if (state.chapter === 0) $('show-profile').setAttribute('aria-current', 'page');
  else $('show-profile').removeAttribute('aria-current');
}
function renderReader() {
  if (state.chapter === 0) {
    $('reader-content').innerHTML = `<article class="profile-content"><div class="profile-top"><div><p class="reader-kicker">DIE PERSON HINTER DEN KAPITELN</p><h2 class="reader-title" id="reader-title">Supada<br>Itami<span>.</span></h2><p class="reader-date">CHUNIN · RAITON · ZENKAI DE</p></div><figure class="profile-portrait"><img src="assets/supada-itami.png" width="1287" height="1222" alt="Supada Itami mit weißen Haaren, roten Gesichtsmarkierungen und Chunin-Weste."></figure></div><p class="profile-intro"><strong>Kekkei Genkai: Daiton.</strong><br>Jedes Training, jede Aufgabe und jeder Schritt nach vorn hat seinen Platz in diesem Buch. Hier halte ich fest, was ich erlebt und gelernt habe.</p><dl class="profile-stats"><div><dt>HEIMAT</dt><dd>Konohagakure</dd></div><div><dt>AKTUELLER RANG</dt><dd>Chunin</dd></div><div><dt>CHAKRA-ELEMENT</dt><dd>Raiton · Blitz</dd></div><div><dt>MEIN FOKUS</dt><dd>Taijutsu &amp; Chakra</dd></div></dl><section class="profile-nindo" aria-labelledby="nindo-title"><h3 id="nindo-title" class="reader-kicker">Mein Nindō</h3><blockquote class="profile-quote nindo-quote"><p>„Der Tod ist keine Schande.“</p></blockquote></section><div class="rank-timeline"><a href="#bericht-6"><span>Neuer Rang: Bestätigter Genin</span><time datetime="2026-10-28">28.10.2026</time></a><a href="#bericht-13"><span>Neuer Rang: Chunin</span><time datetime="2026-11-04">04.11.2026</time></a></div></article>`;
    $('running-chapter').textContent = 'DIE SHINOBI-AKTE';
    $('running-date').textContent = 'BAND I · 2026';
    $('reading-position').textContent = 'DEIN BUCH BEGINNT HIER';
    $('page-number').textContent = '01';
  } else {
    const report = getReport(state.chapter);
    $('reader-content').innerHTML = `<article class="chapter-content${isRank(report) ? ' rank-chapter' : ''}"><p class="reader-kicker">KAPITEL ${String(report.id).padStart(2, '0')} · ${escapeHtml(report.category.toUpperCase())}</p><h2 class="reader-title" id="reader-title">${escapeHtml(report.title)}</h2><div class="reader-date"><time datetime="${report.date}">${dateText(report.date)}</time><span>${escapeHtml(report.topic || report.category)}</span><span class="text-status">${state.custom[report.id] ? 'MEIN TEXT' : 'TEXTVORSCHLAG'}</span></div><div class="chapter-body">${paragraphs(report.body)}</div><div class="chapter-tail">${leaf}<button class="edit-chapter-link" type="button" data-edit="${report.id}">Dieses Kapitel bearbeiten ↗</button></div></article>`;
    $('running-chapter').textContent = 'SUPADA ITAMI · BERICHTSHEFT';
    $('running-date').textContent = `KAPITEL ${String(report.id).padStart(2, '0')}`;
    $('reading-position').textContent = `KAPITEL ${report.id} VON ${REPORT_COUNT}`;
    $('page-number').textContent = String(report.id + 1).padStart(2, '0');
  }
  $('reader-content').scrollTop = 0;
  $('previous-page').disabled = state.chapter === 0;
  $('next-page').disabled = state.chapter === LAST_CHAPTER;
  $('next-page').setAttribute('aria-label', state.chapter === 0 ? 'Erstes Kapitel lesen' : 'Nächstes Kapitel');
}

function setView(view, focus = false) {
  state.view = view;
  const mobile = window.matchMedia('(max-width: 800px)').matches;
  $('open-spread').classList.toggle('show-contents', view === 'contents');
  $('mobile-contents').setAttribute('aria-pressed', String(view === 'contents'));
  $('mobile-reader').setAttribute('aria-pressed', String(view === 'reader'));
  $('contents-page').inert = mobile && view !== 'contents';
  $('reader-page').inert = mobile && view !== 'reader';
  $('contents-page').setAttribute('aria-hidden', String(mobile && view !== 'contents'));
  $('reader-page').setAttribute('aria-hidden', String(mobile && view !== 'reader'));
  if (focus && state.phase === 'reader') $(view === 'contents' ? 'contents-page' : 'reader-page').focus({ preventScroll: true });
}
function syncPhase() {
  const reading = state.phase === 'reader';
  const opening = state.phase === 'opening';
  $('cover-view').hidden = reading;
  $('cover-view').inert = state.phase !== 'cover';
  $('open-spread').hidden = !reading && !opening;
  $('open-spread').inert = !reading;
  $('open-spread').setAttribute('aria-hidden', String(!reading));
  $('buch').classList.toggle('is-opening', opening);
  $('buch').setAttribute('aria-busy', String(opening));
  $('open-book-cover').disabled = state.phase !== 'cover';
  $('open-book').disabled = state.phase !== 'cover';
}
function cancelOpening() {
  clearTimeout(openingTimer);
  $('buch').classList.remove('is-opening');
}
function finishOpening() {
  if (state.phase !== 'opening') return;
  cancelOpening();
  state.phase = 'reader';
  syncPhase();
  setView(state.view, true);
  $('opening-status').textContent = 'Dein Konoha-Buch ist geöffnet.';
  writeRoute(state.view === 'contents' ? '#inhalt' : state.chapter ? `#bericht-${state.chapter}` : '#steckbrief');
}
function openBook() {
  if (state.phase !== 'cover') return;
  renderReader();
  setView('reader');
  const animate = !state.motionOff && !motionPreference.matches;
  // Return from a lower cover position while the book opens, without a final jump.
  window.scrollTo({ top: 0, behavior: animate ? 'smooth' : 'instant' });
  state.phase = 'opening';
  syncPhase();
  $('opening-status').textContent = 'Dein Konoha-Buch wird geöffnet.';
  if (!animate) finishOpening();
  else openingTimer = setTimeout(finishOpening, BOOK_OPENING_MS + 140);
}
$('open-book-cover').addEventListener('animationend', event => { if (event.target === $('open-book-cover') && event.animationName === 'cover-open') finishOpening(); });
function showReader(chapter, { route = true, focus = true, view = 'reader' } = {}) {
  const fromCover = state.phase !== 'reader';
  cancelOpening();
  const nextChapter = Number(chapter);
  state.chapter = getReport(nextChapter) ? nextChapter : 0;
  state.phase = 'reader';
  renderReader();
  renderContents();
  syncPhase();
  setView(view, focus);
  if (fromCover) window.scrollTo({ top: 0, behavior: 'instant' });
  if (route) writeRoute(view === 'contents' ? '#inhalt' : state.chapter ? `#bericht-${state.chapter}` : '#steckbrief');
}
function closeBook({ route = true, focus = true } = {}) {
  cancelOpening();
  state.phase = 'cover';
  syncPhase();
  $('opening-status').textContent = 'Das Konoha-Buch ist geschlossen.';
  if (route) writeRoute('#start');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focus) $('open-book').focus({ preventScroll: true });
}
function handleRoute(focus = true) {
  const hash = location.hash.toLowerCase();
  const chapter = hash.match(/^#(?:bericht|monat)-(\d+)$/);
  if (chapter && getReport(chapter[1])) return showReader(Number(chapter[1]), { route: false, focus });
  if (['#inhalt', '#berichte'].includes(hash)) return showReader(state.chapter, { route: false, focus, view: 'contents' });
  if (hash === '#ausblick') return showReader(LAST_CHAPTER, { route: false, focus });
  if (['#steckbrief', '#buch'].includes(hash)) return showReader(0, { route: false, focus });
  closeBook({ route: false, focus: false });
}
window.addEventListener('hashchange', () => handleRoute());
window.matchMedia('(max-width: 800px)').addEventListener('change', () => setView(state.view));

$('open-book').addEventListener('click', openBook);
$('open-book-cover').addEventListener('click', openBook);
$('close-book').addEventListener('click', () => closeBook());
$('show-contents').addEventListener('click', () => {
  if (state.phase !== 'reader') showReader(state.chapter, { view: 'contents' });
  else { setView('contents', true); writeRoute('#inhalt'); }
});
$('mobile-contents').addEventListener('click', () => { setView('contents', true); writeRoute('#inhalt'); });
$('mobile-reader').addEventListener('click', () => { setView('reader', true); writeRoute(state.chapter ? `#bericht-${state.chapter}` : '#steckbrief'); });
$('show-profile').addEventListener('click', () => showReader(0));
$('chapter-list').addEventListener('click', event => {
  const button = event.target.closest('[data-chapter]');
  if (button) showReader(Number(button.dataset.chapter));
});
$('chapter-search').addEventListener('input', event => { state.search = event.target.value; renderContents(); });
$('chapter-category').addEventListener('change', event => { state.category = event.target.value; renderContents(); });
$('reset-search').addEventListener('click', () => {
  state.search = ''; state.category = 'Alle';
  $('chapter-search').value = ''; $('chapter-category').value = 'Alle';
  renderContents(); $('chapter-search').focus();
});
function moveChapter(direction) {
  if (state.phase !== 'reader') return;
  const next = state.chapter + direction;
  if (next === 0 || getReport(next)) showReader(next);
}
$('previous-page').addEventListener('click', () => moveChapter(-1));
$('next-page').addEventListener('click', () => moveChapter(1));
$('motion-toggle').addEventListener('click', () => {
  setMotion(!state.motionOff);
  try { localStorage.setItem('supada-itami-motion', state.motionOff ? 'off' : 'on'); } catch { }
});
document.addEventListener('keydown', event => {
  if ($('edit-dialog').open || event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
  if (event.key === 'Escape') { if (state.phase !== 'cover') { event.preventDefault(); closeBook(); } return; }
  if (state.phase === 'reader' && state.view === 'reader') {
    if (event.key === 'ArrowRight') { event.preventDefault(); moveChapter(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveChapter(-1); }
  }
});

function fillEditor() {
  const report = getReport($('edit-select').value);
  if (!report) return;
  $('edit-title').value = report.title;
  $('edit-date').value = report.date;
  $('edit-body').value = report.body;
  $('edit-title').readOnly = isRank(report);
  $('edit-date').readOnly = isRank(report);
  $('editor-note').textContent = isRank(report) ? 'Rangtitel und Rangdatum bleiben erhalten. Du kannst deinen Bericht dazu ergänzen. Änderungen werden auf diesem Gerät im Browser gespeichert.' : 'Schreibe hier deine tatsächlichen Erlebnisse auf. Änderungen werden auf diesem Gerät im Browser gespeichert.';
}
function openEditor(id = state.chapter || 1) {
  if (state.phase === 'opening') finishOpening();
  $('edit-select').innerHTML = reports.map(original => { const report = getReport(original.id); return `<option value="${report.id}">${String(report.id).padStart(2, '0')} · ${escapeHtml(report.title)}</option>`; }).join('');
  $('edit-select').value = String(getReport(id) ? id : 1);
  fillEditor();
  if (!$('edit-dialog').open) $('edit-dialog').showModal();
}
$('open-editor').addEventListener('click', () => openEditor());
$('reader-content').addEventListener('click', event => { const button = event.target.closest('[data-edit]'); if (button) openEditor(Number(button.dataset.edit)); });
$('edit-select').addEventListener('change', fillEditor);
$('close-editor').addEventListener('click', () => $('edit-dialog').close());
$('cancel-edit').addEventListener('click', () => $('edit-dialog').close());
$('edit-form').addEventListener('submit', event => {
  event.preventDefault();
  const original = reports.find(report => report.id === Number($('edit-select').value));
  const body = $('edit-body').value.trim();
  const title = isRank(original) ? original.title : $('edit-title').value.trim();
  const date = isRank(original) ? original.date : $('edit-date').value;
  if (!body || !title || !validDate(date)) { toast('Bitte Titel, ein gültiges Datum und deinen Bericht ergänzen.'); return; }
  const custom = { ...state.custom, [original.id]: { title, body, date } };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(custom)); }
  catch { toast('Der Browser konnte nicht speichern. Lass den Text geöffnet und kopiere ihn zur Sicherung.'); return; }
  state.custom = custom;
  $('edit-dialog').close();
  showReader(original.id);
  toast('Dein Kapitel ist auf diesem Gerät gespeichert.');
});

function plainText() {
  const heading = `SUPADA ITAMI — DAS KONOHA-BUCH\n${REPORT_COUNT} Kapitel · Zenkai DE\n\nFiktives Rollenspiel-Archiv. Nicht bearbeitete Tätigkeiten und weitere Daten sind Textvorschläge.\n\n`;
  return heading + reports.map(original => { const report = getReport(original.id); return `KAPITEL ${String(report.id).padStart(2, '0')}\n${report.title}\n${dateText(report.date)} · ${report.category}\n${state.custom[report.id] ? 'Mein Text' : 'Textvorschlag'}\n\n${report.body}`; }).join('\n\n' + '—'.repeat(40) + '\n\n');
}
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob(['\uFEFF', plainText()], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Supada-Itami-Konoha-Buch.txt'; document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
function renderPrint() {
  $('print-content').innerHTML = `<h1 class="print-title">Supada Itami</h1><p class="print-subtitle">Das Konoha-Buch · ${REPORT_COUNT} Kapitel · Zenkai DE</p><p class="print-note">Fiktives Rollenspiel-Archiv. Nicht bearbeitete Tätigkeiten und weitere Daten sind Textvorschläge.</p>` + reports.map(original => { const report = getReport(original.id); return `<article><p class="print-date">KAPITEL ${String(report.id).padStart(2, '0')} · ${escapeHtml(report.category)}</p><h2>${escapeHtml(report.title)}</h2><p class="print-date">${dateText(report.date)} · ${state.custom[report.id] ? 'Mein Text' : 'Textvorschlag'}</p>${paragraphs(report.body)}</article>`; }).join('');
}
window.addEventListener('beforeprint', renderPrint);
$('print').addEventListener('click', () => { renderPrint(); window.print(); });

document.querySelectorAll('[data-report-count]').forEach(element => { element.textContent = String(REPORT_COUNT); });
$('chapter-list').setAttribute('aria-label', `${REPORT_COUNT} Kapitel`);
$('download').setAttribute('aria-label', `Alle ${REPORT_COUNT} Berichte als Text herunterladen`);
renderContents();
renderReader();
handleRoute(false);
