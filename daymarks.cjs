const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');let saved,fail=false,listener,nav;
const c={console,structuredClone,state:{profile:{cpf:'test'},balance:{minutes:1200,bankDaysOff:[]},records:[]},todayIso:()=> '2026-09-17',bankSaving:false,bankDaysOff:()=>c.state.balance.bankDaysOff||[],bankDayOff:date=>(c.state.balance.bankDaysOff||[]).find(x=>x.date===date&&!x.cancelledAt),bankDayQuote:()=>({minutes:480,scheduleSnapshot:{active:true,expectedMinutes:480}}),uuid:()=>String(Math.random()),captureView:()=>'<div class="v157-capture-control"><span class="v157-capture-label">Capturar</span></div>',recordCard:()=>'',bindCalendar(){},submitCapture(){},document:{addEventListener:(t,f)=>listener=f},toast(){},navigate:v=>nav=v,v116ResetCaptureState(){},renderView(){},saveSetting:async(cpf,key,v)=>{if(fail)throw Error('storage');saved=structuredClone(v)}};
vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'src/ticket-daymarks-v164.js'),'utf8'),c);
(async()=>{
assert.match(c.captureView(),/data-daymark="folga"/);assert.match(c.captureView(),/data-daymark="feriado"/);
assert.equal(await c.registerDayMark('folga'),true);assert.equal(saved.bankDaysOff[0].minutes,480);assert.equal(c.ticketDayRecords()[0].dayKind,'folga');assert.equal(nav,'dashboard');assert.equal(await c.registerDayMark('feriado'),false);
c.state.balance={minutes:1200,bankDaysOff:[]};assert.equal(await c.registerDayMark('feriado'),true);assert.equal(c.state.balance.minutes,1200);assert.equal(c.ticketDayRecords()[0].dayKind,'feriado');assert.ok(c.bankDayQuote('2026-09-17').error);
c.state.balance=JSON.parse(JSON.stringify(saved));assert.equal(c.ticketDayRecords()[0].dayKind,'feriado');
let b={dataset:{daymarkCancel:saved.dayMarks[0].id,kind:'feriado'}};await listener({target:{closest:s=>s==='[data-daymark-cancel]'?b:null}});assert.equal(c.ticketDayRecords().length,0);
c.state.records=[{date:'2026-09-17',punches:[{}]}];assert.equal(await c.registerDayMark('feriado'),false);
c.state.records=[];fail=true;assert.equal(await c.registerDayMark('feriado'),false);assert.equal(c.ticketDayRecords().length,0);
console.log('PASS: buttons, folga debit, holiday without debit, conflicts, records, reload, undo, storage failure');
})().catch(e=>{console.error(e);process.exit(1)});
