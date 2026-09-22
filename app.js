/* Ticket. 1.0.2 - bundle sem dependencias externas */
'use strict';

function showStartupError(error){
  console.error('Ticket. startup error:', error);
  const target=document.querySelector('#app');
  if(!target) return;
  const message=String(error?.message||error||'Erro desconhecido');
  target.innerHTML=`<main style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef1f7;color:#1c2333"><section style="width:min(560px,100%);padding:28px;border:1px solid rgba(255,255,255,.85);border-radius:28px;background:rgba(255,255,255,.58);box-shadow:0 20px 55px rgba(50,55,85,.13);backdrop-filter:blur(24px)"><h1 style="margin:0 0 10px">Ticket.</h1><h2 style="margin:0 0 12px;font-size:1.25rem">Não foi possível iniciar o sistema</h2><p style="line-height:1.55;color:#5d6678">${message}</p><p style="line-height:1.55;color:#5d6678">Recarregue a página. Se o problema continuar, verifique a conexão e tente novamente.</p></section></main>`;
}
window.addEventListener('error',(event)=>showStartupError(event.error||event.message));
window.addEventListener('unhandledrejection',(event)=>showStartupError(event.reason));

const paths={
home:'<path d="m3.5 11 8.5-7 8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-6h5v6"/>',
records:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
report:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
calendar:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 9.5h17"/>',
more:'<circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
entry:'<path d="M10 4H5v16h5"/><path d="m13 8 4 4-4 4"/><path d="M17 12H8"/>',
lunch:'<path d="M7 3v7M4 3v5a2 2 0 0 0 4 0V3M6 10v11"/><path d="M15 3v8c0 1.7 1.3 3 3 3V3M18 14v7"/>',
return:'<path d="m8 5 10 7-10 7z"/><path d="M5 5v14"/>',
exit:'<path d="M6 21V4"/><path d="M6 5h11l-2.5 4L17 13H6"/>',
camera:'<path d="M4 7h4l1.5-2h5L16 7h4v12H4z"/><circle cx="12" cy="13" r="4"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
bolt:'<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
hourglass:'<path d="M6 3h12M6 21h12M7 3c0 5 2 6 5 9-3 3-5 4-5 9M17 3c0 5-2 6-5 9 3 3 5 4 5 9"/>',
target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1A8 8 0 0 0 15 6l-.3-2.5h-4L10.4 6A8 8 0 0 0 8 7L5.6 6 3.6 9.5 5.6 11a7 7 0 0 0 0 2l-2 1.5 2 3.5L8 17a8 8 0 0 0 2.4 1l.3 2.5h4L15 18a8 8 0 0 0 2.4-1l2.4 1 2-3.5-2-1.5c.1-.3.2-.7.2-1z"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
cloud:'<path d="M7 18h11a4 4 0 0 0 .5-8A6 6 0 0 0 7 8.5 4.5 4.5 0 0 0 7 18z"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/>',
back:'<path d="m15 18-6-6 6-6"/>',
chev:'<path d="m9 18 6-6-6-6"/>',
logout:'<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
save:'<path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
filter:'<path d="M4 5h16l-6 7v5l-4 2v-7z"/>',
};
function icon(name,size=20,cls=''){return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.clock}</svg>`;}
function homePremiumIcon(name,size=27){
  const premium={
    entry:'<path d="M5 4.5h9v15H5z" fill="currentColor" fill-opacity=".09"/><path d="M14 7V4.5H5v15h9V17M21 12H9M12.5 8.5 9 12l3.5 3.5"/>',
    lunch:'<path d="M5 15a7 7 0 0 1 14 0" fill="currentColor" fill-opacity=".09"/><path d="M4 15h16M7 19h10M12 8V5M10 5h4"/>',
    return:'<path d="M5.5 8.5A8 8 0 1 1 5 15"/><path d="M5.5 3.5v5h5"/><path d="m11 9 5 3-5 3z" fill="currentColor" fill-opacity=".16"/>',
    exit:'<path d="M10 4.5h9v15h-9" fill="currentColor" fill-opacity=".09"/><path d="M10 7V4.5h9v15h-9V17M3 12h12M11.5 8.5 15 12l-3.5 3.5"/>',
    clock:'<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity=".08"/><path d="M12 7.5V12l3 2"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    overtime:'<circle cx="10" cy="13" r="7" fill="currentColor" fill-opacity=".07"/><path d="M10 9v4l2.5 1.5M16 3l-3 6h4l-2 5"/>',
    bank:'<path d="M7 4h10M7 20h10M8 4c0 4 1.5 5.5 4 8-2.5 2.5-4 4-4 8M16 4c0 4-1.5 5.5-4 8 2.5 2.5 4 4 4 8"/><path d="M10 17h4" stroke-width="2.3"/>',
    target:'<circle cx="11" cy="13" r="8" fill="currentColor" fill-opacity=".07"/><circle cx="11" cy="13" r="4"/><circle cx="11" cy="13" r="1" fill="currentColor"/><path d="m14 10 6-6M16 4h4v4"/>'
  };
  return `<svg class="home-premium-svg-v152" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${premium[name]||premium.clock}</svg>`;
}
function dockPremiumIcon(name,size=31){
  const dock={
    home:'<path d="m3.5 11 8.5-7 8.5 7v8.5H3.5z" fill="currentColor" fill-opacity=".08"/><path d="M8.5 19.5v-6h7v6M3.5 11l8.5-7 8.5 7"/>',
    records:'<rect x="4" y="3.5" width="16" height="17" rx="4" fill="currentColor" fill-opacity=".07"/><path d="M8 8h5M8 12h4M8 16h3"/><circle cx="16.5" cy="14.5" r="3.5"/><path d="M16.5 12.7v2l1.3.8"/>',
    report:'<rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="currentColor" fill-opacity=".07"/><path d="M7 16v-4M12 16V8M17 16v-6"/><path d="m7 8 4-2 3 2 3-3"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="4" fill="currentColor" fill-opacity=".07"/><path d="M8 3v4M16 3v4M3.5 9.5h17"/><circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1" fill="currentColor" stroke="none"/>',
    more:'<rect x="4" y="4" width="6" height="6" rx="2" fill="currentColor" fill-opacity=".14"/><rect x="14" y="4" width="6" height="6" rx="2" fill="currentColor" fill-opacity=".14"/><rect x="4" y="14" width="6" height="6" rx="2" fill="currentColor" fill-opacity=".14"/><rect x="14" y="14" width="6" height="6" rx="2" fill="currentColor" fill-opacity=".14"/>'
  };
  return `<svg class="dock-premium-svg-v154" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dock[name]||dock.more}</svg>`;
}
function brand(){return `<span class="brand-mark"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M7.5 15v-2.5a8.5 8.5 0 0 1 17 0V15"/><path d="M10.8 16v-3.5a5.2 5.2 0 0 1 10.4 0v4.2c0 3.8-1.1 7.2-3.2 10"/><path d="M14 15.5v-3a2 2 0 0 1 4 0v4.3c0 3.3-.9 6.2-2.5 8.8"/><path d="M7.8 18.5c.4 3 1.5 5.6 3.3 7.8"/><path d="m21.5 23 2 2 4-5" stroke-width="2.2"/></svg></span><strong class="brand-word">Ticket<span>.</span></strong>`;}

