/* Ticket. 1.0.7 — armazenamento em nuvem funcional, navegação no topo e Assistente IA */
'use strict';

state.cloudTokens = state.cloudTokens || {google:null,onedrive:null};
state.cloudErrors = state.cloudErrors || {google:0,onedrive:0};
state.aiMessages = state.aiMessages || [];

function v107AiGlyph(size=22){return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><path d="M5.5 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg>`;}
function v107GoogleGlyph(size=24){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.1 4.1h7.8l3.9 6.8-3.1 1.8-3.8-6.6H9.2z" fill="#4f82ff"/><path d="M8.1 4.1 4.2 10.9l3.1 1.8 3.8-6.6z" fill="#22a66f"/><path d="M4.2 10.9 8.1 17.8h7.8l-1.9-3.3H9.9l-2.6-4.6z" fill="#eab83f"/></svg>`;}
function v107OneDriveGlyph(size=24){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.2 17.8H18a3.6 3.6 0 0 0 .5-7.2A5.8 5.8 0 0 0 8 8.5a4.5 4.5 0 0 0 1.2 9.3Z" fill="#2f80ed"/><path d="M5.4 17.8h5.8a4.1 4.1 0 0 0-2.2-7.5A4.8 4.8 0 0 0 5.4 17.8Z" fill="#5aa3ff"/></svg>`;}
function v107LocalGlyph(size=23){return typeof v105DatabaseGlyph==='function'?v105DatabaseGlyph(size):icon('cloud',size);}

function v107CloudKey(){return `ticket.cloud.${state.profile?.cpf||'guest'}`;}
function v107DefaultCloud(){const p=window.TICKET_CONFIG||{};return {provider:'local',googleClientId:String(p.googleClientId||''),microsoftClientId:String(p.microsoftClientId||''),microsoftTenant:String(p.microsoftTenant||'common'),synced:{google:{},onedrive:{}},account:{google:'',onedrive:''}};}
function v107CloudConfig(){
  if(state.cloud && state.cloud.__cpf===state.profile?.cpf)return state.cloud;
  let stored={};try{stored=JSON.parse(localStorage.getItem(v107CloudKey())||'{}')||{};}catch{}
  const base=v107DefaultCloud();
  state.cloud={...base,...stored,synced:{google:{...(stored.synced?.google||{})},onedrive:{...(stored.synced?.onedrive||{})}},account:{google:stored.account?.google||'',onedrive:stored.account?.onedrive||''},__cpf:state.profile?.cpf||''};
  return state.cloud;
}
function v107SaveCloud(){const c=v107CloudConfig();const save={provider:c.provider,googleClientId:c.googleClientId,microsoftClientId:c.microsoftClientId,microsoftTenant:c.microsoftTenant,synced:c.synced,account:c.account};localStorage.setItem(v107CloudKey(),JSON.stringify(save));}

function v107ScrollTop(){
  requestAnimationFrame(()=>{
    try{window.scrollTo({top:0,left:0,behavior:'auto'});}catch{window.scrollTo(0,0);}
    document.querySelector('.main')?.scrollTo?.({top:0,left:0,behavior:'auto'});
    document.querySelector('#content')?.scrollTo?.({top:0,left:0,behavior:'auto'});
  });
}
const v107NavigateBefore=navigate;
navigate=function(view){const result=v107NavigateBefore(view);v107ScrollTop();return result;};

function v107EvidenceRefs(){
  const refs=[];const seen=new Set();
  for(const record of state.records||[]){
    for(const punch of record.punches||[]){
      const id=punch.evidenceId;if(!id||seen.has(id))continue;seen.add(id);
      refs.push({id,date:record.date,label:v105PunchLabel?.(punch.type)||punch.type||'Ponto',time:punch.time||'',kind:'receipt'});
    }
    for(const id of record.environmentIds||[]){if(!id||seen.has(id))continue;seen.add(id);refs.push({id,date:record.date,label:'Ambiente',time:'',kind:'environment'});}
  }
  return refs;
}
function v107CloudStats(provider){const refs=v107EvidenceRefs();const synced=v107CloudConfig().synced?.[provider]||{};const done=refs.filter(r=>synced[r.id]).length;return {total:refs.length,done,pending:Math.max(0,refs.length-done),errors:Number(state.cloudErrors?.[provider]||0)};}
function v107SafeFileName(value){return String(value||'arquivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'');}
function v107EvidenceFileName(ref,evidence){const ext=(evidence?.blob?.type||'').includes('png')?'png':'jpg';const time=ref.time?`_${ref.time.replace(':','')}`:'';return `${ref.date}_${v107SafeFileName(ref.label)}${time}_${ref.id.slice(0,8)}.${ext}`;}

function v107LoadScript(src,id){return new Promise((resolve,reject)=>{if(id&&document.getElementById(id)){resolve();return;}const s=document.createElement('script');if(id)s.id=id;s.src=src;s.async=true;s.defer=true;s.onload=()=>resolve();s.onerror=()=>reject(new Error('Não foi possível carregar a biblioteca de autenticação.'));document.head.append(s);});}

async function v107GoogleToken(){
  const c=v107CloudConfig();if(!c.googleClientId)throw new Error('Informe o Client ID do Google Drive.');
  await v107LoadScript('https://accounts.google.com/gsi/client','ticketGoogleIdentity');
  return await new Promise((resolve,reject)=>{
    const client=google.accounts.oauth2.initTokenClient({client_id:c.googleClientId,scope:'openid email profile https://www.googleapis.com/auth/drive.file',callback:async response=>{if(response?.error){reject(new Error(response.error_description||response.error));return;}state.cloudTokens.google=response.access_token;try{const me=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:`Bearer ${response.access_token}`}}).then(r=>r.ok?r.json():null);if(me){c.account.google=me.email||me.name||'Conta Google';v107SaveCloud();}}catch{}resolve(response.access_token);}});
    client.requestAccessToken({prompt:state.cloudTokens.google?'':'consent'});
  });
}
async function v107GoogleFolder(token){
  const q=encodeURIComponent("name='Ticket' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  const found=await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=10`,{headers:{Authorization:`Bearer ${token}`}});
  if(!found.ok)throw new Error('Não foi possível consultar a pasta Ticket. no Google Drive.');
  const data=await found.json();if(data.files?.[0]?.id)return data.files[0].id;
  const created=await fetch('https://www.googleapis.com/drive/v3/files',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({name:'Ticket',mimeType:'application/vnd.google-apps.folder'})});
  if(!created.ok)throw new Error('Não foi possível criar a pasta Ticket. no Google Drive.');return (await created.json()).id;
}
async function v107GoogleUpload(token,folderId,name,blob){
  const boundary=`ticket_${Math.random().toString(36).slice(2)}`;
  const meta=JSON.stringify({name,parents:[folderId]});
  const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${blob.type||'application/octet-stream'}\r\n\r\n`,blob,`\r\n--${boundary}--`]);
  const res=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body});
  if(!res.ok)throw new Error(`Google Drive recusou o arquivo ${name}.`);return await res.json();
}

async function v107Msal(){
  if(window.msal)return window.msal;
  await v107LoadScript('https://alcdn.msauth.net/browser/2.35.0/js/msal-browser.min.js','ticketMsalBrowser');
  if(!window.msal)throw new Error('Biblioteca Microsoft não carregada.');return window.msal;
}
async function v107OneDriveToken(){
  const c=v107CloudConfig();if(!c.microsoftClientId)throw new Error('Informe o Client ID do Microsoft OneDrive.');
  const lib=await v107Msal();
  if(!state.cloudMsal){state.cloudMsal=new lib.PublicClientApplication({auth:{clientId:c.microsoftClientId,authority:`https://login.microsoftonline.com/${c.microsoftTenant||'common'}`,redirectUri:location.origin},cache:{cacheLocation:'sessionStorage',storeAuthStateInCookie:false}});}
  const scopes=['Files.ReadWrite','User.Read'];let account=state.cloudMsal.getAllAccounts?.()[0];
  if(!account){const login=await state.cloudMsal.loginPopup({scopes,prompt:'select_account'});account=login.account;}
  let token;try{token=(await state.cloudMsal.acquireTokenSilent({scopes,account})).accessToken;}catch{token=(await state.cloudMsal.acquireTokenPopup({scopes,account})).accessToken;}
  state.cloudTokens.onedrive=token;c.account.onedrive=account?.username||account?.name||'Conta Microsoft';v107SaveCloud();return token;
}
async function v107OneDriveFolder(token){
  let res=await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/Ticket',{headers:{Authorization:`Bearer ${token}`}});
  if(res.ok)return true;if(res.status!==404)throw new Error('Não foi possível consultar a pasta Ticket. no OneDrive.');
  res=await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({name:'Ticket',folder:{},'@microsoft.graph.conflictBehavior':'rename'})});
  if(!res.ok)throw new Error('Não foi possível criar a pasta Ticket. no OneDrive.');return true;
}
async function v107OneDriveUpload(token,name,blob){const safe=encodeURIComponent(name);const res=await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/Ticket/${safe}:/content`,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':blob.type||'application/octet-stream'},body:blob});if(!res.ok)throw new Error(`OneDrive recusou o arquivo ${name}.`);return await res.json();}

async function v107BuildBackupBlob(){const payload={version:'1.0.7',exportedAt:new Date().toISOString(),profile:{fullName:state.profile?.fullName||'',email:state.profile?.email||'',cpf:state.profile?.cpf||''},records:state.records,schedule:state.schedule,balance:state.balance,closing:state.closing};return new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});}
async function v107SyncCloud(){
  const c=v107CloudConfig();const provider=c.provider;if(provider==='local'){toast('Selecione Google Drive ou Microsoft OneDrive para sincronizar.');return;}
  const button=document.querySelector('#cloudSyncNowV107');if(button){button.disabled=true;button.textContent='Sincronizando…';}
  state.cloudErrors[provider]=0;
  try{
    let token,folderId='';if(provider==='google'){token=await v107GoogleToken();folderId=await v107GoogleFolder(token);}else{token=await v107OneDriveToken();await v107OneDriveFolder(token);}
    const refs=v107EvidenceRefs();let uploaded=0;
    for(const ref of refs){
      if(c.synced[provider]?.[ref.id])continue;
      const evidence=await getEvidence(ref.id);if(!evidence?.blob)continue;
      const name=v107EvidenceFileName(ref,evidence);
      try{if(provider==='google')await v107GoogleUpload(token,folderId,name,evidence.blob);else await v107OneDriveUpload(token,name,evidence.blob);c.synced[provider][ref.id]=new Date().toISOString();uploaded++;v107SaveCloud();}
      catch(error){state.cloudErrors[provider]++;console.warn(error);}
    }
    const backup=await v107BuildBackupBlob();const backupName=`Ticket_backup_${todayIso()}.json`;
    try{if(provider==='google')await v107GoogleUpload(token,folderId,backupName,backup);else await v107OneDriveUpload(token,backupName,backup);}catch(error){console.warn(error);}
    toast(state.cloudErrors[provider]?`Sincronização concluída com ${state.cloudErrors[provider]} falha(s).`:`Sincronização concluída. ${uploaded} nova(s) imagem(ns) enviada(s).`);
  }catch(error){console.error(error);toast(error.message||'Não foi possível sincronizar com a nuvem.');}
  finally{if(state.view==='storage')renderView();}
}

function v107CloudProviderCard(provider,title,subtitle,glyph){const c=v107CloudConfig();const selected=c.provider===provider;return `<button type="button" class="v107-cloud-provider ${selected?'selected':''}" data-cloud-provider="${provider}"><span class="resource-icon blue">${glyph}</span><span><strong>${title}</strong><small>${subtitle}</small></span><i class="radio ${selected?'active':''}"></i></button>`;}
function v107CloudAccountMarkup(){const c=v107CloudConfig();const provider=c.provider;if(provider==='local')return `<div class="v107-cloud-local-note">${v107LocalGlyph(19)} <span>Os comprovantes permanecem protegidos neste navegador. Você pode mudar para a nuvem a qualquer momento.</span></div>`;const isGoogle=provider==='google';const configured=isGoogle?Boolean(c.googleClientId):Boolean(c.microsoftClientId);const account=c.account?.[provider]||'';return `<div class="v107-cloud-account-state"><div><small>Provedor selecionado</small><strong>${isGoogle?'Google Drive':'Microsoft OneDrive'}</strong>${account?`<span>${esc(account)}</span>`:''}</div><button type="button" id="cloudConnectV107" class="secondary">${configured?(account?'Trocar conta':'Conectar conta'):'Configurar e conectar'}</button></div>`;}

storageView=function(){
  const c=v107CloudConfig();const provider=c.provider;const stats=provider==='local'?{total:v107EvidenceRefs().length,done:0,pending:0,errors:0}:v107CloudStats(provider);
  return `<section class="v105-storage-page v107-storage-page"><div class="v105-page-intro"><span class="v105-kicker">CÓPIAS DAS IMAGENS</span><h2>Armazenamento</h2><p>Escolha onde os comprovantes serão preservados e sincronize quando desejar.</p></div>
  <div class="v107-cloud-providers">${v107CloudProviderCard('local','Somente neste dispositivo','Imagens armazenadas no navegador atual.',v107LocalGlyph(24))}${v107CloudProviderCard('google','Google Drive','Conecte sua conta e salve uma cópia na pasta Ticket.',v107GoogleGlyph(25))}${v107CloudProviderCard('onedrive','Microsoft OneDrive','Conecte sua conta Microsoft e salve na pasta Ticket.',v107OneDriveGlyph(25))}</div>
  <article class="settings-section-card v107-cloud-account"><div class="settings-card-head"><div><h3>Conta de armazenamento</h3><p>Você escolhe o provedor e autoriza a própria conta. As credenciais de acesso não ficam salvas pelo Ticket.</p></div><span class="settings-card-icon blue">${v105CloudGlyph(22)}</span></div>${v107CloudAccountMarkup()}</article>
  <article class="settings-section-card v107-sync-card"><div class="settings-card-head"><div><h3>Fila de sincronização</h3><p>${provider==='local'?'Nenhum envio em nuvem está ativo.':'Envie somente quando desejar; os registros locais continuam preservados.'}</p></div><span class="settings-card-icon blue">${v105CloudGlyph(22)}</span></div><div class="v105-queue-row"><span>Imagens registradas</span><strong>${stats.total}</strong></div><div class="v105-queue-row"><span>Pendentes</span><strong>${provider==='local'?0:stats.pending}</strong></div><div class="v105-queue-row"><span>Com erro</span><strong>${provider==='local'?0:stats.errors}</strong></div><div class="v105-queue-row"><span>Provedor atual</span><strong>${provider==='google'?'Google Drive':provider==='onedrive'?'OneDrive':'Local'}</strong></div>${provider!=='local'?`<button id="cloudSyncNowV107" class="primary full-action">${v105CloudGlyph(18)} Sincronizar agora</button>`:''}<button id="cloudExportBackupV107" class="secondary full-action">${v105DownloadGlyph(18)} Exportar backup local</button></article></section>`;
};

function v107EnsureCloudModal(){let m=document.querySelector('#cloudConfigModalV107');if(m)return m;m=document.createElement('div');m.id='cloudConfigModalV107';m.className='v107-modal';m.setAttribute('aria-hidden','true');document.body.append(m);return m;}
function v107CloseCloudModal(){const m=document.querySelector('#cloudConfigModalV107');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');}
function v107OpenCloudModal(provider){const c=v107CloudConfig();const google=provider==='google';const m=v107EnsureCloudModal();m.innerHTML=`<div class="v107-modal-backdrop" data-cloud-close></div><section class="v107-modal-dialog" role="dialog" aria-modal="true"><div class="settings-card-head"><div><span class="v105-kicker">CONEXÃO SEGURA</span><h3>${google?'Google Drive':'Microsoft OneDrive'}</h3><p>Informe o Client ID público do aplicativo OAuth. Nenhum segredo ou senha deve ser colocado aqui.</p></div><span class="settings-card-icon blue">${google?v107GoogleGlyph(23):v107OneDriveGlyph(23)}</span></div><form id="cloudConfigFormV107" class="stack"><label class="field"><span>Client ID</span><input name="clientId" value="${esc(google?c.googleClientId:c.microsoftClientId)}" placeholder="${google?'...apps.googleusercontent.com':'ID do aplicativo Microsoft'}" required></label>${google?'':`<label class="field"><span>Tenant</span><input name="tenant" value="${esc(c.microsoftTenant||'common')}" placeholder="common"></label>`}<div class="v107-modal-actions"><button type="button" class="secondary" data-cloud-close>Cancelar</button><button type="submit" class="primary">Salvar e conectar</button></div></form></section>`;m.classList.add('open');m.setAttribute('aria-hidden','false');m.querySelectorAll('[data-cloud-close]').forEach(x=>x.addEventListener('click',v107CloseCloudModal));m.querySelector('#cloudConfigFormV107').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));if(google)c.googleClientId=String(d.clientId||'').trim();else{c.microsoftClientId=String(d.clientId||'').trim();c.microsoftTenant=String(d.tenant||'common').trim()||'common';state.cloudMsal=null;}v107SaveCloud();v107CloseCloudModal();try{if(google)await v107GoogleToken();else await v107OneDriveToken();toast('Conta conectada com sucesso.');}catch(error){toast(error.message||'Não foi possível conectar a conta.');}if(state.view==='storage')renderView();});}

function v107AiEndpoint(){return localStorage.getItem('ticket.ai.endpoint')||window.TICKET_CONFIG?.aiEndpoint||'https://ticket-app-ai.onrender.com/api/chat';}
function v107AiFallback(text){const q=String(text||'').toLowerCase();if(q.includes('armazen'))return 'Abra Configurações → Recursos do Ticket. → Armazenamento. Lá você pode escolher Local, Google Drive ou OneDrive e sincronizar quando quiser.';if(q.includes('jornada'))return 'Em Configurações → Jornada semanal você define dias ativos, entrada, saída, carga diária e quantidade de batidas. Registros já salvos não são alterados.';if(q.includes('saldo'))return 'Use Configurações → Definir saldo anterior para informar o saldo oficial anterior ao Ticket. A data de referência define a partir de quando o sistema começa a somar os registros novos.';if(q.includes('foto')||q.includes('comprovante'))return 'Em Registrar ponto, fotografe o comprovante, confira a análise de qualidade, escolha cores ou alto contraste, informe DATA e HORA e confirme. Depois a foto fica disponível em Registros como somente leitura.';if(q.includes('fechamento')||q.includes('período'))return 'Em Configurações → Período de fechamento você pode usar mês normal ou ciclo personalizado, como 16 a 15.';return 'Posso ajudar com registro de ponto, jornada, saldo anterior, fechamento, armazenamento, fotos, relatórios e uso do Ticket. A conexão com a IA online ainda pode estar sendo ativada; enquanto isso, este suporte local continua disponível.';}
function v107AiBubble(role,text){return `<div class="v107-ai-bubble ${role}"><span>${role==='assistant'?v107AiGlyph(17):'Você'}</span><p>${esc(text).replace(/\n/g,'<br>')}</p></div>`;}
profileView=function(){if(!state.aiMessages.length)state.aiMessages.push({role:'assistant',content:'Olá! Sou o Assistente Ticket. Posso orientar você sobre registros, configurações, armazenamento, relatórios e funcionamento do app.'});return `<section class="v107-ai-page"><div class="v107-ai-head"><div><span class="v105-kicker">SUPORTE INTELIGENTE</span><h2>Assistente Ticket. IA</h2><p>Suporte específico para o sistema, sem exibir seus dados pessoais nesta tela.</p></div><span class="v107-ai-orb">${v107AiGlyph(30)}</span></div><article class="v107-ai-card"><div id="aiMessagesV107" class="v107-ai-messages">${state.aiMessages.slice(-20).map(m=>v107AiBubble(m.role,m.content)).join('')}</div><div class="v107-ai-quick"><button type="button" data-ai-prompt="Como registrar um ponto corretamente?">Registrar ponto</button><button type="button" data-ai-prompt="Como configurar minha jornada semanal?">Jornada</button><button type="button" data-ai-prompt="Como salvar minhas fotos na nuvem?">Nuvem</button></div><form id="aiFormV107" class="v107-ai-form"><textarea name="message" rows="2" maxlength="2000" placeholder="Pergunte algo sobre o Ticket." required></textarea><button type="submit" aria-label="Enviar">${v107AiGlyph(20)}<span>Enviar</span></button></form><small class="v107-ai-privacy">A IA recebe apenas a pergunta e um contexto técnico mínimo do Ticket.; seus registros e fotos não são enviados automaticamente.</small></article></section>`;};

function v107DecorateAiLaunchers(){document.querySelectorAll('[data-view="profile"]').forEach(btn=>{btn.title='Assistente Ticket. IA';btn.setAttribute('aria-label','Assistente Ticket. IA');if(btn.closest('.mobile-brand')||btn.closest('.toolbar'))btn.innerHTML=v107AiGlyph(21);else if(btn.closest('.sidebar'))btn.innerHTML=`${v107AiGlyph(19)}<span>Assistente IA</span>`;});}
async function v107SendAi(message){const text=String(message||'').trim();if(!text)return;state.aiMessages.push({role:'user',content:text});renderView();const form=document.querySelector('#aiFormV107');const btn=form?.querySelector('button');if(btn)btn.disabled=true;state.aiMessages.push({role:'assistant',content:'Pensando…',pending:true});renderView();try{const history=state.aiMessages.filter(m=>!m.pending).slice(-10).map(({role,content})=>({role,content}));const res=await fetch(v107AiEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history,context:{view:state.view,version:'1.0.7',platform:navigator.userAgent.includes('Android')?'Android':'Web'}})});if(!res.ok)throw new Error('IA online indisponível');const data=await res.json();state.aiMessages=state.aiMessages.filter(m=>!m.pending);state.aiMessages.push({role:'assistant',content:String(data.answer||'Não recebi uma resposta.')});}catch(error){state.aiMessages=state.aiMessages.filter(m=>!m.pending);state.aiMessages.push({role:'assistant',content:v107AiFallback(text)});}renderView();}

function v107BindView(){
  v107DecorateAiLaunchers();
  if(state.view==='storage'){
    document.querySelectorAll('[data-cloud-provider]').forEach(btn=>btn.addEventListener('click',()=>{const c=v107CloudConfig();c.provider=btn.dataset.cloudProvider;v107SaveCloud();renderView();v107ScrollTop();}));
    document.querySelector('#cloudConnectV107')?.addEventListener('click',async()=>{const c=v107CloudConfig();const provider=c.provider;const configured=provider==='google'?c.googleClientId:c.microsoftClientId;if(!configured){v107OpenCloudModal(provider);return;}try{if(provider==='google')await v107GoogleToken();else await v107OneDriveToken();toast('Conta conectada.');renderView();}catch(error){toast(error.message||'Não foi possível conectar a conta.');}});
    document.querySelector('#cloudSyncNowV107')?.addEventListener('click',v107SyncCloud);
    document.querySelector('#cloudExportBackupV107')?.addEventListener('click',exportData);
  }
  if(state.view==='profile'){
    document.querySelectorAll('[data-ai-prompt]').forEach(btn=>btn.addEventListener('click',()=>v107SendAi(btn.dataset.aiPrompt)));
    document.querySelector('#aiFormV107')?.addEventListener('submit',e=>{e.preventDefault();const input=e.currentTarget.elements.message;const text=input.value;input.value='';v107SendAi(text);});
    const box=document.querySelector('#aiMessagesV107');if(box)box.scrollTop=box.scrollHeight;
  }
}
const v107RenderViewBefore=renderView;
renderView=function(){const result=v107RenderViewBefore();queueMicrotask(v107BindView);return result;};
const v107RenderShellBefore=renderShell;
renderShell=function(){const result=v107RenderShellBefore();queueMicrotask(()=>{v107DecorateAiLaunchers();if(state.view==='storage')v107ScrollTop();});return result;};

queueMicrotask(()=>{v107DecorateAiLaunchers();if(state.view==='storage')v107ScrollTop();});
