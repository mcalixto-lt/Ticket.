const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),{indexedDB}=require('fake-indexeddb');
const {document}=parseHTML('<html><body><div id="content"></div><nav class="glass-dock"><button data-view="records"></button></nav></body></html>');
const day={active:true,requiredPunches:4,expectedMinutes:480,entryTime:'08:00',exitTime:'18:00'};
const state={view:'capture',profile:{cpf:'12345678909'},records:[],schedule:{2:day},balance:{},receiptFile:null};
const today='2026-10-13';const labels=['entry','lunch','return','exit'];
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
let schedules=0;
const ctx={console,document,state,TICKET_V104_VIEWS:new Set(),structuredClone,Blob,TextEncoder,Uint8Array,atob,URL,crypto:require('node:crypto').webcrypto,Date,FormData:class{},DEFAULT_SCHEDULE:{2:day},
 calculateRecord:()=>({complete:false,expectedMinutes:480,workedMinutes:0}),
 captureView:()=>'<article><div class="v156-camera-toolbar"><button data-daymark="folga">Folga</button><div><button id="startCamera">Capturar</button></div><button data-daymark="feriado">Feriado</button></div><div id="cameraStage">Camera</div></article>',
 renderView:()=>{},recordCard:()=>'<article>batidas</article>',v105ReportRecord:()=>'<article>relatório</article>',v111CalendarDayModal:()=>{},v111CloseModal:()=>{},
 v105NextPunchInfo:date=>{const existing=state.records.find(r=>r.date===date);const used=new Set((existing?.punches||[]).map(p=>p.type));const type=labels.find(p=>!used.has(p))||'';return{existing,order:labels,type,index:labels.indexOf(type)};},
 v105RegisterAction:type=>({title:type,label:type,confirm:type}),v105CaptureInformationCard:()=>'<form><input id="captureTypeV105" type="hidden" name="type"></form>',v105RefreshClassification:()=>{},dashboardView:()=>'<div>home</div>',
 PUNCH_TYPES:labels.map(key=>({key,label:key})),todayIso:()=>today,scheduleForDate:()=>structuredClone(day),esc:escape,icon:()=>'<svg></svg>',head:(t,s)=>`<h2>${t}</h2><p>${s}</p>`,formatDateBr:s=>s,formatDuration:n=>String(n),bindNav:()=>{},navigate:view=>{state.view=view;},toast:()=>{},
 registerDayMark:async()=>true,bankDayQuote:()=>({minutes:480}),bankDayOff:()=>false,holidayMark:()=>false,ticketScheduleFolder:()=>{schedules++;},ticketScheduleCloud:()=>{schedules++;},
 ticketTransactionDone:t=>new Promise((resolve,reject)=>{t.oncomplete=resolve;t.onerror=t.onabort=()=>reject(t.error||Error('abort'));}),
 getEvidence:()=>{},ticketEvidenceUrlsV104:new Map(),v104OpenEvidencePreview:()=>{},confirm:()=>true
};
const database=new Promise((resolve,reject)=>{const q=indexedDB.open('ticket-absence-test',1);q.onupgradeneeded=()=>{q.result.createObjectStore('records',{keyPath:'id'});q.result.createObjectStore('evidence',{keyPath:'id'});};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
ctx.db=()=>database;ctx.listRecords=async()=>new Promise(async(resolve,reject)=>{const d=await database,q=d.transaction('records').objectStore('records').getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
vm.createContext(ctx);
for(const file of ['ticket-absence-core-v197.js','ticket-absence-v197.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),ctx);
const core=ctx;
const absence={id:'absence',documentType:'declaration',origin:'home',appointmentStart:'09:00',appointmentEnd:'10:00',workExit:'',workReturn:'',applyCredit:true,fullDay:false,travelBefore:30,travelAfter:30,policySource:'company-informed',evidenceId:'doc',createdAt:'2026-10-13T09:00:00Z'};
async function get(store,id){const d=await database;return new Promise((resolve,reject)=>{const q=d.transaction(store).objectStore(store).get(id);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}
(async()=>{
 const html=ctx.captureView();assert.match(html,/id="startCamera"/);assert.match(html,/data-daymark="folga"/);assert.match(html,/data-daymark="feriado"/);assert.match(html,/data-absence-open/);
 const order=parseHTML('<html><body>'+html+'</body></html>').document;assert(order.querySelector('.v156-camera-toolbar').nextElementSibling.matches('[data-absence-open]'),'absence option is separate from the capture row');
 assert(ctx.TICKET_V104_VIEWS.has('absence'),'new screen participates in device-back navigation');
 const image={id:'doc',profileCpf:state.profile.cpf,blob:new Blob(['document'],{type:'image/png'}),type:'medical_document'};
 await ctx.ticketAbsenceCommitV197({date:today,item:absence,blob:image,breaks:{breakStart:'12:00',breakEnd:'14:00'}});
 assert.equal((await get('evidence','doc')).blob.size,8);assert.equal(state.records[0].absences[0].id,'absence');assert.equal(schedules,2,'successful atomic save schedules both configured persistence hooks');
 const before=structuredClone(await get('records',state.profile.cpf+':'+today));
 await assert.rejects(ctx.ticketAbsenceCommitV197({date:today,item:{...absence,id:'invalid',evidenceId:'new-photo',appointmentEnd:'08:00'},blob:{...image,id:'new-photo'},breaks:null}));
 assert.equal(await get('evidence','new-photo'),undefined,'failed record validation rolls back the photo');assert.deepEqual(await get('records',before.id),before,'failed save preserves the old record');
 await ctx.ticketAbsenceCommitV197({date:today,item:{...absence,applyCredit:false,replacesId:'absence'},blob:null,breaks:null});
 assert.equal(state.records[0].absences[0].history.length,1);assert.equal(state.records[0].absences[0].applyCredit,false);
 state.records=[{...before,absences:[absence],punches:[{type:'entry',time:'14:30'}]}];
 assert.equal(ctx.v105NextPunchInfo(today).type,'exit','late arrival moves straight to exit');
 assert.match(ctx.v105CaptureInformationCard(),/name="type"/);assert.match(ctx.v105CaptureInformationCard(),/<select/,'absence days can choose the real receipt type');
 const med={...absence,id:'work',origin:'work',workExit:'08:30'};state.records=[{...before,absences:[med],punches:[{type:'entry',time:'08:00'}]}];
 assert.equal(ctx.v105NextPunchInfo(today).type,'medical_return:work');
 assert.equal(ctx.ticketAbsenceCaptureChoiceV197(today,'medical_return:work','10:30').type,'medical_return');assert(ctx.ticketAbsenceCaptureChoiceV197(today,'medical_return:work','09:00').error);
 // Exercise the production capture handler for an independent return.
 const production=fs.readFileSync(path.join(__dirname,'../src/ticket-enhancements-v106.js'),'utf8');
 const begin=production.indexOf('function ticketLunchReturnTimeV196(time){'),finish=production.indexOf('\n};',production.indexOf('submitCapture=async function(event){',begin))+3;
 ctx.FormData=class{constructor(){return [['date',today],['time','10:30'],['type','medical_return:work']];}};
 ctx.document.querySelector=(original=>selector=>selector==='#recordLockConfirm'?{checked:true}:original.call(ctx.document,selector))(ctx.document.querySelector);
 ctx.getRecord=async()=>structuredClone(state.records[0]);
 ctx.uuid=()=>require('node:crypto').randomUUID();ctx.fileToBlob=async()=>new Blob(['receipt'],{type:'image/jpeg'});ctx.evidenceHash=async()=> 'hash';
 ctx.saveEvidence=async()=>{};ctx.saveRecord=async record=>{state.records=[record];};ctx.clearUrls=()=>{};ctx.toMinutes=time=>Number(time.slice(0,2))*60+Number(time.slice(3));ctx.setTimeout=fn=>{fn();return 0;};ctx.clearTimeout=()=>{};
 const storedList=ctx.listRecords;ctx.listRecords=async()=>state.records;
 state.receiptFile={};vm.runInContext(production.slice(begin,finish),ctx);await ctx.submitCapture({preventDefault(){},currentTarget:{}});
 assert.equal(state.records[0].punches.length,1,'medical return must not become a lunch punch');assert.equal(state.records[0].absencePunches[0].type,'medical_return');assert.equal(state.records[0].absencePunches[0].time,'10:30');
 ctx.listRecords=storedList;
 const page=ctx.ticketAbsenceFormV197();assert.match(page,/ticketAbsencePhoto/);assert.match(page,/Direto de casa/);assert(!page.includes('30 min'));assert(!page.includes('Intervalo previsto'));assert.match(page,/ticket-absence-document-pair/);assert.match(page,/ticket-absence-divider/);assert(!page.includes('Tipo de documento'));
 state.view='records';assert.match(ctx.recordCard(state.records[0]),/Ver documento/);assert.match(ctx.v105ReportRecord(state.records[0]),/Ausência justificada/);
 // Round-trip through the production backup parser, preserving document bytes,
 // timestamps, the policy and captured medical returns.
 const backup=fs.readFileSync(path.join(__dirname,'../src/ticket-backup-v165.js'),'utf8');vm.runInContext(backup.slice(0,backup.indexOf('function ticketStorageOptions')),ctx);
 const cpf=state.profile.cpf,record={...before,absences:[med],punches:[{type:'entry',time:'08:00',evidenceId:'photo'}],evidenceIds:['doc','photo'],absencePunches:[{id:'return',type:'medical_return',absenceId:'work',time:'10:30',evidenceId:'photo',createdAt:'2026-10-13T10:30:00Z'}]};
 const payload={profile:{cpf,fullName:'Teste'},records:[record],evidence:['doc','photo'].map(id=>({id,profileCpf:cpf,data:'data:image/png;base64,aGVsbG8='})),settings:[]};
 const envelope=async p=>new Blob([JSON.stringify({format:'ticket-full-backup',version:1,sha256:await ctx.ticketDigest(JSON.stringify(p)),payload:p})]);
 const restored=await ctx.ticketParseBackup(await envelope(payload));assert.equal(restored.records[0].absences[0].travelBefore,30);assert.equal(restored.records[0].absencePunches[0].time,'10:30');assert.equal(await ctx.ticketDecodeEvidence(restored.evidence[0]).blob.text(),'hello');
 const malformed=structuredClone(payload);malformed.records[0].absences[0].evidenceId='missing';await assert.rejects(ctx.ticketParseBackup(await envelope(malformed)));
 console.log('PASS: capture preserved, route/history registration, atomic photo+record save and rollback, edit history, independent return capture, record/report UI and medical backup round-trip.');
})().catch(error=>{console.error(error);process.exitCode=1;});