const DEFAULT_SCHEDULE = {
  0: { active:false, requiredPunches:0, expectedMinutes:0 },
  1: { active:true, requiredPunches:4, expectedMinutes:480 },
  2: { active:true, requiredPunches:4, expectedMinutes:480 },
  3: { active:true, requiredPunches:4, expectedMinutes:480 },
  4: { active:true, requiredPunches:4, expectedMinutes:480 },
  5: { active:true, requiredPunches:4, expectedMinutes:480 },
  6: { active:true, requiredPunches:2, expectedMinutes:240 },
};

const PUNCH_TYPES = [
  { key:'entry', label:'Entrada' },
  { key:'lunch', label:'Almoço' },
  { key:'return', label:'Retorno' },
  { key:'exit', label:'Saída' },
];

function todayIso(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function monthKey(iso=todayIso()){ return String(iso).slice(0,7); }
function formatDateBr(iso){ if(!iso) return '--/--/----'; const [y,m,d]=iso.split('-'); return `${d}/${m}/${y}`; }
function formatMonthLabel(key){ const [y,m]=key.split('-').map(Number); return new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(new Date(y,m-1,1)); }
function longDate(iso=todayIso()){ return new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date(`${iso}T12:00:00`)); }
function timeNow(){ const d=new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
const POINT_REMINDERS=[480,720,780,840,900,1080].map(minutes=>({minutes,label:'Ponto',time:`${String(Math.floor(minutes/60)).padStart(2,'0')}:00`}));
function pointReminderStatus(now=new Date()){
  const current=now.getHours()*60+now.getMinutes();
  const reminder=POINT_REMINDERS.find(item=>item.minutes-current>=0&&item.minutes-current<=5);
  return reminder?{...reminder,minutesLeft:reminder.minutes-current}:null;
}
function nextPointReminder(now=new Date()){
  const current=now.getHours()*60+now.getMinutes();
  return POINT_REMINDERS.find(item=>item.minutes>=current)||POINT_REMINDERS[0];
}
function reminderMessage(reminder){return reminder.minutesLeft===0?`Agora é hora de registrar: ${reminder.label}.`:`Faltam ${reminder.minutesLeft} min para registrar: ${reminder.label} às ${reminder.time}.`;}
function updateNotificationBell({announce=false}={}){
  const reminder=pointReminderStatus();
  document.querySelectorAll('[data-notification]').forEach(button=>{button.classList.toggle('has-alert',Boolean(reminder));button.setAttribute('aria-label',reminder?reminderMessage(reminder):`Próximo ponto às ${nextPointReminder().time}`);});
  if(reminder&&announce){const key=`ticketReminder:${todayIso()}:${reminder.time}`;if(!localStorage.getItem(key)){localStorage.setItem(key,'1');toast(reminderMessage(reminder));}}
  return reminder;
}
function toMinutes(time){ if(!/^\d{2}:\d{2}$/.test(String(time))) return null; const [h,m]=time.split(':').map(Number); return h*60+m; }
function formatDuration(minutes,{signed=false}={}){ if(minutes==null||Number.isNaN(minutes)) return '--h--'; const sign=minutes<0?'-':signed&&minutes>0?'+':''; const abs=Math.abs(Math.round(minutes)); return `${sign}${String(Math.floor(abs/60)).padStart(2,'0')}h ${String(abs%60).padStart(2,'0')}m`; }
function scheduleForDate(iso,schedule=DEFAULT_SCHEDULE){ const dt=new Date(`${iso}T12:00:00`); return structuredClone(schedule[dt.getDay()] || DEFAULT_SCHEDULE[dt.getDay()]); }
function normalizeRecord(record){ return {...record, punches:[...(record?.punches||[])].sort((a,b)=>toMinutes(a.time)-toMinutes(b.time))}; }
function calculateRecord(record,schedule=DEFAULT_SCHEDULE){
  if(!record) return {complete:false,workedMinutes:0,balanceMinutes:null,requiredPunches:4,expectedMinutes:480,status:'Sem registro'};
  const day = record.scheduleSnapshot || scheduleForDate(record.date,schedule);
  const punches=[...(record.punches||[])].sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  const required=Number(day.requiredPunches||0);
  let worked=null;
  if(required===2 && punches.length>=2) worked=toMinutes(punches[1].time)-toMinutes(punches[0].time);
  if(required===4 && punches.length>=4) worked=(toMinutes(punches[1].time)-toMinutes(punches[0].time))+(toMinutes(punches[3].time)-toMinutes(punches[2].time));
  const complete=required>0 && punches.length>=required && worked!=null;
  return { complete, workedMinutes:worked ?? 0, balanceMinutes:complete?worked-Number(day.expectedMinutes||0):null, requiredPunches:required, expectedMinutes:Number(day.expectedMinutes||0), status:complete?'Completo':punches.length?'Incompleto':'Sem registro' };
}
function accumulatedBalance(records,schedule=DEFAULT_SCHEDULE,{afterDate='',throughDate=todayIso()}={}){
  return records.reduce((sum,r)=>{ if(afterDate&&r.date<=afterDate) return sum; if(throughDate&&r.date>throughDate) return sum; const c=calculateRecord(r,schedule); return sum+(c.complete?c.balanceMinutes:0); },0);
}
function closingPeriodForDate(iso=todayIso(),settings={mode:'custom',startDay:16}){
  const startDay=Number(settings.startDay||1); const dt=new Date(`${iso}T12:00:00`); const y=dt.getFullYear(), m=dt.getMonth();
  if(settings.mode!=='custom' || startDay===1){ const start=new Date(y,m,1,12); const end=new Date(y,m+1,0,12); return {startDate:todayIso(start),endDate:todayIso(end)}; }
  const thisStart=new Date(y,m,Math.min(startDay,new Date(y,m+1,0).getDate()),12);
  const start=dt>=thisStart?thisStart:new Date(y,m-1,Math.min(startDay,new Date(y,m,0).getDate()),12);
  const next=new Date(start.getFullYear(),start.getMonth()+1,Math.min(startDay,new Date(start.getFullYear(),start.getMonth()+2,0).getDate()),12);
  const end=new Date(next); end.setDate(end.getDate()-1);
  return {startDate:todayIso(start),endDate:todayIso(end)};
}
function nextClosingPeriod(period,settings){ const d=new Date(`${period.endDate}T12:00:00`); d.setDate(d.getDate()+1); return closingPeriodForDate(todayIso(d),settings); }
function periodRecords(records,period){ return records.filter(r=>r.date>=period.startDate&&r.date<=period.endDate).sort((a,b)=>b.date.localeCompare(a.date)); }
function periodSummary(records,schedule,period){ const selected=periodRecords(records,period); let worked=0,positive=0,negative=0,pending=0; selected.forEach(r=>{const c=calculateRecord(r,schedule); worked+=c.workedMinutes||0; if(!c.complete) pending++; else if(c.balanceMinutes>=0) positive+=c.balanceMinutes; else negative+=Math.abs(c.balanceMinutes);}); return {records:selected,worked,positive,negative,net:positive-negative,pending}; }
function firstName(name=''){ return String(name).trim().split(/\s+/)[0]||'Colaborador'; }
function greeting(){ const h=new Date().getHours(); return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'; }
function uuid(){ return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function cpfDigits(v=''){ return String(v).replace(/\D/g,'').slice(0,11); }
function formatCpf(v=''){ const d=cpfDigits(v); return d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2'); }
function maskCpf(v=''){ const d=cpfDigits(v); return d.length===11?`${d.slice(0,3)}.xxx.xxx-${d.slice(9)}`:formatCpf(d); }
function nextPunchType(record,schedule=DEFAULT_SCHEDULE){ const c=calculateRecord(record,schedule); if(c.requiredPunches===2){ return (record?.punches?.length||0)===0?'entry':'exit'; } return ['entry','lunch','return','exit'][Math.min(record?.punches?.length||0,3)]; }

const DB_NAME='ticket-glass-db';
const DB_VERSION=1;
let dbPromise;
function db(){
  if(dbPromise) return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const d=req.result;
      if(!d.objectStoreNames.contains('profiles')) d.createObjectStore('profiles',{keyPath:'cpf'});
      if(!d.objectStoreNames.contains('records')) d.createObjectStore('records',{keyPath:'id'});
      if(!d.objectStoreNames.contains('evidence')) d.createObjectStore('evidence',{keyPath:'id'});
      if(!d.objectStoreNames.contains('settings')) d.createObjectStore('settings',{keyPath:'key'});
    };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  }); return dbPromise;
}
async function tx(store,mode='readonly'){ const d=await db(); return d.transaction(store,mode).objectStore(store); }
function reqP(req){ return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);}); }
async function saveProfile(profile){ return reqP((await tx('profiles','readwrite')).put(profile)); }
async function getProfile(cpf){ return reqP((await tx('profiles')).get(cpf)); }
async function listProfiles(){ return reqP((await tx('profiles')).getAll()); }
async function saveRecord(record){ return reqP((await tx('records','readwrite')).put(record)); }
async function getRecord(profileCpf,date){ return reqP((await tx('records')).get(`${profileCpf}:${date}`)); }
async function listRecords(profileCpf){ const all=await reqP((await tx('records')).getAll()); return all.filter(r=>r.profileCpf===profileCpf).sort((a,b)=>b.date.localeCompare(a.date)); }
async function saveEvidence(evidence){ return reqP((await tx('evidence','readwrite')).put(evidence)); }
async function getEvidence(id){ return reqP((await tx('evidence')).get(id)); }
async function saveSetting(profileCpf,key,value){ return reqP((await tx('settings','readwrite')).put({key:`${profileCpf}:${key}`,value})); }
async function getSetting(profileCpf,key,fallback=null){ const v=await reqP((await tx('settings')).get(`${profileCpf}:${key}`)); return v?.value ?? fallback; }
async function clearProfileData(profileCpf){
  const d=await db(); const tr=d.transaction(['records','evidence','settings'],'readwrite');
  const recStore=tr.objectStore('records'); const evStore=tr.objectStore('evidence'); const setStore=tr.objectStore('settings');
  const recs=await reqP(recStore.getAll()); const evidenceIds=[]; recs.filter(r=>r.profileCpf===profileCpf).forEach(r=>{(r.evidenceIds||[]).forEach(id=>evidenceIds.push(id)); recStore.delete(r.id);});
  evidenceIds.forEach(id=>evStore.delete(id)); const settings=await reqP(setStore.getAll()); settings.filter(s=>s.key.startsWith(`${profileCpf}:`)).forEach(s=>setStore.delete(s.key));
  return new Promise((resolve,reject)=>{tr.oncomplete=resolve;tr.onerror=()=>reject(tr.error);});
}
function setSession(cpf){ localStorage.setItem('ticketGlassSession',cpf); }
function getSession(){ return localStorage.getItem('ticketGlassSession')||''; }
function clearSession(){ localStorage.removeItem('ticketGlassSession'); }

