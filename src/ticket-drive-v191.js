/* Ticket. 1.0.91 — Drive organizado e restauração completa entre dispositivos. */
'use strict';

const TICKET_DRIVE_DATA_FOLDER_V191='Dados';
const TICKET_DRIVE_EVIDENCE_FOLDER_V191='Comprovantes';
const TICKET_DRIVE_BACKUP_V191='Ticket_backup_atual.json';
const TICKET_MONTHS_V191=['01-Janeiro','02-Fevereiro','03-Março','04-Abril','05-Maio','06-Junho','07-Julho','08-Agosto','09-Setembro','10-Outubro','11-Novembro','12-Dezembro'];
const ticketDriveFolderCacheV191=new Map();

function ticketDriveEscapeV191(value){return String(value||'').replaceAll('\\','\\\\').replaceAll("'","\\'");}
function ticketDriveSyncedKeyV191(){return `ticket.drive.v191.synced.${state.profile?.cpf||'guest'}`;}
function ticketDriveReadSyncedV191(){try{return JSON.parse(localStorage.getItem(ticketDriveSyncedKeyV191())||'{}')||{};}catch{return{};}}
function ticketDriveMarkSyncedV191(id){const saved=ticketDriveReadSyncedV191();saved[id]=new Date().toISOString();try{localStorage.setItem(ticketDriveSyncedKeyV191(),JSON.stringify(saved));}catch{}}

async function ticketDriveListV191(token,query,fields='files(id,name,mimeType,modifiedTime,appProperties)'){
  const url=`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=${encodeURIComponent(fields)}&pageSize=100`;
  const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
  if(response.status===401){ticketGoogleClearSessionV190();throw Object.assign(Error('A sessão do Google expirou.'),{code:'reauth'});}
  if(!response.ok)throw Error('Não foi possível consultar as pastas do Google Drive.');
  return (await response.json()).files||[];
}

