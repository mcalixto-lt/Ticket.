'use strict';
const ticketCloudFileName='Ticket_backup_atual.json';
let ticketCloudBusy=false,ticketCloudDirty=false,ticketCloudTimer=null;
function ticketPublicConfig(){return window.TICKET_CONFIG||{};}
function ticketProviderConfigured(provider){const c=ticketPublicConfig();return provider==='Google Drive'?Boolean(c.googleClientId):Boolean(c.microsoftClientId);}
function ticketProviderKey(label){return label==='Google Drive'?'google':'onedrive';}
function ticketApplyPublicCloudConfig(){
  const publicConfig=ticketPublicConfig(),cloud=v107CloudConfig();
  cloud.googleClientId=String(publicConfig.googleClientId||'').trim();
  cloud.microsoftClientId=String(publicConfig.microsoftClientId||'').trim();
  cloud.microsoftTenant=String(publicConfig.microsoftTenant||'common').trim()||'common';
}
async function ticketGoogleBackupFile(token,folderId){
  const quoted=ticketCloudFileName.replaceAll("'","\\'");
  const q=encodeURIComponent(`name='${quoted}' and '${folderId}' in parents and trashed=false`);
  const response=await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,modifiedTime)&pageSize=2`,{headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok)throw Error('Não foi possível localizar o backup no Google Drive.');
  return (await response.json()).files?.[0]||null;
}
async function ticketGooglePutBackup(token,folderId,blob){
  const current=await ticketGoogleBackupFile(token,folderId);
  const url=current?`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(current.id)}?uploadType=resumable`:'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
  const metadata=current?{}:{name:ticketCloudFileName,parents:[folderId]};
  const session=await fetch(url,{method:current?'PATCH':'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json','X-Upload-Content-Length':String(blob.size)},body:JSON.stringify(metadata)});
  const uploadUrl=session.headers.get('Location');
  if(!session.ok||!uploadUrl)throw Error('O Google Drive não iniciou o envio do backup.');
  const response=await fetch(uploadUrl,{method:'PUT',headers:{'Content-Type':'application/json'},body:blob});
  if(!response.ok)throw Error('O Google Drive recusou a atualização do backup.');
}
async function ticketOneDrivePutBackup(token,blob){await v107OneDriveUpload(token,ticketCloudFileName,blob);}
async function ticketCloudToken(provider,{interactive=false}={}){
  ticketApplyPublicCloudConfig();
  if(provider==='google'){
    if(state.cloudTokens.google)return state.cloudTokens.google;
    if(!interactive)throw Object.assign(Error('Entre novamente na conta Google para continuar a sincronização.'),{code:'reauth'});
    return v107GoogleToken();
  }
  if(state.cloudTokens.onedrive)return state.cloudTokens.onedrive;
  if(!interactive)throw Object.assign(Error('Entre novamente na conta Microsoft para continuar a sincronização.'),{code:'reauth'});
  return v107OneDriveToken();
}
async function ticketCloudWrite(provider,{interactive=false}={}){
  if(ticketCloudBusy)return false;
  if(!state.profile)return false;
  ticketCloudBusy=true;ticketCloudDirty=false;
  ticketFolderStatusUpdate('Preparando a cópia completa para a nuvem…');
  try{
    const token=await ticketCloudToken(provider,{interactive}),blob=await ticketCreateBackup();
    if(provider==='google'){const folder=await v107GoogleFolder(token);await ticketGooglePutBackup(token,folder,blob);}
    else{await v107OneDriveFolder(token);await ticketOneDrivePutBackup(token,blob);}
    const cloud=v107CloudConfig();cloud.provider=provider;cloud.lastFullBackupAt=new Date().toISOString();v107SaveCloud();
    ticketFolderStatusUpdate(`Sincronização com ${provider==='google'?'Google Drive':'OneDrive'} concluída às ${new Date().toLocaleTimeString('pt-BR')}.`);
    return true;
  }catch(error){
    ticketCloudDirty=true;
    ticketFolderStatusUpdate(error.code==='reauth'?error.message:'Sincronização pendente. Abra Armazenamento para tentar novamente.');
    if(interactive||error.code!=='reauth')toast(error.message||'Não foi possível sincronizar a cópia completa.');
    return false;
  }finally{ticketCloudBusy=false;}
}
function ticketScheduleCloud(cpf){
  const cloud=v107CloudConfig();if(!cpf||cpf!==state.profile?.cpf||!['google','onedrive'].includes(cloud.provider))return;
  ticketCloudDirty=true;clearTimeout(ticketCloudTimer);
  ticketFolderStatusUpdate('Alterações aguardando sincronização. Mantenha o Ticket aberto.');
  ticketCloudTimer=setTimeout(()=>ticketCloudWrite(cloud.provider,{interactive:false}),1400);
}
async function ticketCloudRead(provider){
  if(ticketCloudBusy)return;
  ticketCloudBusy=true;
  try{
    const token=await ticketCloudToken(provider,{interactive:true});let response;
    if(provider==='google'){
      const folder=await v107GoogleFolder(token),file=await ticketGoogleBackupFile(token,folder);
      if(!file)throw Error('Nenhum backup completo foi encontrado no Google Drive.');
      response=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`,{headers:{Authorization:`Bearer ${token}`}});
    }else{
      response=await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/Ticket/${encodeURIComponent(ticketCloudFileName)}:/content`,{headers:{Authorization:`Bearer ${token}`}});
    }
    if(!response.ok)throw Error('Não foi possível baixar o backup da conta.');
    const file=new File([await response.blob()],ticketCloudFileName,{type:'application/json'});
    const payload=await ticketParseBackup(file);
    if(state.profile&&state.profile.cpf!==payload.profile.cpf)throw Error('Saia da conta atual para restaurar o cadastro deste backup.');
    if(!confirm(`Restaurar ${payload.records.length} dias de ponto e ${payload.evidence.length} fotos de ${payload.profile.fullName}? Os dados locais deste colaborador serão substituídos.`))return;
    await ticketCommitRestore(payload);state.profile=payload.profile;state.records=payload.records;
    const settings=Object.fromEntries(payload.settings.map(s=>[s.key.slice(payload.profile.cpf.length+1),s.value]));
    state.schedule=settings.schedule||structuredClone(DEFAULT_SCHEDULE);state.balance=settings.balance||{minutes:0,history:[]};state.closing=settings.closing||{mode:'custom',startDay:16,endDay:15};state.holidays=settings.holidays||[];
    setSession(payload.profile.cpf);state.view='dashboard';renderShell();toast('Suas informações foram restauradas');
  }catch(error){if(error.name!=='AbortError')toast(error.message||'Não foi possível restaurar pela conta.');}
  finally{ticketCloudBusy=false;}
}
ticketCloudSetupNotice=async function(label){
  const provider=ticketProviderKey(label);
  if(!ticketProviderConfigured(label)){
    ticketStorageDialog(label,`<p>A conexão com ${esc(label)} precisa ser configurada pelo responsável do aplicativo.</p><p>Adicione o Client ID em <strong>public/config.js</strong> e autorize o endereço HTTPS do Ticket no provedor.</p><p class="ticket-backup-warning">Nenhuma conta foi conectada e nenhum arquivo foi enviado.</p>`);return;
  }
  const restore=Boolean(document.querySelector('.ticket-backup-dialog [data-ticket-cloud]'));
  document.querySelectorAll('dialog.ticket-backup-dialog').forEach(d=>d.close());
  if(restore)await ticketCloudRead(provider);
  else{
    const cloud=v107CloudConfig();cloud.provider=provider;v107SaveCloud();
    if(await ticketCloudWrite(provider,{interactive:true})){toast(`Conta conectada. Sincronização com ${label} ativada.`);if(state.view==='storage')renderView();}
  }
};
// Complementa os gatilhos locais: mudanças passam a atualizar também o provedor ativo.
for(const name of ['saveProfile','saveRecord','saveEvidence']){
  const before=window[name];window[name]=async function(item){const result=await before(item);ticketScheduleCloud(item.cpf||item.profileCpf);return result;};
}
const ticketCloudSaveSetting=saveSetting;
saveSetting=async function(cpf,key,value){const result=await ticketCloudSaveSetting(cpf,key,value);if(key!=='internalStorageDestination')ticketScheduleCloud(cpf);return result;};
const ticketCloudStorageView=storageView;
storageView=function(){
  ticketApplyPublicCloudConfig();const cloud=v107CloudConfig(),html=ticketCloudStorageView();
  return html.replace('Google Drive<small>','Google Drive'+(cloud.provider==='google'&&cloud.account.google?`<em>${esc(cloud.account.google)}</em>`:'')+'<small>').replace('OneDrive<small>','OneDrive'+(cloud.provider==='onedrive'&&cloud.account.onedrive?`<em>${esc(cloud.account.onedrive)}</em>`:'')+'<small>');
};
setTimeout(()=>{if(state.profile)ticketScheduleCloud(state.profile.cpf);},1800);
