/* Folgas debitadas do banco: lançamentos separados do saldo inicial. */
'use strict';
function bankDaysOff(){return state.balance.bankDaysOff||[];}
function bankDayOff(date){return bankDaysOff().find(x=>x.date===date&&!x.cancelledAt);}
function bankDebits({afterDate='',throughDate=todayIso(),fromDate=''}={}){
  return bankDaysOff().filter(x=>!x.cancelledAt&&(!afterDate||x.date>afterDate)&&(!fromDate||x.date>=fromDate)&&(!throughDate||x.date<=throughDate)).reduce((n,x)=>n+x.minutes,0);
}
function bankDayQuote(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return {error:'Selecione a data da folga.'};
  const dt=new Date(`${date}T12:00:00`);
  if(Number.isNaN(dt.getTime())||todayIso(dt)!==date)return {error:'Informe uma data válida.'};
  if(date>todayIso())return {error:'Registre uma folga já realizada, até hoje.'};
  if(state.balance.referenceDate&&date<=state.balance.referenceDate)return {error:'Escolha uma data posterior à referência do saldo anterior.'};
  if(bankDayOff(date))return {error:'Já existe uma folga registrada nesta data.'};
  if(state.records.some(r=>r.date===date&&(r.punches||[]).length))return {error:'Esta data já possui ponto registrado.'};
  const day=scheduleForDate(date,state.schedule);
  const minutes=Number(day.expectedMinutes||0);
  if(!day.active||!Number.isFinite(minutes)||minutes<=0)return {error:'Este dia não tem jornada prevista. Não há horas a descontar.'};
  return {minutes,remaining:totalBalance()-minutes,scheduleSnapshot:structuredClone(day)};
}
const bankAccumulatedBefore=accumulatedBalance;
accumulatedBalance=function(records,schedule,options={}){return bankAccumulatedBefore(records,schedule,options)-bankDebits(options);};
const bankPeriodBefore=periodSummary;
periodSummary=function(records,schedule,period){
  const result=bankPeriodBefore(records,schedule,period);
  const debit=bankDebits({fromDate:period.startDate,throughDate:period.endDate});
  return {...result,negative:result.negative+debit,net:result.net-debit,bankDayOffMinutes:debit};
};
const bankCardBefore=balanceCard;
balanceCard=function(){
  return `<article class="settings-section-card bank-card"><div class="settings-card-head"><div><h3>Banco de horas e folgas</h3><p>Use seu saldo para um dia de descanso.</p></div><span class="settings-card-icon purple">${icon('clock',24)}</span></div><div class="bank-current"><span>Saldo disponível</span><strong>${formatDuration(totalBalance(),{signed:true})}</strong></div><details class="bank-initial"><summary>Definir ou atualizar saldo anterior</summary>${bankCardBefore()}</details><form id="bankDayOffForm"><h3>Registrar folga</h3><label class="field"><span>Data da folga realizada</span><input name="date" type="date" max="${todayIso()}" required></label><div id="bankDayQuote" class="bank-quote" aria-live="polite">Selecione uma data para calcular o desconto.</div><button class="primary" type="submit" disabled>Confirmar folga</button></form><h3>Histórico de folgas</h3><div class="bank-history">${bankDaysOff().slice().reverse().map(x=>`<div><strong>${formatDateBr(x.date)}</strong><span>${x.cancelledAt?'Cancelada':`− ${formatDuration(x.minutes)}`}${!x.cancelledAt&&state.balance.referenceDate&&x.date<=state.balance.referenceDate?' · incorporada ao saldo anterior':''}</span>${x.cancelledAt?'':`<button class="secondary" data-bank-cancel="${esc(x.id)}">Cancelar folga</button>`}</div>`).join('')||'<p class="muted">Nenhuma folga registrada.</p>'}</div></article>`;
};
let bankSaving=false;
async function persistBankDaysOff(items){
  const cpf=state.profile.cpf;
  const next={...state.balance,bankDaysOff:items};
  await saveSetting(cpf,'balance',next);
  if(state.profile?.cpf===cpf)state.balance=next;
}
const bankBindBefore=bindSettings;
bindSettings=function(){
  bankBindBefore();
  const form=document.querySelector('#bankDayOffForm');
  if(!form)return;
  const date=form.elements.date,button=form.querySelector('button[type="submit"]'),output=document.querySelector('#bankDayQuote');
  date.addEventListener('change',()=>{
    const q=bankDayQuote(date.value);button.disabled=!!q.error;
    output.textContent=q.error||`Desconto: ${formatDuration(q.minutes)} · Saldo após a folga: ${formatDuration(q.remaining,{signed:true})}`;
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(bankSaving)return;
    const q=bankDayQuote(date.value);if(q.error){toast(q.error);return;}
    bankSaving=true;button.disabled=true;
    try{
      await persistBankDaysOff([...bankDaysOff(),{id:uuid(),date:date.value,minutes:q.minutes,scheduleSnapshot:q.scheduleSnapshot,createdAt:new Date().toISOString()}]);
      toast('Folga registrada. Saldo atualizado.');renderView();
    }catch(error){toast('Não foi possível salvar a folga. Tente novamente.');button.disabled=false;}
    finally{bankSaving=false;}
  });
  document.querySelectorAll('[data-bank-cancel]').forEach(b=>b.addEventListener('click',async()=>{
    if(bankSaving)return;bankSaving=true;b.disabled=true;
    try{
      await persistBankDaysOff(bankDaysOff().map(x=>x.id===b.dataset.bankCancel?{...x,cancelledAt:new Date().toISOString()}:x));
      toast('Folga cancelada. Saldo recalculado.');renderView();
    }catch(error){toast('Não foi possível cancelar a folga.');b.disabled=false;}
    finally{bankSaving=false;}
  }));
};
// Não permite contabilizar ponto e folga na mesma data.
const bankCaptureBefore=submitCapture;
submitCapture=async function(e){
  const date=e.currentTarget?.querySelector('[name="date"]')?.value||todayIso();
  if(bankDayOff(date)){e.preventDefault();toast('Esta data possui uma folga. Cancele a folga antes de registrar ponto.');return;}
  return bankCaptureBefore(e);
};
const bankCalendarBefore=bindCalendar;
bindCalendar=function(){
  bankCalendarBefore();
  document.querySelectorAll('[data-day]').forEach(button=>{
    const off=bankDayOff(button.dataset.day);if(!off)return;
    button.classList.add('bank-day-off');button.title=`Folga · ${formatDuration(off.minutes)} descontadas do banco`;
    const label=document.createElement('small');label.textContent='Folga';button.append(label);
    button.onclick=()=>toast(`${formatDateBr(off.date)} · Folga · ${formatDuration(off.minutes)} descontadas do banco de horas`);
  });
};
