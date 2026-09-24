const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
for(const [,ref] of html.matchAll(/(?:src|href)=["']([^"'#?]+)(?:\?[^"']*)?["']/g)){
  if(!ref.startsWith('.')&&!ref.startsWith('/'))continue;
  const rel=ref.replace(/^\.\//,'').replace(/^\//,'');
  assert(fs.existsSync(path.join(root,rel)),`Referência ausente: ${rel}`);
}
const sw=read('public/sw.js');
for(const [,ref] of sw.matchAll(/['"]\/(?!api)([^'"?]+)(?:\?[^'"]*)?['"]/g)){
  if(!ref||ref==='index.html')continue;
  assert(fs.existsSync(path.join(root,ref)),`Cache ausente: ${ref}`);
}
assert(html.includes('ticket-cloud-v167.js?v=188'));
assert(html.includes('ticket-drive-v190.js?v=190'));
assert(html.includes('ticket-drive-v191.js?v=191'));
assert(!html.includes('?v=167'));
assert(sw.includes("ticket-app-v191"));
assert(!sw.includes('?v=167'));
assert.strictEqual(JSON.parse(read('version.json')).version,'1.0.91');
assert.strictEqual(JSON.parse(read('public/version.json')).version,'1.0.91');
const render=read('render.yaml');
assert(render.includes('name: ticket-app'));
assert(render.includes('buildCommand: npm ci'));
assert(render.includes('startCommand: npm start'));
const config=read('public/config.js');
assert(config.includes('googleClientId'));
assert(config.includes('.apps.googleusercontent.com'));
assert(config.includes('microsoftClientId'));
const server=read('server/index.mjs');
assert(!server.includes('DEFAULT_GOOGLE_CLIENT_ID'));
const drive=read('src/ticket-drive-v190.js');
assert(drive.includes('ticketGoogleClientIdValidV190'));
assert(drive.includes("sessionStorage.setItem"));
assert(drive.includes("prompt:firstConsent?'consent':''"));
assert(drive.includes('ticketGoogleResumeV190'));
const organizedDrive=read('src/ticket-drive-v191.js');
assert(organizedDrive.includes("TICKET_DRIVE_DATA_FOLDER_V191='Dados'"));
assert(organizedDrive.includes("TICKET_DRIVE_EVIDENCE_FOLDER_V191='Comprovantes'"));
assert(organizedDrive.includes('ticketDriveMigrateConnectionV191'));
assert(organizedDrive.includes('ticketCommitRestore(payload)'));
assert(server.includes("app.use('/src'"));
assert(server.includes("app.use('/public'"));
assert(!server.includes('express.static(WEB_ROOT'));
console.log('Production package checks passed.');
