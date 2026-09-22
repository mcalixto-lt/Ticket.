/* Ticket. 1.0.15 — clima automático em tempo real, IA multicolor e câmera de ambiente integrada */
'use strict';

state.environmentConfirmedV115=Boolean(state.environmentConfirmedV115);
state.environmentStreamV115=state.environmentStreamV115||null;
state.weatherV115LastCoordsRefresh=Number(state.weatherV115LastCoordsRefresh||0);

/* ---------- Clima: sem ação ao toque e atualização automática ---------- */
function v115NeutralizeWeatherButtons(){
  v113CloseWeatherPopover?.();
  document.querySelectorAll('[data-weather-v113]').forEach(btn=>{
    btn.onclick=e=>{e.preventDefault();e.stopPropagation();};
    btn.setAttribute('aria-disabled','true');
    btn.title='Clima e hora atualizados automaticamente';
  });
}

async function v115RealtimeWeather(){
  const w=state.weatherV113;
  if(!w||w.status==='loading')return;
  w.status='loading';
  v113UpdateWeatherLaunchers?.();
  v115NeutralizeWeatherButtons();
  try{
    const now=Date.now();
    if(!w.coords||now-state.weatherV115LastCoordsRefresh>5*60*1000){
      const location=await v114ResolveCoords(false);
      w.coords={latitude:Number(location.latitude),longitude:Number(location.longitude)};
      state.weatherV114Source=location.source||'';
      state.weatherV115LastCoordsRefresh=now;
    }
    const params=new URLSearchParams({
      latitude:String(w.coords.latitude),
      longitude:String(w.coords.longitude),
      current:'temperature_2m,apparent_temperature,weather_code,is_day',
      timezone:'auto',
      forecast_days:'1'
    });
    const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Clima indisponível');
    const data=await response.json();
    const current=data.current||{};
    w.temperature=Number(current.temperature_2m);
    w.apparent=Number(current.apparent_temperature);
    w.code=Number(current.weather_code);
    w.isDay=Number(current.is_day??1);
    w.updatedAt=Date.now();
    w.status='ready';
    w.error='';
  }catch(error){
    if(w.temperature==null)w.status='error';
    else w.status='ready';
    w.error=error?.message||'Clima indisponível';
  }
  v113UpdateWeatherLaunchers?.();
  v114UpdateClockOnly?.();
  v115NeutralizeWeatherButtons();
}

/* ---------- Foto do ambiente: câmera embutida igual ao registro ---------- */
function v115StopEnvironmentCamera(){
  if(state.environmentStreamV115){
    try{state.environmentStreamV115.getTracks().forEach(track=>track.stop());}catch{}
    state.environmentStreamV115=null;
  }
}