const app=document.querySelector('#app');
const toastRoot=document.querySelector('#toastRoot');
const state={profile:null,records:[],schedule:structuredClone(DEFAULT_SCHEDULE),balance:{minutes:0,referenceDate:'',note:'',history:[]},closing:{mode:'custom',startDay:16},view:'dashboard',recordRange:'today',reportMonth:monthKey(todayIso()),calendarMonth:monthKey(todayIso()),captureMode:'point',receiptFile:null,receiptUrl:'',environmentFile:null,environmentUrl:'',stream:null,settingsTab:'schedule'};
let authSuccessTimer=0;
let homeClockTimer=0;

function esc(v=''){return String(v).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function toast(message){const el=document.createElement('div');el.className='toast';el.textContent=message;toastRoot.append(el);setTimeout(()=>el.remove(),3600);}
function currentRecord(date=todayIso()){return state.records.find(r=>r.date===date)||null;}
function previousBalance(){return Number(state.balance.minutes||0);}
function ticketBalance(){return accumulatedBalance(state.records,state.schedule,{afterDate:state.balance.referenceDate||'',throughDate:todayIso()});}
function totalBalance(){return previousBalance()+ticketBalance();}
function period(){return closingPeriodForDate(todayIso(),state.closing);}
function profileInitial(){return firstName(state.profile?.fullName||'C').charAt(0).toUpperCase();}
function stopCamera(){if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}}
function clearUrls(){for(const key of ['receiptUrl','environmentUrl']){if(state[key]) URL.revokeObjectURL(state[key]);state[key]='';}}

async function loadState(){
  const cpf=getSession(); if(!cpf) return false;
  const profile=await getProfile(cpf); if(!profile){clearSession();return false;}
  state.profile=profile;
  state.records=await listRecords(cpf);
  state.schedule=await getSetting(cpf,'schedule',structuredClone(DEFAULT_SCHEDULE));
  state.balance=await getSetting(cpf,'balance',{minutes:0,referenceDate:'',note:'',history:[]});
  state.closing=await getSetting(cpf,'closing',{mode:'custom',startDay:16});
  state.holidays=await getSetting(cpf,'holidays',state.holidays||[]);
  return true;
}

