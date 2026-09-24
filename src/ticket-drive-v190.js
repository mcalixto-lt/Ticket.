/* Ticket. 1.0.90 — sessão Google persistente e sincronização contínua. */
'use strict';

const TICKET_GOOGLE_SCOPE_V190='openid email profile https://www.googleapis.com/auth/drive.file';
const TICKET_GOOGLE_EXPIRY_MARGIN_V190=90000;
let ticketGoogleResumeBusyV190=false;
let ticketGoogleResumeAtV190=0;

function ticketGoogleClientIdValidV190(value){
  return /^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(String(value||'').trim());
}

function ticketGoogleSessionKeyV190(){
  return `ticket.google.oauth.${state.profile?.cpf||'guest'}`;
}

function ticketGoogleReadSessionV190(){
  try{
    const saved=JSON.parse(sessionStorage.getItem(ticketGoogleSessionKeyV190())||'null');
    if(!saved?.accessToken||Number(saved.expiresAt||0)<=Date.now()+TICKET_GOOGLE_EXPIRY_MARGIN_V190)return null;
    return saved;
  }catch{return null;}
}

function ticketGoogleSaveSessionV190(response){
  const expiresIn=Math.max(60,Number(response?.expires_in||3600));
  const saved={accessToken:response.access_token,expiresAt:Date.now()+expiresIn*1000};
  try{sessionStorage.setItem(ticketGoogleSessionKeyV190(),JSON.stringify(saved));}catch{}
  state.cloudTokens.google=saved.accessToken;
  state.googleTokenExpiresAtV190=saved.expiresAt;
  return saved.accessToken;
}

function ticketGoogleClearSessionV190(){
  try{sessionStorage.removeItem(ticketGoogleSessionKeyV190());}catch{}
  state.cloudTokens.google=null;
  state.googleTokenExpiresAtV190=0;
}

/* Mantém o Client ID público oficial e rejeita placeholders. */
ticketApplyPublicCloudConfig=function(){
  const publicConfig=ticketPublicConfig(),cloud=v107CloudConfig();
  const google=String(publicConfig.googleClientId||'').trim();
  const microsoft=String(publicConfig.microsoftClientId||'').trim();
  if(ticketGoogleClientIdValidV190(google))cloud.googleClientId=google;
  else if(!ticketGoogleClientIdValidV190(cloud.googleClientId))cloud.googleClientId='';
  if(microsoft&&!microsoft.startsWith('__'))cloud.microsoftClientId=microsoft;
  else if(String(cloud.microsoftClientId||'').startsWith('__'))cloud.microsoftClientId='';
  cloud.microsoftTenant=String(publicConfig.microsoftTenant||cloud.microsoftTenant||'common').trim()||'common';
};

ticketProviderConfigured=function(provider){
  ticketApplyPublicCloudConfig();
  const cloud=v107CloudConfig();
  return provider==='Google Drive'
    ?ticketGoogleClientIdValidV190(cloud.googleClientId)
    :Boolean(String(cloud.microsoftClientId||'').trim());
};

async function ticketGoogleRequestTokenV190({interactive=false,force=false}={}){
  ticketApplyPublicCloudConfig();
  const cloud=v107CloudConfig();
  if(!ticketGoogleClientIdValidV190(cloud.googleClientId)){
    throw new Error('Client ID inválido. Use um cliente OAuth do tipo Aplicativo da Web.');
  }

  if(!force){
    const memoryValid=state.cloudTokens.google&&Number(state.googleTokenExpiresAtV190||0)>Date.now()+TICKET_GOOGLE_EXPIRY_MARGIN_V190;
    if(memoryValid)return state.cloudTokens.google;
    const stored=ticketGoogleReadSessionV190();
    if(stored){state.cloudTokens.google=stored.accessToken;state.googleTokenExpiresAtV190=stored.expiresAt;return stored.accessToken;}
  }

  ticketGoogleClearSessionV190();
  await v107LoadScript('https://accounts.google.com/gsi/client','ticketGoogleIdentity');
  return await new Promise((resolve,reject)=>{
    let settled=false;
    const finish=(fn,value)=>{if(settled)return;settled=true;clearTimeout(timeout);fn(value);};
    const fail=raw=>{
      const message=raw?.message||raw?.error_description||raw?.error||'A sessão Google precisa ser autorizada novamente.';
      finish(reject,Object.assign(new Error(message),{code:'reauth'}));
    };
    const client=google.accounts.oauth2.initTokenClient({
      client_id:cloud.googleClientId,
      scope:TICKET_GOOGLE_SCOPE_V190,
      include_granted_scopes:true,
      callback:async response=>{
        if(response?.error){fail(response);return;}
        const token=ticketGoogleSaveSessionV190(response);
        cloud.provider='google';
        try{
          const me=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.json():null);
          if(me)cloud.account.google=me.email||me.name||'Conta Google';
        }catch{}
        v107SaveCloud();
        finish(resolve,token);
      },
      error_callback:fail
    });
    const timeout=setTimeout(()=>fail({message:'O Google não respondeu à renovação da sessão.'}),20000);
    const firstConsent=interactive&&!cloud.account.google;
    try{client.requestAccessToken({prompt:firstConsent?'consent':''});}catch(error){fail(error);}
  });
}

