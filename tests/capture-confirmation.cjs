const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/ticket-enhancements-v106.js'),'utf8');
const start=source.indexOf('submitCapture=async function(event){');
const end=source.indexOf('\n};',start)+3;
assert(start>=0&&end>start);
const capture=source.slice(start,end);
async function run(initial){
  const date='2026-09-29',punches=['entry','lunch','return','exit'];
  const existing=initial?{id:'record',profileCpf:'123',date,punches:punches.slice(0,initial).map((type,i)=>({type,time:`0${8+i}:00`})),evidenceIds:[],environmentIds:[],scheduleSnapshot:{active:true}}:null;
  let overlay=0,nav=0,saved;
  const state={profile:{cpf:'123'},receiptFile:{},records:[],schedule:{},environmentFile:null};
  const ctx={state,FormData:class{constructor(){return [['date',date],['time',initial===3?'18:00':'08:00']];}},
    document:{querySelector:()=>({checked:true}),createElement:()=>({setAttribute(){},remove(){}}),body:{append(){overlay++;}}},
    v105NextPunchInfo:()=>({type:punches[initial]}),getRecord:async()=>existing,
    scheduleForDate:()=>({active:true}),uuid:()=>String(Math.random()),fileToBlob:async()=>({}),
    saveEvidence:async()=>{},evidenceHash:async()=>'',saveRecord:async record=>{saved=record;},
    listRecords:async()=>[saved],clearUrls:()=>{},navigate:()=>{nav++;},
    todayIso:()=>date,calculateRecord:record=>({complete:record.punches.length===4}),
    toMinutes:time=>Number(time.slice(0,2))*60+Number(time.slice(3)),
    setTimeout:fn=>{fn();return 0;},toast:()=>{},Date,Math,Promise,FormDataDummy:null,Object,String
  };
  vm.createContext(ctx);vm.runInContext(capture,ctx);
  await ctx.submitCapture({preventDefault(){},currentTarget:{}});
  return{overlay,nav,punches:saved.punches.length};
}
(async()=>{
  const first=await run(0),last=await run(3);
  assert.equal(first.overlay,1,'first punch shows receipt confirmation');
  assert.equal(last.overlay,0,'last punch does not show receipt confirmation');
  assert.equal(last.nav,1,'last punch still navigates home for journey-complete modal');
  assert.equal(last.punches,4);
  console.log('PASS: final punch shows only journey completion; earlier punch confirms receipt.');
})().catch(error=>{console.error(error);process.exitCode=1;});