function authTemplate(mode='login'){
  const login=mode==='login';
  return `<main class="auth-page auth-page-v145"><section class="auth-card auth-card-v145">
    <div class="auth-orb auth-orb-one" aria-hidden="true"></div><div class="auth-orb auth-orb-two" aria-hidden="true"></div>
    <div class="auth-form-wrap auth-form-v145">
      <header class="auth-brand-v145"><div class="brand">${brand()}</div><span class="auth-secure-v145">Acesso protegido</span></header>
      <div class="auth-welcome-v145"><span class="auth-eyebrow-v145">${login?'Bem-vindo de volta':'Seu controle começa aqui'}</span><h1>${login?'Entre no Ticket.':'Crie sua conta.'}</h1><p>${login?'Digite o CPF cadastrado para continuar.':'Informe seu nome e CPF para começar a registrar sua jornada.'}</p></div>
      <div class="auth-tabs" role="tablist" aria-label="Escolha entre entrar ou criar cadastro"><button type="button" role="tab" aria-selected="${login}" data-auth="login" class="${login?'active':''}">Entrar</button><button type="button" role="tab" aria-selected="${!login}" data-auth="register" class="${!login?'active':''}">Criar cadastro</button></div>
      <form id="authForm" class="form auth-form-fields-v145"><input type="hidden" name="mode" value="${mode}">${login?`
        <label class="field"><span>CPF</span><input id="cpfInput" name="cpf" inputmode="numeric" maxlength="14" required autocomplete="username" aria-label="CPF cadastrado" placeholder="Digite seu CPF" data-protect-on-blur="true"></label>`:`
        <label class="field"><span>Nome completo</span><input name="fullName" required autocomplete="name" placeholder="Digite seu nome completo"></label>
        <label class="field"><span>CPF</span><input id="cpfInput" name="cpf" inputmode="numeric" maxlength="14" required autocomplete="username" aria-label="CPF completo" placeholder="Digite seu CPF" data-protect-on-blur="true"></label>
        <small class="auth-cpf-help-v146">Digite os 11 números do CPF.</small>`}
        <button class="primary auth-submit-v145" type="submit"><span>${login?'Entrar no Ticket.':'Criar minha conta'}</span><span aria-hidden="true">→</span></button>
      </form>
    </div>
  </section></main>`;
}
function registrationSuccessTemplate(profile){
  return `<main class="auth-page auth-page-v145"><section class="auth-card auth-card-v145">
    <div class="auth-orb auth-orb-one" aria-hidden="true"></div><div class="auth-orb auth-orb-two" aria-hidden="true"></div>
    <div class="auth-form-wrap auth-form-v145 auth-success-v148">
      <header class="auth-brand-v145"><div class="brand">${brand()}</div><span class="auth-secure-v145">Cadastro protegido</span></header>
      <div class="auth-success-content-v148" role="status" aria-live="polite">
        <div class="auth-success-check-v148" aria-hidden="true"><span>✓</span></div>
        <span class="auth-eyebrow-v145">Tudo certo</span>
        <h1>Cadastro realizado!</h1>
        <p><strong>${esc(firstName(profile.fullName))}</strong>, sua conta foi criada com sucesso.</p>
        <div class="auth-success-cpf-v148"><small>CPF cadastrado</small><strong>${maskCpf(profile.cpf)}</strong></div>
        <p class="auth-success-next-v148">Agora entre no Ticket. usando o CPF que você cadastrou.</p>
        <button id="goToLogin" class="primary auth-submit-v145" type="button"><span>Ir para o login</span><span aria-hidden="true">→</span></button>
      </div>
    </div>
  </section></main>`;
}
function showRegistrationSuccess(profile){
  clearTimeout(authSuccessTimer);clearSession();stopCamera();app.innerHTML=registrationSuccessTemplate(profile);
  const goToLogin=()=>{clearTimeout(authSuccessTimer);authSuccessTimer=0;renderAuth('login');};
  document.querySelector('#goToLogin').onclick=goToLogin;
  authSuccessTimer=setTimeout(goToLogin,3200);
}
function renderAuth(mode='login'){
  clearTimeout(authSuccessTimer);authSuccessTimer=0;stopCamera();app.innerHTML=authTemplate(mode);
  document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>renderAuth(b.dataset.auth));
  const cpfInput=document.querySelector('#cpfInput');
  if(cpfInput)ticketProtectCpf(cpfInput);
  document.querySelector('#authForm').onsubmit=handleAuth;
}
async function handleAuth(e){
  e.preventDefault();const form=e.currentTarget,d=Object.fromEntries(new FormData(form));
  if(d.mode==='register'){
    const cpf=cpfDigits(form.querySelector('#cpfInput')?.dataset.rawCpf||d.cpf);if(cpf.length!==11){toast('Informe um CPF com 11 dígitos.');return;}
    if(await getProfile(cpf)){toast('Este CPF já está cadastrado.');renderAuth('login');return;}
    const profile={cpf,fullName:String(d.fullName).trim(),email:'',createdAt:new Date().toISOString()};await saveProfile(profile);showRegistrationSuccess(profile);return;
  }else{
    const cpf=cpfDigits(form.querySelector('#cpfInput')?.dataset.rawCpf||d.cpf);if(cpf.length!==11){toast('Informe o CPF completo com 11 dígitos.');return;}
    const profile=await getProfile(cpf);if(!profile){toast('CPF não encontrado neste dispositivo.');return;}setSession(cpf);
  }
  await boot({afterLogin:true}).catch(showStartupError);
}

function sidebarButton(view,label,ico){return `<button data-view="${view}" class="${state.view===view?'active':''}">${icon(ico,19)}<span>${label}</span></button>`;}
function shellTemplate(){return `<div class="shell"><aside class="sidebar"><div class="brand">${brand()}</div><nav class="nav">${sidebarButton('dashboard','Início','home')}${sidebarButton('records','Registros','records')}${sidebarButton('capture','Registrar ponto','clock')}${sidebarButton('reports','Relatórios','report')}${sidebarButton('calendar','Calendário','calendar')}${sidebarButton('settings','Configurações','settings')}${sidebarButton('storage','Armazenamento','cloud')}${sidebarButton('profile','Perfil','user')}</nav><div class="sidebar-profile"><div class="avatar">${profileInitial()}</div><div><strong>${esc(firstName(state.profile.fullName))}</strong><small>${esc(state.profile.email)}</small></div><button id="logout" class="icon-btn">${icon('logout',19)}</button></div></aside>
<main class="main"><div class="mobile-brand"><div class="brand">${brand()}</div><div class="mobile-brand-actions-v151"><button class="icon-btn notification-bell-v151" data-notification aria-label="Notificações">${icon('bell',20)}<i aria-hidden="true"></i></button><button class="icon-btn" data-view="profile" aria-label="Perfil">${icon('user',20)}</button></div></div><header class="topbar"><div><h1 id="topTitle" class="brand">${brand()}</h1><small>${esc(longDate())}</small></div><div class="toolbar"><span class="badge positive">Online</span><button class="icon-btn notification-bell-v151" data-notification aria-label="Notificações">${icon('bell',20)}<i aria-hidden="true"></i></button><button class="icon-btn" data-view="profile">${icon('user',20)}</button></div></header><div class="content" id="content"></div></main>
<nav class="glass-dock"><button data-view="dashboard">${dockPremiumIcon('home')}<span>Início</span></button><button data-view="records">${dockPremiumIcon('records')}<span>Registro</span></button><button data-view="reports">${dockPremiumIcon('report')}<span>Relatório</span></button><button data-view="settings">${dockPremiumIcon('more')}<span>Mais</span></button></nav></div>`;}
function renderShell(){app.innerHTML=shellTemplate();bindNav();renderView();document.querySelector('#logout').onclick=logout;}
function bindNav(){document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));}
function navigate(view){stopCamera();state.view=view;renderShell();}
function logout(){stopCamera();clearSession();state.profile=null;renderAuth('login');}
function head(title,subtitle,right=''){return `<div class="page-head"><div><h2>${title}</h2><p>${subtitle}</p></div>${right}</div>`;}

