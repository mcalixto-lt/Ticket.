/* Ticket. 1.0.16 — captura única para ponto/ambiente e tipografia unificada */
'use strict';

state.captureDestinationV116=state.captureDestinationV116||'';

function v116ResetEnvironmentState(){
  if(state.environmentUrl){try{URL.revokeObjectURL(state.environmentUrl);}catch{}}
  state.environmentUrl='';
  state.environmentFile=null;
  state.environmentNote='';
  state.environmentWatermarkAt='';
  state.environmentConfirmedV115=false;
}

function v116ResetCaptureState(){
  stopCamera();
  if(typeof v115StopEnvironmentCamera==='function')v115StopEnvironmentCamera();
  clearUrls();
  state.receiptFile=null;
  state.receiptOriginalFile=null;
  state.photoQuality=null;
  state.captureDestinationV116='';
  state.environmentFile=null;
  state.environmentNote='';
  state.environmentWatermarkAt='';
  state.environmentConfirmedV115=false;
}

function v116DestinationChoice(action){
  if(!state.receiptFile)return '';
  const selected=state.captureDestinationV116;
  return `<section class="v116-destination-block">
    <span class="v105-form-label">Como deseja registrar esta foto?</span>
    <div class="v116-destination-grid">
      <button type="button" class="v116-destination ${selected==='point'?'active point':''}" data-v116-destination="point">
        <span class="v116-destination-icon point">${icon('save',20)}</span>
        <span><strong>${action.title}</strong><small>Usar a foto como comprovante do registro de ${action.label}.</small></span>
      </button>
      <button type="button" class="v116-destination ${selected==='environment'?'active environment':''}" data-v116-destination="environment">
        <span class="v116-destination-icon environment">${v105CameraGlyph(20)}</span>
        <span><strong>Foto do ambiente</strong><small>Salvar a imagem como evidência do ambiente do dia.</small></span>
      </button>
    </div>
  </section>`;
}

function v116PointControls(action){
  if(!state.receiptFile||state.captureDestinationV116!=='point')return '';
  return `<div class="v105-appearance"><span>Como deseja salvar a fotografia?</span><div class="v105-appearance-switch"><button type="button" data-photo-mode="color" class="${state.captureAppearance==='color'?'active':''}">Em cores</button><button type="button" data-photo-mode="contrast" class="${state.captureAppearance==='contrast'?'active':''}">Alto contraste</button></div></div>
  <button id="informDateTimeV105" type="button" class="v105-date-time-btn">${v105EditGlyph(19)} Informar data e hora da ${action.label}</button>`;
}

function v116PunchContext(){
  const info=v105NextPunchInfo(todayIso());
  const action=v105RegisterAction(info.type);
  const total=info.order.length||4;
  const position=info.index>=0?info.index+1:total;
  return {info,action,total,position};
}

