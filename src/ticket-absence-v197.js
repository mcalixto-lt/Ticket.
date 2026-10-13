/* Ticket. 1.0.97 — ausência justificada independente da captura de ponto. */
'use strict';
TICKET_V104_VIEWS.add('absence');
let ticketAbsenceDraftV197={date:'',id:''},ticketAbsencePhotoV197=null,ticketAbsencePhotoUrlV197='',ticketAbsenceSavingV197=false;
function ticketAbsenceGlyphV197(size=25){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-7-7ZM14 2v7h7M9 14h6M12 11v6"/></svg>`;}
const ticketCalculateBeforeV197=calculateRecord;
calculateRecord=function(record,schedule=DEFAULT_SCHEDULE){
  if(!record?.absences?.length)return ticketCalculateBeforeV197(record,schedule);
  return ticketAbsenceCalculateV197(record,record.scheduleSnapshot||scheduleForDate(record.date,schedule));
};
function ticketAbsenceFindV197(date,id){return state.records.find(r=>r.date===date)?.absences?.find(a=>a.id===id&&!a.cancelledAt);}
function ticketAbsenceClearPhotoV197(){if(ticketAbsencePhotoUrlV197)URL.revokeObjectURL(ticketAbsencePhotoUrlV197);ticketAbsencePhotoUrlV197='';ticketAbsencePhotoV197=null;}
function ticketAbsenceOpenV197(date=todayIso(),id=''){ticketAbsenceClearPhotoV197();ticketAbsenceDraftV197={date,id};navigate('absence');}
function ticketAbsenceFormV197(){
 const date=ticketAbsenceDraftV197.date||todayIso(),r=state.records.find(r=>r.date===date),a=ticketAbsenceFindV197(date,ticketAbsenceDraftV197.id)||{};
 const day=r?.scheduleSnapshot||scheduleForDate(date,state.schedule),sch=ticketAbsenceScheduleV197(r,day);
 return `${head('Ausência justificada','Anexe o documento e informe os horários deste dia.')}<form id="ticketAbsenceForm" class="ticket-absence-form"><article class="panel"><h3>${ticketAbsenceGlyphV197(21)} Documento</h3><div class="two-col"><label class="field"><span>Tipo de documento</span><select name="documentType"><option value="declaration" ${a.documentType!=='certificate'?'selected':''}>Declaração</option><option value="certificate" ${a.documentType==='certificate'?'selected':''}>Atestado</option></select></label><label class="field"><span>Data da ausência</span><input name="date" type="date" max="${todayIso()}" value="${date}" ${a.id?'readonly':''} required></label></div><label class="ticket-absence-upload" for="ticketAbsencePhoto">${ticketAbsenceGlyphV197(32)}<strong>${a.evidenceId?'Documento anexado · toque para substituir':'Anexar foto do documento'}</strong><small>Fotografe ou selecione a imagem do documento.</small><img id="ticketAbsencePhotoPreview" alt="Foto do documento anexado" hidden></label><input id="ticketAbsencePhoto" type="file" accept="image/*" capture="environment" hidden><label class="ticket-absence-check"><input name="fullDay" type="checkbox" ${a.fullDay?'checked':''}>Atestado de afastamento durante todo o dia</label></article><article class="panel" data-absence-partial><h3>${icon('clock',21)} Atendimento e deslocamento</h3><div class="two-col"><label class="field"><span>Entrada no estabelecimento</span><input name="appointmentStart" type="time" value="${esc(a.appointmentStart||'')}" required></label><label class="field"><span>Saída do estabelecimento</span><input name="appointmentEnd" type="time" value="${esc(a.appointmentEnd||'')}" required></label></div><div class="ticket-absence-policy">Regra informada da empresa: <strong>30 min de ida + 30 min de retorno</strong><small>O abono considera apenas tempo de jornada sem trabalho e sem intervalo de almoço.</small></div><label class="field"><span>De onde você foi ao atendimento?</span><select name="origin"><option value="home" ${a.origin!=='work'?'selected':''}>Direto de casa, antes de iniciar o trabalho</option><option value="work" ${a.origin==='work'?'selected':''}>Do trabalho</option></select></label><label class="field" data-absence-departure><span>Saída do trabalho para o atendimento</span><input name="workExit" type="time" value="${esc(a.workExit||'')}"></label><label class="field"><span>Chegada ou retorno ao trabalho (opcional)</span><input name="workReturn" type="time" value="${esc(a.workReturn||'')}"></label><p class="ticket-absence-help">Ao capturar o comprovante de chegada, o horário registrado terá prioridade. Se saiu do trabalho, escolha “Retorno da ausência” na captura.</p></article><article class="panel" data-absence-break><h3>${icon('lunch',21)} Intervalo previsto neste dia</h3><div class="two-col"><label class="field"><span>Início do almoço</span><input name="breakStart" type="time" value="${ticketAbsenceTimeV197(sch.breakStart)}" required></label><label class="field"><span>Fim do almoço</span><input name="breakEnd" type="time" value="${ticketAbsenceTimeV197(sch.breakEnd)}" required></label></div><p class="ticket-absence-help">Confirme o intervalo previsto. Quando houver batidas de almoço, os horários registrados serão usados no cálculo. A captura de ponto continua disponível.</p></article><article class="panel"><label class="ticket-absence-check"><input name="applyCredit" type="checkbox" ${a.applyCredit===false?'':'checked'}>Aplicar abono conforme a regra informada da empresa</label><p class="ticket-absence-help">Ao deixar desmarcado, o documento fica registrado sem abono. Esta opção registra sua informação; o Ticket não valida o documento junto ao RH.</p><div id="ticketAbsenceSummary" class="ticket-absence-summary" aria-live="polite">Preencha os horários para conferir o cálculo.</div><label class="ticket-absence-check"><input name="reviewed" type="checkbox" required>Revisei o documento, a data e os horários.</label><button class="primary full-action" type="submit">${icon('save',19)} ${a.id?'Salvar ajuste da ausência':'Registrar ausência'}</button></article></form>`;
}
function ticketAbsenceFormDataV197(form){
 const d=Object.fromEntries(new FormData(form));
 return{documentType:d.documentType,fullDay:Boolean(d.fullDay),origin:d.origin||'home',appointmentStart:d.appointmentStart||'',appointmentEnd:d.appointmentEnd||'',workExit:d.workExit||'',workReturn:d.workReturn||'',applyCredit:Boolean(d.applyCredit),travelBefore:30,travelAfter:30,policySource:'company-informed'};
}
function ticketAbsenceFormRefreshV197(form){
 const d=ticketAbsenceFormDataV197(form),day=state.records.find(r=>r.date===form.elements.date.value)?.scheduleSnapshot||scheduleForDate(form.elements.date.value,state.schedule);
 const full=form.elements.documentType.value==='certificate'&&d.fullDay;
 form.elements.fullDay.disabled=form.elements.documentType.value!=='certificate';if(form.elements.fullDay.disabled)form.elements.fullDay.checked=false;
 form.querySelector('[data-absence-partial]').hidden=full;
 for(const name of ['appointmentStart','appointmentEnd']){form.elements[name].disabled=full;form.elements[name].required=!full;}
 form.querySelector('[data-absence-departure]').hidden=d.origin!=='work';form.elements.workExit.disabled=full||d.origin!=='work';form.elements.workExit.required=!full&&d.origin==='work';
 const needsBreak=Number(day.requiredPunches)!==2&&!full;
 form.querySelector('[data-absence-break]').hidden=!needsBreak;
 for(const name of ['breakStart','breakEnd']){form.elements[name].disabled=!needsBreak;form.elements[name].required=needsBreak;}
 const output=form.querySelector('#ticketAbsenceSummary');
 try{
  const data=ticketAbsenceFormDataV197(form),date=form.elements.date.value;
  const old=state.records.find(r=>r.date===date),record=structuredClone(old||{date,punches:[],evidenceIds:[]});
  const absence={...data,id:ticketAbsenceDraftV197.id||'preview',evidenceId:'preview',fullDay:full};
  record.absences=[...(record.absences||[]).filter(a=>a.id!==absence.id),absence];
  if(needsBreak)record.absenceSchedule={breakStart:form.elements.breakStart.value,breakEnd:form.elements.breakEnd.value};
  ticketAbsenceValidateV197(record);
  const calc=ticketAbsenceCalculateV197(record,day);
  output.innerHTML=`<div><small>Atendimento</small><strong>${full?'Dia inteiro':formatDuration(calc.appointmentMinutes)}</strong></div><div><small>Tempo ausente na jornada</small><strong>${calc.status==='Aguardando retorno'?'Aguardando retorno':formatDuration(calc.absenceMinutes)}</strong></div><div><small>Trabalhado</small><strong>${formatDuration(calc.workedMinutes)}</strong></div><div><small>Abono calculado</small><strong>${formatDuration(calc.creditedMinutes)}</strong></div><p>${calc.complete?`Trabalho + abono: ${formatDuration(calc.accountedMinutes)} · Saldo do dia: ${formatDuration(calc.balanceMinutes,{signed:true})}`:'O resultado final será atualizado com as batidas de chegada e saída.'}</p>`;
 }catch(error){output.textContent=error.message;}
}
async function ticketAbsenceCommitV197({date,item,blob,breaks}){
 const cpf=state.profile.cpf,database=await db(),transaction=database.transaction(['records','evidence'],'readwrite');
 const done=ticketTransactionDone(transaction),records=transaction.objectStore('records'),images=transaction.objectStore('evidence');
 const request=records.get(`${cpf}:${date}`);let failure;
 request.onsuccess=()=>{
  try{
   if(state.profile?.cpf!==cpf)throw Error('A conta mudou. Reabra o formulário.');
   const latest=request.result||{id:`${cpf}:${date}`,profileCpf:cpf,date,punches:[],evidenceIds:[],environmentIds:[],scheduleSnapshot:scheduleForDate(date,state.schedule),createdAt:new Date().toISOString()};
   if((typeof bankDayOff==='function'&&bankDayOff(date))||(typeof holidayMark==='function'&&holidayMark(date)))throw Error('O dia já está marcado como folga ou feriado.');
   const previous=latest.absences?.find(a=>a.id===item.id);
   if(previous?.cancelledAt)throw Error('Essa ausência já foi cancelada.');
   if(item.replacesId&&!previous)throw Error('A ausência foi alterada em outra sessão. Reabra o registro.');
   if(previous){item.createdAt=previous.createdAt;item.history=[...(previous.history||[]),{...previous,history:undefined}];}
   if(blob){images.put(blob);if(!latest.evidenceIds.includes(blob.id))latest.evidenceIds.push(blob.id);}
   latest.absences=[...(latest.absences||[]).filter(a=>a.id!==item.id),item];latest.updatedAt=new Date().toISOString();
   if(breaks)latest.absenceSchedule=breaks;
   ticketAbsenceValidateV197(latest);
   records.put(latest);
  }catch(error){failure=error;transaction.abort();}
 };
 try{await done;}catch(error){throw failure||error;}
 const refreshed=await listRecords(cpf);if(state.profile?.cpf===cpf)state.records=refreshed;
 if(typeof ticketScheduleFolder==='function')ticketScheduleFolder(cpf);
 if(typeof ticketScheduleCloud==='function')ticketScheduleCloud(cpf);
}
async function ticketAbsenceSubmitV197(event){
 event.preventDefault();if(ticketAbsenceSavingV197)return;
 const form=event.currentTarget,button=form.querySelector('button[type="submit"]'),cpf=state.profile.cpf;
 try{
  const d=ticketAbsenceFormDataV197(form),date=form.elements.date.value,existing=ticketAbsenceFindV197(date,ticketAbsenceDraftV197.id);
  if(ticketAbsenceDraftV197.id&&!existing)throw Error('A ausência foi alterada. Reabra o registro antes de ajustar.');
  const parsed=new Date(`${date}T12:00:00`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(parsed.getTime())||todayIso(parsed)!==date||date>todayIso())throw Error('Escolha uma data válida até hoje.');
  if(!form.elements.reviewed.checked)throw Error('Confirme a revisão do documento e dos horários.');
  if(!ticketAbsencePhotoV197&&!existing?.evidenceId)throw Error('Anexe a foto do atestado ou declaração.');
  let evidence=null;
  const item={...d,id:existing?.id||uuid(),evidenceId:existing?.evidenceId||uuid(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),replacesId:existing?.id||''};
  const day=state.records.find(r=>r.date===date)?.scheduleSnapshot||scheduleForDate(date,state.schedule);
  if(!day.active||!Number(day.expectedMinutes))throw Error('Este dia não possui jornada prevista.');
  const breaks=Number(day.requiredPunches)!==2&&!d.fullDay?{breakStart:form.elements.breakStart.value,breakEnd:form.elements.breakEnd.value}:null;
  ticketAbsenceValidateV197({absences:[item],absenceSchedule:breaks||undefined});
  ticketAbsenceSavingV197=true;button.disabled=true;
  if(ticketAbsencePhotoV197){
   const file=ticketAbsencePhotoV197;if(!file.type.startsWith('image/')||file.size>15*1024*1024)throw Error('Use uma foto de até 15 MB.');
   const blob=await fileToBlob(file);item.evidenceId=uuid();
   evidence={id:item.evidenceId,profileCpf:cpf,date,type:'medical_document',blob,createdAt:item.updatedAt,lockedAt:item.updatedAt,immutable:true,integrityHash:await evidenceHash(blob)};
  }
  if(state.profile?.cpf!==cpf)throw Error('A conta mudou. Reabra o formulário.');
  await ticketAbsenceCommitV197({date,item,blob:evidence,breaks});
  ticketAbsenceClearPhotoV197();navigate('records');toast('Ausência justificada registrada. O cálculo acompanha as batidas do dia.');
 }catch(error){toast(error.message||'Não foi possível registrar a ausência.');}
 finally{ticketAbsenceSavingV197=false;button.disabled=false;}
}
const ticketCaptureViewBeforeV197=captureView;
// Preserve the original capture actions; append a separate entry point.
captureView=function(){
 const template=document.createElement('div');template.innerHTML=ticketCaptureViewBeforeV197();
 const toolbar=template.querySelector('.v156-camera-toolbar');
 toolbar?.insertAdjacentHTML('afterend',`<button type="button" class="ticket-absence-option" data-absence-open>${ticketAbsenceGlyphV197()}<span><strong>Ausência justificada</strong><small>Atestado ou declaração · foto e horários</small></span>${icon('chev',18)}</button>`);
 if(String(v105NextPunchInfo(todayIso()).type).startsWith('medical_return:')){
  const context=template.querySelector('.v155-punch-context');
  if(context){context.querySelector('small').textContent='RETORNO DA AUSÊNCIA';context.querySelector('p').textContent='Batida adicional, independente do retorno do almoço.';context.querySelector('b').textContent='';}
 }
 return template.innerHTML;
};
const ticketRenderBeforeV197=renderView;
renderView=function(){
 if(state.view!=='absence')return ticketRenderBeforeV197();
 const content=document.querySelector('#content');if(!content)return;
 content.innerHTML=ticketAbsenceFormV197();bindNav();
 document.querySelectorAll('.glass-dock [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='records'));
 const form=document.querySelector('#ticketAbsenceForm');
 form.addEventListener('submit',ticketAbsenceSubmitV197);form.addEventListener('input',()=>ticketAbsenceFormRefreshV197(form));form.addEventListener('change',()=>ticketAbsenceFormRefreshV197(form));
 form.querySelector('#ticketAbsencePhoto').addEventListener('change',event=>{
  const file=event.target.files[0];if(!file)return;
  if(!file.type.startsWith('image/')||file.size>15*1024*1024){toast('Use uma foto de até 15 MB.');event.target.value='';return;}
  ticketAbsenceClearPhotoV197();ticketAbsencePhotoV197=file;ticketAbsencePhotoUrlV197=URL.createObjectURL(file);
  const preview=form.querySelector('#ticketAbsencePhotoPreview');preview.src=ticketAbsencePhotoUrlV197;preview.hidden=false;
 });
 ticketAbsenceFormRefreshV197(form);
};
function ticketAbsenceRecordMarkupV197(record){
 const active=record.absences||[];if(!active.length)return'';
 const calc=calculateRecord(record,state.schedule);
 return `<section class="ticket-absence-record"><h3>${ticketAbsenceGlyphV197(21)} Ausência justificada</h3>${active.map(a=>{
  const back=ticketAbsenceReturnV197(a,record);
  return `<div class="ticket-absence-item"><header><strong>${a.documentType==='certificate'?'Atestado':'Declaração'}</strong><button class="secondary" data-absence-photo="${esc(a.evidenceId)}">${icon('camera',19)} Ver documento</button></header><p>${a.fullDay?'Afastamento durante todo o dia':`Atendimento: ${esc(a.appointmentStart)}–${esc(a.appointmentEnd)}<br>Deslocamento: 30 min de ida + 30 min de retorno<br>${a.origin==='home'?'Direto de casa':`Saída do trabalho: ${esc(a.workExit)}`} · ${back===null?'Aguardando chegada/retorno':`Chegada/retorno: ${ticketAbsenceTimeV197(back)}`}`}</p><small>${a.cancelledAt?'Abono cancelado · documento preservado':a.applyCredit?'Abono conforme regra informada da empresa':'Documento registrado sem abono'}</small>${a.cancelledAt?'':`<div class="ticket-absence-record-actions"><button class="secondary" data-absence-edit="${esc(a.id)}" data-date="${record.date}">Ajustar ausência</button><button class="secondary" data-absence-cancel="${esc(a.id)}" data-date="${record.date}">Cancelar abono</button></div>`}</div>`;
 }).join('')}<div class="ticket-absence-summary"><div><small>Trabalhado</small><strong>${formatDuration(calc.workedMinutes)}</strong></div><div><small>Abonado</small><strong>${formatDuration(calc.creditedMinutes||0)}</strong></div><div><small>Tempo ausente</small><strong>${calc.status==='Aguardando retorno'?'Pendente':formatDuration(calc.absenceMinutes||0)}</strong></div><div><small>Trabalho + abono</small><strong>${formatDuration(calc.accountedMinutes||0)}</strong></div><p>${calc.complete?`Saldo do dia: ${formatDuration(calc.balanceMinutes,{signed:true})}`:esc(calc.status)} · A foto e os horários fazem parte do backup.</p></div>${(record.absencePunches||[]).map(p=>`<p class="ticket-absence-help">Retorno da ausência: ${esc(p.time)} <button class="secondary" data-absence-photo="${esc(p.evidenceId)}">Ver comprovante</button></p>`).join('')}</section>`;
}
const ticketRecordCardBeforeV197=recordCard;
recordCard=function(record){const html=ticketRecordCardBeforeV197(record),extra=ticketAbsenceRecordMarkupV197(record);return extra?html.replace(/<\/article>\s*$/,extra+'</article>'):html;};
const ticketReportRecordBeforeV197=v105ReportRecord;
v105ReportRecord=function(record){const html=ticketReportRecordBeforeV197(record);return html.replace(/<\/article>\s*$/,ticketAbsenceRecordMarkupV197(record)+'</article>');};
const ticketCalendarModalBeforeV197=v111CalendarDayModal;
v111CalendarDayModal=function(date){ticketCalendarModalBeforeV197(date);const r=state.records.find(r=>r.date===date);document.querySelector('#v111ModalRoot .v111-modal-card')?.insertAdjacentHTML('beforeend',ticketAbsenceRecordMarkupV197(r||{}));};
function ticketAbsenceCaptureChoiceV197(date,requested,time){
  const record=state.records.find(r=>r.date===date);if(!record?.absences?.length)return null;
 if(String(requested).startsWith('medical_return:')){
  const id=requested.slice('medical_return:'.length),a=record.absences.find(a=>a.id===id&&!a.cancelledAt&&a.origin==='work');
  if(!a)return{error:'Ausência não encontrada.'};
  if(ticketAbsenceMinuteV197(time)===null||ticketAbsenceMinuteV197(time)<ticketAbsenceMinuteV197(a.appointmentEnd))return{error:'O retorno deve ser posterior à saída do atendimento.'};
  return{type:'medical_return',absenceId:id};
 }
 if(['entry','lunch','return','exit'].includes(requested))return{type:requested};
 return null;
}
const ticketNextPunchInfoBeforeV197=v105NextPunchInfo;
v105NextPunchInfo=function(date){
 const info=ticketNextPunchInfoBeforeV197(date),record=info.existing;if(!record?.absences?.length)return info;
 const day=record.scheduleSnapshot||scheduleForDate(date,state.schedule),sch=ticketAbsenceScheduleV197(record,day),p=record.punches||[],map=Object.fromEntries(p.map(x=>[x.type,ticketAbsenceMinuteV197(x.time)]));
 if(map.entry==null){if(ticketAbsenceActiveV197(record).some(a=>a.fullDay&&a.applyCredit))return{...info,type:'',index:-1};return{...info,type:'entry',index:0};}
 const pending=ticketAbsenceActiveV197(record).find(a=>!a.fullDay&&a.origin==='work'&&!(record.absencePunches||[]).some(p=>p.absenceId===a.id));
 if(pending&&!p.some(x=>x.type==='exit'))return{...info,type:`medical_return:${pending.id}`,index:info.index};
 if(map.exit!=null)return{...info,type:'',index:-1};
 const lunchInAbsence=ticketAbsenceActiveV197(record).some(a=>a.origin==='work'&&ticketAbsenceMinuteV197(a.workExit)<=sch.breakStart&&ticketAbsenceReturnV197(a,record)>=sch.breakEnd);
 if(Number(day.requiredPunches)===2||map.entry>=sch.breakEnd||lunchInAbsence)return{...info,type:'exit',index:info.order.indexOf('exit')};
 return info;
};
const ticketRegisterActionBeforeV197=v105RegisterAction;
v105RegisterAction=function(type){return String(type).startsWith('medical_return:')?{title:'Registrar Retorno da ausência',label:'retorno da ausência',confirm:'Confirmar retorno da ausência'}:ticketRegisterActionBeforeV197(type);};
const ticketInformationBeforeV197=v105CaptureInformationCard;
v105CaptureInformationCard=function(){
 const html=ticketInformationBeforeV197();if(!html)return html;
 const r=state.records.find(r=>r.date===todayIso());if(!r?.absences?.length)return html;
 const info=v105NextPunchInfo(todayIso()),used=new Set((r.punches||[]).map(p=>p.type));
 const options=PUNCH_TYPES.filter(p=>!used.has(p.key)).map(p=>[p.key,p.label]);
 for(const a of ticketAbsenceActiveV197(r).filter(a=>a.origin==='work'&&!a.fullDay&&!(r.absencePunches||[]).some(p=>p.absenceId===a.id)))options.push([`medical_return:${a.id}`,`Retorno da ausência · ${a.appointmentStart}`]);
 const select=`<label class="field"><span>Batida a registrar neste dia</span><select id="captureTypeV105" name="type">${options.map(([value,label])=>`<option value="${esc(value)}" ${value===info.type?'selected':''}>${esc(label)}</option>`).join('')}</select></label><p class="ticket-absence-help">A captura continua independente do documento. Escolha a batida real que consta no comprovante.</p>`;
 return html.replace(/<input id="captureTypeV105"[^>]*>/,select);
};
const ticketRefreshClassBeforeV197=v105RefreshClassification;
v105RefreshClassification=function(){
 const selected=document.querySelector('#captureTypeV105'),manual=selected?.dataset.manual==='1'?selected.value:null;
 ticketRefreshClassBeforeV197();
 if(manual&&selected?.tagName==='SELECT')selected.value=manual;
 const type=selected?.value;if(type&&selected?.tagName==='SELECT'){
  const action=v105RegisterAction(type);document.querySelector('#captureActionTitleV155').textContent=action.confirm;
  const button=document.querySelector('#confirmCaptureButton');if(button){button.disabled=false;const label=button.querySelector('span');if(label)label.textContent=action.confirm;}
 }
};
document.addEventListener('change',event=>{if(event.target.id==='captureTypeV105'){event.target.dataset.manual='1';v105RefreshClassification();}});
document.addEventListener('click',async event=>{
 const button=event.target.closest?.('[data-absence-open],[data-absence-edit],[data-absence-photo],[data-absence-cancel]');if(!button)return;
 if(button.hasAttribute('data-absence-open')){ticketAbsenceOpenV197();return;}
 if(button.hasAttribute('data-absence-edit')){v111CloseModal();ticketAbsenceOpenV197(button.dataset.date,button.dataset.absenceEdit);return;}
 if(button.hasAttribute('data-absence-photo')){
  try{const e=await getEvidence(button.dataset.absencePhoto);if(!e?.blob)throw Error('Foto indisponível neste dispositivo.');let url=ticketEvidenceUrlsV104.get(e.id);if(!url){url=URL.createObjectURL(e.blob);ticketEvidenceUrlsV104.set(e.id,url);}v104OpenEvidencePreview({url,label:e.type==='medical_document'?'Documento de ausência':'Comprovante do retorno',time:'',hash:e.integrityHash,lockedAt:e.lockedAt});}catch(error){toast(error.message);}return;
 }
 if(!confirm('Cancelar o abono e recalcular o saldo? Os horários e o documento continuam no histórico.'))return;
 if(ticketAbsenceSavingV197)return;ticketAbsenceSavingV197=true;button.disabled=true;
 try{const a=ticketAbsenceFindV197(button.dataset.date,button.dataset.absenceCancel);if(!a)throw Error('Ausência não encontrada.');await ticketAbsenceCommitV197({date:button.dataset.date,item:{...a,cancelledAt:new Date().toISOString(),updatedAt:new Date().toISOString()},blob:null,breaks:null});v111CloseModal();renderView();toast('Abono cancelado. Saldo recalculado.');}catch(error){toast(error.message);}finally{ticketAbsenceSavingV197=false;button.disabled=false;}
});
const ticketDashboardBeforeV197=dashboardView;
dashboardView=function(){
 const html=ticketDashboardBeforeV197(),record=state.records.find(r=>r.date===todayIso());if(!record?.absences?.length)return html;
 const template=document.createElement('div');template.innerHTML=html;
 const calc=calculateRecord(record,state.schedule),info=v105NextPunchInfo(todayIso()),action=v105RegisterAction(info.type);
 const next=template.querySelector('.home-next-v150 strong');if(next)next.textContent=calc.complete?'Jornada concluída':action.title;
 const label=template.querySelector('#quickRegister span');if(label)label.textContent=calc.complete?'Ver jornada de hoje':action.title;
 if(calc.complete){const count=template.querySelector('.home-journey-v150 .home-section-head-v150>span');if(count)count.textContent='Concluída';}
 const metrics=template.querySelector('.home-metrics-v150');if(metrics)metrics.insertAdjacentHTML('afterend',`<article class="panel"><h3>Ausência justificada</h3><p class="ticket-absence-help">Abono do dia: ${formatDuration(calc.creditedMinutes||0)} · ${esc(calc.status)}</p><button class="secondary" data-view="records">Ver documento e cálculo</button></article>`);
 return template.innerHTML;
};
const ticketDayMarkBeforeV197=registerDayMark;
registerDayMark=async function(kind){
 if(state.records.find(r=>r.date===todayIso())?.absences?.length){toast('Este dia possui uma ausência justificada. Ajuste o documento antes de registrar folga ou feriado.');return false;}
 return ticketDayMarkBeforeV197(kind);
};
const ticketBankQuoteBeforeV197=bankDayQuote;
bankDayQuote=function(date){
 if(state.records.find(r=>r.date===date)?.absences?.length)return{error:'Este dia possui uma ausência justificada.'};
 return ticketBankQuoteBeforeV197(date);
};
