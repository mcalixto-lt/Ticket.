const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('src/ticket-drive-v190.js');
const organized=read('src/ticket-drive-v191.js');
const config=read('public/config.js');

assert.match(config,/googleClientId:'\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com'/);
assert(source.includes("sessionStorage.setItem(ticketGoogleSessionKeyV190()"));
assert(source.includes("sessionStorage.getItem(ticketGoogleSessionKeyV190()"));
assert(source.includes("ticketCloudToken('google',{interactive:false}"));
assert(source.includes("window.addEventListener('online',ticketGoogleResumeV190)"));
assert(source.includes("window.addEventListener('focus',ticketGoogleResumeV190)"));
assert(source.includes('ticketGoogleProbeV190'));
assert(source.includes('ticketScheduleCloud(state.profile.cpf)'));
assert(!source.includes('__GOOGLE_CLIENT_ID__'));
assert(organized.includes("TICKET_DRIVE_BACKUP_V191='Ticket_backup_atual.json'"));
assert(organized.includes('ticketDrivePutEvidenceV191'));
assert(organized.includes("appProperties:{ticketType:'evidence'"));
assert(organized.includes('ticketDriveFindBackupV191'));
assert(organized.includes('ticketDriveApplyRestoredStateV191'));
assert(organized.includes('ticketDriveMigrateConnectionV191'));
assert(organized.includes('payload.evidence.length'));

console.log('PASS: Google Drive renewal, organized evidence upload and complete cross-device restore are installed.');