function v115EnvironmentCard(){
  const environmentTime=state.environmentWatermarkAt?new Date(state.environmentWatermarkAt).toLocaleString('pt-BR'):'';
  const registered=Boolean(state.environmentFile&&state.environmentConfirmedV115);
  return `<article class="panel v105-environment-card v106-environment-card v115-environment-card">
    <div class="v105-capture-title v115-env-title">
      <div><span class="v105-kicker">FOTO DO AMBIENTE</span><h3>Registrar ambiente</h3><p>Opcional — fotografe o ambiente sem sair da tela. A imagem recebe data e hora automaticamente.</p></div>
      <span class="v105-camera-icon">${v105CameraGlyph(24)}</span>
    </div>
    <div class="v105-camera-frame v115-env-frame" id="environmentCameraStageV115">
      <video id="environmentCameraVideoV115" class="hidden" playsinline muted></video>
      ${state.environmentUrl?`<img src="${state.environmentUrl}" alt="Foto do ambiente com marca d'água" draggable="false">`:`<div class="v105-camera-empty">${v105CameraGlyph(40)}<strong>Câmera do ambiente</strong><span>Use a galeria ou abra a câmera.</span></div>`}
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
    </div>
    ${state.environmentUrl?`<div class="v115-env-watermark-note">Marca d'água aplicada${environmentTime?`: ${esc(environmentTime)}`:''}</div>`:''}
    <div class="v105-camera-toolbar v106-camera-toolbar v115-env-toolbar">
      <label class="v105-round-action v106-gallery-action" title="Abrir galeria" aria-label="Abrir galeria">${v105ImageGlyph(22)}<input id="environmentPickerV115" type="file" accept="image/*" hidden></label>
      <button id="environmentCameraV115" type="button" class="v106-camera-capture" title="Abrir câmera" aria-label="Abrir câmera">${v105CameraGlyph(25)}</button>
    </div>
    <label class="field v106-environment-note v115-env-note"><span>Observação do ambiente</span><textarea id="environmentNoteV115" placeholder="Opcional — descreva alguma ocorrência ou informação importante.">${esc(state.environmentNote||'')}</textarea></label>
    <button id="registerEnvironmentV115" type="button" class="v115-env-register ${registered?'registered':''}" ${state.environmentFile?'':'disabled'}>${registered?'✓ Ambiente registrado':'Registrar'}</button>
  </article>`;
}

const v115CaptureViewBefore=captureView;
captureView=function(){
  const html=v115CaptureViewBefore();
  return html.replace(/<article class="panel v105-environment-card v106-environment-card">[\s\S]*?<\/article>\s*<\/div>$/,`${v115EnvironmentCard()}</div>`);
};

async function v115StartEnvironmentCamera(){
  try{
    if(state.environmentStreamV115){await v115TakeEnvironmentPhoto();return;}
    v115StopEnvironmentCamera();
    state.environmentStreamV115=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
    const video=document.querySelector('#environmentCameraVideoV115');
    if(!video)return;
    video.srcObject=state.environmentStreamV115;
    video.classList.remove('hidden');
    await video.play();
    const btn=document.querySelector('#environmentCameraV115');
    if(btn){btn.classList.add('armed');btn.title='Capturar foto';btn.setAttribute('aria-label','Capturar foto');btn.innerHTML='<span class="v106-shutter-core"></span>';}
  }catch(error){
    console.warn('Ticket ambiente:',error);
    toast('Não foi possível abrir a câmera do ambiente. Verifique a permissão ou use a galeria.');
  }
}

async function v115TakeEnvironmentPhoto(){
  const video=document.querySelector('#environmentCameraVideoV115');
  if(!video?.videoWidth){toast('A câmera ainda não está pronta.');return;}
  const canvas=document.createElement('canvas');
  canvas.width=video.videoWidth;canvas.height=video.videoHeight;
  canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.94));
  v115StopEnvironmentCamera();
  if(blob){state.environmentConfirmedV115=false;await setFile('environment',blob);}
}

function v115RegisterEnvironment(){
  if(!state.environmentFile){toast('Capture ou escolha uma foto do ambiente.');return;}
  state.environmentConfirmedV115=true;
  const btn=document.querySelector('#registerEnvironmentV115');
  if(btn){btn.classList.add('registered');btn.textContent='✓ Ambiente registrado';}
  toast('Foto do ambiente registrada para esta batida.');
}

const v115BindCaptureBefore=bindCapture;
bindCapture=function(){
  v115BindCaptureBefore();
  document.querySelector('#environmentPickerV115')?.addEventListener('change',async e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    state.environmentConfirmedV115=false;
    await setFile('environment',file);
  });
  document.querySelector('#environmentCameraV115')?.addEventListener('click',v115StartEnvironmentCamera);
  document.querySelector('#environmentNoteV115')?.addEventListener('input',e=>{state.environmentNote=e.target.value;});
  document.querySelector('#registerEnvironmentV115')?.addEventListener('click',v115RegisterEnvironment);
  document.querySelector('#cancelCaptureV105')?.addEventListener('click',()=>{state.environmentConfirmedV115=false;v115StopEnvironmentCamera();});
};

const v115SubmitCaptureBefore=submitCapture;
submitCapture=async function(event){
  if(state.environmentFile&&!state.environmentConfirmedV115){
    event.preventDefault();
    toast('Clique em Registrar na Foto do Ambiente antes de confirmar o ponto.');
    document.querySelector('#registerEnvironmentV115')?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  await v115SubmitCaptureBefore(event);
  if(!state.environmentFile)state.environmentConfirmedV115=false;
};

const v115StopCameraBefore=stopCamera;
stopCamera=function(){v115StopEnvironmentCamera();return v115StopCameraBefore();};

/* ---------- IA: efeito multicolor Google-like ---------- */
function v115DecorateAi(){
  document.querySelectorAll('.mobile-brand [data-view="profile"],.topbar .toolbar [data-view="profile"]').forEach(btn=>btn.classList.add('v115-ai-google'));
}

const v115RenderViewBefore=renderView;
renderView=function(){
  const result=v115RenderViewBefore();
  queueMicrotask(()=>{v115NeutralizeWeatherButtons();v115DecorateAi();v114UpdateClockOnly?.();});
  return result;
};

setInterval(()=>{v114UpdateClockOnly?.();v115NeutralizeWeatherButtons();},1000);
setInterval(()=>{if(document.visibilityState==='visible'&&state.profile)v115RealtimeWeather();},60*1000);
window.addEventListener('pageshow',()=>setTimeout(()=>{v115NeutralizeWeatherButtons();v115DecorateAi();v115RealtimeWeather();},80));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){v115NeutralizeWeatherButtons();v115DecorateAi();v115RealtimeWeather();}});
setTimeout(()=>{v115NeutralizeWeatherButtons();v115DecorateAi();v115RealtimeWeather();},260);
