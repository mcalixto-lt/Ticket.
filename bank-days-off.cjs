const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const schedule=Object.fromEntries(Array.from({length:7},(_,i)=>[i,{active:i!==0,expectedMinutes:i===0?0:i===6?240:480,requiredPunches:i===6?2:4}]));
let saved,fail=false;
const c={console,structuredClone,DEFAULT_SCHEDULE:schedule,state:{profile:{cpf:'test'},schedule,balance:{minutes:1200,referenceDate:'2026-09-01',bankDaysOff:[]},records:[]},todayIso:d=>d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'2026-09-17',toMinutes:s=>{let [h,m]=s.split(':').map(Number);return h*60+m},balanceCard(){},bindSettings(){},submitCapture(){},bindCalendar(){},saveSetting:async(cpf,key,value)=>{if(fail)throw Error('storage');saved=structuredClone(value)}};
vm.createContext(c);
const base=fs.readFileSync(path.join(root,'app.js'),'utf8');
vm.runInContext(base.slice(base.indexOf('function scheduleForDate('),base.indexOf('function firstName(')),c);
vm.runInContext('function totalBalance(){return Number(state.balance.minutes)+accumulatedBalance(state.records,state.schedule,{afterDate:state.balance.referenceDate});}',c);
vm.runInContext(fs.readFileSync(path.join(root,'src/ticket-bank-v163.js'),'utf8'),c);
(async()=>{
assert.equal(c.bankDayQuote('2026-09-16').minutes,480);
assert.equal(c.bankDayQuote('2026-09-12').minutes,240);
assert.ok(c.bankDayQuote('2026-09-13').error); // Sunday
assert.ok(c.bankDayQuote('2026-02-30').error);
assert.ok(c.bankDayQuote('2026-09-18').error); // Future
assert.ok(c.bankDayQuote('2026-09-01').error); // Already in opening balance
let first={id:'one',date:'2026-09-16',minutes:480};
await c.persistBankDaysOff([first]);assert.equal(saved.bankDaysOff.length,1);assert.equal(c.totalBalance(),720); // 20h ->12h
assert.ok(c.bankDayQuote('2026-09-16').error); // duplicate
assert.equal(c.bankDayQuote('2026-09-12').remaining,480); // 12h ->8h
c.state.schedule[3].expectedMinutes=360;assert.equal(c.totalBalance(),720); // saved debit immutable
c.state.balance=JSON.parse(JSON.stringify(saved));assert.equal(c.totalBalance(),720); // reload
assert.equal(c.periodSummary([],schedule,{startDate:'2026-09-01',endDate:'2026-09-30'}).net,-480);
assert.equal(c.periodSummary([],schedule,{startDate:'2026-08-01',endDate:'2026-08-31'}).net,0);
await c.persistBankDaysOff([{...first,cancelledAt:'now'}]);assert.equal(c.totalBalance(),1200);
c.state.records=[{date:'2026-09-15',punches:[{time:'08:00'}]}];assert.ok(c.bankDayQuote('2026-09-15').error);
fail=true;await assert.rejects(()=>c.persistBankDaysOff([first]));assert.equal(c.totalBalance(),1200);
fail=false;await c.persistBankDaysOff([first]);c.state.balance.referenceDate='2026-09-16';assert.equal(c.totalBalance(),1200); // new baseline includes prior deductions
console.log('PASS: weekday, Saturday, nonworking day, invalid/future dates, duplicate, snapshot, reload, cancellation, storage failure, date bounds and period totals');
})().catch(e=>{console.error(e);process.exit(1)});
