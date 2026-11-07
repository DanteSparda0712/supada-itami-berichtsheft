'use strict';

const $=id=>document.getElementById(id);
const storageKey='supada-itami-reports-v1';
const state={custom:{},filter:'Alle',search:'',sort:'oldest',currentReport:13,currentScene:0,motionOff:false};
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validDate=date=>typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>='1900-01-01'&&date<='2100-12-31'&&!Number.isNaN(Date.parse(date+'T12:00:00Z'))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date;
const dateText=date=>new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const monthText=date=>new Intl.DateTimeFormat('de-DE',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const isRank=report=>report.category==='Rangaufstieg';
function loadSavedReports(){
  try{
    const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');
    if(!saved||typeof saved!=='object'||Array.isArray(saved))return;
    for(const report of reports){const custom=saved[report.id];if(custom&&typeof custom.title==='string'&&typeof custom.body==='string'&&custom.title.trim()&&custom.body.trim()&&custom.title.length<=120&&custom.body.length<=8000){state.custom[report.id]={title:custom.title,body:custom.body,date:validDate(custom.date)?custom.date:report.date};}}
  }catch{}
}
function getReport(id){const original=reports.find(report=>report.id===Number(id));if(!original)return null;const custom=state.custom[original.id];return{...original,...custom,title:isRank(original)?original.title:(custom?.title||original.title),date:isRank(original)?original.date:(custom?.date||original.date)};}
loadSavedReports();
try{const preference=localStorage.getItem('supada-itami-motion');state.motionOff=preference?preference==='off':window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{state.motionOff=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
function setMotion(off){state.motionOff=off;document.body.classList.toggle('still',off);document.body.classList.toggle('motion-allowed',!off);$('motion-toggle').setAttribute('aria-pressed',String(off));$('motion-label').textContent=off?'Bewegung an':'Bewegung aus';}
setMotion(state.motionOff);

function reportMarkup(id){
  const report=getReport(id),custom=Boolean(state.custom[id]);
  const symbol=isRank(report)?'忍':report.category==='Training'?'術':'巻';
  const sceneClass=report.category==='Training'?'forest-background':'village-background';
  const next=id<13?`#bericht-${id+1}`:'#ausblick';
  return `<div class="scene-background ${sceneClass}" aria-hidden="true"></div><span class="scene-kanji" aria-hidden="true">${symbol}</span><div class="chapter-heading"><p class="eyebrow"><span></span>BERICHT ${String(id).padStart(2,'0')} / ${escapeHtml(monthText(report.date).toLocaleUpperCase('de'))}</p><h2>${escapeHtml(report.title)}</h2></div><div class="scroll-frame"><article class="scroll-paper parchment" tabindex="0" aria-label="Vollständiger Bericht ${id}: ${escapeHtml(report.title)}"><div class="paper-content"><div class="paper-meta"><time datetime="${report.date}">${dateText(report.date)} · ${escapeHtml(report.topic||report.category)}</time><span>${custom?'MEIN PERSÖNLICHER TEXT':'BEARBEITBARER TEXTVORSCHLAG'}</span></div><div class="paper-body">${report.body.split(/\n\s*\n/).map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</div><div class="paper-footer"><span class="ink-stamp" aria-hidden="true">忍</span><div><button class="paper-link" type="button" data-edit="${id}">Text anpassen ✎</button><a class="paper-link" href="${next}">Nächstes Kapitel →</a></div></div></div></article><span class="wood-rod left-rod" aria-hidden="true"></span><span class="wood-rod right-rod" aria-hidden="true"></span></div><span class="report-number-bg" aria-hidden="true">${String(id).padStart(2,'0')}</span><div class="scene-bottom"><span>${escapeHtml(report.category.toUpperCase())} / SUPADA ITAMI</span><span>${String(id).padStart(2,'0')} — 13</span></div>`;
}
function renderScenes(){
  $('berichte').innerHTML=reports.map(original=>`<section class="scene report-scene${isRank(original)?' rank-report':''}" id="bericht-${original.id}" tabindex="-1" data-report="${original.id}" data-scene-label="${escapeHtml(original.title)}">${reportMarkup(original.id)}</section>`).join('');
  $('edit-select').innerHTML=reports.map(original=>`<option value="${original.id}">${String(original.id).padStart(2,'0')} · ${escapeHtml(getReport(original.id).title)}</option>`).join('');
}
renderScenes();
const scenes=[...document.querySelectorAll('main .scene')];
function buildRail(){
  $('chapter-rail').innerHTML=scenes.map((scene,index)=>{const number=scene.dataset.report;const label=number?`${String(number).padStart(2,'0')} · ${getReport(number).title}`:scene.dataset.sceneLabel;return `<a class="chapter-link" href="#${scene.id}" aria-label="${escapeHtml(label)}"${index===state.currentScene?' aria-current="step"':''}><i aria-hidden="true"></i><span>${escapeHtml(number?String(number).padStart(2,'0'):label)}</span></a>`;}).join('');
}
buildRail();
for(const host of document.querySelectorAll('.embers'))host.innerHTML=Array.from({length:20},(_,index)=>`<i style="--left:${(index*37+9)%100}%;--speed:${9+index%8}s;--delay:-${index*.71}s"></i>`).join('');

function filteredReports(){return reports.map(original=>getReport(original.id)).filter(report=>(state.filter==='Alle'||report.category===state.filter)&&(!state.search||`${report.title} ${report.body} ${report.category} ${dateText(report.date)}`.toLocaleLowerCase('de').includes(state.search))).sort((a,b)=>state.sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));}
function renderArchive(){
  const visible=filteredReports();
  $('archive-list').innerHTML=visible.map(report=>`<li><a href="#bericht-${report.id}" class="archive-link"><span>${String(report.id).padStart(2,'0')}</span><span>${escapeHtml(report.title)}<small>${dateText(report.date)} · ${escapeHtml(report.category)} · ${state.custom[report.id]?'MEIN TEXT':'TEXTVORSCHLAG'}</small></span><span aria-hidden="true">↗</span></a></li>`).join('');
  $('result-count').textContent=`${visible.length} von 13 Kapiteln`;
  $('empty-state').hidden=visible.length>0;
}
renderArchive();

function normalizedHash(hash){const monthAlias=hash.match(/^#monat-(\d+)$/);if(monthAlias)return `bericht-${monthAlias[1]}`;return hash.replace(/^#/,'');}
function goTo(target,options={}){
  const id=normalizedHash(target),element=$(id);
  if(!element)return false;
  for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();
  element.scrollIntoView({behavior:options.instant||state.motionOff?'auto':'smooth',block:'start'});
  const sceneIndex=scenes.findIndex(scene=>scene.id===id);
  if(sceneIndex>=0){state.currentScene=sceneIndex;if(scenes[sceneIndex].dataset.report)state.currentReport=Number(scenes[sceneIndex].dataset.report);}
  if(options.focus!==false)element.focus?.({preventScroll:true});
  try{history.replaceState(null,'',`#${id}`);}catch{}
  return true;
}
function markScene(index){
  if(index<0)return;
  state.currentScene=index;
  scenes.forEach((scene,i)=>scene.classList.toggle('active',i===index));
  if(scenes[index].dataset.report)state.currentReport=Number(scenes[index].dataset.report);
  document.querySelectorAll('.chapter-link').forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(visible.length)markScene(scenes.indexOf(visible[0].target));},{threshold:[.3,.55,.75]});scenes.forEach(scene=>observer.observe(scene));}
let scrollScheduled=false;
function updateProgress(){const total=document.documentElement.scrollHeight-window.innerHeight;const progress=total>0?Math.min(1,Math.max(0,window.scrollY/total)):0;$('progress-fill').style.transform=`scaleX(${progress})`;scrollScheduled=false;}
window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
window.addEventListener('resize',updateProgress);
updateProgress();
document.addEventListener('click',event=>{
  const edit=event.target.closest('[data-edit]');if(edit){openEditor(Number(edit.dataset.edit));return;}
  const close=event.target.closest('[data-close]');if(close){$(close.dataset.close)?.close();return;}
  const anchor=event.target.closest('a[href^="#"]');
  if(anchor&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&goTo(anchor.getAttribute('href')))event.preventDefault();
});
window.addEventListener('hashchange',()=>{if(location.hash)goTo(location.hash,{instant:true});});

function fillEditor(id){
  const report=getReport(id);if(!report)return;
  state.currentReport=Number(id);$('edit-select').value=String(id);$('edit-title').value=report.title;$('edit-title').readOnly=isRank(report);$('edit-date').value=report.date;$('edit-date').readOnly=isRank(report);$('edit-body').value=report.body;
  $('editor-note').textContent=isRank(report)?'Rang und Datum sind festgelegt. Ergänze hier deine tatsächlichen Tätigkeiten. Dein Text wird auf diesem Gerät im Browser gespeichert.':'Passe den Textvorschlag und das Datum an deine Erlebnisse an. Dein Bericht wird auf diesem Gerät im Browser gespeichert.';
}
function openEditor(id=state.currentReport){fillEditor(id);$('archive-dialog').close();if(!$('edit-dialog').open)$('edit-dialog').showModal();}
$('open-editor').addEventListener('click',()=>openEditor());
$('edit-select').addEventListener('change',event=>fillEditor(Number(event.target.value)));
$('open-archive').addEventListener('click',()=>{renderArchive();$('archive-dialog').showModal();});
$('edit-form').addEventListener('submit',event=>{
  event.preventDefault();const report=getReport(Number($('edit-select').value));
  const title=$('edit-title').value.trim(),body=$('edit-body').value.trim(),date=$('edit-date').value;
  if(!title||title.length>120||!body||body.length>8000||!validDate(date))return;
  const next={...state.custom,[report.id]:{title:isRank(report)?report.title:title,date:isRank(report)?report.date:date,body}};
  try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{toast('Speichern ist in diesem Browser nicht möglich. Dein Text bleibt im Editor.');return;}
  state.custom=next;
  const scene=$(`bericht-${report.id}`);scene.innerHTML=reportMarkup(report.id);scene.dataset.sceneLabel=getReport(report.id).title;
  const selected=$('edit-select').querySelector(`option[value="${report.id}"]`);if(selected)selected.textContent=`${String(report.id).padStart(2,'0')} · ${getReport(report.id).title}`;
  buildRail();renderArchive();$('edit-dialog').close();toast('Dein Bericht wurde auf diesem Gerät gespeichert.');
});
$('report-search').addEventListener('input',event=>{state.search=event.target.value.trim().toLocaleLowerCase('de');renderArchive();});
$('report-category').addEventListener('change',event=>{state.filter=event.target.value;renderArchive();});
$('report-sort').addEventListener('change',event=>{state.sort=event.target.value;renderArchive();});
$('reset-search').addEventListener('click',()=>{state.search='';state.filter='Alle';$('report-search').value='';$('report-category').value='Alle';renderArchive();$('report-search').focus();});
$('motion-toggle').addEventListener('click',()=>{setMotion(!state.motionOff);try{localStorage.setItem('supada-itami-motion',state.motionOff?'off':'on');}catch{}toast(state.motionOff?'Bewegung ausgeschaltet.':'Bewegung eingeschaltet.');});
document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey)return;
  if($('opening').open){if(event.key==='Enter'){event.preventDefault();dismissOpening(true);}return;}
  if(document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,[contenteditable],.scroll-paper'))return;
  const key=event.key.toLowerCase();
  if(key==='e'){event.preventDefault();openEditor();return;}
  let target;
  if(['arrowdown','arrowright','pagedown','j'].includes(key))target=scenes[Math.min(scenes.length-1,state.currentScene+1)];
  else if(['arrowup','arrowleft','pageup','k'].includes(key))target=scenes[Math.max(0,state.currentScene-1)];
  else if(key==='home')target=scenes[0];else if(key==='end')target=scenes[scenes.length-1];
  else if(/^[1-9]$/.test(key))target=$(`bericht-${key}`);
  if(target){event.preventDefault();goTo(`#${target.id}`);}
});

