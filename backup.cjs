const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx={Blob,TextEncoder,Uint8Array,atob,crypto:require('node:crypto').webcrypto,console};
vm.createContext(ctx);
const source=fs.readFileSync(path.join(__dirname,'../src/ticket-backup-v165.js'),'utf8');
vm.runInContext(source.slice(0,source.indexOf('function ticketStorageOptions')),ctx);
const cpf='12345678909',photo='data:image/png;base64,aGVsbG8=';
const payload={profile:{cpf,fullName:'Teste'},records:[{id:cpf+':2026-09-17',profileCpf:cpf,date:'2026-09-17',createdAt:'2026-09-17T08:00:00Z',scheduleSnapshot:{active:true,expectedMinutes:480},punches:[{type:'entry',time:'08:00',evidenceId:'photo',lockedAt:'2026-09-17T08:00:00Z'}],evidenceIds:['photo'],environmentIds:[]}],evidence:[{id:'photo',profileCpf:cpf,data:photo,lockedAt:'2026-09-17T08:00:00Z'}],settings:[{key:cpf+':balance',value:{minutes:1200,bankDaysOff:[{date:'2026-09-16',minutes:480}],dayMarks:[{date:'2026-09-15',kind:'feriado'}]}}]};
async function envelope(p){return new Blob([JSON.stringify({format:'ticket-full-backup',version:1,sha256:await ctx.ticketDigest(JSON.stringify(p)),payload:p})]);}
(async()=>{
 const p=await ctx.ticketParseBackup(await envelope(payload));
 assert.equal(p.records[0].punches[0].time,'08:00');assert.equal(p.records[0].createdAt,payload.records[0].createdAt);
 assert.equal(p.settings[0].value.bankDaysOff[0].minutes,480);
 const photo=ctx.ticketDecodeEvidence(p.evidence[0]);assert.equal(await photo.blob.text(),'hello');assert.equal(photo.lockedAt,payload.evidence[0].lockedAt);
 const bad=structuredClone(payload);bad.evidence=[];assert.throws(()=>ctx.ticketValidateBackupPayload(bad));
 const dup=structuredClone(payload);dup.records.push(dup.records[0]);assert.throws(()=>ctx.ticketValidateBackupPayload(dup));
 const wrong=structuredClone(payload);wrong.evidence[0].profileCpf='00000000000';assert.throws(()=>ctx.ticketValidateBackupPayload(wrong));
 await assert.rejects(()=>ctx.ticketParseBackup(new Blob(['{"format":"ticket-full-backup","version":1,"sha256":"wrong","payload":{}}'])));
 await assert.rejects(()=>ctx.ticketParseBackup(new Blob(['{"version":2}'])));
 console.log('PASS: full payload, original timestamps, photo bytes, balance metadata, invalid checksum, duplicate IDs, foreign photo and legacy rejection. IndexedDB transaction/device picker not exercised in this environment.');
})().catch(e=>{console.error(e);process.exit(1)});
function envelopeBlob(p){return new Blob([JSON.stringify({format:'ticket-full-backup',version:1,sha256:'wrong',payload:p})]);}
