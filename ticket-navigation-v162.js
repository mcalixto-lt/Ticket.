/* Ticket. 1.0.62 — cadastro e retorno pela tela anterior. */
'use strict';

function ticketUserSilhouette(){
  return '<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><circle cx="40" cy="40" r="37" fill="#eee8f8"/><circle cx="40" cy="29" r="12" fill="none" stroke="#7447cf" stroke-width="3"/><path d="M17 63c0-13 9-20 23-20s23 7 23 20" fill="none" stroke="#7447cf" stroke-width="3" stroke-linecap="round"/></svg>';
}
function ticketRegistrationDetails(){
  const cpf=String(state.profile?.cpf||'').replace(/\D/g,'');
  const masked=cpf.length===11?`${cpf.slice(0,3)}.***.***-${cpf.slice(-2)}`:'—';
  return `<article class="settings-section-card ticket-registration"><div class="ticket-registration-avatar">${ticketUserSilhouette()}<h3>${esc(state.profile?.fullName||'Colaborador')}</h3></div><h3>Dados do colaborador</h3><dl class="identity-list"><div><dt>Nome completo</dt><dd>${esc(state.profile?.fullName||'')}</dd></div><div><dt>CPF</dt><dd>${masked}</dd></div></dl></article>`;
}
identificationCard=function(){
  return `<article class="settings-section-card"><div class="settings-card-head"><div><h3>Meu Cadastro</h3><p>Confira seus dados de identificação.</p></div>${ticketUserSilhouette()}</div><button class="secondary" data-resource-view="registration">Ver meu cadastro</button></article>`;
};
const ticketRenderViewBefore162=renderView;
renderView=function(){
  let result;
  if(state.view==='registration'){
    const content=document.querySelector('#content');
    if(content)content.innerHTML=`<section><h2>Meu Cadastro</h2><p class="muted">Confira seus dados de identificação.</p>${ticketRegistrationDetails()}</section>`;
    bindViewEvents();
    document.querySelectorAll('.glass-dock [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='settings'));
  }else result=ticketRenderViewBefore162();
  return result;
};
