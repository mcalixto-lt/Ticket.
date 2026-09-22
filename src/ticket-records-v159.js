'use strict';
const recordCardBeforeV159=recordCard;
recordCard=function(record){
  if(state.view!=='records')return recordCardBeforeV159(record);
  const complete=calculateRecord(record,state.schedule).complete;
  const punches=record.punches||[];
  const rows=PUNCH_TYPES.map(({key,label})=>{
    const punch=punches.find(p=>p.type===key);
    const id=punch?v104EvidenceIdForPunch(record,punch,punches.indexOf(punch)):'';
    return `<div class="receipt-row-v159"><span>${homePremiumIcon(key,22)} ${label}</span><button type="button" class="receipt-preview-v159" ${id?`data-receipt-v159="${esc(id)}" data-label="${esc(label)}" data-time="${esc(punch.time)}"`:'disabled'} aria-label="${id?`Ver comprovante de ${label}`:`Sem comprovante de ${label}`}">${dockPremiumIcon('records',21)}</button><b>${esc(punch?.time||'--:--')}</b></div>`;
  }).join('');
  return `<article class="panel receipt-day-v159"><small class="muted">${formatDateBr(record.date)}</small><header><h3>${record.date===todayIso()?'Jornada de hoje':'Jornada do dia'}</h3><span>Prévia</span><small class="badge ${complete?'positive':'pending'}">${complete?'Concluída':'Em andamento'}</small></header>${rows}${record.environmentIds?.length?v104RecordEvidenceMarkup({...record,punches:[],evidenceIds:[]}):''}<div class="v134-correction-row">${v134CorrectionButton(record)}</div></article>`;
};
document.addEventListener('click',async event=>{
  const button=event.target.closest?.('[data-receipt-v159]');
  if(!button||button.disabled)return;
  button.disabled=true;
  try{
    const evidence=await getEvidence(button.dataset.receiptV159);
    if(!evidence?.blob){toast('Comprovante indisponível neste dispositivo.');return;}
    let url=ticketEvidenceUrlsV104.get(evidence.id);
    if(!url){url=URL.createObjectURL(evidence.blob);ticketEvidenceUrlsV104.set(evidence.id,url);}
    v104OpenEvidencePreview({url,label:button.dataset.label,time:button.dataset.time,hash:evidence.integrityHash,lockedAt:evidence.lockedAt||evidence.createdAt});
  }catch(error){toast('Não foi possível abrir o comprovante. Tente novamente.');}
  finally{button.disabled=false;}
});
