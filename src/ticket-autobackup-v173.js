/* Ticket. 1.0.73 — backup automático em horários fixos (sem recuperação automática),
   popover de notificação e reordenação/espaçamento do Armazenamento. */
'use strict';

/* ---------- Backup automático: apenas grava backup, nunca recupera sozinho ---------- */
const AUTO_BACKUP_TIMES=['08:30','12:30','13:30','14:30','15:30','18:30'];

function autoBackupMinutes(label){const p=String(label).split(':').map(Number);return p[0]*60+p[1];}
function autoBackupDayKey(d){return todayIso(d||new Date());}
function autoBackupFiredList(d){
  try{return JSON.parse(localStorage.getItem('ticketAutoBackupFired:'+autoBackupDayKey(d))||'[]')||[];}
  catch{return[];}
}
function autoBackupMarkFired(label){
  const list=autoBackupFiredList();
  if(!list.includes(label))list.push(label);
  try{localStorage.setItem('ticketAutoBackupFired:'+autoBackupDayKey(),JSON.stringify(list));}catch{}
}
function autoBackupDueTimes(now){
  const cur=(now||new Date()).getHours()*60+(now||new Date()).getMinutes();
  const fired=autoBackupFiredList(now);
  return AUTO_BACKUP_TIMES.filter(t=>autoBackupMinutes(t)<=cur&&!fired.includes(t));
}

/* Destino ativo: pasta, nuvem ou navegador. Retorna o caminho/nome salvo. */
async function autoBackupTarget(){
  const cpf=state.profile?.cpf;
  if(!cpf)return{kind:'browser',label:'Neste navegador'};
  let dest=null;
  try{dest=await getSetting(cpf,'internalStorageDestination',null);}catch{}
  const cloud=typeof v107CloudConfig==='function'?v107CloudConfig():{provider:'local'};
  if(dest?.mode==='folder'&&typeof ticketFolder!=='undefined'&&ticketFolder&&ticketFolder.cpf===cpf)
    return{kind:'folder',label:ticketFolder.dir.name};
  if(cloud.provider==='google')return{kind:'google',label:'Google Drive'};
  if(cloud.provider==='onedrive')return{kind:'onedrive',label:'OneDrive'};
  return{kind:'browser',label:'Neste navegador'};
}

/* Executa SOMENTE o backup no destino ativo (não restaura nada). */
async function runAutoBackup(){
  const t=await autoBackupTarget();
  if(t.kind==='folder'){ticketFolderDirty=true;await ticketFlushFolder();return t.kind;}
  if(t.kind==='google'){await ticketCloudWrite('google',{interactive:false});return t.kind;}
  if(t.kind==='onedrive'){await ticketCloudWrite('onedrive',{interactive:false});return t.kind;}
  return'browser';
}

/* Teste de comunicação: mostra o caminho salvo que recebe o backup. */
async function autoBackupTest(){
  const t=await autoBackupTarget();
  if(t.kind==='folder'){
    if(typeof ticketFolder!=='undefined'&&ticketFolder&&ticketFolder.cpf===state.profile?.cpf){
      try{
        const perm=await ticketFolder.dir.queryPermission({mode:'readwrite'});
        return perm==='granted'
          ?{ok:true,label:t.label}
          :{ok:false,label:t.label,message:'Autorize a pasta para que ela receba o backup.'};
      }catch(e){return{ok:false,label:t.label,message:e.message||'Falha ao testar a pasta.'};}
    }
    return{ok:false,label:'Sem pasta definida',message:'Defina o local de salvamento em “Celular ou cartão SD”.'};
  }
  if(t.kind==='google'||t.kind==='onedrive'){
    try{await ticketCloudToken(t.kind);return{ok:true,label:t.label};}
    catch(e){return{ok:false,label:t.label,message:e.code==='reauth'
      ?`Autorize a conta ${t.label} para receber o backup.`
      :(e.message||`Verifique a conta ${t.label}.`)};}
  }
  return{ok:true,label:'Neste navegador'};
}

