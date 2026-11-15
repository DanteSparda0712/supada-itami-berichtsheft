'use strict';

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'supada-itami-reports-v1';
const REPORT_COUNT = reports.length;
const SERVER_START_DATE = serverTimeline.startDate;
const BERLIN_TODAY = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const TIMELINE_END = BERLIN_TODAY > serverTimeline.asOfDate ? BERLIN_TODAY : serverTimeline.asOfDate;
const GAME_MONTH_COUNT = dateNumber(TIMELINE_END) - dateNumber(SERVER_START_DATE) + 1;
const LAST_CHAPTER = GAME_MONTH_COUNT;
const BOOK_OPENING_MS = 620;
const state = { phase: 'cover', chapter: 0, currentReport: null, view: 'reader', search: '', category: 'Alle', custom: {}, motionOff: false };
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
function dateNumber(date) { return Date.parse(date + 'T00:00:00Z') / 86400000; }
function monthDate(month) { return new Date((dateNumber(SERVER_START_DATE) + month - 1) * 86400000).toISOString().slice(0, 10); }
function gameMonthForDate(date) { return Math.min(GAME_MONTH_COUNT, Math.max(1, dateNumber(date) - dateNumber(SERVER_START_DATE) + 1)); }
function getReport(id) {
  const original = reports.find(report => report.id === Number(id));
  if (!original) return null;
  const custom = state.custom[original.id];
  const rawDate = isRank(original) ? original.date : custom?.date || original.date;
  const date = rawDate < SERVER_START_DATE ? SERVER_START_DATE : rawDate > TIMELINE_END ? TIMELINE_END : rawDate;
  return { ...original, ...custom, title: isRank(original) ? original.title : custom?.title || original.title, date, gameMonth: gameMonthForDate(date) };
}
function getMonths() {
  const months = Array.from({ length: GAME_MONTH_COUNT }, (_, index) => ({ number: index + 1, date: monthDate(index + 1), reports: [] }));
  for (const original of reports) { const report = getReport(original.id); months[report.gameMonth - 1].reports.push(report); }
  return months;
}
function getMonth(number) { return getMonths()[Number(number) - 1] || null; }

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
  const activeFilter = state.category !== 'Alle' || Boolean(search);
  const months = getMonths().map(month => {
    const matching = month.reports.filter(report => (state.category === 'Alle' || report.category === state.category) && (!search || `${report.title} ${report.body} ${report.category} ${dateText(report.date)} Spielmonat ${month.number}`.toLocaleLowerCase('de').includes(search)));
    const monthMatch = state.category === 'Alle' && search && `Spielmonat ${month.number} Servertag ${month.number} ${dateText(month.date)}`.toLocaleLowerCase('de').includes(search);
    return { ...month, matching, visible: !activeFilter || matching.length > 0 || monthMatch };
  }).filter(month => month.visible);
  $('chapter-list').innerHTML = months.map(month => {
    const first = month.matching[0] || month.reports[0];
    const rank = month.reports.some(isRank);
    const count = month.reports.length;
    return `<li><button class="chapter-item${rank ? ' rank-item' : ''}${count ? '' : ' empty-month'}" type="button" data-month="${month.number}"${state.chapter === month.number ? ' aria-current="page"' : ''}><span class="chapter-index">${String(month.number).padStart(2, '0')}</span><span class="chapter-summary"><span class="chapter-title">${escapeHtml(first?.title || 'Noch kein Bericht')}</span><span class="chapter-meta">Spielmonat ${month.number} · ${count} ${count === 1 ? 'Bericht' : 'Berichte'}<br>${dateText(month.date)} · Servertag ${month.number}</span></span></button></li>`;
  }).join('');
  $('empty-state').hidden = months.length > 0;
  $('chapter-list').hidden = months.length === 0;
  const matches = months.reduce((sum, month) => sum + (activeFilter ? month.matching.length : month.reports.length), 0);
  $('result-count').textContent = `${months.length} ${months.length === 1 ? 'Spielmonat' : 'Spielmonate'} · ${matches} ${matches === 1 ? 'Bericht' : 'Berichte'}`;
  if (state.chapter === 0) $('show-profile').setAttribute('aria-current', 'page');
  else $('show-profile').removeAttribute('aria-current');
}
function reportMarkup(report) {
  return `<section class="report-section${isRank(report) ? ' rank-report' : ''}" data-report="${report.id}" id="entry-${report.id}"><p class="report-number">BERICHT ${String(report.id).padStart(2, '0')} · ${escapeHtml(report.category.toUpperCase())}</p><h3 class="report-title">${escapeHtml(report.title)}</h3><div class="report-meta"><span>${escapeHtml(report.topic || report.category)}</span><span class="text-status">${state.custom[report.id] ? 'MEIN TEXT' : 'TEXTVORSCHLAG'}</span></div><div class="chapter-body">${paragraphs(report.body)}</div><div class="chapter-tail">${leaf}<button class="edit-chapter-link" type="button" data-edit="${report.id}">Bericht bearbeiten ↗</button></div></section>`;
}
function renderReader() {
  if (state.chapter === 0) {
    state.currentReport = null;
    $('reader-content').innerHTML = `<article class="profile-content"><div class="profile-top"><div><p class="reader-kicker">DIE PERSON HINTER DEN BERICHTEN</p><h2 class="reader-title" id="reader-title">Supada<br>Itami<span>.</span></h2><p class="reader-date">KONIN · RAITON · ZENKAI DE</p></div><figure class="profile-portrait"><img src="assets/supada-itami-red.webp" width="600" height="800" alt="Supada Itami mit roten Haaren, roten Gesichtsmarkierungen und Shinobi-Weste."></figure></div><p class="profile-intro"><strong>Kekkei Genkai: Daiton.</strong><br>Jedes Training, jede Aufgabe und jeder Schritt nach vorn hat seinen Platz in diesem Buch. Hier halte ich fest, was ich erlebt und gelernt habe.<span class="timeline-rule">1 Servertag = 1 Spielmonat · Seit ${dateText(SERVER_START_DATE)}<br>Stand: ${dateText(TIMELINE_END)}</span></p><dl class="profile-stats"><div><dt>HEIMAT</dt><dd>Konohagakure</dd></div><div><dt>AKTUELLER RANG</dt><dd>Konin</dd></div><div><dt>AUF DEM SERVER</dt><dd>${GAME_MONTH_COUNT} Tage</dd></div><div><dt>SPIELZEIT SEIT BEITRITT</dt><dd>${GAME_MONTH_COUNT} Monate</dd></div><div><dt>CHAKRA-ELEMENT</dt><dd>Raiton · Blitz</dd></div><div><dt>MEIN FOKUS</dt><dd>Taijutsu &amp; Chakra</dd></div></dl><section class="profile-nindo" aria-labelledby="nindo-title"><h3 id="nindo-title" class="reader-kicker">Mein Nindō</h3><blockquote class="profile-quote nindo-quote"><p>„Der Tod ist keine Schande.“</p></blockquote></section><div class="rank-timeline"><a href="#bericht-6"><span>Neuer Rang: Bestätigter Genin</span><span class="rank-time">Spielmonat ${gameMonthForDate("2026-10-28")}<time datetime="2026-10-28">28.10.2026</time></span></a><a href="#bericht-13"><span>Neuer Rang: Chunin</span><span class="rank-time">Spielmonat ${gameMonthForDate("2026-11-04")}<time datetime="2026-11-04">04.11.2026</time></span></a><a href="#bericht-24"><span>Neuer Rang: Konin</span><span class="rank-time">Spielmonat ${gameMonthForDate("2026-11-14")}<time datetime="2026-11-14">14.11.2026</time></span></a></div></article>`;
    $('running-chapter').textContent = 'DEINE SHINOBI-CHRONIK';
    $('running-date').textContent = `STAND ${dateText(TIMELINE_END)}`;
    $('reading-position').textContent = `${GAME_MONTH_COUNT} SERVERTAGE · ${GAME_MONTH_COUNT} SPIELMONATE`;
    $('page-number').textContent = 'Start';
  } else {
    const month = getMonth(state.chapter);
    if (!month.reports.some(report => report.id === state.currentReport)) state.currentReport = month.reports[0]?.id || null;
    const body = month.reports.length ? month.reports.map(reportMarkup).join('') : `<div class="month-empty">${leaf}<h3>Noch kein Bericht</h3><p>Für Spielmonat ${month.number} ist noch kein Bericht hinterlegt.</p><button type="button" data-show-contents>Zur Monatsübersicht ↗</button></div>`;
    $('reader-content').innerHTML = `<article class="month-content"><p class="reader-kicker">1 SERVERTAG = 1 SPIELMONAT</p><h2 class="reader-title" id="reader-title">Spielmonat ${month.number}<span>.</span></h2><div class="reader-date"><time datetime="${month.date}">Reales Datum: ${dateText(month.date)}</time><span>Servertag ${month.number}</span><span>${month.reports.length} ${month.reports.length === 1 ? 'Bericht' : 'Berichte'}</span></div>${body}</article>`;
    $('running-chapter').textContent = 'SUPADA ITAMI · SPIELCHRONIK';
    $('running-date').textContent = `MONAT ${String(month.number).padStart(2, '0')}`;
    $('reading-position').textContent = `SPIELMONAT ${month.number} VON ${GAME_MONTH_COUNT}`;
    $('page-number').textContent = String(month.number).padStart(2, '0');
  }
  $('reader-content').scrollTop = 0;
  $('previous-page').disabled = state.chapter === 0;
  $('next-page').disabled = state.chapter === LAST_CHAPTER;
  $('next-page').setAttribute('aria-label', state.chapter === 0 ? 'Ersten Spielmonat lesen' : 'Nächster Spielmonat');
}
function scrollToReport(id) {
  const reader = $('reader-content'), section = reader.querySelector(`[data-report="${Number(id)}"]`);
  if (section) reader.scrollTop += section.getBoundingClientRect().top - reader.getBoundingClientRect().top - 12;
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
  writeRoute(state.view === 'contents' ? '#inhalt' : state.chapter ? `#monat-${state.chapter}` : '#steckbrief');
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
function showReader(chapter, { route = true, focus = true, view = 'reader', reportId = null } = {}) {
  const fromCover = state.phase !== 'reader';
  cancelOpening();
  const nextChapter = Number(chapter);
  state.chapter = Number.isInteger(nextChapter) && nextChapter >= 0 && nextChapter <= GAME_MONTH_COUNT ? nextChapter : 0;
  state.currentReport = reportId;
  state.phase = 'reader';
  renderReader();
  renderContents();
  syncPhase();
  setView(view, focus);
  if (fromCover) window.scrollTo({ top: 0, behavior: 'instant' });
  if (reportId && view === 'reader') scrollToReport(reportId);
  if (route) writeRoute(view === 'contents' ? '#inhalt' : reportId ? `#bericht-${reportId}` : state.chapter ? `#monat-${state.chapter}` : '#steckbrief');
}
function showReport(id, options = {}) {
  const report = getReport(id);
  if (report) showReader(report.gameMonth, { ...options, reportId: report.id });
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
  const report = hash.match(/^#bericht-(\d+)$/);
  if (report && getReport(report[1])) return showReport(Number(report[1]), { route: false, focus });
  const month = hash.match(/^#monat-(\d+)$/);
  if (month && Number(month[1]) >= 1 && Number(month[1]) <= GAME_MONTH_COUNT) return showReader(Number(month[1]), { route: false, focus });
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
$('mobile-reader').addEventListener('click', () => { setView('reader', true); writeRoute(state.chapter ? `#monat-${state.chapter}` : '#steckbrief'); });
$('show-profile').addEventListener('click', () => showReader(0));
$('chapter-list').addEventListener('click', event => {
  const button = event.target.closest('[data-month]');
  if (button) showReader(Number(button.dataset.month));
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
  if (next >= 0 && next <= GAME_MONTH_COUNT) showReader(next);
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
  $('editor-note').textContent = isRank(report) ? 'Rangtitel und Rangdatum bleiben erhalten. Du kannst deinen Bericht dazu ergänzen. Änderungen werden auf diesem Gerät im Browser gespeichert.' : 'Wähle das reale Datum des Servertags; der Spielmonat wird automatisch zugeordnet. Änderungen werden auf diesem Gerät im Browser gespeichert.';
}
function openEditor(id = state.currentReport || getMonth(state.chapter)?.reports[0]?.id || 1) {
  if (state.phase === 'opening') finishOpening();
  $('edit-select').innerHTML = reports.map(original => { const report = getReport(original.id); return `<option value="${report.id}">Spielmonat ${report.gameMonth} · ${escapeHtml(report.title)}</option>`; }).join('');
  $('edit-select').value = String(getReport(id) ? id : 1);
  fillEditor();
  if (!$('edit-dialog').open) $('edit-dialog').showModal();
}
$('open-editor').addEventListener('click', () => openEditor());
$('reader-content').addEventListener('click', event => {
  const button = event.target.closest('[data-edit]');
  if (button) openEditor(Number(button.dataset.edit));
  if (event.target.closest('[data-show-contents]')) { setView('contents', true); writeRoute('#inhalt'); }
});
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
  if (date < SERVER_START_DATE || date > TIMELINE_END) { toast('Das reale Datum muss innerhalb deiner bisherigen Serverzeit liegen.'); return; }
  const custom = { ...state.custom, [original.id]: { title, body, date } };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(custom)); }
  catch { toast('Der Browser konnte nicht speichern. Lass den Text geöffnet und kopiere ihn zur Sicherung.'); return; }
  state.custom = custom;
  $('edit-dialog').close();
  showReport(original.id);
  toast('Dein Bericht ist auf diesem Gerät gespeichert.');
});

function plainText() {
  const heading = `SUPADA ITAMI — DAS KONOHA-BUCH\n${GAME_MONTH_COUNT} Spielmonate · ${REPORT_COUNT} Berichte · Zenkai DE\nStand: ${dateText(TIMELINE_END)}\n1 Servertag = 1 Spielmonat. Erster Servertag: ${dateText(SERVER_START_DATE)}.\n\nFiktives Rollenspiel-Archiv. Nicht bearbeitete Tätigkeiten sind Textvorschläge.\n\n`;
  return heading + getMonths().map(month => `SPIELMONAT ${String(month.number).padStart(2, '0')} · SERVERTAG ${month.number}\nReales Datum: ${dateText(month.date)}\n\n` + (month.reports.length ? month.reports.map(report => `BERICHT ${String(report.id).padStart(2, '0')}\n${report.title}\n${report.category} · ${state.custom[report.id] ? 'Mein Text' : 'Textvorschlag'}\n\n${report.body}`).join('\n\n' + '—'.repeat(24) + '\n\n') : 'Für diesen Spielmonat ist noch kein Bericht hinterlegt.')).join('\n\n' + '═'.repeat(40) + '\n\n');
}
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob(['\uFEFF', plainText()], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Supada-Itami-Konoha-Buch.txt'; document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
function renderPrint() {
  $('print-content').innerHTML = `<h1 class="print-title">Supada Itami</h1><p class="print-subtitle">Das Konoha-Buch · ${GAME_MONTH_COUNT} Spielmonate · ${REPORT_COUNT} Berichte</p><p class="print-note">Stand: ${dateText(TIMELINE_END)}. 1 Servertag = 1 Spielmonat. Erster Servertag: ${dateText(SERVER_START_DATE)}.</p><p class="print-note">Fiktives Rollenspiel-Archiv. Nicht bearbeitete Tätigkeiten sind Textvorschläge.</p>` + getMonths().map(month => `<article class="print-month"><p class="print-date">SERVERTAG ${month.number} · REALES DATUM ${dateText(month.date)}</p><h2>Spielmonat ${month.number}</h2>${month.reports.length ? month.reports.map(report => `<section class="print-report"><p class="print-date">BERICHT ${String(report.id).padStart(2, '0')} · ${escapeHtml(report.category)}</p><h3>${escapeHtml(report.title)}</h3><p class="print-date">${state.custom[report.id] ? 'Mein Text' : 'Textvorschlag'}</p>${paragraphs(report.body)}</section>`).join('') : '<p>Für diesen Spielmonat ist noch kein Bericht hinterlegt.</p>'}</article>`).join('');
}

window.addEventListener('beforeprint', renderPrint);
$('print').addEventListener('click', () => { renderPrint(); window.print(); });

document.querySelectorAll('[data-report-count]').forEach(element => { element.textContent = String(REPORT_COUNT); });
document.querySelectorAll('[data-month-count]').forEach(element => { element.textContent = String(GAME_MONTH_COUNT); });
document.querySelectorAll('[data-server-days]').forEach(element => { element.textContent = String(GAME_MONTH_COUNT); });
$('chapter-list').setAttribute('aria-label', `${GAME_MONTH_COUNT} Spielmonate`);
document.querySelectorAll('[data-month-for]').forEach(element => { element.textContent = `Spielmonat ${gameMonthForDate(element.dataset.monthFor)}`; });
$('edit-date').min = SERVER_START_DATE;
$('edit-date').max = TIMELINE_END;
$('download').setAttribute('aria-label', `Alle ${REPORT_COUNT} Berichte als Text herunterladen`);
renderContents();
renderReader();
handleRoute(false);
