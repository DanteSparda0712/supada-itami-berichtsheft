'use strict';

const $=id=>document.getElementById(id);
const storageKey='supada-itami-reports-v1';
const state={custom:{},filter:'Alle',search:'',open:false,opening:false,chapter:0,page:0,view:'contents',currentReport:1,motionOff:false};
const BOOK_OPENING_MS=720;
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validDate=date=>typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>='1900-01-01'&&date<='2100-12-31'&&!Number.isNaN(Date.parse(date+'T12:00:00Z'))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date;
const dateText=date=>new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const isRank=report=>report.category==='Rangaufstieg';
function loadSavedReports(){try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(!saved||typeof saved!=='object'||Array.isArray(saved))return;for(const report of reports){const custom=saved[report.id];if(custom&&typeof custom.title==='string'&&typeof custom.body==='string'&&custom.title.trim()&&custom.body.trim()&&custom.title.length<=120&&custom.body.length<=8000)state.custom[report.id]={title:custom.title,body:custom.body,date:validDate(custom.date)?custom.date:report.date};}}catch{}}
function getReport(id){const original=reports.find(report=>report.id===Number(id));if(!original)return null;const custom=state.custom[original.id];return{...original,...custom,title:isRank(original)?original.title:(custom?.title||original.title),date:isRank(original)?original.date:(custom?.date||original.date)};}
loadSavedReports();
try{const preference=localStorage.getItem('supada-itami-motion');state.motionOff=preference?preference==='off':window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{state.motionOff=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
let toastTimer,turnTimer,resizeTimer,openingTimer,openingFocus=false;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
function setMotion(off){state.motionOff=off;document.body.classList.toggle('still',off);document.body.classList.toggle('motion-allowed',!off);$('motion-toggle').setAttribute('aria-pressed',String(off));$('motion-toggle').setAttribute('aria-label',off?'Buchanimationen einschalten':'Buchanimationen ausschalten');$('motion-label').textContent=off?'Bewegung an':'Bewegung aus';if(off&&state.opening)finishOpening();}
setMotion(state.motionOff);
document.querySelector('.embers').innerHTML=Array.from({length:15},(_,index)=>`<i style="--left:${(index*37+9)%100}%;--speed:${12+index%8}s;--delay:-${index*.91}s"></i>`).join('');

function pageBudget(){const width=window.innerWidth,height=window.innerHeight;if(width<=500)return Math.max(55,Math.min(115,Math.floor((height-400)/3.8)));return Math.max(65,Math.min(145,Math.floor((height-420)*(width>1100?.32:.26))));}
let wordsPerPage=pageBudget();
// Split long paragraphs without dropping text. The page body can also scroll at larger text sizes.
function paginate(body,budget=wordsPerPage){
  const pages=[];let current=[],used=0;
  const flush=()=>{if(current.length){pages.push(current);current=[];used=0;}};
  for(const paragraph of body.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean)){
    const words=paragraph.match(/\S+/g)||[];
    if(words.length<=budget){if(used+words.length+(current.length?5:0)>budget)flush();current.push(paragraph);used+=words.length+5;continue;}
    let offset=0;
    while(offset<words.length){
      if(budget-used<20)flush();
      const available=Math.max(1,budget-used);let count=Math.min(available,words.length-offset);
      if(offset+count<words.length){for(let n=count;n>=Math.floor(count*.68);n--){if(/[.!?][”"»)]?$/.test(words[offset+n-1])){count=n;break;}}}
      current.push(words.slice(offset,offset+count).join(' '));used+=count+5;offset+=count;
      if(offset<words.length)flush();
    }
  }
  flush();return pages.length?pages:[['']];
}
const getPages=id=>paginate(getReport(id).body);
function absolutePage(id,page=0){let number=3;for(const report of reports){if(report.id===Number(id))return number+page;number+=getPages(report.id).length;}return 2;}
function filteredReports(){return reports.map(report=>getReport(report.id)).filter(report=>(state.filter==='Alle'||report.category===state.filter)&&(!state.search||`${report.title} ${report.body} ${report.category} ${dateText(report.date)}`.toLocaleLowerCase('de').includes(state.search)));}
function renderContents(){
  const visible=filteredReports();
  $('chapter-list').innerHTML=visible.map(report=>`<li><button type="button" class="chapter-item${isRank(report)?' rank-item':''}" data-chapter="${report.id}" title="${escapeHtml(report.title)}"${state.chapter===report.id?' aria-current="page"':''}><span class="chapter-index">${String(report.id).padStart(2,'0')}</span><span class="chapter-copy"><span class="chapter-title">${escapeHtml(report.title)}</span><span class="chapter-meta">${dateText(report.date)} · ${escapeHtml(report.category)}</span></span><span class="chapter-dots" aria-hidden="true"></span><span class="chapter-page-number" aria-label="Buchseite ${absolutePage(report.id)}">${absolutePage(report.id)}</span></button></li>`).join('');
  $('result-count').textContent=visible.length===13?'13 Kapitel':`${visible.length} von 13 Kapiteln`;
  $('empty-state').hidden=visible.length>0;
  $('book-bookmarks').innerHTML=reports.map(report=>`<button type="button" class="book-bookmark${isRank(report)?' rank-mark':''}" data-chapter="${report.id}" aria-label="Kapitel ${report.id}: ${escapeHtml(getReport(report.id).title)}"${state.chapter===report.id?' aria-current="page"':''}>${String(report.id).padStart(2,'0')}</button>`).join('');
}
function welcomeMarkup(){return `<div class="welcome-page"><p class="welcome-label">DIE PERSON HINTER DEN KAPITELN</p><h2 id="reader-title">Supada<br>Itami<span style="color:var(--red)">.</span></h2><p class="welcome-subtitle">CHUNIN · RAITON · ZENKAI DE</p><figure class="welcome-portrait"><img src="assets/supada-itami.png" alt="Supada Itami mit weißen Haaren, roten Gesichtsmarkierungen und Chunin-Weste." width="1287" height="1222"></figure><p class="welcome-intro">Jedes Training, jede Aufgabe und jeder Schritt nach vorn hat seinen Platz in diesem Buch. Wähle links ein Kapitel oder blättere zur ersten Seite.</p><dl class="welcome-facts"><div><dt>HEIMAT</dt><dd>Konohagakure</dd></div><div><dt>RANG</dt><dd>Chunin</dd></div><div><dt>ELEMENT</dt><dd>Raiton · Blitz</dd></div><div><dt>MEIN FOKUS</dt><dd>Taijutsu &amp; Chakra</dd></div></dl><blockquote class="welcome-quote">„Mein nächster Schritt ist immer nach vorn.“</blockquote><div class="welcome-ranks"><button type="button" data-chapter="6"><span>Neuer Rang: Bestätigter Genin</span><time datetime="2026-10-28">28.10.2026</time></button><button type="button" data-chapter="13"><span>Neuer Rang: Chunin</span><time datetime="2026-11-04">04.11.2026</time></button></div></div>`;}
function renderReader(direction='none'){
  const reader=$('reader-page');reader.classList.remove('turning-forward','turning-back');clearTimeout(turnTimer);
  if(state.chapter===0){
    $('reader-content').innerHTML=welcomeMarkup();$('running-chapter').textContent='DIE SHINOBI-AKTE';$('running-date').textContent='BAND I · 2026';$('reading-position').textContent='DEIN BUCH BEGINNT HIER';$('page-number').textContent='2';$('previous-page').disabled=true;$('next-page').disabled=false;
  }else{
    const report=getReport(state.chapter),pages=getPages(state.chapter);state.page=Math.min(Math.max(0,state.page),pages.length-1);
    $('reader-content').innerHTML=`<article class="chapter-content"><p class="reader-kicker">KAPITEL ${String(report.id).padStart(2,'0')} · ${escapeHtml(report.category.toUpperCase())}${state.page?' · FORTSETZUNG':''}</p><h2 id="reader-title" class="reader-title">${escapeHtml(report.title)}</h2><div class="reader-date"><time datetime="${report.date}">${dateText(report.date)} · ${escapeHtml(report.topic||report.category)}</time><span>${state.custom[report.id]?'MEIN TEXT':'TEXTVORSCHLAG'}</span></div><div class="chapter-body" tabindex="0" aria-label="Text auf Buchseite ${absolutePage(report.id,state.page)}">${pages[state.page].map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</div><div class="chapter-tail"><span class="ink-stamp" aria-hidden="true">忍</span><button type="button" class="edit-chapter-link" data-edit="${report.id}">Kapitel bearbeiten ✎</button></div></article>`;
    $('running-chapter').textContent='SUPADA ITAMI · BERICHTSHEFT';$('running-date').textContent=`KAPITEL ${String(report.id).padStart(2,'0')}`;
    $('reading-position').textContent=`KAPITEL ${report.id} VON 13 · SEITE ${state.page+1} VON ${pages.length}`;$('page-number').textContent=String(absolutePage(report.id,state.page));$('previous-page').disabled=false;$('next-page').disabled=report.id===13&&state.page===pages.length-1;
  }
  if(direction!=='none'&&!state.motionOff){void reader.offsetWidth;reader.classList.add(direction==='back'?'turning-back':'turning-forward');turnTimer=setTimeout(()=>reader.classList.remove('turning-forward','turning-back'),450);}
}
function setView(view,focus=false){
  state.view=view;$('open-spread').classList.toggle('show-reader',view==='reader');const mobile=window.innerWidth<=800;
  $('mobile-contents').setAttribute('aria-pressed',String(view==='contents'));$('mobile-reader').setAttribute('aria-pressed',String(view==='reader'));
  $('contents-page').setAttribute('aria-hidden',String(mobile&&view==='reader'));$('reader-page').setAttribute('aria-hidden',String(mobile&&view==='contents'));$('contents-page').inert=mobile&&view==='reader';$('reader-page').inert=mobile&&view==='contents';
  if(focus&&state.opening){openingFocus=true;return;}
  if(focus){const target=view==='reader'?$('reader-page'):$('contents-page');target.focus({preventScroll:true});}
}
function writeHash(hash){try{history.replaceState(null,'',hash);}catch{}}
function syncBookVisibility(){
  const ready=state.open&&!state.opening;
  $('open-spread').hidden=!ready;$('open-spread').inert=!ready;$('book-tools').hidden=!ready;
  $('buch').classList.toggle('is-open',ready);$('buch').classList.toggle('is-opening',state.opening);
  if(state.opening)$('buch').setAttribute('aria-busy','true');else $('buch').removeAttribute('aria-busy');
  $('closed-book').setAttribute('aria-hidden',String(state.open));$('closed-book').inert=state.open;
  $('cover-heading').setAttribute('aria-hidden',String(state.open));$('cover-callout').setAttribute('aria-hidden',String(state.open));$('cover-callout').inert=state.open;
  $('open-book-cover').disabled=state.open;$('open-book').disabled=state.open;
}
function finishOpening(restoreFocus=true){
  clearTimeout(openingTimer);const shouldFocus=openingFocus;openingFocus=false;state.opening=false;syncBookVisibility();
  if(state.open){$('opening-status').textContent='Buch geöffnet. 13 Kapitel stehen im Inhaltsverzeichnis.';if(restoreFocus&&shouldFocus)setView(state.view,true);}
}
function openBook(options={}){
  const animate=!state.open&&!state.motionOff&&options.animate!==false;
  state.open=true;
  if(animate){state.opening=true;openingFocus=Boolean(options.focus);$('buch').style.setProperty('--book-opening-duration',BOOK_OPENING_MS+'ms');$('opening-status').textContent='Das Konoha-Buch öffnet sich.';clearTimeout(openingTimer);openingTimer=setTimeout(()=>finishOpening(),BOOK_OPENING_MS+120);}
  syncBookVisibility();setView(options.view||'contents',Boolean(options.focus));renderContents();renderReader();
  if(!state.opening)$('opening-status').textContent='Buch geöffnet. 13 Kapitel stehen im Inhaltsverzeichnis.';
  if(options.hash!==false)writeHash(state.chapter?'#bericht-'+state.chapter:'#inhalt');
}
function closeBook(options={}){
  state.open=false;finishOpening(false);$('opening-status').textContent='Buch zugeklappt.';
  if(options.hash!==false)writeHash('#start');if(options.focus!==false)$('open-book-cover').focus({preventScroll:true});
}
$('open-book-cover').addEventListener('animationend',event=>{if(state.opening&&event.target===$('open-book-cover')&&event.animationName==='konoha-simple-open')finishOpening();});
function selectChapter(id,page=0,options={}){
  id=Number(id);if(!getReport(id))return false;const old=state.chapter*100+state.page;
  if(state.opening&&options.animate===false)finishOpening(false);
  if(!state.open)openBook({hash:false,animate:options.animate});state.chapter=id;state.currentReport=id;state.page=Math.min(Math.max(0,page),getPages(id).length-1);
  setView('reader',options.focus!==false);renderContents();renderReader(options.animate===false?'none':id*100+state.page<old?'back':'forward');if(options.hash!==false)writeHash(`#bericht-${id}`);return true;
}
function showProfile(options={}){if(!state.open)openBook({hash:false,animate:options.animate});state.chapter=0;state.page=0;setView('reader',options.focus!==false);renderContents();renderReader();if(options.hash!==false)writeHash('#steckbrief');}
function turnPage(delta){
  if(state.opening)return;
  if(!state.open){openBook({focus:true});return;}
  if(state.chapter===0){if(delta>0)selectChapter(1,0,{focus:false});return;}
  const pages=getPages(state.chapter),next=state.page+delta;
  if(next>=0&&next<pages.length){state.page=next;renderReader(delta<0?'back':'forward');return;}
  if(delta>0&&state.chapter<13)selectChapter(state.chapter+1,0,{focus:false});
  else if(delta<0&&state.chapter>1)selectChapter(state.chapter-1,getPages(state.chapter-1).length-1,{focus:false});
  else if(delta<0)showProfile({focus:false});
}
function goTo(hash,options={}){
  const match=String(hash).match(/^#(?:bericht|monat)-(\d+)$/);if(match)return selectChapter(Number(match[1]),0,options);
  if(['#start',''].includes(hash)){closeBook(options);return true;}
  if(['#buch','#inhalt','#berichte'].includes(hash)){openBook({focus:options.focus!==false,hash:options.hash,animate:options.animate});return true;}
  if(['#steckbrief','#rangweg'].includes(hash)){showProfile(options);return true;}
  if(hash==='#ausblick')return selectChapter(13,getPages(13).length-1,options);
  return false;
}
$('contents-page').tabIndex=-1;
$('open-book-cover').addEventListener('click',()=>openBook({focus:true}));$('open-book').addEventListener('click',()=>openBook({focus:true}));$('close-book').addEventListener('click',()=>closeBook());
$('show-contents').addEventListener('click',()=>{if(!state.open)openBook({focus:true});else{setView('contents',true);writeHash('#inhalt');}});
$('show-profile').addEventListener('click',()=>showProfile());$('mobile-contents').addEventListener('click',()=>setView('contents',true));$('mobile-reader').addEventListener('click',()=>setView('reader',true));
$('previous-page').addEventListener('click',()=>turnPage(-1));$('next-page').addEventListener('click',()=>turnPage(1));
document.addEventListener('click',event=>{
  const chapter=event.target.closest?.('[data-chapter]');if(chapter){selectChapter(Number(chapter.dataset.chapter));return;}
  const edit=event.target.closest?.('[data-edit]');if(edit){openEditor(Number(edit.dataset.edit));return;}
  const link=event.target.closest?.('a[href^="#"]');if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&goTo(link.getAttribute('href')))event.preventDefault();
});
$('chapter-search').addEventListener('input',event=>{state.search=event.target.value.trim().toLocaleLowerCase('de');renderContents();});$('chapter-category').addEventListener('change',event=>{state.filter=event.target.value;renderContents();});$('reset-search').addEventListener('click',()=>{state.search='';state.filter='Alle';$('chapter-search').value='';$('chapter-category').value='Alle';renderContents();$('chapter-search').focus();});

function fillEditor(id){const report=getReport(id);if(!report)return;state.currentReport=Number(id);$('edit-select').value=String(id);$('edit-title').value=report.title;$('edit-title').readOnly=isRank(report);$('edit-date').value=report.date;$('edit-date').readOnly=isRank(report);$('edit-body').value=report.body;$('editor-note').textContent=isRank(report)?'Rang und Datum bleiben erhalten. Ergänze hier deine tatsächlichen Tätigkeiten. Dein Text wird auf diesem Gerät im Browser gespeichert.':'Passe den Textvorschlag und das Datum an deine Erlebnisse an. Dein Kapitel wird auf diesem Gerät im Browser gespeichert.';}
function renderEditorChoices(){$('edit-select').innerHTML=reports.map(report=>`<option value="${report.id}">${String(report.id).padStart(2,'0')} · ${escapeHtml(getReport(report.id).title)}</option>`).join('');}
function openEditor(id=state.currentReport){if(state.opening)finishOpening(false);renderEditorChoices();fillEditor(id);if(!$('edit-dialog').open)$('edit-dialog').showModal();}
$('open-editor').addEventListener('click',()=>openEditor());$('edit-select').addEventListener('change',event=>fillEditor(Number(event.target.value)));$('close-editor').addEventListener('click',()=>$('edit-dialog').close());$('cancel-edit').addEventListener('click',()=>$('edit-dialog').close());
$('edit-form').addEventListener('submit',event=>{
  event.preventDefault();const report=getReport(Number($('edit-select').value));const title=$('edit-title').value.trim(),body=$('edit-body').value.trim(),date=$('edit-date').value;
  if(!report||!title||title.length>120||!body||body.length>8000||!validDate(date))return;
  const next={...state.custom,[report.id]:{title:isRank(report)?report.title:title,date:isRank(report)?report.date:date,body}};
  try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{toast('Speichern ist in diesem Browser nicht möglich. Dein Text bleibt im Editor.');return;}
  state.custom=next;renderContents();renderReader();$('edit-dialog').close();toast('Dein Kapitel wurde auf diesem Gerät gespeichert.');
});
$('motion-toggle').addEventListener('click',()=>{setMotion(!state.motionOff);try{localStorage.setItem('supada-itami-motion',state.motionOff?'off':'on');}catch{}toast(state.motionOff?'Bewegung ausgeschaltet.':'Bewegung eingeschaltet.');});
document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||document.querySelector('dialog[open]')||event.target.closest?.('input,textarea,select,[contenteditable]'))return;
  const key=event.key.toLowerCase();
  if(state.opening){if(key==='escape'){event.preventDefault();closeBook();}else if(['enter','arrowright','arrowleft','pagedown','pageup'].includes(key))event.preventDefault();return;}
  if(!state.open){if(key==='enter'){event.preventDefault();openBook({focus:true});}return;}
  if(['arrowright','pagedown'].includes(key)){event.preventDefault();turnPage(1);}else if(['arrowleft','pageup'].includes(key)){event.preventDefault();turnPage(-1);}else if(key==='escape'){event.preventDefault();closeBook();}else if(key==='e'){event.preventDefault();openEditor();}else if(key==='i'||key==='home'){event.preventDefault();setView('contents',true);}else if(key==='end'){event.preventDefault();selectChapter(13,getPages(13).length-1);}else if(/^[1-9]$/.test(key)){event.preventDefault();selectChapter(Number(key));}
});
let touchStart=null;
$('reader-page').addEventListener('touchstart',event=>{const touch=event.touches[0];touchStart=touch?{x:touch.clientX,y:touch.clientY}:null;},{passive:true});
$('reader-page').addEventListener('touchend',event=>{const touch=event.changedTouches[0];if(!touchStart||!touch)return;const dx=touch.clientX-touchStart.x,dy=touch.clientY-touchStart.y;touchStart=null;if(window.getSelection()?.toString())return;if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.5)turnPage(dx<0?1:-1);},{passive:true});
window.addEventListener('resize',()=>{if(state.opening)finishOpening(false);clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const budget=pageBudget();if(budget!==wordsPerPage){wordsPerPage=budget;renderContents();renderReader();}setView(state.view);},140);});
window.addEventListener('hashchange',()=>goTo(location.hash,{hash:false,animate:false,focus:false}));

