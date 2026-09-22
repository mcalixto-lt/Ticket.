'use strict';
// Backup por colaborador, incluindo Blobs, metadados e configurações.
const ticketBackupStores=['profiles','records','evidence','settings'];
const ticketBackupMaxBytes=200*1024*1024;
function ticketTransactionDone(t){return new Promise((resolve,reject)=>{t.oncomplete=resolve;t.onerror=t.onabort=()=>reject(t.error||new Error('Operação cancelada.'));});}
async function ticketReadSnapshot(cpf){
  const database=await db(),t=database.transaction(ticketBackupStores,'readonly');
  const done=ticketTransactionDone(t);
  const lists=await Promise.all(ticketBackupStores.map(s=>reqP(t.objectStore(s).getAll())));
  await done;
  return {profile:lists[0].find(p=>p.cpf===cpf),records:lists[1].filter(r=>r.profileCpf===cpf),evidence:lists[2].filter(e=>e.profileCpf===cpf),settings:lists[3].filter(s=>s.key.startsWith(cpf+':')&&!s.key.endsWith(':internalStorageDestination'))};
}
function ticketBlobData(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});}
async function ticketDigest(text){
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
async function ticketCreateBackup(){
  if(!state.profile)throw Error('Entre na sua conta para fazer backup.');
  const snapshot=await ticketReadSnapshot(state.profile.cpf);
  if(!snapshot.profile)throw Error('Cadastro não encontrado.');
  let size=0;
  const evidence=[];
  for(const e of snapshot.evidence){
    if(!(e.blob instanceof Blob))throw Error('Comprovante sem imagem. Backup não concluído.');
    size+=e.blob.size;if(size>ticketBackupMaxBytes/1.5)throw Error('Backup muito grande para este formato.');
    const {blob,...metadata}=e;
    evidence.push({...metadata,data:await ticketBlobData(blob)});
  }
  const payload={...snapshot,evidence};
  ticketValidateBackupPayload(payload);
  const data=JSON.stringify(payload);
  return new Blob([JSON.stringify({format:'ticket-full-backup',version:1,createdAt:new Date().toISOString(),sha256:await ticketDigest(data),payload})],{type:'application/json'});
}
function ticketValidateBackupPayload(p){
  const bad=()=>{throw Error('Arquivo de backup inválido ou incompleto.');};
  if(!p||!p.profile||!/^\d{11}$/.test(p.profile.cpf)||typeof p.profile.fullName!=='string'||!p.profile.fullName.trim())bad();
  const cpf=p.profile.cpf;
  for(const k of ['records','evidence','settings'])if(!Array.isArray(p[k]))bad();
  const unique=(items,key)=>{const ids=new Set();for(const x of items){if(!x||typeof x[key]!=='string'||!x[key]||ids.has(x[key]))bad();ids.add(x[key]);}};
  unique(p.records,'id');unique(p.evidence,'id');unique(p.settings,'key');
  for(const r of p.records){
    if(r.profileCpf!==cpf||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||r.id!==`${cpf}:${r.date}`||!Array.isArray(r.punches)||!Array.isArray(r.evidenceIds)||!Array.isArray(r.environmentIds||[]))bad();
    for(const punch of r.punches)if(!['entry','lunch','return','exit'].includes(punch.type)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(punch.time))bad();
  }
  for(const e of p.evidence)if(e.profileCpf!==cpf||typeof e.data!=='string'||!/^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(e.data))bad();
  for(const s of p.settings)if(!s.key.startsWith(cpf+':')||s.key===cpf+':internalStorageDestination'||!Object.hasOwn(s,'value'))bad();
  const evidenceIds=new Set(p.evidence.map(e=>e.id));
  for(const r of p.records)for(const id of [...r.evidenceIds,...(r.environmentIds||[]),...r.punches.map(p=>p.evidenceId).filter(Boolean)])if(!evidenceIds.has(id))bad();
  return p;
}
async function ticketParseBackup(file){
  if(file.size>ticketBackupMaxBytes)throw Error('O arquivo ultrapassa o limite de 200 MB.');
  let envelope;try{envelope=JSON.parse(await file.text());}catch{throw Error('O arquivo não é um backup válido.');}
  if(envelope.format!=='ticket-full-backup'||envelope.version!==1)throw Error('Use um backup completo do Ticket. Exportações antigas não contêm todas as fotos.');
  if(await ticketDigest(JSON.stringify(envelope.payload))!==envelope.sha256)throw Error('Arquivo alterado ou danificado. Nenhum dado foi restaurado.');
  return ticketValidateBackupPayload(envelope.payload);
}
function ticketDecodeEvidence(e){
  const {data,...metadata}=e,[header,b64]=data.split(',');
  const raw=atob(b64),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  return {...metadata,blob:new Blob([bytes],{type:header.slice(5).split(';')[0]})};
}
async function ticketCommitRestore(payload){
  ticketValidateBackupPayload(payload);
  const cpf=payload.profile.cpf;
  if(state.profile&&state.profile.cpf!==cpf)throw Error('Saia da conta atual para restaurar o cadastro deste arquivo.');
  const evidence=payload.evidence.map(ticketDecodeEvidence);
  const database=await db(),t=database.transaction(ticketBackupStores,'readwrite');
  const done=ticketTransactionDone(t);
  const lists={};let pending=3;
  // Todas as leituras e escritas na mesma transação: restaura tudo ou nada.
  for(const name of ['records','evidence','settings']){
    const request=t.objectStore(name).getAll();
    request.onsuccess=()=>{
      lists[name]=request.result;
      if(--pending)return;
      try{
        for(const e of evidence)if(lists.evidence.some(old=>old.id===e.id&&old.profileCpf!==cpf))throw Error('Identificador de imagem em uso por outro cadastro.');
        for(const name of ['records','evidence','settings'])for(const row of lists[name]){
          if(name==='settings'?row.key.startsWith(cpf+':'):row.profileCpf===cpf)t.objectStore(name).delete(name==='settings'?row.key:row.id);
        }
        t.objectStore('profiles').put(payload.profile);
        for(const r of payload.records)t.objectStore('records').put(r);
        for(const e of evidence)t.objectStore('evidence').put(e);
        for(const s of payload.settings)t.objectStore('settings').put(s);
      }catch(error){t.abort();}
    };
  }
  await done;
  return cpf;
}
function ticketStorageOptions(action='restore'){
  return `<div class="ticket-storage-options"><button data-ticket-cloud="Google Drive" class="secondary">${icon('cloud',25)}<span>Google Drive<small>Conexão pendente de configuração.</small></span></button><button data-ticket-cloud="OneDrive" class="secondary">${icon('cloud',25)}<span>OneDrive<small>Conexão pendente de configuração.</small></span></button><button data-ticket-local="restore" class="secondary">${icon('save',25)}<span>Celular ou cartão SD<small>Procurar o arquivo completo salvo no aparelho.</small></span></button></div>`;
}
function ticketChooseDestination(action){
  const dialog=document.createElement('dialog');dialog.className='ticket-backup-dialog';
  dialog.innerHTML=`<h3>De onde deseja restaurar?</h3><p>Recupere fotos, registros e configurações com as datas originais.</p>${ticketStorageOptions('restore')}<button class="secondary" data-ticket-close>Cancelar</button>`;
  document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
}
let ticketBackupBusy=false;
async function ticketSaveLocal(){
  if(ticketBackupBusy)return;ticketBackupBusy=true;
  try{
    if(!state.profile)throw Error('Entre na sua conta para fazer backup.');
    const filename=`Ticket-backup-${todayIso()}.json`;
    // O seletor precisa ser aberto durante o gesto do usuário.
    const handle=window.showSaveFilePicker?await window.showSaveFilePicker({suggestedName:filename,types:[{description:'Backup completo do Ticket',accept:{'application/json':['.json']}}]}):null;
    const blob=await ticketCreateBackup();
    if(handle){const writer=await handle.createWritable();try{await writer.write(blob);await writer.close();}catch(error){try{await writer.abort();}catch{}throw error;}toast('Seu backup foi concluído');}
    else{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Arquivo gerado. Confirme o download e o local salvo no seu aparelho.');}
  }catch(error){if(error.name!=='AbortError')toast(error.message||'Não foi possível concluir o backup.');}
  finally{ticketBackupBusy=false;}
}
function ticketChooseRestore(){
  if(ticketBackupBusy)return;
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.addEventListener('change',async()=>{
    const file=input.files?.[0];if(!file||ticketBackupBusy)return;ticketBackupBusy=true;
    try{
      const p=await ticketParseBackup(file);
      if(state.profile&&state.profile.cpf!==p.profile.cpf)throw Error('Saia da conta atual para restaurar outro cadastro.');
      if(!confirm(`Restaurar ${p.records.length} dias de ponto e ${p.evidence.length} fotos de ${p.profile.fullName}? Os dados locais deste colaborador serão substituídos pelo backup. Salve uma cópia atual antes de continuar.`))return;
      await ticketCommitRestore(p);
      stopCamera();clearUrls();
      if(typeof ticketEvidenceUrlsV104!=='undefined'){for(const url of ticketEvidenceUrlsV104.values())URL.revokeObjectURL(url);ticketEvidenceUrlsV104.clear();}
      state.profile=p.profile;state.records=p.records;
      const settings=Object.fromEntries(p.settings.map(s=>[s.key.slice(p.profile.cpf.length+1),s.value]));
      state.schedule=settings.schedule||structuredClone(DEFAULT_SCHEDULE);state.balance=settings.balance||{minutes:0,history:[]};state.closing=settings.closing||{mode:'custom',startDay:16,endDay:15};state.holidays=settings.holidays||[];
      try{setSession(p.profile.cpf);}catch{}
      state.view='dashboard';renderShell();toast('Suas informações foram restauradas');
    }catch(error){toast(error.message||'Não foi possível restaurar. Os dados locais foram preservados.');}
    finally{ticketBackupBusy=false;}
  });input.click();
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-ticket-choose],[data-ticket-local],[data-ticket-cloud],[data-ticket-close]');if(!b)return;
  if(b.hasAttribute('data-ticket-close')){b.closest('dialog')?.close();return;}
  if(b.dataset.ticketCloud){ticketCloudSetupNotice(b.dataset.ticketCloud);return;}
  if(b.dataset.ticketChoose){ticketChooseDestination(b.dataset.ticketChoose);return;}
  b.closest('dialog')?.close();
  if(b.dataset.ticketLocal==='restore')ticketChooseRestore();else ticketSaveLocal();
});
exportData=ticketSaveLocal;
const ticketRenderBefore165=renderView;
renderView=function(){
  return ticketRenderBefore165();
};
const ticketAuthBefore165=authTemplate;
authTemplate=function(...args){return ticketAuthBefore165(...args)+`<div class="ticket-login-restore"><button class="secondary" data-ticket-choose="restore">Restaurar informações</button></div>`;};
const ticketSettingsBefore165=settingsView;
settingsView=function(){
  const template=document.createElement('template');template.innerHTML=ticketSettingsBefore165();
  const stack=template.content.querySelector('.settings-stack');
  const labels=['Jornada Semanal','Saldo anterior','Período de fechamento','Feriados e folgas','Armazenamento','Como usar','Aplicativo'];
  if(stack&&stack.children.length===8){
    Array.from(stack.children).slice(1).forEach((card,i)=>{
      const section=document.createElement('details');section.className='ticket-settings-section';
      const summary=document.createElement('summary');summary.textContent=labels[i];
      card.replaceWith(section);section.append(summary,card);
    });
  }
  return template.innerHTML;
};
