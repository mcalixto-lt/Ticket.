/* Ticket. 1.0.3 — prévia bloqueada de registros e configurações aperfeiçoadas */
'use strict';

function lockGlyph(size=17){return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`;}
function phoneGlyph(size=21){return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10 5h4M11 18.5h2"/></svg>`;}
function formatChangedAt(value){const iso=String(value||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(iso)?formatDateBr(iso):'Data não informada';}
function maskCpf(cpf=''){const d=cpfDigits(cpf).padStart(11,'0');return `***.${d.slice(3,6)}.${d.slice(6,9)}-**`;}
function durationToInput(minutes=0){const abs=Math.max(0,Number(minutes)||0);return `${String(Math.floor(abs/60)).padStart(2,'0')}:${String(abs%60).padStart(2,'0')}`;}
function predecessorDay(day){const n=Math.max(1,Math.min(31,Number(day)||1));return n===1?31:n-1;}
function dayOptions(selected){return Array.from({length:31},(_,i)=>`<option value="${i+1}" ${Number(selected)===i+1?'selected':''}>${i+1}</option>`).join('');}
function punchOptions(selected=4){return [2,4].map(v=>`<option value="${v}" ${Number(selected)===v?'selected':''}>${v}</option>`).join('');}

async function evidenceHash(blob){
  try{
    if(!blob || !crypto?.subtle) return '';
    const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
    return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
  }catch{return '';}
}

async function migrateImmutableRecords(){
  if(!state.profile || state.__lockedMigrationCpf===state.profile.cpf) return;
  state.__lockedMigrationCpf=state.profile.cpf;
  let changed=false;
  for(const original of state.records||[]){
    let localChanged=false;
    const record={...original};
    record.punches=(record.punches||[]).map(p=>{
      if(p.immutable && p.lockedAt) return p;
      localChanged=true;
      return {...p,immutable:true,lockedAt:p.lockedAt||p.createdAt||record.updatedAt||record.createdAt||new Date().toISOString()};
    });
    if(!record.immutablePunches || record.lockPolicy!=='append-only'){
      record.immutablePunches=true;
      record.lockPolicy='append-only';
      localChanged=true;
    }
    if(localChanged){await saveRecord(record);changed=true;}
  }
  if(changed) state.records=await listRecords(state.profile.cpf);
}

const originalRenderShellV103=renderShell;
renderShell=function(){
  originalRenderShellV103();
  if(state.profile) queueMicrotask(()=>migrateImmutableRecords().catch(()=>{}));
};

const originalRecordCardV103=recordCard;
recordCard=function(r){
  const html=originalRecordCardV103(r);
  return html.replace('</article>',`<span class="record-lock-chip">${lockGlyph(13)} Bloqueado</span></article>`);
};

function captureReviewMarkup(record,next){
  const receipt=state.receiptUrl?`<div class="review-photo main"><img src="${state.receiptUrl}" alt="Prévia do comprovante selecionado"><span>Comprovante</span></div>`:`<div class="review-photo empty">${icon('camera',30)}<span>Adicione a foto do comprovante</span></div>`;
  const environment=state.environmentUrl?`<div class="review-photo"><img src="${state.environmentUrl}" alt="Prévia do ambiente"><span>Ambiente</span></div>`:`<div class="review-photo optional">${icon('camera',24)}<span>Ambiente opcional</span></div>`;
  const nextLabel=PUNCH_TYPES.find(p=>p.key===next)?.label||'Ponto';
  return `<section class="capture-review-card">
    <div class="capture-review-head"><div><span class="settings-kicker">PRÉVIA</span><h3>Revise antes de salvar</h3><p>A foto, a data e o horário ficam vinculados ao registro confirmado.</p></div><span class="locked-badge">${lockGlyph(15)} Imutável</span></div>
    <div class="capture-review-photos">${receipt}${environment}</div>
    <div class="capture-review-meta"><div><small>Tipo</small><strong id="reviewType">${nextLabel}</strong></div><div><small>Data</small><strong id="reviewDate">${formatDateBr(todayIso())}</strong></div><div><small>Hora</small><strong id="reviewTime">${timeNow()}</strong></div></div>
    <label class="lock-confirm"><input id="recordLockConfirm" type="checkbox" required><span><strong>Confirmo que revisei o registro.</strong><small>Depois de salvar, esta batida não poderá ser editada ou substituída.</small></span></label>
  </section>`;
}

captureView=function(){
  const record=currentRecord();
  const c=calculateRecord(record,state.schedule);
  const next=nextPunchType(record,state.schedule);
  const required=Number(c.requiredPunches||4);
  const allowed=required===2?PUNCH_TYPES.filter(p=>p.key==='entry'||p.key==='exit'):PUNCH_TYPES;
  const options=allowed.map(p=>`<option value="${p.key}" ${p.key===next?'selected':''}>${p.label}</option>`).join('');
  return `${head('Registrar ponto','Fotografe o comprovante, confira a prévia e confirme. Cada batida salva fica bloqueada para alteração.')}
  <div class="capture-layout enhanced-capture"><article class="panel capture-media-panel">
    <div class="capture-box"><div class="panel-head"><div><h3>Comprovante do ponto</h3><p>Obrigatório para confirmar a batida.</p></div>${state.receiptUrl?'<span class="badge positive">Foto pronta</span>':''}</div>
      <div class="camera-stage" id="cameraStage"><video id="cameraVideo" class="hidden" playsinline muted></video>${state.receiptUrl?`<img src="${state.receiptUrl}" alt="Prévia do comprovante">`:`<div class="camera-placeholder">${icon('camera',42)}<p>Abra a câmera ou escolha uma foto.</p><small>A imagem aparecerá aqui antes de salvar.</small></div>`}</div>
      <div class="camera-actions"><button id="startCamera" class="secondary">${icon('camera',18)} Abrir câmera</button><label class="secondary file-action">${state.receiptUrl?'Trocar foto':'Escolher foto'}<input id="receiptPicker" type="file" accept="image/*" capture="environment" hidden></label><button id="takePhoto" class="secondary hidden">Capturar foto</button><button id="stopCamera" class="secondary hidden">Fechar câmera</button></div>
    </div>
    <div class="capture-box environment-box"><div class="panel-head"><div><h3>Foto do ambiente</h3><p>Opcional — evidência complementar.</p></div></div><div class="photo-preview environment-preview">${state.environmentUrl?`<img src="${state.environmentUrl}" alt="Prévia do ambiente">`:`<span class="muted">Nenhuma foto adicionada</span>`}</div><label class="secondary file-action">${icon('camera',18)} ${state.environmentUrl?'Trocar foto':'Adicionar foto'}<input id="environmentPicker" type="file" accept="image/*" capture="environment" hidden></label></div>
  </article>
  <article class="panel capture-data-panel"><form id="captureForm" class="capture-form"><label class="field"><span>Tipo de ponto</span><select name="type">${options}</select></label><div class="two-col"><label class="field"><span>Data</span><input name="date" type="date" value="${todayIso()}" required></label><label class="field"><span>Hora</span><input name="time" type="time" value="${timeNow()}" required></label></div><label class="field"><span>Observação</span><textarea name="note" placeholder="Opcional"></textarea></label>
    ${captureReviewMarkup(record,next)}
    <div class="panel today-summary"><div class="panel-head"><div><h3>Resumo de hoje</h3><p>${c.complete?'Jornada concluída':'Jornada em andamento'}</p></div><span class="locked-badge subtle">${lockGlyph(14)} Batidas salvas bloqueadas</span></div>${workdayFlow(record)}</div>
    <button id="confirmCaptureButton" class="primary capture-confirm" type="submit" ${state.receiptFile?'':'disabled'}>${lockGlyph(18)} Confirmar e bloquear registro</button>
  </form></article></div>`;
};

setFile=function(kind,file){
  if(!file) return;
  const urlKey=kind==='receipt'?'receiptUrl':'environmentUrl';
  const fileKey=kind==='receipt'?'receiptFile':'environmentFile';
  if(state[urlKey]) URL.revokeObjectURL(state[urlKey]);
  state[fileKey]=file;
  state[urlKey]=URL.createObjectURL(file);
  stopCamera();
  if(state.view==='capture') renderView();
};

function refreshCaptureReview(){
  const form=document.querySelector('#captureForm');
  if(!form) return;
  const type=form.elements.type?.value;
  const date=form.elements.date?.value;
  const time=form.elements.time?.value;
  const label=PUNCH_TYPES.find(p=>p.key===type)?.label||'Ponto';
  const typeEl=document.querySelector('#reviewType'); if(typeEl) typeEl.textContent=label;
  const dateEl=document.querySelector('#reviewDate'); if(dateEl) dateEl.textContent=date?formatDateBr(date):'--/--/----';
  const timeEl=document.querySelector('#reviewTime'); if(timeEl) timeEl.textContent=time||'--:--';
}

bindCapture=function(){
  const form=document.querySelector('#captureForm');
  if(!form) return;
  form.onsubmit=submitCapture;
  document.querySelector('#receiptPicker').onchange=e=>setFile('receipt',e.target.files[0]);
  document.querySelector('#environmentPicker').onchange=e=>setFile('environment',e.target.files[0]);
  document.querySelector('#startCamera').onclick=startCamera;
  document.querySelector('#stopCamera').onclick=()=>{stopCamera();renderView();};
  document.querySelector('#takePhoto').onclick=takePhoto;
  ['type','date','time'].forEach(name=>form.elements[name]?.addEventListener('input',refreshCaptureReview));
  document.querySelector('#recordLockConfirm')?.addEventListener('change',e=>{
    document.querySelector('.capture-review-card')?.classList.toggle('confirmed',e.target.checked);
  });
  refreshCaptureReview();
};

submitCapture=async function(e){
  e.preventDefault();
  if(!state.receiptFile){toast('Adicione a foto do comprovante antes de confirmar.');return;}
  if(!document.querySelector('#recordLockConfirm')?.checked){toast('Revise a prévia e confirme o bloqueio do registro.');return;}
  const d=Object.fromEntries(new FormData(e.currentTarget));
  const existing=await getRecord(state.profile.cpf,d.date);
  const snapshot=existing?.scheduleSnapshot||scheduleForDate(d.date,state.schedule);
  if(!snapshot.active && !confirm('Este dia está configurado como folga. Deseja continuar?')) return;
  const record=existing?{...existing,punches:[...(existing.punches||[])],evidenceIds:[...(existing.evidenceIds||[])],environmentIds:[...(existing.environmentIds||[])]}:{id:`${state.profile.cpf}:${d.date}`,profileCpf:state.profile.cpf,date:d.date,punches:[],evidenceIds:[],environmentIds:[],scheduleSnapshot:snapshot,createdAt:new Date().toISOString(),lockPolicy:'append-only',immutablePunches:true};
  if(record.punches.some(p=>p.type===d.type)){toast('Essa batida já foi registrada e está bloqueada para alteração.');return;}
  const required=Number(snapshot.requiredPunches||4);
  if(record.punches.length>=required){toast('A jornada desta data já possui todas as batidas permitidas.');return;}
  const now=new Date().toISOString();
  const receiptId=uuid();
  const receiptBlob=await fileToBlob(state.receiptFile);
  await saveEvidence({id:receiptId,profileCpf:state.profile.cpf,date:d.date,type:'receipt',blob:receiptBlob,createdAt:now,lockedAt:now,immutable:true,integrityHash:await evidenceHash(receiptBlob)});
  record.evidenceIds.push(receiptId);
  if(state.environmentFile){
    const envId=uuid();
    const envBlob=await fileToBlob(state.environmentFile);
    await saveEvidence({id:envId,profileCpf:state.profile.cpf,date:d.date,type:'environment',blob:envBlob,createdAt:now,lockedAt:now,immutable:true,integrityHash:await evidenceHash(envBlob)});
    record.environmentIds.push(envId);
  }
  record.punches.push({id:uuid(),type:d.type,time:d.time,note:d.note||'',evidenceId:receiptId,createdAt:now,lockedAt:now,immutable:true});
  record.punches.sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  record.immutablePunches=true;
  record.lockPolicy='append-only';
  record.updatedAt=now;
  await saveRecord(record);
  clearUrls();
  state.receiptFile=null;
  state.environmentFile=null;
  state.records=await listRecords(state.profile.cpf);
  toast('Ponto confirmado e bloqueado para alteração.');
  navigate('dashboard');
};

function identificationCard(){
  return `<article class="settings-section-card identification-card"><div class="settings-card-head"><div><h3>Identificação bloqueada</h3><p>Dados confirmados no primeiro acesso.</p></div><span class="settings-card-icon purple">${lockGlyph(23)}</span></div><dl class="identity-list"><div><dt>Nome completo</dt><dd>${esc(state.profile.fullName)}</dd></div><div><dt>E-mail</dt><dd>${esc(state.profile.email)}</dd></div><div><dt>CPF</dt><dd>${maskCpf(state.profile.cpf)}</dd></div><div><dt>Status</dt><dd><span class="status-locked">${lockGlyph(14)} Bloqueado</span></dd></div></dl></article>`;
}

function balanceCard(){
  const mins=Math.abs(Number(state.balance.minutes||0));
  const type=Number(state.balance.minutes||0)>0?'positive':Number(state.balance.minutes||0)<0?'negative':'none';
  const history=(state.balance.history||[]).slice().reverse();
  return `<article class="settings-section-card"><div class="settings-card-head"><div><h3>Definir saldo anterior</h3><p>Informe o saldo que você já possuía antes de começar a registrar no Ticket.</p></div><span class="settings-card-icon violet">${icon('clock',23)}</span></div>
  <form id="balanceForm" class="settings-form-rich"><label class="field"><span>Tipo do saldo</span><select name="type"><option value="positive" ${type==='positive'?'selected':''}>Positivo</option><option value="negative" ${type==='negative'?'selected':''}>Negativo</option><option value="none" ${type==='none'?'selected':''}>Sem saldo anterior</option></select></label><div class="two-col"><label class="field"><span>Horas</span><input name="hours" type="number" inputmode="numeric" min="0" max="9999" value="${Math.floor(mins/60)}"></label><label class="field"><span>Minutos</span><input name="minutes" type="number" inputmode="numeric" min="0" max="59" value="${mins%60}"></label></div><label class="field"><span>Data de referência</span><input name="referenceDate" type="date" value="${state.balance.referenceDate||todayIso()}"></label><label class="field"><span>Observação opcional</span><input name="note" maxlength="180" value="${esc(state.balance.note||'')}" placeholder="Ex.: saldo oficial do banco de horas"></label><p class="settings-help">O saldo informado será considerado válido até a data de referência. O Ticket. somará apenas os registros posteriores a essa data.</p><button class="primary settings-save" type="submit">${icon('save',18)} Salvar saldo anterior</button></form>
  <div class="settings-history"><h4>${icon('records',18)} Histórico de atualização</h4><div class="balance-history-list">${history.length?history.map(h=>{const old=h.previousMinutes;return `<div class="balance-history-item"><span class="history-icon">${icon('calendar',18)}</span><div><small>${formatChangedAt(h.changedAt)}</small><strong>${old==null?'Saldo definido como':`Saldo alterado de ${formatDuration(old)} para`} <em>${formatDuration(h.minutes,{signed:true})}</em></strong><p>${esc(h.note||'Sem observação')}${h.referenceDate?` · válido até ${formatDateBr(h.referenceDate)}`:''}</p></div></div>`;}).join(''):'<p class="settings-empty">Nenhuma alteração registrada.</p>'}</div></div></article>`;
}

function closingCard(){
  const p=period(),n=nextClosingPeriod(p,state.closing);
  const start=state.closing.mode==='calendar'?1:Number(state.closing.startDay||16);
  const end=state.closing.mode==='calendar'?31:Number(state.closing.endDay||predecessorDay(start));
  return `<article class="settings-section-card"><div class="settings-card-head"><div><h3>Período de fechamento do ponto</h3><p>Defina o dia inicial e o dia final de cada ciclo mensal.</p></div><span class="settings-card-icon cyan">${icon('calendar',23)}</span></div><form id="closingForm" class="settings-form-rich"><label class="field"><span>Modo de fechamento</span><select id="closingModeRich" name="mode"><option value="calendar" ${state.closing.mode==='calendar'?'selected':''}>Mês normal — dia 1 ao último dia</option><option value="custom" ${state.closing.mode==='custom'?'selected':''}>Personalizado</option></select></label><div class="two-col"><label class="field"><span>Dia inicial do ciclo</span><select id="closingStartRich" name="startDay">${dayOptions(start)}</select></label><label class="field"><span>Dia final do ciclo</span><select id="closingEndRich" name="endDay">${dayOptions(end)}</select></label></div><p class="settings-help">Para um ciclo contínuo, o dia final deve ser o dia imediatamente anterior ao dia inicial. Exemplo: 16 até 15.</p><div class="period-preview-rich"><div><small>Período atual do ponto</small><strong>${formatDateBr(p.startDate)} até ${formatDateBr(p.endDate)}</strong></div><div><small>Próximo período</small><strong>${formatDateBr(n.startDate)} até ${formatDateBr(n.endDate)}</strong></div></div><button class="primary settings-save" type="submit">${icon('save',18)} Salvar período</button></form></article>`;
}

function weeklyScheduleCard(){
  const names=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const short=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  return `<article class="settings-section-card schedule-rich-card"><div class="settings-card-head schedule-head"><div><h3>Jornada semanal</h3><p>Segunda a sábado vêm ativados como padrão.</p></div><button class="primary schedule-top-save" type="submit" form="scheduleForm">Salvar jornada</button></div><form id="scheduleForm" class="schedule-rich-list">${names.map((name,i)=>{const s=state.schedule[i]||{};const active=Boolean(s.active);const entry=s.entryTime||'08:00';const exit=s.exitTime||(i===6?'12:00':'18:00');return `<section class="schedule-day ${active?'active':''}" data-schedule-day="${i}"><div class="schedule-day-title"><label class="switch"><input name="active-${i}" type="checkbox" value="1" ${active?'checked':''}><span class="switch-ui"></span></label><strong>${short[i]}</strong><span>${name}</span></div><div class="schedule-fields"><label class="field"><span>Entrada</span><input name="entry-${i}" type="time" value="${entry}" ${active?'':'disabled'}></label><label class="field"><span>Saída</span><input name="exit-${i}" type="time" value="${exit}" ${active?'':'disabled'}></label><label class="field"><span>Carga</span><input name="load-${i}" type="time" value="${durationToInput(active?s.expectedMinutes:0)}" ${active?'':'disabled'}></label><label class="field"><span>Batidas</span><select name="punches-${i}" ${active?'':'disabled'}>${punchOptions(s.requiredPunches||4)}</select></label></div></section>`;}).join('')}</form></article>`;
}

function deviceCards(){
  const installAvailable=Boolean(state.installPrompt);
  return `<div class="settings-bottom-grid"><article class="settings-section-card compact-setting-card"><div class="settings-card-head"><div><h3>Instalação no celular</h3><p>Adicione o Ticket. à tela inicial para abrir como aplicativo.</p></div><span class="settings-card-icon blue">${phoneGlyph()}</span></div><button id="installTicket" class="secondary full-action" ${installAvailable?'':'disabled'}>${installAvailable?'Instalar Ticket.':'Instalação pelo menu do navegador'}</button><p class="settings-help">${installAvailable?'O navegador está pronto para instalar o aplicativo.':'A opção fica disponível quando o navegador permite a instalação.'}</p></article><article class="settings-section-card compact-setting-card"><div class="settings-card-head"><div><h3>Sessão da conta</h3><p>Encerre o acesso quando não for mais utilizar este dispositivo.</p></div><span class="settings-card-icon purple">${icon('logout',22)}</span></div><button id="settingsLogout" class="secondary full-action">Sair da conta</button></article><article class="settings-section-card compact-setting-card reset-setting-card"><div class="settings-card-head"><div><h3>Redefinir instalação</h3><p>Apaga registros, fotos e configurações locais. O cadastro do perfil permanece.</p></div><span class="settings-card-icon red">${icon('trash',22)}</span></div><button id="settingsReset" class="secondary danger reset-action">${icon('trash',18)} Apagar dados locais</button></article></div>`;
}

settingsView=function(){
  return `<section class="settings-full"><div class="settings-page-intro"><span class="settings-kicker">PREFERÊNCIAS</span><h2>Configurações</h2><p>Defina a jornada, o saldo anterior e o período mensal de fechamento. Os registros de ponto já salvos permanecem bloqueados e não serão alterados.</p></div><div class="settings-stack">${identificationCard()}${balanceCard()}${closingCard()}${weeklyScheduleCard()}${deviceCards()}</div></section>`;
};

function updateClosingRichFields(){
  const mode=document.querySelector('#closingModeRich');
  const start=document.querySelector('#closingStartRich');
  const end=document.querySelector('#closingEndRich');
  if(!mode||!start||!end) return;
  if(mode.value==='calendar'){
    start.value='1';end.value='31';start.disabled=true;end.disabled=true;
  }else{
    start.disabled=false;end.disabled=false;
  }
}
function toggleScheduleDay(row,active){
  row?.classList.toggle('active',active);
  row?.querySelectorAll('.schedule-fields input,.schedule-fields select').forEach(el=>el.disabled=!active);
  if(!active){const load=row?.querySelector('[name^="load-"]');if(load)load.value='00:00';}
}

bindSettings=function(){
  document.querySelector('#scheduleForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget);
    for(let i=0;i<7;i++){
      const active=fd.has(`active-${i}`);
      const load=active?toMinutes(fd.get(`load-${i}`)||'00:00')||0:0;
      state.schedule[i]={...(state.schedule[i]||{}),active,requiredPunches:active?Number(fd.get(`punches-${i}`)||4):0,expectedMinutes:load,entryTime:fd.get(`entry-${i}`)||'08:00',exitTime:fd.get(`exit-${i}`)||(i===6?'12:00':'18:00')};
    }
    await saveSetting(state.profile.cpf,'schedule',state.schedule);
    toast('Jornada semanal salva.');
    renderView();
  });
  document.querySelectorAll('.schedule-day .switch input').forEach(input=>input.addEventListener('change',()=>toggleScheduleDay(input.closest('.schedule-day'),input.checked)));
  document.querySelector('#balanceForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.currentTarget));
    const previous=Number(state.balance.minutes||0);
    let mins=Number(d.hours||0)*60+Number(d.minutes||0);
    if(d.type==='negative') mins*=-1;
    if(d.type==='none') mins=0;
    const item={minutes:mins,previousMinutes:previous,referenceDate:d.referenceDate,note:d.note,changedAt:new Date().toISOString()};
    state.balance={...state.balance,minutes:mins,referenceDate:d.referenceDate,note:d.note,history:[...(state.balance.history||[]),item]};
    await saveSetting(state.profile.cpf,'balance',state.balance);
    toast('Saldo anterior salvo.');
    renderView();
  });
  const mode=document.querySelector('#closingModeRich');
  const start=document.querySelector('#closingStartRich');
  const end=document.querySelector('#closingEndRich');
  mode?.addEventListener('change',()=>{if(mode.value==='custom'&&start&&end)end.value=String(predecessorDay(start.value));updateClosingRichFields();});
  start?.addEventListener('change',()=>{if(mode?.value==='custom'&&end)end.value=String(predecessorDay(start.value));});
  updateClosingRichFields();
  document.querySelector('#closingForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const modeValue=document.querySelector('#closingModeRich')?.value||'calendar';
    const startDay=modeValue==='calendar'?1:Number(document.querySelector('#closingStartRich')?.value||1);
    const endDay=modeValue==='calendar'?31:Number(document.querySelector('#closingEndRich')?.value||31);
    if(modeValue==='custom'&&endDay!==predecessorDay(startDay)){toast(`Para manter um ciclo contínuo iniciado no dia ${startDay}, use o dia final ${predecessorDay(startDay)}.`);return;}
    state.closing={mode:modeValue,startDay,endDay};
    await saveSetting(state.profile.cpf,'closing',state.closing);
    toast('Período de fechamento salvo.');
    renderView();
  });
  document.querySelector('#settingsLogout')?.addEventListener('click',logout);
  document.querySelector('#settingsReset')?.addEventListener('click',async()=>{
    if(!confirm('Apagar todos os registros, fotos e configurações locais deste perfil? As batidas serão removidas deste dispositivo.')) return;
    await clearProfileData(state.profile.cpf);
    state.records=[];
    state.schedule=structuredClone(DEFAULT_SCHEDULE);
    state.balance={minutes:0,referenceDate:'',note:'',history:[]};
    state.closing={mode:'custom',startDay:16,endDay:15};
    toast('Instalação local redefinida.');
    renderView();
  });
  document.querySelector('#installTicket')?.addEventListener('click',async()=>{
    if(!state.installPrompt){toast('Use o menu do navegador e escolha “Adicionar à tela inicial” ou “Instalar app”.');return;}
    state.installPrompt.prompt();
    await state.installPrompt.userChoice.catch(()=>null);
    state.installPrompt=null;
    renderView();
  });
};

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  state.installPrompt=event;
  if(state.view==='settings') renderView();
});
window.addEventListener('appinstalled',()=>{state.installPrompt=null;toast('Ticket. instalado neste dispositivo.');});
