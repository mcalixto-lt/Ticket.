/* Ticket. 1.0.14 — clima automático/colorido, relógio em tempo real e IA prismática */
'use strict';

state.weatherV114Source=state.weatherV114Source||'';

function v114ClockText(){
  return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
}

function v114WeatherGlyph(code,isDay=1,size=22){
  const tone=v113WeatherTone(code,isDay);
  const base=`width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"`;
  if(tone==='sun')return `<svg ${base}><circle cx="12" cy="12" r="4.2" fill="#FFD54A" stroke="#F59E0B" stroke-width="1.3"/><g stroke="#F59E0B" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.2v2.2M12 19.6v2.2M2.2 12h2.2M19.6 12h2.2M5.1 5.1l1.55 1.55M17.35 17.35l1.55 1.55M18.9 5.1l-1.55 1.55M6.65 17.35 5.1 18.9"/></g></svg>`;
  if(tone==='night')return `<svg ${base}><path d="M16.8 15.7A7.2 7.2 0 0 1 9 5.1a7.6 7.6 0 1 0 7.8 10.6Z" fill="#7C6CF2" stroke="#5B4EC8" stroke-width="1.2"/><path d="m18.7 4.2.55 1.25 1.25.55-1.25.55-.55 1.25-.55-1.25-1.25-.55 1.25-.55z" fill="#FFD65C"/></svg>`;
  if(tone==='rain')return `<svg ${base}><path d="M6.6 15.6h10.7a3.55 3.55 0 0 0 .3-7.05A5.2 5.2 0 0 0 8 7.65a4.1 4.1 0 0 0-1.4 7.95Z" fill="#91BFF5" stroke="#4D8ED8" stroke-width="1.2"/><g stroke="#28A7E8" stroke-width="1.7" stroke-linecap="round"><path d="m8.2 18.1-.8 2M12.2 18.1l-.8 2M16.2 18.1l-.8 2"/></g></svg>`;
  if(tone==='storm')return `<svg ${base}><path d="M6.6 15.2h10.7a3.55 3.55 0 0 0 .3-7.05A5.2 5.2 0 0 0 8 7.25a4.1 4.1 0 0 0-1.4 7.95Z" fill="#8798BF" stroke="#66789E" stroke-width="1.2"/><path d="m13.2 13.1-3 5h2.7l-1 3.2 4.7-6.2h-2.9l1-2Z" fill="#FFD044" stroke="#E8A600" stroke-width=".8"/></svg>`;
  if(tone==='fog')return `<svg ${base}><path d="M6.7 10.1h10.6" stroke="#A5B0BE" stroke-width="2" stroke-linecap="round"/><path d="M4.5 13.8h15" stroke="#8491A3" stroke-width="2" stroke-linecap="round"/><path d="M7.2 17.4h9.6" stroke="#B7C0CC" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="2" fill="#FFD45A" opacity=".9"/></svg>`;
  if(tone==='snow')return `<svg ${base}><path d="M6.6 15.2h10.7a3.55 3.55 0 0 0 .3-7.05A5.2 5.2 0 0 0 8 7.25a4.1 4.1 0 0 0-1.4 7.95Z" fill="#B9D8F5" stroke="#6BA3D7" stroke-width="1.2"/><g fill="#68B7E8"><circle cx="8" cy="19" r="1.05"/><circle cx="12" cy="20" r="1.05"/><circle cx="16" cy="19" r="1.05"/></g></svg>`;
  if(tone==='cloud')return `<svg ${base}><path d="M5.9 17h11.7a4 4 0 0 0 .35-7.92A5.8 5.8 0 0 0 7.1 8.05 4.45 4.45 0 0 0 5.9 17Z" fill="#9FB2CA" stroke="#70849F" stroke-width="1.2"/></svg>`;
  return `<svg ${base}><circle cx="8.1" cy="7.6" r="3.1" fill="#FFD54A" stroke="#F59E0B" stroke-width="1.1"/><g stroke="#F59E0B" stroke-width="1.25" stroke-linecap="round"><path d="M8.1 2.5v1.3M3 7.6h1.3M4.5 4l.9.9"/></g><path d="M7.3 18h10.2a3.6 3.6 0 0 0 .32-7.15A5.25 5.25 0 0 0 8 10.05 4.05 4.05 0 0 0 7.3 18Z" fill="#A7C7EC" stroke="#5B93CF" stroke-width="1.2"/></svg>`;
}

v113WeatherGlyph=v114WeatherGlyph;

v113WeatherButtonMarkup=function(){
  const w=state.weatherV113;
  const tone=v113WeatherTone(w.code,w.isDay);
  const hasTemp=w.temperature!=null&&Number.isFinite(Number(w.temperature));
  const temp=hasTemp?`${Math.round(Number(w.temperature))}°`:'--°';
  const clock=v114ClockText();
  const title=w.status==='ready'?`${v113WeatherDescription(w.code)} · ${temp} · ${clock}`:w.status==='loading'?`Atualizando clima · ${clock}`:`Clima local · ${clock}`;
  return `<button type="button" class="v113-weather-launcher v114-weather-launcher ${tone}" data-weather-v113 title="${esc(title)}" aria-label="${esc(title)}"><span class="v113-weather-glyph v114-weather-glyph">${v114WeatherGlyph(w.code,w.isDay,22)}</span><span class="v114-weather-values"><strong>${temp}</strong><i aria-hidden="true"></i><time data-weather-clock datetime="${clock}">${clock}</time></span></button>`;
};

