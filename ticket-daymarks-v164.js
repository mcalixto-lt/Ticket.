/* Folga e feriado registrados na captura, sem foto e sem criar batidas. */
'use strict';
function dayMarkIcon(kind){
 const paths=kind==='folga'?'<circle cx="29" cy="13" r="7"/><path d="m18 17-8 8 16 9 4 12m8-36 13 2-12 19 5 16 13-6 14 23c3 5-3 9-6 4L51 51l-13 6M16 25l17 5 12-13M17 45h18a7 7 0 0 1 7 7v16H17zM20 68l-3 10m23-10 3 10m0-18h11l1 13c0 6 8 6 8 0l-2-18"/>':'<path d="M17 23h54l5 49H30M17 23l-3 31m5-17h53M30 23c-10 0-9-16 0-16s10 16 1 16m21 0c-10 0-9-16 0-16s10 16 1 16M36 46h7m10 0h7m-24 11h7m10 0h7"/><g stroke="#ef8835"><path d="M5 63c3-25 31-27 38-2-6-4-10-3-14 1-4-5-9-5-13-2-4-2-7-1-11 3Zm11-3c2-10 7-17 12-19m1 21c3-11 2-16-1-21m-7 22-4 13M4 80q18-16 40 0H4Z"/></g>';
 return `<svg viewBox="0 0 84 84" width="42" height="42" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
function holidayMark(date){return (state.balance.dayMarks||[]).find(x=>x.date===date&&!x.cancelledAt);}
function ticketDayRecords(){return [...bankDaysOff().filter(x=>!x.cancelledAt).map(x=>({...x,dayKind:'folga'})),...(state.balance.dayMarks||[]).filter(x=>!x.cancelledAt).map(x=>({...x,dayKind:'feriado'}))].map(x=>({...x,punches:[]}));}
const dayCaptureViewBefore=captureView;
captureView=function(){
 const html=dayCaptureViewBefore();
 const control=kind=>`<button type="button" class="daymark-action ${kind}" data-daymark="${kind}"><span>${dayMarkIcon(kind)}</span><b>${kind==='folga'?'Folga':'Feriado'}</b></button>`;
 return html.replace('<div class="v157-capture-control">',control('folga')+'<div class="v157-capture-control">').replace('<span class="v157-capture-label">Capturar</span></div>','<span class="v157-capture-label">Capturar</span></div>'+control('feriado'));
};
const dayRecordCardBefore=recordCard;
recordCard=function(r){
 if(!r.dayKind)return dayRecordCardBefore(r);
 const name=r.dayKind==='folga'?'Folga':'Feriado';
 return `<article class="panel daymark-record"><span class="daymark-symbol ${r.dayKind}">${dayMarkIcon(r.dayKind)}</span><div><small>${formatDateBr(r.date)}</small><h3>${name}</h3><p>${r.dayKind==='folga'?`${formatDuration(r.minutes)} descontadas do banco de horas`:'Dia de descanso · sem desconto no banco'}</p><button type="button" class="secondary" data-daymark-cancel="${esc(r.id)}" data-kind="${r.dayKind}">Desfazer marcação</button></div></article>`;
};
let dayMarkSaving=false;
async function registerDayMark(kind){
 if(dayMarkSaving||bankSaving)return false;
 if(!['folga','feriado'].includes(kind))return false;
 const date=todayIso();
 if(bankDayOff(date)||holidayMark(date)){toast('Este dia já está identificado em Registros.');return false;}
 if(state.records.some(r=>r.date===date&&r.punches?.length)){toast('Este dia já possui ponto registrado.');return false;}
 let item={id:uuid(),date,createdAt:new Date().toISOString(),kind};
 if(kind==='folga'){
  const q=bankDayQuote(date);
  if(q.error){toast(q.error);return false;}
  item={...item,minutes:q.minutes,scheduleSnapshot:q.scheduleSnapshot};
 }
 dayMarkSaving=true;bankSaving=true;
 try{
  const cpf=state.profile.cpf;
  const next=kind==='folga'?{...state.balance,bankDaysOff:[...bankDaysOff(),item]}:{...state.balance,dayMarks:[...(state.balance.dayMarks||[]),item]};
  await saveSetting(cpf,'balance',next);
  if(state.profile?.cpf!==cpf)return false;
  state.balance=next;v116ResetCaptureState();
  toast(kind==='folga'?'Folga registrada. Saldo atualizado.':'Feriado registrado.');navigate('dashboard');return true;
 }catch(error){toast('Não foi possível salvar. Tente novamente.');return false;}
 finally{dayMarkSaving=false;bankSaving=false;}
}
document.addEventListener('click',async e=>{
 const add=e.target.closest?.('[data-daymark]');
 if(add){add.disabled=true;try{await registerDayMark(add.dataset.daymark);}finally{add.disabled=false;}return;}
 const cancel=e.target.closest?.('[data-daymark-cancel]');
 if(!cancel||dayMarkSaving||bankSaving)return;
 dayMarkSaving=true;bankSaving=true;cancel.disabled=true;
 try{
  const key=cancel.dataset.kind==='folga'?'bankDaysOff':'dayMarks';
  const cpf=state.profile.cpf;
  const next={...state.balance,[key]:(state.balance[key]||[]).map(x=>x.id===cancel.dataset.daymarkCancel?{...x,cancelledAt:new Date().toISOString()}:x)};
  await saveSetting(cpf,'balance',next);
  if(state.profile?.cpf===cpf){state.balance=next;renderView();toast('Marcação desfeita.');}
 }catch(error){toast('Não foi possível desfazer.');cancel.disabled=false;}
 finally{dayMarkSaving=false;bankSaving=false;}
});
const daySubmitBefore=submitCapture;
submitCapture=async function(e){
 const date=e.currentTarget?.querySelector('[name="date"]')?.value||todayIso();
 if(holidayMark(date)){e.preventDefault();toast('Dia marcado como feriado de descanso. Desfaça a marcação em Registros para registrar ponto.');return;}
 return daySubmitBefore(e);
};
const dayCalendarBefore=bindCalendar;
bindCalendar=function(){dayCalendarBefore();document.querySelectorAll('[data-day]').forEach(b=>{if(!holidayMark(b.dataset.day))return;b.classList.add('bank-day-off');b.title='Feriado · descanso';const label=document.createElement('small');label.textContent='Feriado';b.append(label);b.onclick=()=>toast(`${formatDateBr(b.dataset.day)} · Feriado · dia de descanso`);});};
// Mantém a classificação única também pelo formulário do banco de horas.
const dayQuoteBefore=bankDayQuote;
bankDayQuote=function(date){
 if(holidayMark(date))return {error:'Este dia já está marcado como feriado. Desfaça a marcação em Registros antes de alterá-lo.'};
 return dayQuoteBefore(date);
};