function workdayFlow(record){const punches=record?.punches||[];const map={};punches.forEach(p=>map[p.type]=p.time);return `<div class="workday-flow"><div class="flow-step entry"><span class="flow-icon">${icon('entry',24)}</span><small>Entrada</small><b>${map.entry||'--:--'}</b></div><i class="flow-link"></i><div class="flow-step lunch"><span class="flow-icon">${icon('lunch',24)}</span><small>Almoço</small><b>${map.lunch||'--:--'}</b></div><i class="flow-link"></i><div class="flow-step return"><span class="flow-icon">${icon('return',24)}</span><small>Retorno</small><b>${map.return||'--:--'}</b></div><i class="flow-link"></i><div class="flow-step exit"><span class="flow-icon">${icon('exit',24)}</span><small>Saída</small><b>${map.exit||'--:--'}</b></div></div>`;}
function homeJourneyFlow(record){const map={};(record?.punches||[]).forEach(p=>map[p.type]=p.time);const steps=[['entry','Entrada'],['lunch','Almoço'],['return','Retorno'],['exit','Saída']],count=Math.min(4,(record?.punches||[]).length);return `<div class="home-journey-flow-v152">${steps.map(([key,label],index)=>{let link='';if(index){const arrow=index-1,done=count>=index+1,next=!done&&arrow===(count<=1?0:Math.min(2,count-1));link=`<i class="home-journey-link-v152${done?' is-done':next?' is-next':''}" aria-hidden="true"></i>`;}return `${link}<div class="home-journey-step-v152 ${key}"><span class="home-premium-badge-v152">${homePremiumIcon(key,28)}</span><small>${label}</small><b>${map[key]||'--:--'}</b></div>`;}).join('')}</div>`;}
function homeMetric(label,value,ico,tone=''){return `<article class="home-metric-card-v152 ${tone}"><div><span>${label}</span><strong>${value}</strong></div><span class="home-metric-icon-v152">${homePremiumIcon(ico,25)}</span></article>`;}
function stat(label,value,ico,tone=''){return `<article class="stat ${tone}"><div class="stat-label"><span>${label}</span><span class="stat-icon">${icon(ico,18)}</span></div><strong>${value}</strong></article>`;}
function recordCard(r){const c=calculateRecord(r,state.schedule);const d=new Date(`${r.date}T12:00:00`);const weekday=new Intl.DateTimeFormat('pt-BR',{weekday:'short'}).format(d).replace('.','');const map={};(r.punches||[]).forEach(p=>map[p.type]=p.time);const badge=!c.complete?`<span class="badge pending">Pendente</span>`:c.balanceMinutes>=0?`<span class="badge positive">${formatDuration(c.balanceMinutes,{signed:true})}</span>`:`<span class="badge negative">${formatDuration(c.balanceMinutes,{signed:true})}</span>`;return `<article class="record-card"><div class="record-date"><small>${weekday}</small><b>${r.date.slice(8,10)}</b><small>${r.date.slice(5,7)}</small></div><div class="record-times"><div><span>Entrada</span><b>${map.entry||'--:--'}</b></div><div><span>Almoço</span><b>${map.lunch||'--:--'}</b></div><div><span>Retorno</span><b>${map.return||'--:--'}</b></div><div><span>Saída</span><b>${map.exit||'--:--'}</b></div></div><div>${badge}<small class="muted" style="display:block;text-align:right;margin-top:6px">${formatDuration(c.workedMinutes)}</small></div></article>`;}
function dashboardView(){
  const today=currentRecord(),c=calculateRecord(today,state.schedule),p=period(),punches=today?.punches||[];
  const next=punches.length>=c.requiredPunches?{label:'Jornada concluída',key:'done'}:(PUNCH_TYPES[punches.length]||{label:'Registrar ponto',key:'entry'});
  return `<div class="home-v150">
    <header class="home-welcome-v150"><div><h2 id="homeGreeting">${greeting()}, <span class="ticket-greeting-name">${esc(firstName(state.profile.fullName))}</span></h2><p>Acompanhe sua jornada de hoje.</p></div><div class="home-avatar-v150">${profileInitial()}</div></header>
    <article class="home-clock-card-v150">
      <div class="home-clock-top-v150"><div><small>${longDate()}</small><strong id="homeLiveClock">${timeNow()}</strong></div></div>
      <div class="home-next-v150"><span>Próxima ação</span><strong>${next.label}</strong><small>${punches.length} de ${c.requiredPunches||4} registros realizados</small></div>
      <button id="quickRegister" class="home-register-v150">${icon('clock',21)}<span>${next.key==='done'?'Ver jornada de hoje':`Registrar ${next.label.toLocaleLowerCase('pt-BR')}`}</span><b aria-hidden="true">→</b></button>
    </article>
    <article class="home-section-v150 home-journey-v150"><div class="home-section-head-v150"><div><h3>Jornada de hoje</h3><p>Seus horários registrados</p></div><span>${punches.length}/${c.requiredPunches||4}</span></div>${homeJourneyFlow(today)}</article>
    <section class="home-metrics-v150">${homeMetric('Horas hoje',formatDuration(c.workedMinutes),'clock','blue')}${homeMetric('Horas extras',c.balanceMinutes==null?'--h--':formatDuration(c.balanceMinutes,{signed:true}),'overtime',c.balanceMinutes>=0?'green':'orange')}${homeMetric('Banco de horas',formatDuration(totalBalance(),{signed:true}),'bank','green')}${homeMetric('Meta diária',formatDuration(c.expectedMinutes),'target','purple')}</section>
    <article class="period-card home-period-v150"><div><small>Período atual</small><strong>${formatDateBr(p.startDate)} até ${formatDateBr(p.endDate)}</strong></div><div><small>Saldo acumulado</small><strong class="period-balance">${formatDuration(totalBalance(),{signed:true})}</strong></div></article>
  </div>`;
}

function recordsView(){const tabs=`<div class="segmented"><button data-range="today" class="${state.recordRange==='today'?'active':''}">Hoje</button><button data-range="week" class="${state.recordRange==='week'?'active':''}">Semana</button><button data-range="month" class="${state.recordRange==='month'?'active':''}">Mês</button></div>`;let recs=[...state.records,...(typeof ticketDayRecords==='function'?ticketDayRecords():[])].sort((a,b)=>b.date.localeCompare(a.date));const t=todayIso();if(state.recordRange==='today') recs=recs.filter(r=>r.date===t);if(state.recordRange==='week'){const d=new Date(`${t}T12:00:00`);const start=new Date(d);start.setDate(d.getDate()-((d.getDay()+6)%7));const s=todayIso(start);recs=recs.filter(r=>r.date>=s&&r.date<=t);}if(state.recordRange==='month') recs=recs.filter(r=>monthKey(r.date)===monthKey(t));return `${head('Registros','Consulte as batidas e os totais de cada dia.',tabs)}<div class="record-list">${recs.length?recs.map(recordCard).join(''):'<article class="panel"><p class="muted">Nenhum registro nesse período.</p></article>'}</div>`;}