function exportText(){return 'Das Konoha-Buch\nSupada Itami · Chunin\n\nFiktive Musterberichte für dein Rollenspiel. Unbearbeitete Tätigkeiten und weitere Daten sind Textvorschläge.\n\n'+reports.map(original=>{const report=getReport(original.id);return `Kapitel ${String(report.id).padStart(2,'0')} — ${report.title} · ${dateText(report.date)}${state.custom[report.id]?'':' [Textvorschlag]'}\n\n${report.body}`;}).join('\n\n────────────────────\n\n');}
$('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\uFEFF'+exportText()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='Konoha_Buch_Supada_Itami.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Alle 13 Kapitel wurden zum Herunterladen bereitgestellt.');});
function preparePrint(){if($('print-reports'))return;const section=document.createElement('section');section.id='print-reports';section.innerHTML='<h1>Das Konoha-Buch · Supada Itami</h1><p>Chunin seit 04.11.2026 · Bestätigter Genin seit 28.10.2026</p><p>Fiktive Musterberichte für dein Rollenspiel. Unbearbeitete Tätigkeiten und weitere Daten sind Textvorschläge.</p>'+reports.map(original=>{const report=getReport(original.id);return `<article><h2>Kapitel ${report.id} · ${escapeHtml(report.title)}</h2><p>${dateText(report.date)} · ${escapeHtml(report.category)}${state.custom[report.id]?'':' · Textvorschlag'}</p>${report.body.split(/\n\s*\n/).map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</article>`;}).join('');document.body.append(section);}
function finishPrint(){$('print-reports')?.remove();}
window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',finishPrint);$('print').addEventListener('click',()=>{preparePrint();window.print();});
renderContents();renderReader();renderEditorChoices();
if(location.hash&&location.hash!=='#start')goTo(location.hash,{hash:false,animate:false,focus:false});
