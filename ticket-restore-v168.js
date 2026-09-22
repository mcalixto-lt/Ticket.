'use strict';
function ticketRestoreIcon(kind){
  if(kind==='google')return `<span class="ticket-restore-icon google" aria-hidden="true"><svg viewBox="0 0 48 48"><path fill="#4285f4" d="M17.1 6h13.8l13.7 23.8-6.9 12H24l6.9-12z"/><path fill="#34a853" d="M17.1 6 3.4 29.8l6.9 12L24 18z"/><path fill="#fbbc04" d="M10.3 41.8h27.4l6.9-12H17.2z"/></svg></span>`;
  if(kind==='onedrive')return `<span class="ticket-restore-icon onedrive" aria-hidden="true"><svg viewBox="0 0 48 48"><path fill="#0364b8" d="M20.4 14.2a13 13 0 0 1 20.2 7.2 9.7 9.7 0 0 1-1 19.3H13.1a10.7 10.7 0 0 1-2.8-21 13.4 13.4 0 0 1 10.1-5.5z"/><path fill="#28a8ea" d="M7.2 30.2a10.7 10.7 0 0 1 10.6-10.8c1 0 2 .1 2.9.4a13 13 0 0 1 19.9 1.6 9.7 9.7 0 0 0-8.9 5.9A11.1 11.1 0 0 0 19 31.1a8.8 8.8 0 0 0-11.8-.9z"/></svg></span>`;
  return `<span class="ticket-restore-icon device" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="5" width="25" height="38" rx="5"/><path d="M17 10h7M18 37h5"/><path d="M30 19h9l3 3v18H30z" fill="currentColor" fill-opacity=".1"/><path d="M35 19v8M39 20v7M34 34h4"/></svg></span>`;
}
ticketStorageOptions=function(){
  return `<div class="ticket-storage-options ticket-restore-options"><button data-ticket-cloud="Google Drive" class="secondary">${ticketRestoreIcon('google')}<span><strong>Google Drive</strong><small>Entrar na conta e recuperar a cópia completa.</small></span><i>${icon('chev',18)}</i></button><button data-ticket-cloud="OneDrive" class="secondary">${ticketRestoreIcon('onedrive')}<span><strong>OneDrive</strong><small>Entrar na conta Microsoft e recuperar a cópia.</small></span><i>${icon('chev',18)}</i></button><button data-ticket-local="restore" class="secondary">${ticketRestoreIcon('device')}<span><strong>Celular ou cartão SD</strong><small>Procurar o arquivo completo salvo no aparelho.</small></span><i>${icon('chev',18)}</i></button></div>`;
};
ticketChooseDestination=function(){
  const dialog=document.createElement('dialog');dialog.className='ticket-backup-dialog ticket-restore-dialog';
  dialog.innerHTML=`<div class="ticket-restore-brand"><div class="brand">${brand()}</div></div><div class="ticket-restore-heading"><span class="ticket-restore-kicker">RESTAURAÇÃO SEGURA</span><h3>De onde deseja restaurar?</h3><p>Recupere fotos, registros e configurações com as datas originais.</p></div>${ticketStorageOptions()}<p class="ticket-restore-note">A restauração recompõe o sistema sem alterar as datas dos registros e comprovantes.</p><button class="secondary ticket-restore-cancel" data-ticket-close>Cancelar</button>`;
  document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
};
