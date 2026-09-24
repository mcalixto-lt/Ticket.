/* Ticket. 1.0.92 — confirmação visual ao concluir a jornada do dia. */
'use strict';

function ticketJourneyCompletionKeyV192(record){
  const last=(record?.punches||[]).at(-1);
  return `ticket.journey.completed.${state.profile?.cpf||''}.${record?.date||''}.${last?.id||record?.updatedAt||''}`;
}

function ticketJourneyCompleteModalV192(record){
  const calc=calculateRecord(record,state.schedule);
  const key=ticketJourneyCompletionKeyV192(record);
  try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch{}
  const content=`<div class="v111-complete-hero ticket-complete-v192">
    <span class="v111-complete-icon">${icon('target',34)}</span>
    <span class="v111-spark s1">✦</span><span class="v111-spark s2">✧</span><span class="v111-spark s3">✦</span>
    <h3>Parabéns, você concluiu sua jornada!</h3>
    <p>Bom descanso.</p>
    <div class="v111-complete-summary">
      <div><small>Total trabalhado</small><strong>${formatDuration(calc.workedMinutes)}</strong></div>
      <div><small>Saldo do dia</small><strong class="${calc.balanceMinutes>=0?'positive':'negative'}">${formatDuration(calc.balanceMinutes||0,{signed:true})}</strong></div>
    </div>
    <button type="button" class="primary" data-v111-close>Concluir</button>
  </div>`;
  if(typeof v111OpenModal==='function')v111OpenModal(content,'journey-complete');
  else toast('Parabéns, você concluiu sua jornada! Bom descanso.');
}

const ticketSubmitBeforeV192=submitCapture;
submitCapture=async function(event){
  const form=event.currentTarget;
  const values=Object.fromEntries(new FormData(form));
  const date=String(values.date||form?.querySelector?.('[name="date"]')?.value||todayIso());
  const before=state.records.find(record=>record.date===date);
  const beforeCount=(before?.punches||[]).length;
  await ticketSubmitBeforeV192(event);
  const after=state.records.find(record=>record.date===date);
  const afterCount=(after?.punches||[]).length;
  if(date!==todayIso()||!after||afterCount<=beforeCount)return;
  if(!calculateRecord(after,state.schedule).complete)return;
  setTimeout(()=>ticketJourneyCompleteModalV192(after),120);
};