/* ---------- Armazenamento: injeta "Backup Automático" (5º) com o mesmo espaçamento ---------- */
const autoBackupStorageSource=storageView;
storageView=function(){
  const base=autoBackupStorageSource();
  const abCard=`
  <article class="panel autobackup-panel-v173">
    <h3>Backup Automático</h3>
    <p>Executa backup automático nos horários 08:30, 12:30, 13:30, 14:30, 15:30 e 18:30, sem recuperar sozinho. A restauração só é feita quando você solicitar.</p>
    <div id="autobackupStatus-v173" role="status"></div>
    <div class="autobackup-actions-v173"><button class="secondary" data-autobackup-test>Teste de comunicação</button></div>
  </article>`;
  const marker='<article class="panel"><h3>Recuperar informa';
  return base.includes(marker)?base.replace(marker,abCard+'\n'+marker):base+abCard;
};

/* ---------- Pós-render: status + botão de teste ---------- */
const autoBackupRenderSource=renderView;
renderView=function(){
  const result=autoBackupRenderSource();
  requestAnimationFrame(async()=>{
    if(state.view!=='storage')return;
    const status=document.querySelector('#autobackupStatus-v173');
    if(status){
      const t=await autoBackupTarget();
      const due=autoBackupDueTimes();
      status.textContent='Caminho de backup: '+t.label+(due.length?` · próximo às ${due[0]}`:' · em dia');
      status.className='';
    }
    document.querySelectorAll('[data-autobackup-test]').forEach(b=>{
      if(b.dataset.b173)return;b.dataset.b173='1';
      b.onclick=async()=>{
        const s=document.querySelector('#autobackupStatus-v173');
        if(s){s.className='';s.textContent='Testando comunicação…';}
        const res=await autoBackupTest();
        if(s){s.className=res.ok?'is-ok':'is-err';s.textContent=(res.ok?'Comunicação OK · Caminho: ':'Falha · Caminho: ')+res.label+(res.message?` — ${res.message}`:'');}
        if(!res.ok)toast(res.message||'Defina o local de salvamento automático.');
      };
    });
  });
  return result;
};

/* ---------- Agendamento: grava backup sozinho; NUNCA restaura ---------- */
let autoBackupTimer=null;
function autoBackupSweep(){
  if(!state.profile)return;
  const due=autoBackupDueTimes();
  if(!due.length)return;
  due.forEach(t=>autoBackupMarkFired(t));
  runAutoBackup()
    .then(kind=>{
      if(kind==='browser')return;
      const s=document.querySelector('#autobackupStatus-v173');
      if(s){s.className='is-ok';s.textContent='Backup automático realizado às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'.';}
    })
    .catch(()=>{});
}
function startAutoBackupLoop(){
  if(autoBackupTimer)return;
  autoBackupTimer=setInterval(autoBackupSweep,20000);
}
setTimeout(autoBackupSweep,4000);
window.addEventListener('focus',autoBackupSweep);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')autoBackupSweep();});
if(document.readyState==='complete')startAutoBackupLoop();
else window.addEventListener('load',startAutoBackupLoop);

/* ---------- Popover de notificação: mostra "Nenhuma novidade." quando vazio;
         fecha ao clicar em qualquer parte da tela. ---------- */
(function(){
  let pop=null;
  function closePop(){if(pop){pop.remove();pop=null;}}
  function showPop(text){
    closePop();
    const bell=document.querySelector('.mobile-brand-actions-v151 [data-notification]')||document.querySelector('[data-notification]');
    if(!bell)return;
    pop=document.createElement('div');
    pop.className='ticket-notification-pop-v173';
    pop.setAttribute('role','status');
    pop.textContent=text;
    pop.addEventListener('click',ev=>ev.stopPropagation());
    document.body.append(pop);
    const r=bell.getBoundingClientRect();
    const width=Math.min(300,Math.max(200,window.innerWidth-24));
    const left=Math.max(12,Math.min(r.left,window.innerWidth-width-12));
    pop.style.width=width+'px';pop.style.left=left+'px';
    const below=r.bottom+8;
    pop.style.top=(below+140>window.innerHeight?r.top-148:below)+'px';
  }
  document.addEventListener('click',function(e){
    const bell=e.target.closest?.('[data-notification]');
    if(bell){
      e.preventDefault();e.stopPropagation();
      const reminder=typeof updateNotificationBell==='function'?updateNotificationBell():null;
      showPop(reminder?reminderMessage(reminder):'Nenhuma novidade.');
      return;
    }
    closePop();
  },true);
  window.addEventListener('scroll',closePop,{passive:true});
})();