function captureView(){const record=currentRecord();const c=calculateRecord(record,state.schedule);const next=nextPunchType(record,state.schedule);const options=PUNCH_TYPES.map(p=>`<option value="${p.key}" ${p.key===next?'selected':''}>${p.label}</option>`).join('');return `${head('Registrar ponto','Fotografe o comprovante e, opcionalmente, registre o ambiente de trabalho.')}
<div class="capture-layout"><article class="panel"><div class="capture-box"><h3>Comprovante do ponto</h3><div class="camera-stage" id="cameraStage"><video id="cameraVideo" class="hidden" playsinline muted></video>${state.receiptUrl?`<img src="${state.receiptUrl}" alt="Comprovante">`:`<div class="camera-placeholder">${icon('camera',42)}<p>Use a câmera ou escolha uma foto do comprovante.</p></div>`}</div><div class="camera-actions"><button id="startCamera" class="secondary">${icon('camera',18)} Abrir câmera</button><label class="secondary" style="display:flex;align-items:center;justify-content:center;gap:8px">Escolher foto<input id="receiptPicker" type="file" accept="image/*" capture="environment" hidden></label><button id="takePhoto" class="secondary hidden">Capturar foto</button><button id="stopCamera" class="secondary hidden">Fechar câmera</button></div></div>
<div class="capture-box" style="margin-top:14px"><h3>Foto do ambiente <small class="muted">(opcional)</small></h3><div class="photo-preview">${state.environmentUrl?`<img src="${state.environmentUrl}" alt="Ambiente">`:`<span class="muted">Nenhuma foto adicionada</span>`}</div><label class="secondary" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px">${icon('camera',18)} Adicionar foto<input id="environmentPicker" type="file" accept="image/*" capture="environment" hidden></label></div></article>
<article class="panel"><form id="captureForm" class="capture-form"><label class="field"><span>Tipo de ponto</span><select name="type">${options}</select></label><div class="two-col"><label class="field"><span>Data</span><input name="date" type="date" value="${todayIso()}" required></label><label class="field"><span>Hora</span><input name="time" type="time" value="${timeNow()}" required></label></div><label class="field"><span>Observação</span><textarea name="note" placeholder="Opcional"></textarea></label><div class="panel" style="padding:14px"><div class="panel-head"><div><h3>Resumo de hoje</h3><p>${c.complete?'Jornada concluída':'Jornada em andamento'}</p></div></div>${workdayFlow(record)}</div><button class="primary" type="submit">Confirmar ponto</button></form></article></div>`;}
async function fileToBlob(file){return file instanceof Blob?file:null;}
function setFile(kind,file){if(!file)return;const urlKey=kind==='receipt'?'receiptUrl':'environmentUrl';const fileKey=kind==='receipt'?'receiptFile':'environmentFile';if(state[urlKey]) URL.revokeObjectURL(state[urlKey]);state[fileKey]=file;state[urlKey]=URL.createObjectURL(file);renderShell();state.view='capture';renderShell();}
async function submitCapture(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const existing=await getRecord(state.profile.cpf,d.date);const snapshot=existing?.scheduleSnapshot||scheduleForDate(d.date,state.schedule);if(!snapshot.active){if(!confirm('Este dia está configurado como folga. Deseja continuar?'))return;}const record=existing||{id:`${state.profile.cpf}:${d.date}`,profileCpf:state.profile.cpf,date:d.date,punches:[],evidenceIds:[],environmentIds:[],scheduleSnapshot:snapshot,createdAt:new Date().toISOString()};if(record.punches.some(p=>p.type===d.type)){toast('Esse tipo de ponto já foi registrado nesta data.');return;}const evidenceIds=[...record.evidenceIds];if(state.receiptFile){const id=uuid();await saveEvidence({id,profileCpf:state.profile.cpf,date:d.date,type:'receipt',blob:await fileToBlob(state.receiptFile),createdAt:new Date().toISOString()});evidenceIds.push(id);}let envIds=[...(record.environmentIds||[])];if(state.environmentFile){const id=uuid();await saveEvidence({id,profileCpf:state.profile.cpf,date:d.date,type:'environment',blob:await fileToBlob(state.environmentFile),createdAt:new Date().toISOString()});envIds.push(id);}record.punches.push({id:uuid(),type:d.type,time:d.time,note:d.note||'',evidenceId:evidenceIds.at(-1)||null,createdAt:new Date().toISOString()});record.punches.sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));record.evidenceIds=evidenceIds;record.environmentIds=envIds;record.updatedAt=new Date().toISOString();await saveRecord(record);clearUrls();state.receiptFile=null;state.environmentFile=null;state.records=await listRecords(state.profile.cpf);toast('Ponto registrado com sucesso.');navigate('dashboard');}