const ticketCloudTokenBeforeV190=ticketCloudToken;
ticketCloudToken=async function(provider,{interactive=false,force=false}={}){
  if(provider==='google')return ticketGoogleRequestTokenV190({interactive,force});
  return ticketCloudTokenBeforeV190(provider,{interactive});
};

/* Todos os fluxos antigos passam a usar a sessão renovável acima. */
v107GoogleToken=async function(){return ticketGoogleRequestTokenV190({interactive:true});};

async function ticketGoogleProbeV190(token){
  const response=await fetch('https://www.googleapis.com/drive/v3/files?pageSize=1&fields=files(id)',{headers:{Authorization:`Bearer ${token}`}});
  if(response.status===401){ticketGoogleClearSessionV190();throw Object.assign(new Error('A sessão Google expirou.'),{code:'reauth'});}
  if(!response.ok)throw new Error('O Google Drive não respondeu ao teste de comunicação.');
  return true;
}

/* O teste agora renova silenciosamente e confirma a API do Drive de verdade. */
const autoBackupTestBeforeV190=autoBackupTest;
autoBackupTest=async function(){
  const target=await autoBackupTarget();
  if(target.kind!=='google')return autoBackupTestBeforeV190();
  try{
    let token=await ticketCloudToken('google',{interactive:false});
    try{await ticketGoogleProbeV190(token);}
    catch(error){if(error.code!=='reauth')throw error;token=await ticketCloudToken('google',{interactive:false,force:true});await ticketGoogleProbeV190(token);}
    return{ok:true,label:'Google Drive'};
  }catch(error){
    return{ok:false,label:'Google Drive',message:error.code==='reauth'?'O Google bloqueou a renovação silenciosa. Toque em Google Drive uma vez para reautorizar.':(error.message||'Falha ao testar o Google Drive.')};
  }
};

function ticketDecorateGoogleModalV190(){
  requestAnimationFrame(()=>{
    const form=document.querySelector('#cloudConfigFormV107');
    if(!form||form.querySelector('.ticket-google-help-v190'))return;
    const help=document.createElement('div');
    help.className='ticket-google-help-v190 ticket-google-help-v189';
    help.innerHTML=`<strong>Configuração do Google Drive</strong><span>Conta conectada permanece ativa após atualizar o Ticket.</span><span>Origem autorizada: ${esc(location.origin)}</span><span>O sistema renova o acesso sem armazenar sua senha.</span>`;
    form.prepend(help);
  });
}

const ticketCloudSetupBeforeV190=ticketCloudSetupNotice;
ticketCloudSetupNotice=async function(label){
  ticketApplyPublicCloudConfig();
  if(label==='Google Drive'&&!ticketProviderConfigured(label)){
    document.querySelectorAll('dialog.ticket-backup-dialog').forEach(dialog=>dialog.close());
    if(typeof v107OpenCloudModal==='function'){
      v107OpenCloudModal('google');ticketDecorateGoogleModalV190();return;
    }
  }
  return ticketCloudSetupBeforeV190(label);
};

/* Retoma a conta ao abrir, voltar ao aplicativo ou recuperar a internet. */
async function ticketGoogleResumeV190(){
  const now=Date.now();
  if(ticketGoogleResumeBusyV190||now-ticketGoogleResumeAtV190<5000||!navigator.onLine||!state.profile)return;
  const cloud=v107CloudConfig();
  if(cloud.provider!=='google'||!cloud.account.google)return;
  ticketGoogleResumeBusyV190=true;ticketGoogleResumeAtV190=now;
  try{
    const token=await ticketCloudToken('google',{interactive:false});
    await ticketGoogleProbeV190(token);
    ticketFolderStatusUpdate(`Google Drive conectado · ${cloud.account.google}`);
    ticketScheduleCloud(state.profile.cpf);
  }catch(error){
    ticketFolderStatusUpdate(error.code==='reauth'?'Sincronização pausada: o Google solicitou uma nova autorização.':'Sincronização pendente: aguardando o Google Drive.');
  }finally{ticketGoogleResumeBusyV190=false;}
}

setTimeout(ticketGoogleResumeV190,2300);
window.addEventListener('online',ticketGoogleResumeV190);
window.addEventListener('focus',ticketGoogleResumeV190);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ticketGoogleResumeV190();});

/* Impede que um Client ID inválido abra uma página 401. */
document.addEventListener('submit',event=>{
  if(event.target?.id!=='cloudConfigFormV107')return;
  const input=event.target.elements?.clientId;
  if(!input||ticketGoogleClientIdValidV190(input.value))return;
  event.preventDefault();event.stopImmediatePropagation();
  input.setCustomValidity('Informe um Client ID OAuth válido terminado em .apps.googleusercontent.com');
  input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});
},true);