function v116EnvironmentCard(){
  const isEnvironment=state.captureDestinationV116==='environment';
  const environmentTime=state.environmentWatermarkAt?new Date(state.environmentWatermarkAt).toLocaleString('pt-BR'):'';
  return `<article class="panel v105-environment-card v106-environment-card v116-environment-card">
    <div class="v105-capture-title v116-environment-title">
      <div>
        <span class="v105-kicker">REGISTRAR AMBIENTE</span>
        <h3>Registrar ambiente</h3>
        <p>Use a mesma fotografia capturada acima. Escolha “Foto do ambiente”, adicione uma observação se necessário e registre.</p>
      </div>
      <span class="v105-camera-icon">${v105CameraGlyph(24)}</span>
    </div>
    ${!state.receiptFile?`<div class="v116-environment-empty"><span>${v105CameraGlyph(24)}</span><div><strong>Nenhuma foto capturada</strong><small>Capture uma imagem no box “Fotografe o comprovante” para decidir como registrá-la.</small></div></div>`:''}
    ${state.receiptFile&&!isEnvironment?`<div class="v116-environment-empty ready"><span>${v105CameraGlyph(24)}</span><div><strong>Foto disponível</strong><small>Na opção acima, escolha “Foto do ambiente” para preparar esta imagem.</small></div></div>`:''}
    ${isEnvironment&&state.environmentUrl?`<div class="v106-environment-preview v116-environment-preview"><img src="${state.environmentUrl}" alt="Foto do ambiente com marca d'água" draggable="false"><small>Marca d'água aplicada${environmentTime?`: ${esc(environmentTime)}`:''}</small></div>`:''}
    ${isEnvironment?`<label class="field v106-environment-note v116-environment-note"><span>Observação do ambiente</span><textarea id="environmentNoteV116" placeholder="Opcional — descreva alguma ocorrência ou informação importante.">${esc(state.environmentNote||'')}</textarea></label>
    <div class="v116-environment-actions">
      <button id="registerEnvironmentV116" type="button" class="v115-env-register v116-register-environment" ${state.environmentFile?'':'disabled'}>Registrar</button>
      <button id="cancelEnvironmentV116" type="button" class="v116-cancel-environment">Cancelar</button>
    </div>`:''}
  </article>`;
}

captureView=function(){
  const hasPhoto=Boolean(state.receiptFile);
  const pointSelected=state.captureDestinationV116==='point';
  const context=v116PunchContext();
  const action=context.action;
  return `${head(action.title,`Capture o comprovante para registrar ${action.label} com segurança.`)}
  <div class="v105-capture-page v106-capture-page v116-capture-page">
    <section class="v155-punch-context ${context.info.type||'done'}">
      <span class="v155-punch-icon">${homePremiumIcon(context.info.type||'clock',27)}</span>
      <div><small>PRÓXIMA BATIDA</small><strong>${action.title}</strong><p>${context.info.type?`${context.position}ª de ${context.total} batidas previstas para hoje.`:'Todos os registros previstos para hoje foram concluídos.'}</p></div>
      <b>${context.info.type?`${context.position}/${context.total}`:'✓'}</b>
    </section>
    <article class="panel v105-capture-card v116-main-capture-card">
      <div class="v105-capture-title"><div><span class="v105-kicker">${action.title.toLocaleUpperCase('pt-BR')}</span><h3>Comprovante da ${action.label}</h3><p>Enquadre bem a imagem. Depois da captura, confirme se ela será usada neste registro ou como foto do ambiente.</p></div><span class="v105-camera-icon">${v105CameraGlyph(24)}</span></div>
      <div class="v105-camera-frame" id="cameraStage"><video id="cameraVideo" class="hidden" playsinline muted></video>${state.receiptUrl?`<img src="${state.receiptUrl}" alt="Fotografia capturada" draggable="false">`:`<div class="v105-camera-empty">${v105CameraGlyph(42)}<strong>Câmera pronta</strong><span>Toque em Capturar para abrir a câmera.</span></div>`}<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i></div>
      ${v106QualityMarkup()}
      <div class="v105-camera-toolbar v106-camera-toolbar v156-camera-toolbar">
        <div class="v157-capture-control"><button id="startCamera" type="button" class="v106-camera-capture v156-capture-action" title="Capturar" aria-label="Capturar comprovante"><span class="v156-capture-action-icon">${v105CameraGlyph(25)}</span></button><span class="v157-capture-label">Capturar</span></div>
      </div>
      ${v116DestinationChoice(action)}
      ${v116PointControls(action)}
    </article>
    ${hasPhoto&&pointSelected?v105CaptureInformationCard():''}
    ${v116EnvironmentCard()}
  </div>`;
};

const v116SetFileBefore=setFile;
setFile=async function(kind,file){
  if(kind!=='receipt')return v116SetFileBefore(kind,file);
  state.captureDestinationV116='';
  v116ResetEnvironmentState();
  await v116SetFileBefore('receipt',file);
};

async function v116ChooseDestination(destination){
  if(!state.receiptFile){toast('Capture uma fotografia primeiro.');return;}
  if(destination==='point'){
    state.captureDestinationV116='point';
    v116ResetEnvironmentState();
    renderView();
    return;
  }
  if(destination==='environment'){
    state.captureDestinationV116='environment';
    const source=state.receiptOriginalFile||state.receiptFile;
    const marked=await v106WatermarkEnvironment(source);
    state.environmentFile=marked.blob;
    state.environmentWatermarkAt=marked.at;
    state.environmentConfirmedV115=false;
    v106BlobUrlReplace('environmentUrl',marked.blob);
    renderView();
  }
}

function v116CancelEnvironment(){
  v116ResetCaptureState();
  toast('Foto cancelada. A captura foi descartada.');
  renderView();
}

async function v116SaveEnvironment(){
  if(state.captureDestinationV116!=='environment'||!state.environmentFile){toast('Escolha “Foto do ambiente” antes de registrar.');return;}
  const button=document.querySelector('#registerEnvironmentV116');
  if(button){button.disabled=true;button.textContent='Registrando…';}
  try{
    const date=todayIso();
    const now=new Date().toISOString();
    const existing=await getRecord(state.profile.cpf,date);
    const snapshot=existing?.scheduleSnapshot||scheduleForDate(date,state.schedule);
    const record=existing?{
      ...existing,
      punches:[...(existing.punches||[])],
      evidenceIds:[...(existing.evidenceIds||[])],
      environmentIds:[...(existing.environmentIds||[])]
    }:{
      id:`${state.profile.cpf}:${date}`,
      profileCpf:state.profile.cpf,
      date,
      punches:[],
      evidenceIds:[],
      environmentIds:[],
      scheduleSnapshot:snapshot,
      createdAt:now,
      lockPolicy:'append-only',
      immutablePunches:true
    };
    const envId=uuid();
    const envBlob=state.environmentFile instanceof Blob?state.environmentFile:await fileToBlob(state.environmentFile);
    await saveEvidence({
      id:envId,
      profileCpf:state.profile.cpf,
      date,
      type:'environment',
      blob:envBlob,
      createdAt:now,
      lockedAt:now,
      immutable:true,
      watermarkAt:state.environmentWatermarkAt||now,
      note:String(state.environmentNote||'').trim(),
      integrityHash:await evidenceHash(envBlob)
    });
    record.environmentIds.push(envId);
    record.immutablePunches=true;
    record.lockPolicy='append-only';
    record.updatedAt=now;
    await saveRecord(record);
    state.records=await listRecords(state.profile.cpf);
    v116ResetCaptureState();
    toast('Foto do ambiente registrada e vinculada aos Registros de hoje.');
    navigate('records');
  }catch(error){
    console.error('Ticket ambiente 1.0.16:',error);
    toast('Não foi possível registrar a foto do ambiente agora.');
    if(button){button.disabled=false;button.textContent='Registrar';}
  }
}

const v116SubmitPointBefore=submitCapture;
submitCapture=async function(event){
  if(state.captureDestinationV116!=='point'){
    event.preventDefault();
    toast('Escolha “Registrar como ponto” para confirmar esta batida.');
    return;
  }
  v116ResetEnvironmentState();
  await v116SubmitPointBefore(event);
  if(state.view!=='capture')state.captureDestinationV116='';
};

bindCapture=function(){
  document.querySelector('#startCamera')?.addEventListener('click',startCamera);
  document.querySelectorAll('[data-v116-destination]').forEach(btn=>btn.addEventListener('click',()=>v116ChooseDestination(btn.dataset.v116Destination)));
  document.querySelectorAll('[data-photo-mode]').forEach(btn=>btn.addEventListener('click',async()=>{await v106ApplyReceiptMode(btn.dataset.photoMode,true);}));
  document.querySelector('#environmentNoteV116')?.addEventListener('input',e=>{state.environmentNote=e.target.value;});
  document.querySelector('#registerEnvironmentV116')?.addEventListener('click',v116SaveEnvironment);
  document.querySelector('#cancelEnvironmentV116')?.addEventListener('click',v116CancelEnvironment);
  document.querySelector('#informDateTimeV105')?.addEventListener('click',()=>{document.querySelector('#captureInfoV105')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.querySelector('#captureDateV105')?.focus({preventScroll:true}),350);});
  const form=document.querySelector('#captureForm');
  if(form){
    form.addEventListener('submit',submitCapture);
    document.querySelector('#captureDateV105')?.addEventListener('change',v105RefreshClassification);
    document.querySelector('#cancelCaptureV105')?.addEventListener('click',()=>{v116ResetCaptureState();renderView();});
    v105RefreshClassification();
  }
};

window.addEventListener('beforeunload',()=>{if(typeof v115StopEnvironmentCamera==='function')v115StopEnvironmentCamera();});
