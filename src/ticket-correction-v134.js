/* Ticket. 1.0.34 — correção controlada: uma única alteração de horário por dia */
'use strict';

const TICKET_CORRECTION_VERSION_V134='1.0.34';
const TICKET_CORRECTION_LEGACY_DATE_V134='2026-09-02';
const TICKET_CORRECTION_LEGACY_FROM_V134='02:00';
const TICKET_CORRECTION_LEGACY_TO_V134='14:00';

function v134Today(){ return typeof todayIso==='function'?todayIso():new Date().toISOString().slice(0,10); }
function v134CorrectionUsed(record){ return Boolean(record?.correctionUsed || record?.correctionHistory?.length); }
function v134PunchLabel(type){ return PUNCH_TYPES?.find(p=>p.key===type)?.label || ({entry:'Entrada',lunch:'Saída para almoço',return:'Retorno do almoço',exit:'Saída final'}[type]||'Ponto'); }
function v134Esc(value){ return typeof esc==='function'?esc(String(value??'')):String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

async function v134LegacyRepair(){
  if(!state.profile || state.__v134LegacyRepairCpf===state.profile.cpf) return;
  state.__v134LegacyRepairCpf=state.profile.cpf;
  const record=await getRecord(state.profile.cpf,TICKET_CORRECTION_LEGACY_DATE_V134);
  if(!record || v134CorrectionUsed(record)) return;
  const punch=(record.punches||[]).find(p=>p.type==='return' && p.time===TICKET_CORRECTION_LEGACY_FROM_V134);
  if(!punch) return;
  const now=new Date().toISOString();
  const before=punch.time;
  punch.originalTime=punch.originalTime||before;
  punch.time=TICKET_CORRECTION_LEGACY_TO_V134;
  punch.correctedAt=now;
  punch.corrected=true;
  punch.immutable=true;
  record.punches.sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  record.correctionUsed=true;
  record.correctionUsedAt=now;
  record.correctionHistory=[...(record.correctionHistory||[]),{
    id:(typeof uuid==='function'?uuid():`correction-${Date.now()}`),
    punchId:punch.id,
    type:'time',
    before,
    after:punch.time,
    changedAt:now,
    reason:'Correção inicial da implantação da regra de uma correção por dia.',
    system:true,
    version:TICKET_CORRECTION_VERSION_V134
  }];
  record.updatedAt=now;
  record.lockPolicy='append-only';
  record.immutablePunches=true;
  await saveRecord(record);
  state.records=await listRecords(state.profile.cpf);
  toast('Correção aplicada em 02/09: retorno 02:00 → 14:00.');
}

function v134CanCorrect(record){
  return Boolean(state.profile && record && record.profileCpf===state.profile.cpf && record.date===v134Today() && !v134CorrectionUsed(record));
}

function v134PencilGlyph(size=16){return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5a2.5 2.5 0 0 0-3.5-3.5L4 16.5Z"/><path d="m14 6 4 4"/></svg>`;}

function v134CorrectionButton(record){
  if(!record) return '';
  if(record.date!==v134Today()) return '';
  if(v134CorrectionUsed(record)) return `<span class="v134-correction-used">${typeof lockGlyph==='function'?lockGlyph(12):'✓'} Correção já utilizada hoje</span>`;
  return `<button type="button" class="secondary v134-correction-button" data-correct-record="${v134Esc(record.id)}">${v134PencilGlyph(16)} Corrigir 1 vez</button>`;
}

const originalRecordCardV134=recordCard;
recordCard=function(record){
  const html=originalRecordCardV134(record);
  const control=v134CorrectionButton(record);
  return control ? html.replace('</article>',`<div class="v134-correction-row">${control}</div></article>`) : html;
};

function v134EnsureModal(){
  let modal=document.querySelector('#ticketCorrectionModalV134');
  if(modal) return modal;
  modal=document.createElement('div');
  modal.id='ticketCorrectionModalV134';
  modal.className='v134-modal';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<div class="v134-backdrop" data-v134-close></div><section class="v134-dialog" role="dialog" aria-modal="true" aria-labelledby="v134Title"><header class="v134-head"><div><span class="settings-kicker">CORREÇÃO CONTROLADA</span><h3 id="v134Title">Corrigir um horário</h3><p>Você tem <strong>1 correção por dia</strong>. Depois de confirmar, este registro volta a ficar bloqueado.</p></div><button type="button" class="v134-close" data-v134-close aria-label="Fechar">×</button></header><form id="v134Form"><div id="v134PunchFields" class="v134-fields"></div><label class="v134-reason"><span>Motivo da correção <small>(opcional)</small></span><textarea id="v134Reason" rows="2" maxlength="240" placeholder="Ex.: horário informado incorretamente"></textarea></label><div class="v134-warning">A alteração ficará registrada no histórico de correções. Não será possível fazer uma segunda correção nesta data.</div><footer><button type="button" class="secondary" data-v134-close>Cancelar</button><button type="submit" class="primary">Confirmar correção</button></footer></form></section>`;
  document.body.append(modal);
  modal.querySelectorAll('[data-v134-close]').forEach(el=>el.addEventListener('click',v134CloseModal));
  modal.querySelector('#v134Form').addEventListener('submit',v134SubmitCorrection);
  return modal;
}

let v134EditingRecordId='';
function v134OpenModal(record){
  if(!v134CanCorrect(record)){ toast(record?.date===v134Today()?'A correção deste dia já foi utilizada.':'A correção só pode ser feita no registro do dia.'); return; }
  v134EditingRecordId=record.id;
  const modal=v134EnsureModal();
  const fields=modal.querySelector('#v134PunchFields');
  const punches=[...(record.punches||[])].sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  fields.innerHTML=punches.map(p=>`<label class="field v134-time-field"><span>${v134Esc(v134PunchLabel(p.type))}</span><input type="time" name="${v134Esc(p.id)}" value="${v134Esc(p.time||'')}" required><small>Atual: ${v134Esc(p.time||'--:--')}</small></label>`).join('');
  modal.querySelector('#v134Reason').value='';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.documentElement.classList.add('v134-modal-open');
}
function v134CloseModal(){
  const modal=document.querySelector('#ticketCorrectionModalV134');
  if(!modal)return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.documentElement.classList.remove('v134-modal-open');
  v134EditingRecordId='';
}

async function v134SubmitCorrection(event){
  event.preventDefault();
  const record=state.records.find(r=>r.id===v134EditingRecordId);
  if(!v134CanCorrect(record)){v134CloseModal();toast('A correção deste dia já foi utilizada.');return;}
  const form=event.currentTarget;
  const changes=[];
  for(const punch of record.punches||[]){
    const input=form.elements.namedItem(punch.id);
    const next=String(input?.value||'');
    if(next && next!==punch.time) changes.push({punch,before:punch.time,after:next});
  }
  if(!changes.length){toast('Nenhum horário foi alterado.');return;}
  const now=new Date().toISOString();
  const reason=String(form.querySelector('#v134Reason')?.value||'').trim();
  for(const change of changes){
    change.punch.originalTime=change.punch.originalTime||change.before;
    change.punch.time=change.after;
    change.punch.correctedAt=now;
    change.punch.corrected=true;
    change.punch.immutable=true;
  }
  record.punches.sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  record.correctionUsed=true;
  record.correctionUsedAt=now;
  record.correctionHistory=[...(record.correctionHistory||[]),...changes.map(change=>({
    id:(typeof uuid==='function'?uuid():`correction-${Date.now()}-${Math.random()}`),
    punchId:change.punch.id,
    type:'time',
    before:change.before,
    after:change.after,
    changedAt:now,
    reason,
    system:false,
    version:TICKET_CORRECTION_VERSION_V134
  }))];
  record.updatedAt=now;
  record.lockPolicy='append-only';
  record.immutablePunches=true;
  await saveRecord(record);
  state.records=await listRecords(state.profile.cpf);
  v134CloseModal();
  renderView();
  const summary=changes.map(c=>`${c.before} → ${c.after}`).join(', ');
  toast(`Correção registrada: ${summary}. Cálculo atualizado.`);
}

function v134BindCorrectionButtons(){
  document.querySelectorAll('[data-correct-record]').forEach(button=>{
    if(button.dataset.v134Bound==='1')return;
    button.dataset.v134Bound='1';
    button.addEventListener('click',async()=>{
      const record=state.records.find(r=>r.id===button.dataset.correctRecord);
      if(record)v134OpenModal(record);
    });
  });
}

const originalRenderViewV134=renderView;
renderView=function(){
  const result=originalRenderViewV134();
  queueMicrotask(()=>v134BindCorrectionButtons());
  return result;
};

const originalRenderShellV134=renderShell;
renderShell=function(){
  const result=originalRenderShellV134();
  if(state.profile) queueMicrotask(()=>v134LegacyRepair().catch(error=>console.warn('Ticket: correção inicial v1.0.34 falhou',error)));
  return result;
};

window.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('#ticketCorrectionModalV134.open'))v134CloseModal();});
window.addEventListener('beforeunload',v134CloseModal);