function exportText(){return 'Berichtsheft für Zenkai DE\nSupada Itami · Chunin\n\nFiktive Musterberichte für dein Rollenspiel. Unbearbeitete Tätigkeiten und weitere Daten sind Textvorschläge.\n\n'+reports.map(original=>{const report=getReport(original.id);return `Bericht ${String(report.id).padStart(2,'0')} — ${report.title} · ${dateText(report.date)}${state.custom[report.id]?'':' [Textvorschlag]'}\n\n${report.body}`;}).join('\n\n────────────────────\n\n');}
$('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\uFEFF'+exportText()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='Berichtsheft_Supada_Itami.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Alle 13 Berichte wurden zum Herunterladen bereitgestellt.');});
function preparePrint(){if($('print-reports'))return;const section=document.createElement('section');section.id='print-reports';section.innerHTML='<h1>Supada Itami · Shinobi-Berichtsheft</h1><p>Chunin seit 04.11.2026 · Bestätigter Genin seit 28.10.2026</p><p>Fiktive Musterberichte für dein Rollenspiel. Unbearbeitete Tätigkeiten und weitere Daten sind Textvorschläge.</p>'+reports.map(original=>{const report=getReport(original.id);return `<article><h2>${escapeHtml(report.title)}</h2><p>${dateText(report.date)} · ${escapeHtml(report.category)}${state.custom[report.id]?'':' · Textvorschlag'}</p>${report.body.split(/\n\s*\n/).map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</article>`;}).join('');document.body.append(section);}
function finishPrint(){$('print-reports')?.remove();}
window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',finishPrint);
$('print').addEventListener('click',()=>{preparePrint();window.print();});

function dismissOpening(animate=false){
  const dialog=$('opening');if(!dialog.open||dialog.classList.contains('is-opening'))return;
  try{sessionStorage.setItem('supada-itami-intro-seen','1');}catch{}
  const done=()=>{dialog.close();dialog.classList.remove('is-opening');$('start').focus({preventScroll:true});};
  if(animate&&!state.motionOff){dialog.classList.add('is-opening');setTimeout(done,650);}else done();
}
$('open-scroll').addEventListener('click',()=>dismissOpening(true));$('skip-opening').addEventListener('click',()=>dismissOpening());
$('opening').addEventListener('cancel',event=>{event.preventDefault();dismissOpening();});
let seenIntro=false;try{seenIntro=sessionStorage.getItem('supada-itami-intro-seen')==='1';}catch{}
if(location.hash){requestAnimationFrame(()=>goTo(location.hash,{instant:true,focus:false}));}else if(!seenIntro&&!state.motionOff)$('opening').showModal();
