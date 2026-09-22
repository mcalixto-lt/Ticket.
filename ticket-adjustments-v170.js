'use strict';
// Credits add to the existing balance without moving its historical cutoff.
function ticketPositiveCreditTotal(){return (state.balance.positiveCredits||[]).reduce((sum,item)=>sum+Number(item.minutes||0),0);}
const ticketPreviousBalance170=previousBalance;
previousBalance=function(){return ticketPreviousBalance170()+ticketPositiveCreditTotal();};
function ticketCreditEntry(hours,minutes,date,note){
  const h=Number(hours),m=Number(minutes),description=String(note||'').trim();
  if(!Number.isInteger(h)||h<0||h>9999||!Number.isInteger(m)||m<0||m>59||h*60+m<=0)throw Error('Informe um saldo positivo em horas e minutos.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>todayIso()||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('Informe uma data válida até hoje.');
  if(!description||description.length>180)throw Error('Informe uma descrição de até 180 caracteres.');
  return {id:uuid(),minutes:h*60+m,date,note:description,createdAt:new Date().toISOString()};
}
balanceCard=function(){
  const marks=ticketDayRecords().sort((a,b)=>b.date.localeCompare(a.date));
  return `<article class="settings-section-card"><h3>Saldo disponível</h3><div class="bank-current"><strong>${formatDuration(totalBalance(),{signed:true})}</strong></div><details class="bank-initial"><summary>Definir Saldo Anterior</summary><p class="muted">Adicione horas positivas que ainda não foram registradas. O valor será somado ao saldo atual.</p><form id="ticketPositiveBalanceForm" class="stack"><div class="two-col"><label class="field"><span>Horas</span><input name="hours" type="number" min="0" max="9999" step="1" value="0" required></label><label class="field"><span>Minutos</span><input name="minutes" type="number" min="0" max="59" step="1" value="0" required></label></div><label class="field"><span>Data</span><input name="date" type="date" max="${todayIso()}" value="${todayIso()}" required></label><label class="field"><span>Descrição</span><input name="note" maxlength="180" placeholder="Ex.: horas positivas de período anterior" required></label><button class="primary" type="submit">Adicionar saldo positivo</button></form><div class="settings-history"><h4>Créditos adicionados</h4>${(state.balance.positiveCredits||[]).slice().reverse().map(x=>`<p><strong>+ ${formatDuration(x.minutes)}</strong> · ${formatDateBr(x.date)}<br><span class="muted">${esc(x.note)}</span></p>`).join('')||'<p class="muted">Nenhum crédito adicional.</p>'}</div></details><h3>Histórico de Folgas e Feriados</h3><div class="ticket-day-history170">${marks.map(x=>`<div><span class="daymark-symbol ${x.dayKind}">${dayMarkIcon(x.dayKind)}</span><div><strong>${x.dayKind==='folga'?'Folga':'Feriado'}</strong><small>${formatDateBr(x.date)}</small><p>${x.dayKind==='folga'?`${formatDuration(x.minutes)} descontadas`:'Sem desconto no saldo'}</p></div></div>`).join('')||'<p class="muted">Nenhuma folga ou feriado registrado.</p>'}</div></article>`;
};
let ticketCreditSaving170=false;
document.addEventListener('submit',async event=>{
  if(event.target.id!=='ticketPositiveBalanceForm')return;
  event.preventDefault();if(ticketCreditSaving170)return;
  const form=event.target,button=form.querySelector('button[type=submit]');
  try{
    const data=new FormData(form),entry=ticketCreditEntry(data.get('hours'),data.get('minutes'),data.get('date'),data.get('note'));
    ticketCreditSaving170=true;button.disabled=true;
    const cpf=state.profile.cpf,next={...state.balance,positiveCredits:[...(state.balance.positiveCredits||[]),entry]};
    await saveSetting(cpf,'balance',next);
    if(state.profile?.cpf===cpf){state.balance=next;renderView();toast('Saldo positivo adicionado. Saldo atualizado.');}
  }catch(error){toast(error.message||'Não foi possível salvar o saldo.');}
  finally{ticketCreditSaving170=false;button.disabled=false;}
});
const ticketStorage170=storageView;
storageView=function(){
  const template=document.createElement('template');template.innerHTML=ticketStorage170();
  for(const [selector,kind] of [['[data-ticket-cloud="Google Drive"]','google'],['[data-ticket-cloud="OneDrive"]','onedrive'],['[data-ticket-folder]','device']]){
    const button=template.content.querySelector(selector);if(button)button.firstElementChild.outerHTML=ticketRestoreIcon(kind);
  }
  const browser=template.content.querySelector('[data-ticket-browser]');
  if(browser)browser.firstElementChild.outerHTML='<span class="ticket-restore-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="#7447cf" stroke-width="2.5" stroke-linecap="round"><rect x="5" y="8" width="38" height="31" rx="6"/><path d="M5 18h38M12 13h1m5 0h1m5 0h1"/></svg></span>';
  return template.innerHTML;
};
const ticketRender170=renderView;
renderView=function(){const result=ticketRender170();document.querySelector('.shell')?.classList.toggle('ticket-home170',state.view==='dashboard');return result;};
