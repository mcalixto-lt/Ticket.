'use strict';
// Destino local externo: solicita acesso real à pasta, nunca simula permissão.
let ticketFolder=null,ticketFolderTimer=null,ticketFolderWriting=false,ticketFolderDirty=false,ticketFolderSelecting=false;
let ticketFolderOwner='',ticketFolderStatus='Salvamento no navegador ativo.';
function ticketFolderStatusUpdate(message){
  ticketFolderStatus=message;
  const el=document.querySelector('#ticketStorageStatus');if(el)el.textContent=message;
}
function ticketStorageDialog(title,body){
  const dialog=document.createElement('dialog');dialog.className='ticket-backup-dialog';
  dialog.innerHTML=`<h3>${esc(title)}</h3>${body}<button class="secondary" data-ticket-close>Fechar</button>`;
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();return dialog;
}
function ticketCloudSetupNotice(provider){
  ticketStorageDialog(provider,`<p>A conexão com ${esc(provider)} ainda não foi ativada no Ticket.</p><p>Precisamos cadastrar o aplicativo, configurar o endereço do sistema e implementar a autorização da conta. Só então será possível entrar, sincronizar e restaurar seus dados.</p><p class="ticket-backup-warning">Nenhuma conta foi conectada e nenhum arquivo foi enviado.</p>`);
}
storageView=function(){
  const folder=ticketFolder?.cpf===state.profile?.cpf?ticketFolder:null;
  return `${head('Armazenamento','Escolha onde guardar e recuperar suas informações.')}<div class="ticket-storage-options"><button class="secondary" data-ticket-browser>${icon('records',25)}<span>Neste navegador<small>Salvamento local automático · veja o aviso de risco.</small></span></button><button class="secondary" data-ticket-cloud="Google Drive">${icon('cloud',25)}<span>Google Drive<small>Sincronização na conta · conexão ainda pendente.</small></span></button><button class="secondary" data-ticket-cloud="OneDrive">${icon('cloud',25)}<span>OneDrive<small>Sincronização na conta · conexão ainda pendente.</small></span></button><button class="secondary" data-ticket-folder>${icon('save',25)}<span>Celular ou cartão SD<small>${folder?`Pasta: ${esc(folder.dir.name)} · alterar ou reconectar`:'Autorizar acesso e escolher a pasta.'}</small></span></button></div><article class="panel"><h3>Recuperar informações</h3><p>Restaure fotos, registros, horários e configurações do arquivo salvo, mantendo as datas originais.</p><button class="primary full-action" data-ticket-choose="restore">${icon('records',22)} Restaurar</button></article>`;
};
async function ticketWriteFolder(target,blob){
  const writer=await target.file.createWritable();
  try{await writer.write(blob);await writer.close();}catch(error){try{await writer.abort();}catch{}throw error;}
}
async function ticketFlushFolder(){
  if(ticketFolderWriting||ticketFolderSelecting||ticketBackupBusy||!ticketFolder||!ticketFolderDirty)return;
  const target=ticketFolder;if(state.profile?.cpf!==target.cpf)return;
  ticketFolderWriting=true;ticketFolderDirty=false;
  ticketFolderStatusUpdate('Salvando a cópia completa na pasta…');
  try{
    if(await target.dir.queryPermission({mode:'readwrite'})!=='granted')throw Error('Reconecte a pasta para autorizar o salvamento.');
    const blob=await ticketCreateBackup();
    if(ticketFolder!==target||state.profile?.cpf!==target.cpf)return;
    await ticketWriteFolder(target,blob);
    ticketFolderStatusUpdate(`Salvo em ${target.dir.name} às ${new Date().toLocaleTimeString('pt-BR')}.`);
  }catch(error){
    ticketFolderDirty=true;ticketFolderStatusUpdate('Cópia externa pendente. Reconecte a pasta para tentar novamente.');
    toast('Não foi possível atualizar a pasta. Os dados continuam no navegador.');
    return;
  }finally{ticketFolderWriting=false;}
  if(ticketFolderDirty)ticketScheduleFolder(target.cpf);
}
function ticketScheduleFolder(cpf){
  if(!ticketFolder||ticketFolder.cpf!==cpf)return;
  ticketFolderDirty=true;clearTimeout(ticketFolderTimer);
  ticketFolderStatusUpdate('Alterações aguardando salvamento na pasta. Mantenha o Ticket aberto.');
  ticketFolderTimer=setTimeout(ticketFlushFolder,800);
}
async function ticketSelectFolder(){
  if(ticketFolderSelecting||ticketFolderWriting||ticketBackupBusy){toast('Aguarde o salvamento atual terminar.');return;}
  if(!state.profile){toast('Entre no sistema para escolher onde salvar.');return;}
  if(!window.showDirectoryPicker){
    ticketStorageDialog('Pasta não disponível neste navegador','<p>Este navegador não permite autorizar uma pasta para salvamento automático. Para este recurso, use um navegador compatível.</p><p>Você ainda pode salvar uma cópia completa como arquivo e restaurá-la depois. O download não ativa sincronização automática.</p><button class="primary" data-ticket-local="backup">Salvar uma cópia agora</button>');return;
  }
  ticketFolderSelecting=true;
  const cpf=state.profile.cpf;
  try{
    const dir=await window.showDirectoryPicker({mode:'readwrite',id:'ticket-storage'});
    if(state.profile?.cpf!==cpf)throw Error('A conta mudou. Escolha novamente a pasta.');
    const blob=await ticketCreateBackup();
    const name=`Ticket-${todayIso()}-${crypto.randomUUID().slice(0,8)}.json`;
    // Novo arquivo: não sobrescreve arquivos antigos na pasta escolhida.
    const file=await dir.getFileHandle(name,{create:true});
    const target={cpf,dir,file};await ticketWriteFolder(target,blob);
    if(state.profile?.cpf!==cpf)return;
    ticketFolder=target;ticketFolderOwner=cpf;
    try{await saveSetting(cpf,'internalStorageDestination',{mode:'folder',dir,file});}catch{toast('Pasta conectada nesta sessão. Reconecte ao reabrir o Ticket.');}
    ticketFolderStatusUpdate(`Salvo em ${dir.name}. Atualização automática ativa enquanto o Ticket estiver aberto.`);
    ticketFolderDirty=true;toast('Pasta autorizada. Suas informações foram salvas.');
    if(state.view==='storage')renderView();
  }catch(error){if(error.name!=='AbortError'){ticketFolderStatusUpdate('Não foi possível conectar a pasta. Salvamento local mantido.');toast(error.message||'Não foi possível salvar na pasta.');}}
  finally{ticketFolderSelecting=false;if(ticketFolderDirty)ticketScheduleFolder(cpf);}
}
async function ticketUseBrowser(){
  if(ticketFolderWriting||ticketFolderSelecting){toast('Aguarde o salvamento atual terminar.');return;}
  try{
    await saveSetting(state.profile.cpf,'internalStorageDestination',{mode:'browser'});
    ticketFolder=null;ticketFolderDirty=false;clearTimeout(ticketFolderTimer);
    ticketFolderStatusUpdate('Salvamento no navegador ativo. Nenhuma cópia externa automática está conectada.');
    document.querySelector('#ticketBrowserChoice')?.close();if(state.view==='storage')renderView();
    toast('Suas informações serão salvas neste navegador.');
  }catch{toast('Não foi possível alterar o destino.');}
}
async function ticketResumeFolder(){
  const cpf=state.profile?.cpf||'';if(ticketFolderOwner===cpf)return;
  ticketFolderOwner=cpf;ticketFolder=null;ticketFolderDirty=false;clearTimeout(ticketFolderTimer);
  ticketFolderStatusUpdate('Salvamento no navegador ativo.');if(!cpf)return;
  try{
    const saved=await getSetting(cpf,'internalStorageDestination',null);
    if(state.profile?.cpf!==cpf||ticketFolderOwner!==cpf)return;
    if(saved?.mode!=='folder'||!saved.dir||!saved.file)return;
    ticketFolder={cpf,dir:saved.dir,file:saved.file};
    if(await saved.dir.queryPermission({mode:'readwrite'})==='granted')ticketScheduleFolder(cpf);
    else ticketFolderStatusUpdate(`Acesso à pasta ${saved.dir.name} precisa ser autorizado novamente. Toque em Celular ou cartão SD.`);
  }catch{ticketFolderStatusUpdate('Não foi possível reconectar a pasta. Escolha o destino novamente.');}
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-ticket-browser],[data-ticket-browser-confirm],[data-ticket-folder]');if(!b)return;
  if(b.hasAttribute('data-ticket-browser')){
    const d=ticketStorageDialog('Salvar neste navegador',`<p>Suas informações e fotos serão salvas neste navegador.</p><p class="ticket-backup-warning">Se você limpar os dados do navegador ou do site, poderá perder essas informações. Escolha uma pasta externa para manter outra cópia.</p><p>Esta opção interrompe a atualização automática da pasta conectada. Os arquivos já salvos nela permanecem.</p><button class="primary" data-ticket-browser-confirm>Usar este navegador</button>`);d.id='ticketBrowserChoice';
  }else if(b.hasAttribute('data-ticket-browser-confirm'))ticketUseBrowser();
  else ticketSelectFolder();
});
// Leitura do destino por conta; um arquivo nunca recebe dados de outro CPF.
const ticketRenderStorageBefore166=renderShell;
renderShell=function(){const result=ticketRenderStorageBefore166();ticketResumeFolder();return result;};
const ticketSaveProfileBefore166=saveProfile;
saveProfile=async function(p){const result=await ticketSaveProfileBefore166(p);ticketScheduleFolder(p.cpf);return result;};
const ticketSaveRecordBefore166=saveRecord;
saveRecord=async function(r){const result=await ticketSaveRecordBefore166(r);ticketScheduleFolder(r.profileCpf);return result;};
const ticketSaveEvidenceBefore166=saveEvidence;
saveEvidence=async function(e){const result=await ticketSaveEvidenceBefore166(e);ticketScheduleFolder(e.profileCpf);return result;};
const ticketSaveSettingBefore166=saveSetting;
saveSetting=async function(cpf,key,value){const result=await ticketSaveSettingBefore166(cpf,key,value);if(key!=='internalStorageDestination')ticketScheduleFolder(cpf);return result;};
const ticketRestoreBefore166=ticketCommitRestore;
ticketCommitRestore=async function(p){
  if(ticketFolderWriting||ticketFolderSelecting)throw Error('Aguarde o salvamento atual terminar antes de restaurar.');
  ticketFolderSelecting=true;
  try{
    const result=await ticketRestoreBefore166(p);
    ticketFolder=null;ticketFolderDirty=false;clearTimeout(ticketFolderTimer);ticketFolderOwner='';
    ticketFolderStatusUpdate('Informações restauradas. Escolha uma pasta para retomar a cópia externa.');return result;
  }finally{ticketFolderSelecting=false;}
};
const ticketClearProfileBefore166=clearProfileData;
clearProfileData=async function(cpf){
  if(ticketFolder?.cpf===cpf){if(ticketFolderWriting||ticketFolderSelecting)throw Error('Aguarde o salvamento terminar.');ticketFolder=null;ticketFolderDirty=false;clearTimeout(ticketFolderTimer);}
  return ticketClearProfileBefore166(cpf);
};
ticketResumeFolder();
