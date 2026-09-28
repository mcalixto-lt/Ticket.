const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/ticket-drive-v190.js'),'utf8');
const clientId='123456789-abc123.apps.googleusercontent.com';
const values=new Map();
let scriptLoads=0,oauthCalls=0;
const cloud={googleClientId:clientId,account:{google:'user@example.com'},provider:'google'};
const context={
  state:{profile:{cpf:'12345678900'},cloudTokens:{google:null}},
  sessionStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)},
  ticketPublicConfig:()=>({googleClientId:clientId}),v107CloudConfig:()=>cloud,v107SaveCloud:()=>{},
  ticketApplyPublicCloudConfig:()=>{},ticketProviderConfigured:()=>{},ticketCloudToken:async()=>{},
  v107GoogleToken:async()=>{},autoBackupTest:async()=>{},ticketCloudSetupNotice:async()=>{},
  v107LoadScript:async()=>{scriptLoads++;},
  google:{accounts:{oauth2:{initTokenClient:({callback})=>({requestAccessToken:()=>{oauthCalls++;callback({access_token:'fresh-token',expires_in:3600});}})}}},
  fetch:async()=>({ok:true,json:async()=>({email:'user@example.com'})}),
  setTimeout:()=>0,clearTimeout:()=>{},window:{addEventListener:()=>{}},
  document:{addEventListener:()=>{}},navigator:{onLine:true},
  requestAnimationFrame:()=>{},location:{origin:'https://ticket.example'},
  Date,Promise,JSON,Error,Object,String,Number,Boolean,RegExp,console
};
vm.createContext(context);vm.runInContext(source,context);
(async()=>{
  await assert.rejects(context.ticketGoogleRequestTokenV190({interactive:false}),error=>error.code==='reauth');
  assert.equal(scriptLoads,0,'background access must not load Google Identity');
  assert.equal(oauthCalls,0,'background access must not open OAuth');
  assert.equal(await context.ticketGoogleRequestTokenV190({interactive:true}),'fresh-token');
  assert.equal(oauthCalls,1,'explicit connection opens OAuth once');
  assert.equal(await context.ticketGoogleRequestTokenV190({interactive:false}),'fresh-token');
  assert.equal(oauthCalls,1,'valid session is reused without OAuth');
  context.state.cloudTokens.google=null;
  context.state.googleTokenExpiresAtV190=0;
  assert.equal(await context.ticketGoogleRequestTokenV190({interactive:false}),'fresh-token');
  assert.equal(oauthCalls,1,'sessionStorage access stays silent');
  console.log('PASS: Google login only on explicit connection; background sync reuses a valid token.');
})().catch(error=>{console.error(error);process.exitCode=1;});