function reportSeries(records){return records.slice().reverse().slice(-14).map(r=>({label:r.date.slice(8,10)+'/'+r.date.slice(5,7),minutes:calculateRecord(r,state.schedule).workedMinutes||0}));}
function chartSvg(data){if(!data.length)return `<div class="chart-empty">${icon('report',28)}<strong>Sem dados para exibir</strong><span>A evolução das horas aparecerá aqui após o primeiro registro de ponto.</span></div>`;const d=data;const w=760,h=280,p=38,max=Math.max(...d.map(x=>x.minutes),480)*1.12;const x=i=>p+i*((w-p*2)/Math.max(1,d.length-1));const y=v=>h-p-(v/max)*(h-p*2);const pts=d.map((a,i)=>[x(i),y(a.minutes)]);const line=pts.map(([a,b],i)=>`${i?'L':'M'} ${a.toFixed(1)} ${b.toFixed(1)}`).join(' ');const area=`${line} L ${pts.at(-1)[0]} ${h-p} L ${pts[0][0]} ${h-p} Z`;return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="chartGradient" x1="0" x2="1"><stop stop-color="#7650e5"/><stop offset=".56" stop-color="#2e79ff"/><stop offset="1" stop-color="#18b19e"/></linearGradient><linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7650e5" stop-opacity=".24"/><stop offset="1" stop-color="#2e79ff" stop-opacity=".01"/></linearGradient></defs>${[.25,.5,.75].map(f=>`<line class="chart-grid" x1="${p}" y1="${p+(h-p*2)*f}" x2="${w-p}" y2="${p+(h-p*2)*f}"/>`).join('')}<path class="chart-area" d="${area}"/><path class="chart-line" d="${line}"/>${pts.map(([a,b],i)=>`<circle class="chart-point" cx="${a}" cy="${b}" r="4"/><text class="chart-label" text-anchor="middle" x="${a}" y="${h-7}">${d[i].label}</text>`).join('')}</svg>`;}
function reportsView(){const p=period();const s=periodSummary(state.records,state.schedule,p);return `${head('Relatórios','Acompanhe horas trabalhadas, extras e evolução do período.',`<input id="reportMonth" class="input-compact" type="month" value="${state.reportMonth}">`)}<div class="summary-strip">${stat('Horas trabalhadas',formatDuration(s.worked),'clock','green')}${stat('Horas extras',formatDuration(s.positive,{signed:true}),'bolt','orange')}${stat('Banco de horas',formatDuration(totalBalance(),{signed:true}),'hourglass','blue')}${stat('Meta do período',`${s.records.length*8}h 00m`,'target','purple')}</div><article class="chart-card"><div class="panel-head"><div><h3>Evolução de horas</h3><p>${formatDateBr(p.startDate)} até ${formatDateBr(p.endDate)}</p></div><span class="badge ${s.net>=0?'positive':'negative'}">Saldo ${formatDuration(s.net,{signed:true})}</span></div>${chartSvg(reportSeries(s.records))}</article><div class="record-list">${s.records.map(recordCard).join('')||'<article class="panel"><p class="muted">Sem registros no período.</p></article>'}</div>`;}

function calendarView(){const [y,m]=state.calendarMonth.split('-').map(Number);const first=new Date(y,m-1,1,12);const last=new Date(y,m,0,12);const lead=(first.getDay()+6)%7;const cells=[];for(let i=0;i<lead;i++)cells.push(null);for(let d=1;d<=last.getDate();d++)cells.push(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);while(cells.length%7)cells.push(null);const nav=`<div class="toolbar"><button id="calPrev" class="secondary">‹</button><input id="calMonth" class="input-compact" type="month" value="${state.calendarMonth}"><button id="calNext" class="secondary">›</button></div>`;return `${head('Calendário','Visualize dias completos, extras, negativos e pendências.',nav)}<article class="calendar-card"><div class="calendar-week"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div class="calendar-grid">${cells.map(iso=>{if(!iso)return'<div></div>';const r=state.records.find(x=>x.date===iso);const c=r?calculateRecord(r,state.schedule):null;const sch=scheduleForDate(iso,state.schedule);const dots=[];if(r){dots.push(`<i class="dot ${c.complete?'complete':'pending'}"></i>`);if(c.complete&&c.balanceMinutes>0)dots.push('<i class="dot positive"></i>');if(c.complete&&c.balanceMinutes<0)dots.push('<i class="dot negative"></i>');}return `<button class="day ${!sch.active?'off':''} ${iso===todayIso()?'today':''}" data-day="${iso}"><b>${Number(iso.slice(8))}</b><div class="dots">${dots.join('')}</div></button>`;}).join('')}</div></article>`;}

function scheduleSettings(){const days=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];return `<h3>Jornada semanal</h3><p class="muted">Defina quais dias são trabalhados e a carga horária esperada.</p><form id="scheduleForm" class="stack">${days.map((name,i)=>{const s=state.schedule[i];return `<div class="two-col"><label class="field"><span>${name}</span><select name="active-${i}"><option value="1" ${s.active?'selected':''}>Trabalha</option><option value="0" ${!s.active?'selected':''}>Folga</option></select></label><label class="field"><span>Meta diária (horas)</span><input name="hours-${i}" type="number" min="0" max="24" value="${Math.round(s.expectedMinutes/60)}"></label></div>`;}).join('')}<button class="primary">Salvar jornada</button></form>`;}
function balanceSettings(){const mins=Math.abs(Number(state.balance.minutes||0));return `<h3>Saldo anterior</h3><p class="muted">Informe o saldo que já existia antes de começar a usar este novo Ticket.</p><form id="balanceForm" class="stack"><label class="field"><span>Tipo</span><select name="type"><option value="positive" ${state.balance.minutes>=0?'selected':''}>Positivo</option><option value="negative" ${state.balance.minutes<0?'selected':''}>Negativo</option></select></label><div class="two-col"><label class="field"><span>Horas</span><input name="hours" type="number" min="0" value="${Math.floor(mins/60)}"></label><label class="field"><span>Minutos</span><input name="minutes" type="number" min="0" max="59" value="${mins%60}"></label></div><label class="field"><span>Data de referência</span><input name="referenceDate" type="date" value="${state.balance.referenceDate||todayIso()}"></label><label class="field"><span>Observação</span><input name="note" value="${esc(state.balance.note||'')}"></label><button class="primary">Salvar saldo</button></form><div class="panel" style="margin-top:16px"><h3>Histórico</h3>${(state.balance.history||[]).slice().reverse().map(h=>`<p><strong>${formatDuration(h.minutes,{signed:true})}</strong> <small class="muted">${formatDateBr(h.referenceDate)} · ${esc(h.note||'')}</small></p>`).join('')||'<p class="muted">Nenhuma alteração registrada.</p>'}</div>`;}
function closingSettings(){const p=period(),n=nextClosingPeriod(p,state.closing);return `<h3>Período de fechamento</h3><p class="muted">Defina o ciclo mensal utilizado no cálculo do banco de horas.</p><form id="closingForm" class="stack"><label class="field"><span>Modo</span><select name="mode"><option value="custom" ${state.closing.mode==='custom'?'selected':''}>Personalizado</option><option value="calendar" ${state.closing.mode==='calendar'?'selected':''}>Mês calendário</option></select></label><label class="field"><span>Dia inicial do ciclo</span><input name="startDay" type="number" min="1" max="31" value="${state.closing.startDay||16}"></label><article class="panel"><small class="muted">Período atual</small><strong style="display:block;margin:4px 0 14px">${formatDateBr(p.startDate)} até ${formatDateBr(p.endDate)}</strong><small class="muted">Próximo período</small><strong style="display:block;margin-top:4px">${formatDateBr(n.startDate)} até ${formatDateBr(n.endDate)}</strong></article><button class="primary">Salvar período</button></form>`;}
function appearanceSettings(){return `<h3>Aparência</h3><p class="muted">O visual Glassmorphism é o padrão desta versão.</p><div class="stack"><article class="panel"><strong>Glassmorphism Premium</strong><p class="muted">Cards translúcidos, ícones vetoriais coloridos e ações em roxo escuro.</p></article><article class="panel"><strong>Responsividade automática</strong><p class="muted">O mesmo layout se reorganiza no celular, tablet e desktop.</p></article></div>`;}
function settingsView(){const tabs=[['schedule','Jornada semanal'],['balance','Saldo anterior'],['closing','Período de fechamento'],['appearance','Aparência']];const content=state.settingsTab==='balance'?balanceSettings():state.settingsTab==='closing'?closingSettings():state.settingsTab==='appearance'?appearanceSettings():scheduleSettings();return `${head('Configurações','Ajuste a jornada, saldo anterior e período de fechamento.')}<div class="settings-layout"><nav class="settings-menu">${tabs.map(([k,l])=>`<button data-setting="${k}" class="${state.settingsTab===k?'active':''}"><span>${l}</span>${icon('chev',17)}</button>`).join('')}</nav><section class="settings-detail">${content}</section></div>`;}
function storageView(){return `${head('Armazenamento','Gerencie onde comprovantes e fotos ficam preservados.')}<div class="stack"><article class="panel storage-option"><span class="stat-icon">${icon('cloud',20)}</span><div><strong>Armazenamento local</strong><small>Ativo — dados salvos neste navegador.</small></div></article><article class="panel storage-option"><span class="stat-icon">${icon('cloud',20)}</span><div><strong>Google Drive</strong><small>Conector preparado para uma etapa futura deste projeto novo.</small></div></article><article class="panel storage-option"><span class="stat-icon">${icon('cloud',20)}</span><div><strong>OneDrive</strong><small>Conector preparado para uma etapa futura deste projeto novo.</small></div></article><button id="exportData" class="secondary">Exportar backup JSON</button></div>`;}
function profileView(){return `${head('Perfil','Dados da conta e sessão atual.')}<div class="stack"><article class="panel profile-card"><div class="avatar">${profileInitial()}</div><div><strong>${esc(state.profile.fullName)}</strong><small class="muted" style="display:block;margin-top:4px">${esc(state.profile.email)} · ${formatCpf(state.profile.cpf)}</small></div></article><article class="panel"><button id="logoutProfile" class="secondary profile-action" style="width:100%;margin-bottom:10px">${icon('logout',18)}<span>Sair da conta</span></button><button id="clearProfile" class="secondary danger profile-action" style="width:100%">${icon('trash',18)}<span>Apagar dados locais deste perfil</span></button></article></div>`;}

