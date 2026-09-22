/* Ticket. 1.0.4 — prévias persistentes nos registros, seleção bloqueada e navegação Android */
'use strict';

const TICKET_V104_VIEWS = new Set(['dashboard','records','capture','reports','calendar','settings','storage','profile','help','registration']);
const ticketEvidenceUrlsV104 = new Map();
let ticketHistoryFromPopV104 = false;
let ticketHistoryReadyV104 = false;

function v104EvidenceIdForPunch(record,punch,index){
  return punch?.evidenceId || record?.evidenceIds?.[index] || '';
}

function v104RecordEvidenceMarkup(record){
  const punches=[...(record?.punches||[])].sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  const receiptItems=punches.map((p,index)=>{
    const id=v104EvidenceIdForPunch(record,p,index);
    if(!id) return '';
    const label=PUNCH_TYPES.find(item=>item.key===p.type)?.label || 'Ponto';
    return `<button type="button" class="record-evidence-thumb is-loading" data-evidence-id="${esc(id)}" data-evidence-label="${esc(label)}" data-evidence-time="${esc(p.time||'--:--')}" aria-label="Abrir prévia de ${esc(label)} às ${esc(p.time||'--:--')}"><span class="record-thumb-media">${icon('camera',21)}</span><span class="record-thumb-caption"><strong>${esc(label)}</strong><small>${esc(p.time||'--:--')}</small></span></button>`;
  }).filter(Boolean);

  const envItems=(record?.environmentIds||[]).map((id,index)=>id?`<button type="button" class="record-evidence-thumb environment is-loading" data-evidence-id="${esc(id)}" data-evidence-label="Ambiente${(record.environmentIds||[]).length>1?` ${index+1}`:''}" data-evidence-time="" aria-label="Abrir prévia da foto do ambiente"><span class="record-thumb-media">${icon('camera',21)}</span><span class="record-thumb-caption"><strong>Ambiente</strong><small>Evidência</small></span></button>`:'').filter(Boolean);
  const items=[...receiptItems,...envItems];
  if(!items.length){
    return `<div class="record-evidence-strip record-evidence-empty"><div class="record-evidence-title"><span>${icon('camera',16)} Prévias do registro</span><small>Registro bloqueado</small></div><p>Este registro não possui uma foto recuperável vinculada.</p></div>`;
  }
  return `<div class="record-evidence-strip"><div class="record-evidence-title"><span>${icon('camera',16)} Prévias do registro</span><small>${items.length} ${items.length===1?'imagem':'imagens'} · somente leitura</small></div><div class="record-evidence-scroller">${items.join('')}</div></div>`;
}

const originalRecordCardV104=recordCard;
recordCard=function(record){
  const html=originalRecordCardV104(record);
  if(state.view!=='records') return html;
  return html.replace('</article>',`${v104RecordEvidenceMarkup(record)}</article>`);
};

async function v104LoadEvidence(button){
  if(!button || button.dataset.evidenceHydrated==='1' || button.dataset.evidenceHydrated==='loading') return;
  const id=button.dataset.evidenceId;
  if(!id) return;
  button.dataset.evidenceHydrated='loading';
  try{
    const evidence=await getEvidence(id);
    if(!evidence?.blob){
      button.classList.remove('is-loading');
      button.classList.add('is-missing');
      button.dataset.evidenceHydrated='1';
      button.querySelector('.record-thumb-media')?.insertAdjacentHTML('beforeend','<small>Indisponível</small>');
      return;
    }
    let url=ticketEvidenceUrlsV104.get(id);
    if(!url){
      url=URL.createObjectURL(evidence.blob);
      ticketEvidenceUrlsV104.set(id,url);
    }
    const media=button.querySelector('.record-thumb-media');
    if(media){
      media.innerHTML=`<img src="${url}" alt="Prévia ${esc(button.dataset.evidenceLabel||'do registro')}" draggable="false">`;
    }
    button.classList.remove('is-loading');
    button.classList.add('is-ready');
    button.dataset.evidenceHydrated='1';
    button.dataset.evidenceHash=evidence.integrityHash||'';
    button.dataset.evidenceLockedAt=evidence.lockedAt||evidence.createdAt||'';
    button.addEventListener('click',()=>v104OpenEvidencePreview({
      url,
      label:button.dataset.evidenceLabel||'Registro',
      time:button.dataset.evidenceTime||'',
      hash:evidence.integrityHash||'',
      lockedAt:evidence.lockedAt||evidence.createdAt||''
    }));
  }catch(error){
    console.warn('Ticket: não foi possível carregar a prévia',error);
    button.classList.remove('is-loading');
    button.classList.add('is-missing');
    button.dataset.evidenceHydrated='1';
  }
}

function v104HydrateRecordPreviews(root=document){
  root.querySelectorAll?.('.record-evidence-thumb[data-evidence-id]').forEach(button=>v104LoadEvidence(button));
}

