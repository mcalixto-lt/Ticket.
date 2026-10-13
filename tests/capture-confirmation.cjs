const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/ticket-enhancements-v106.js'),'utf8');
const start=source.indexOf('function ticketLunchReturnTimeV196(time){');
const end=source.indexOf('\n};',source.indexOf('submitCapture=async function(event){',start))+3;
assert(start>=0&&end>start);
const capture=source.slice(start,end);
async function run(initial,time=initial===3?'18:00':initial===1?'12:30':'08:00'){
  const date='2026-09-29',punches=['entry','lunch','return','exit'];
  const existing=initial?{id:'record',profileCpf:'123',date,punches:punches.slice(0,initial).map((type,i)=>({type,time:`0${8+i}:00`})),evidenceIds:[],environmentIds:[],scheduleSnapshot:{active:true}}:null;
  let overlay=0,nav=0,saved,message='',delay;
  const state={profile:{cpf:'123'},receiptFile:{},records:[],schedule:{},environmentFile:null};
  const ctx={state,FormData:class{constructor(){return [['date',date],['time',time]];}},
    document:{querySelector:()=>({checked:true}),createElement:()=>({setAttribute(){},remove(){},querySelector:()=>null}),body:{append(el){overlay++;message=el.innerHTML;}}},
    v105NextPunchInfo:()=>({type:punches[initial]}),getRecord:async()=>existing,
    scheduleForDate:()=>({active:true}),uuid:()=>String(Math.random()),fileToBlob:async()=>({}),
    saveEvidence:async()=>{},evidenceHash:async()=>'',saveRecord:async record=>{saved=record;},
    listRecords:async()=>[saved],clearUrls:()=>{},navigate:()=>{nav++;},
    todayIso:()=>date,calculateRecord:record=>({complete:record.punches.length===4}),
    toMinutes:time=>Number(time.slice(0,2))*60+Number(time.slice(3)),
    setTimeout:(fn,ms)=>{delay=ms;fn();return 0;},clearTimeout:()=>{},esc:s=>String(s),icon:()=>'',toast:()=>{},Date,Math,Promise,FormDataDummy:null,Object,String
  };
  vm.createContext(ctx);vm.runInContext(capture,ctx);
  await ctx.submitCapture({preventDefault(){},currentTarget:{}});
  return{overlay,nav,punches:saved.punches.length,message,delay};
}
(async()=>{
  const first=await run(0),last=await run(3);
  assert.equal(first.overlay,1,'first punch shows receipt confirmation');
  assert.equal(last.overlay,0,'last punch does not show receipt confirmation');
  assert.equal(last.nav,1,'last punch still navigates home for journey-complete modal');
  assert.equal(last.punches,4);
  const lunch=await run(1);
  assert.match(lunch.message,/Ponto de almoço registrado às 12:30h/);
  assert.match(lunch.message,/Você voltará às <strong>14:30h/);
  assert.equal(lunch.delay,6000,'lunch confirmation allows more reading time');
  assert.equal(first.delay,1500,'other confirmations keep their duration');
  assert(!first.message.includes('Você voltará'));
  const overnight=await run(1,'23:30');
  assert.match(overnight.message,/01:30h/);
  assert.match(overnight.message,/dia seguinte/);
  const minutes=await run(1,'12:59');
  assert.match(minutes.message,/14:59h/);
  console.log('PASS: final punch has one confirmation; lunch returns after two hours, including midnight rollover.');
})().catch(error=>{console.error(error);process.exitCode=1;});