function renderView(){const content=document.querySelector('#content');if(!content)return;const views={dashboard:dashboardView,records:recordsView,capture:captureView,reports:reportsView,calendar:calendarView,settings:settingsView,storage:storageView,profile:profileView};content.innerHTML=(views[state.view]||dashboardView)();bindViewEvents();document.querySelectorAll('.glass-dock [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));document.querySelectorAll('.sidebar [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));}
function bindViewEvents(){bindNav();clearInterval(homeClockTimer);document.querySelectorAll('[data-notification]').forEach(button=>button.onclick=()=>{const reminder=updateNotificationBell();toast(reminder?reminderMessage(reminder):`Próximo ponto: ${nextPointReminder().label} às ${nextPointReminder().time}.`);});if(state.view==='dashboard'){document.querySelector('#quickRegister')?.addEventListener('click',()=>navigate('capture'));updateNotificationBell({announce:true});const clock=document.querySelector('#homeLiveClock'),greetingEl=document.querySelector('#homeGreeting'),first=firstName(state.profile.fullName);const refreshHomeTime=()=>{if(clock)clock.textContent=timeNow();if(greetingEl)greetingEl.innerHTML=`${greeting()}, <span class="ticket-greeting-name">${esc(first)}</span>`;updateNotificationBell({announce:true});};refreshHomeTime();homeClockTimer=setInterval(refreshHomeTime,1000);}if(state.view==='records')document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{state.recordRange=b.dataset.range;renderView();});if(state.view==='capture')bindCapture();if(state.view==='calendar')bindCalendar();if(state.view==='settings')bindSettings();if(state.view==='storage')document.querySelector('#exportData')?.addEventListener('click',exportData);if(state.view==='profile'){document.querySelector('#logoutProfile')?.addEventListener('click',logout);document.querySelector('#clearProfile')?.addEventListener('click',async()=>{if(!confirm('Apagar todos os registros e configurações deste perfil neste navegador?'))return;await clearProfileData(state.profile.cpf);state.records=[];toast('Dados locais removidos.');navigate('dashboard');});}}
function bindCapture(){document.querySelector('#captureForm').onsubmit=submitCapture;document.querySelector('#receiptPicker').onchange=e=>setFile('receipt',e.target.files[0]);document.querySelector('#environmentPicker').onchange=e=>setFile('environment',e.target.files[0]);document.querySelector('#startCamera').onclick=startCamera;document.querySelector('#stopCamera').onclick=()=>{stopCamera();renderView();};document.querySelector('#takePhoto').onclick=takePhoto;}
async function startCamera(){try{stopCamera();state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});const v=document.querySelector('#cameraVideo');v.srcObject=state.stream;v.classList.remove('hidden');await v.play();document.querySelector('#takePhoto').classList.remove('hidden');document.querySelector('#stopCamera').classList.remove('hidden');document.querySelector('#startCamera').classList.add('hidden');}catch{toast('Não foi possível abrir a câmera. Use a opção de escolher foto.');}}
async function takePhoto(){const v=document.querySelector('#cameraVideo');if(!v?.videoWidth)return;const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));stopCamera();setFile('receipt',blob);}
function bindCalendar(){document.querySelector('#calMonth').onchange=e=>{state.calendarMonth=e.target.value;renderView();};const shift=n=>{const [y,m]=state.calendarMonth.split('-').map(Number);const d=new Date(y,m-1+n,1,12);state.calendarMonth=monthKey(todayIso(d));renderView();};document.querySelector('#calPrev').onclick=()=>shift(-1);document.querySelector('#calNext').onclick=()=>shift(1);document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{const r=state.records.find(x=>x.date===b.dataset.day);toast(r?`${formatDateBr(r.date)}: ${calculateRecord(r,state.schedule).status}`:`${formatDateBr(b.dataset.day)}: sem registro`);});}
function bindSettings(){document.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>{state.settingsTab=b.dataset.setting;renderView();});document.querySelector('#scheduleForm')?.addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));for(let i=0;i<7;i++){const active=d[`active-${i}`]==='1';const h=Math.max(0,Number(d[`hours-${i}`]||0));state.schedule[i]={active,requiredPunches:active?(i===6?2:4):0,expectedMinutes:h*60};}await saveSetting(state.profile.cpf,'schedule',state.schedule);toast('Jornada salva.');renderView();});document.querySelector('#balanceForm')?.addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));let mins=Number(d.hours||0)*60+Number(d.minutes||0);if(d.type==='negative')mins*=-1;const item={minutes:mins,referenceDate:d.referenceDate,note:d.note,changedAt:new Date().toISOString()};state.balance={minutes:mins,referenceDate:d.referenceDate,note:d.note,history:[...(state.balance.history||[]),item]};await saveSetting(state.profile.cpf,'balance',state.balance);toast('Saldo anterior salvo.');renderView();});document.querySelector('#closingForm')?.addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.closing={mode:d.mode,startDay:Number(d.startDay||1)};await saveSetting(state.profile.cpf,'closing',state.closing);toast('Período salvo.');renderView();});}
function exportData(){const payload={version:1,exportedAt:new Date().toISOString(),profile:state.profile,records:state.records,schedule:state.schedule,balance:state.balance,closing:state.closing};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ticket-backup-${todayIso()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}

async function boot({afterLogin=false}={}){
  await (window.__ticketSplashDone||Promise.resolve());
  if(!afterLogin){
    clearSession();state.profile=null;
    renderAuth((await listProfiles()).length?'login':'register');return;
  }
  if(!(await loadState())){renderAuth((await listProfiles()).length?'login':'register');return;}
  renderShell();
}
window.addEventListener('beforeunload',()=>{stopCamera();clearUrls();});
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('/public/sw.js').catch(()=>{});
boot().catch(showStartupError);