function v104EnsureEvidenceModal(){
  let modal=document.querySelector('#recordEvidenceModal');
  if(modal) return modal;
  modal=document.createElement('div');
  modal.id='recordEvidenceModal';
  modal.className='record-evidence-modal';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<div class="record-evidence-backdrop" data-close-evidence></div><section class="record-evidence-dialog" role="dialog" aria-modal="true" aria-label="Prévia do registro"><header><div><span class="settings-kicker">REGISTRO BLOQUEADO</span><h3 id="evidenceModalTitle">Prévia</h3><p id="evidenceModalSubtitle"></p></div><button type="button" class="record-evidence-close" data-close-evidence aria-label="Fechar">×</button></header><div class="record-evidence-full"><img id="evidenceModalImage" alt="Prévia ampliada do registro" draggable="false"></div><footer><span class="locked-badge">${typeof lockGlyph==='function'?lockGlyph(14):'🔒'} Somente leitura</span><small id="evidenceModalIntegrity"></small></footer></section>`;
  document.body.append(modal);
  modal.querySelectorAll('[data-close-evidence]').forEach(el=>el.addEventListener('click',()=>v104CloseEvidencePreview()));
  return modal;
}

function v104OpenEvidencePreview({url,label,time,hash,lockedAt}){
  const modal=v104EnsureEvidenceModal();
  modal.querySelector('#evidenceModalImage').src=url;
  modal.querySelector('#evidenceModalTitle').textContent=label+(time?` · ${time}`:'');
  const lockDate=lockedAt?new Date(lockedAt):null;
  const lockText=lockDate && !Number.isNaN(lockDate.getTime()) ? `Bloqueado em ${lockDate.toLocaleString('pt-BR')}` : 'Registro imutável';
  modal.querySelector('#evidenceModalSubtitle').textContent=lockText;
  modal.querySelector('#evidenceModalIntegrity').textContent=hash?`Integridade SHA-256: ${hash.slice(0,12)}…`:'Evidência preservada no registro';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.documentElement.classList.add('evidence-modal-open');
  if(state.profile && !ticketHistoryFromPopV104){
    history.pushState({ticketApp:true,ticketNavigation162:true,view:state.view,preview:true},'',`${location.pathname}${location.search}#${state.view}`);
  }
}

function v104HideEvidencePreview(){
  const modal=document.querySelector('#recordEvidenceModal');
  if(!modal?.classList.contains('open')) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.documentElement.classList.remove('evidence-modal-open');
}

function v104CloseEvidencePreview(){
  if(history.state?.ticketApp && history.state?.preview){
    history.back();
  }else{
    v104HideEvidencePreview();
  }
}

const originalRenderViewV104=renderView;
renderView=function(){
  const result=originalRenderViewV104();
  queueMicrotask(()=>v104HydrateRecordPreviews(document));
  return result;
};

function v104RouteUrl(view){
  return `${location.pathname}${location.search}#${view}`;
}

const originalNavigateV104=navigate;
navigate=function(view){
  const target=TICKET_V104_VIEWS.has(view)?view:'dashboard';
  const previous=state.view;
  const result=originalNavigateV104(target);
  if(state.profile && !ticketHistoryFromPopV104 && target!==previous){
    history.pushState({ticketApp:true,ticketNavigation162:true,view:target},'',v104RouteUrl(target));
  }
  queueMicrotask(()=>v104HydrateRecordPreviews(document));
  return result;
};

function v104InitializeHistory(){
  if(ticketHistoryReadyV104 || !state.profile) return;
  ticketHistoryReadyV104=true;
  const requested=String(location.hash||'').replace(/^#/,'');
  const target=TICKET_V104_VIEWS.has(requested)?requested:(TICKET_V104_VIEWS.has(state.view)?state.view:'dashboard');
  // An internal base entry keeps ordinary Back navigation inside the app.
  if(!history.state?.ticketNavigation162){
    history.replaceState({ticketApp:true,ticketNavigation162:true,view:'dashboard',ticketBase:true},'',v104RouteUrl('dashboard'));
    history.pushState({ticketApp:true,ticketNavigation162:true,view:target},'',v104RouteUrl(target));
  }else if(history.state.ticketBase){
    history.pushState({ticketApp:true,ticketNavigation162:true,view:target},'',v104RouteUrl(target));
  }else{
    history.replaceState({...history.state,view:target},'',v104RouteUrl(target));
  }
  if(target!==state.view){
    ticketHistoryFromPopV104=true;
    try{ originalNavigateV104(target); }finally{ ticketHistoryFromPopV104=false; }
  }
}

window.addEventListener('popstate',event=>{
  if(document.querySelector('#recordEvidenceModal.open')){
    v104HideEvidencePreview();
    if(event.state?.preview) return;
  }
  if(!state.profile) return;
  if(event.state?.ticketBase){
    history.pushState({ticketApp:true,ticketNavigation162:true,view:'dashboard'},'',v104RouteUrl('dashboard'));
  }
  const target=event.state?.ticketApp && TICKET_V104_VIEWS.has(event.state.view) ? event.state.view : null;
  if(!target) return;
  if(target===state.view){
    queueMicrotask(()=>v104HydrateRecordPreviews(document));
    return;
  }
  ticketHistoryFromPopV104=true;
  try{ originalNavigateV104(target); }finally{ ticketHistoryFromPopV104=false; }
  queueMicrotask(()=>v104HydrateRecordPreviews(document));
});

function v104IsEditableTarget(target){
  return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]'));
}

document.addEventListener('selectstart',event=>{
  if(app?.contains(event.target) && !v104IsEditableTarget(event.target)) event.preventDefault();
},true);

document.addEventListener('contextmenu',event=>{
  if(app?.contains(event.target) && !v104IsEditableTarget(event.target)) event.preventDefault();
},true);

const v104Observer=new MutationObserver(()=>{
  v104HydrateRecordPreviews(document);
  v104InitializeHistory();
});
v104Observer.observe(app,{childList:true,subtree:true});

window.addEventListener('keydown',event=>{
  if(event.key==='Escape' && document.querySelector('#recordEvidenceModal.open')) v104CloseEvidencePreview();
});

window.addEventListener('beforeunload',()=>{
  ticketEvidenceUrlsV104.forEach(url=>URL.revokeObjectURL(url));
  ticketEvidenceUrlsV104.clear();
});

queueMicrotask(()=>{
  v104HydrateRecordPreviews(document);
  v104InitializeHistory();
});