function v114UpdateClockOnly(){
  const clock=v114ClockText();
  document.querySelectorAll('[data-weather-clock]').forEach(el=>{el.textContent=clock;el.setAttribute('datetime',clock);});
}

function v114LocationStorageKey(){return `ticket.weather.location.${state.profile?.cpf||'guest'}`;}
function v114LoadSavedCoords(){
  try{
    const data=JSON.parse(localStorage.getItem(v114LocationStorageKey())||'null');
    if(data&&Number.isFinite(Number(data.latitude))&&Number.isFinite(Number(data.longitude)))return data;
  }catch{}
  return null;
}
function v114SaveCoords(coords,source){
  const data={latitude:Number(coords.latitude),longitude:Number(coords.longitude),source,at:Date.now()};
  try{localStorage.setItem(v114LocationStorageKey(),JSON.stringify(data));}catch{}
  return data;
}

async function v114PermissionState(){
  try{
    if(!navigator.permissions?.query)return 'unknown';
    return (await navigator.permissions.query({name:'geolocation'})).state||'unknown';
  }catch{return 'unknown';}
}

async function v114GpsCoords(){
  const pos=await v113Geolocation();
  return v114SaveCoords({latitude:pos.coords.latitude,longitude:pos.coords.longitude},'gps');
}

async function v114IpCoords(){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try{
    const res=await fetch('https://ipwho.is/',{cache:'no-store',signal:controller.signal});
    const data=await res.json();
    if(res.ok&&data?.success!==false&&Number.isFinite(Number(data.latitude))&&Number.isFinite(Number(data.longitude)))return v114SaveCoords(data,'aproximada');
  }catch{}finally{clearTimeout(timer);}
  const controller2=new AbortController();const timer2=setTimeout(()=>controller2.abort(),5000);
  try{
    const res=await fetch('https://ipapi.co/json/',{cache:'no-store',signal:controller2.signal});
    const data=await res.json();
    if(res.ok&&Number.isFinite(Number(data.latitude))&&Number.isFinite(Number(data.longitude)))return v114SaveCoords(data,'aproximada');
  }finally{clearTimeout(timer2);}
  throw new Error('Localização automática indisponível.');
}

async function v114ResolveCoords(forceGps=false){
  const permission=await v114PermissionState();
  if(forceGps||permission==='granted'){
    try{return await v114GpsCoords();}catch{}
  }
  const cached=v114LoadSavedCoords();
  if(cached&&Date.now()-Number(cached.at||0)<6*60*60*1000){
    if(cached.source==='gps'&&permission==='granted'){
      try{return await v114GpsCoords();}catch{}
    }
    return cached;
  }
  return await v114IpCoords();
}

v113RefreshWeather=async function(forceLocation=false){
  const w=state.weatherV113;
  if(w.status==='loading')return w;
  const fresh=Date.now()-Number(w.updatedAt||0)<7*60*1000;
  if(fresh&&!forceLocation){v114UpdateClockOnly();return w;}
  w.status='loading';v113UpdateWeatherLaunchers();v114UpdateClockOnly();
  try{
    const location=await v114ResolveCoords(Boolean(forceLocation));
    w.coords={latitude:Number(location.latitude),longitude:Number(location.longitude)};
    state.weatherV114Source=location.source||'';
    const params=new URLSearchParams({latitude:String(w.coords.latitude),longitude:String(w.coords.longitude),current:'temperature_2m,apparent_temperature,weather_code,is_day',timezone:'auto',forecast_days:'1'});
    const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível consultar o clima agora.');
    const data=await response.json();const current=data.current||{};
    w.temperature=Number(current.temperature_2m);w.apparent=Number(current.apparent_temperature);w.code=Number(current.weather_code);w.isDay=Number(current.is_day??1);w.updatedAt=Date.now();w.status='ready';w.error='';
  }catch(error){
    w.status='error';w.error=error?.message||'Clima indisponível';
  }
  v113UpdateWeatherLaunchers();v114UpdateClockOnly();
  return w;
};

v113AutoWeather=async function(){
  await v113RefreshWeather(false);
  try{
    if(navigator.permissions?.query){
      const permission=await navigator.permissions.query({name:'geolocation'});
      permission.addEventListener?.('change',()=>{if(permission.state==='granted')v113RefreshWeather(true);});
    }
  }catch{}
};

function v114DecorateAiLauncher(){
  document.querySelectorAll('.mobile-brand [data-view="profile"],.topbar .toolbar [data-view="profile"]').forEach(btn=>{
    btn.classList.add('v114-ai-prism');
    btn.setAttribute('title','Assistente Ticket. IA');
  });
}

const v114RenderViewBefore=renderView;
renderView=function(){
  const result=v114RenderViewBefore();
  queueMicrotask(()=>{v114DecorateAiLauncher();v114UpdateClockOnly();});
  return result;
};

window.addEventListener('pageshow',()=>setTimeout(()=>{v114DecorateAiLauncher();v114UpdateClockOnly();v113RefreshWeather(false);},60));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){v114DecorateAiLauncher();v114UpdateClockOnly();v113RefreshWeather(false);}});
setInterval(v114UpdateClockOnly,15000);
setInterval(()=>{if(document.visibilityState==='visible'&&state.profile)v113RefreshWeather(false);},7*60*1000);
setTimeout(()=>{v114DecorateAiLauncher();v114UpdateClockOnly();v113AutoWeather();},220);
