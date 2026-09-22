/* Ticket. 1.0.72 — refinamentos de CPF, navegação, saldo e jornada. */
'use strict';

const ticketBalanceCard172=balanceCard;
balanceCard=function(){
  const template=document.createElement('template');
  template.innerHTML=ticketBalanceCard172();
  const pair=template.content.querySelector('#ticketPositiveBalanceForm .two-col');
  if(pair){
    pair.className='ticket-time-pair172';
    const divider=document.createElement('i');
    divider.className='ticket-time-divider172';
    divider.setAttribute('aria-hidden','true');
    divider.textContent='|';
    pair.insertBefore(divider,pair.children[1]);
  }
  return template.innerHTML;
};

// Mantém o ponto vermelho visível durante a janela de lembrete e reforça a
// atualização em todas as telas do sistema.
const ticketNotification172=updateNotificationBell;
updateNotificationBell=function(options={}){
  const reminder=ticketNotification172(options);
  document.querySelectorAll('[data-notification]').forEach(button=>{
    button.classList.toggle('has-alert',Boolean(reminder));
    button.querySelector('i')?.setAttribute('aria-label',reminder?'Nova notificação':'');
  });
  return reminder;
};