async function ticketDriveEnsureFolderV191(token,parentId,name){
  const cacheKey=`${parentId}:${name}`;
  if(ticketDriveFolderCacheV191.has(cacheKey))return ticketDriveFolderCacheV191.get(cacheKey);
  const safe=ticketDriveEscapeV191(name);
  const found=await ticketDriveListV191(token,`name='${safe}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  let id=found[0]?.id;
  if(!id){
    const response=await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',parents:[parentId]})});
    if(!response.ok)throw Error(`Não foi possível criar a pasta ${name} no Google Drive.`);
    id=(await response.json()).id;
  }
  ticketDriveFolderCacheV191.set(cacheKey,id);return id;
}

async function ticketDriveFoldersV191(token){
  const root=await v107GoogleFolder(token);
  const data=await ticketDriveEnsureFolderV191(token,root,TICKET_DRIVE_DATA_FOLDER_V191);
  const evidence=await ticketDriveEnsureFolderV191(token,root,TICKET_DRIVE_EVIDENCE_FOLDER_V191);
  return{root,data,evidence};
}

async function ticketDriveStartUploadV191(token,{currentId='',parentId='',name,mimeType,blob,appProperties={}}){
  const updating=Boolean(currentId);
  const url=updating
    ?`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(currentId)}?uploadType=resumable&fields=id,name,modifiedTime`
    :'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,modifiedTime';
  const metadata={name,appProperties};if(!updating)metadata.parents=[parentId];
  const session=await fetch(url,{method:updating?'PATCH':'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':mimeType,'X-Upload-Content-Length':String(blob.size)},body:JSON.stringify(metadata)});
  const uploadUrl=session.headers.get('Location');
  if(session.status===401){ticketGoogleClearSessionV190();throw Object.assign(Error('A sessão do Google expirou.'),{code:'reauth'});}
  if(!session.ok||!uploadUrl)throw Error(`O Google Drive não iniciou o envio de ${name}.`);
  const uploaded=await fetch(uploadUrl,{method:'PUT',headers:{'Content-Type':mimeType},body:blob});
  if(!uploaded.ok)throw Error(`O Google Drive recusou o arquivo ${name}.`);
  return uploaded.json().catch(()=>({id:currentId,name}));
}

async function ticketDrivePutBackupV191(token,folderId,blob){
  const safe=ticketDriveEscapeV191(TICKET_DRIVE_BACKUP_V191);
  const current=(await ticketDriveListV191(token,`name='${safe}' and '${folderId}' in parents and trashed=false`))[0];
  return ticketDriveStartUploadV191(token,{currentId:current?.id||'',parentId:folderId,name:TICKET_DRIVE_BACKUP_V191,mimeType:'application/json',blob,appProperties:{ticketType:'full-backup',ticketVersion:'1.0.91'}});
}

function ticketDriveEvidenceDescriptionV191(evidence){
  let record=null,punch=null,kind='Comprovante';
  for(const candidate of state.records||[]){
    const matched=(candidate.punches||[]).find(item=>item.evidenceId===evidence.id);
    if(matched){record=candidate;punch=matched;break;}
    if((candidate.environmentIds||[]).includes(evidence.id)){record=candidate;kind='Ambiente';break;}
    if((candidate.evidenceIds||[]).includes(evidence.id)){record=candidate;break;}
  }
  const labels={entry:'Entrada',lunch:'Almoco',return:'Retorno',exit:'Saida'};
  if(punch)kind=labels[punch.type]||'Comprovante';
  const date=record?.date||String(evidence.createdAt||evidence.takenAt||todayIso()).slice(0,10);
  const time=(punch?.time||String(evidence.createdAt||evidence.takenAt||'').slice(11,16)||'0000').replace(':','');
  const ext=String(evidence.blob?.type||'').includes('png')?'png':'jpg';
  const fileName=`${date}_${kind}_${time}_${String(evidence.id).slice(0,8)}.${ext}`;
  return{date,kind,time,fileName,mimeType:evidence.blob?.type||'image/jpeg'};
}

async function ticketDrivePutEvidenceV191(token,parentId,evidence,description){
  const id=ticketDriveEscapeV191(evidence.id);
  const existing=(await ticketDriveListV191(token,`appProperties has { key='ticketEvidenceId' and value='${id}' } and trashed=false`))[0];
  if(existing)return existing;
  return ticketDriveStartUploadV191(token,{parentId,name:description.fileName,mimeType:description.mimeType,blob:evidence.blob,appProperties:{ticketType:'evidence',ticketEvidenceId:evidence.id,ticketDate:description.date,ticketKind:description.kind}});
}

async function ticketDriveSyncEvidenceV191(token,evidenceRoot){
  const snapshot=await ticketReadSnapshot(state.profile.cpf);
  const synced=ticketDriveReadSyncedV191();let uploaded=0,already=0;
  for(const evidence of snapshot.evidence){
    if(synced[evidence.id]){already++;continue;}
    if(!(evidence.blob instanceof Blob))throw Error('Um comprovante local está sem imagem.');
    const info=ticketDriveEvidenceDescriptionV191(evidence);
    const year=info.date.slice(0,4)||String(new Date().getFullYear());
    const monthIndex=Math.max(0,Math.min(11,Number(info.date.slice(5,7)||1)-1));
    const yearFolder=await ticketDriveEnsureFolderV191(token,evidenceRoot,year);
    const monthFolder=await ticketDriveEnsureFolderV191(token,yearFolder,TICKET_MONTHS_V191[monthIndex]);
    await ticketDrivePutEvidenceV191(token,monthFolder,evidence,info);
    ticketDriveMarkSyncedV191(evidence.id);uploaded++;
  }
  return{uploaded,already,total:snapshot.evidence.length};
}

/* Google: atualiza o JSON completo e envia fotos separadas. OneDrive mantém o fluxo existente. */
const ticketCloudWriteBeforeV191=ticketCloudWrite;
ticketCloudWrite=async function(provider,{interactive=false}={}){
  if(provider!=='google')return ticketCloudWriteBeforeV191(provider,{interactive});
  if(ticketCloudBusy||!state.profile)return false;
  ticketCloudBusy=true;ticketCloudDirty=false;
  ticketFolderStatusUpdate('Sincronizando dados e comprovantes com o Google Drive…');
  try{
    const token=await ticketCloudToken('google',{interactive});
    const folders=await ticketDriveFoldersV191(token);
    const backup=await ticketCreateBackup();
    await ticketDrivePutBackupV191(token,folders.data,backup);
    const evidence=await ticketDriveSyncEvidenceV191(token,folders.evidence);
    const cloud=v107CloudConfig();cloud.provider='google';cloud.lastFullBackupAt=new Date().toISOString();v107SaveCloud();
    ticketFolderStatusUpdate(`Google Drive sincronizado · ${evidence.total} comprovante(s) protegido(s) · ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`);
    return true;
  }catch(error){
    ticketCloudDirty=true;
    ticketFolderStatusUpdate(error.code==='reauth'?'Sincronização pausada: autorize novamente a conta Google.':'Sincronização pendente: o Ticket tentará novamente.');
    if(interactive||error.code!=='reauth')toast(error.message||'Não foi possível sincronizar com o Google Drive.');
    return false;
  }finally{ticketCloudBusy=false;}
};

async function ticketDriveFindBackupV191(token){
  const folders=await ticketDriveFoldersV191(token);
  const safe=ticketDriveEscapeV191(TICKET_DRIVE_BACKUP_V191);
  let file=(await ticketDriveListV191(token,`name='${safe}' and '${folders.data}' in parents and trashed=false`))[0];
  if(!file)file=(await ticketDriveListV191(token,`name='${safe}' and '${folders.root}' in parents and trashed=false`))[0];
  return{file,folders};
}

function ticketDriveApplyRestoredStateV191(payload){
  state.profile=payload.profile;state.records=payload.records;
  const settings=Object.fromEntries(payload.settings.map(item=>[item.key.slice(payload.profile.cpf.length+1),item.value]));
  state.schedule=settings.schedule||structuredClone(DEFAULT_SCHEDULE);
  state.balance=settings.balance||{minutes:0,history:[]};
  state.closing=settings.closing||{mode:'custom',startDay:16,endDay:15};
  state.holidays=settings.holidays||[];
}

function ticketDriveMigrateConnectionV191(previous,token){
  state.cloud=null;
  const cloud=v107CloudConfig();
  cloud.provider='google';cloud.googleClientId=previous.googleClientId;
  cloud.microsoftClientId=previous.microsoftClientId||'';cloud.microsoftTenant=previous.microsoftTenant||'common';
  cloud.account={...(cloud.account||{}),google:previous.account?.google||'Conta Google'};
  v107SaveCloud();
  if(token&&state.googleTokenExpiresAtV190>Date.now()){
    try{sessionStorage.setItem(ticketGoogleSessionKeyV190(),JSON.stringify({accessToken:token,expiresAt:state.googleTokenExpiresAtV190}));}catch{}
  }
}

/* Restauração completa: cadastro, registros, jornada, saldos, feriados e todas as fotos. */
const ticketCloudReadBeforeV191=ticketCloudRead;
ticketCloudRead=async function(provider){
  if(provider!=='google')return ticketCloudReadBeforeV191(provider);
  if(ticketCloudBusy)return;
  ticketCloudBusy=true;
  try{
    const previous=v107CloudConfig();
    const connection={googleClientId:previous.googleClientId,microsoftClientId:previous.microsoftClientId,microsoftTenant:previous.microsoftTenant,account:{...(previous.account||{})}};
    const token=await ticketCloudToken('google',{interactive:true});
    const {file}=await ticketDriveFindBackupV191(token);
    if(!file)throw Error('Nenhum backup completo foi encontrado na pasta Ticket do Google Drive.');
    const response=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`,{headers:{Authorization:`Bearer ${token}`}});
    if(!response.ok)throw Error('Não foi possível baixar o backup completo da conta.');
    const source=new File([await response.blob()],TICKET_DRIVE_BACKUP_V191,{type:'application/json'});
    const payload=await ticketParseBackup(source);
    if(state.profile&&state.profile.cpf!==payload.profile.cpf)throw Error('Saia da conta atual para restaurar o cadastro deste backup.');
    if(!confirm(`Recuperar ${payload.records.length} dia(s) registrado(s) e ${payload.evidence.length} comprovante(s) de ${payload.profile.fullName}?`))return;
    await ticketCommitRestore(payload);
    stopCamera();clearUrls();
    if(typeof ticketEvidenceUrlsV104!=='undefined'){for(const url of ticketEvidenceUrlsV104.values())URL.revokeObjectURL(url);ticketEvidenceUrlsV104.clear();}
    ticketDriveApplyRestoredStateV191(payload);
    ticketDriveMigrateConnectionV191(connection,token);
    setSession(payload.profile.cpf);state.view='dashboard';renderShell();
    toast(`Recuperação concluída: ${payload.records.length} registro(s) e ${payload.evidence.length} comprovante(s).`);
    setTimeout(()=>ticketScheduleCloud(payload.profile.cpf),1800);
  }catch(error){
    if(error.name!=='AbortError')toast(error.message||'Não foi possível recuperar os dados. As informações locais foram preservadas.');
  }finally{ticketCloudBusy=false;}
};
