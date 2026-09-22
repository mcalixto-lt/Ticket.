/* Ticket. 1.0.13 — setas por etapa, clima em tempo real e animações persistentes */
'use strict';

state.weatherV113=state.weatherV113||{status:'idle',temperature:null,apparent:null,code:null,isDay:1,updatedAt:0,coords:null};

function v113WeatherDescription(code){
  if(code==null)return 'Clima local';
  const c=Number(code);
  if(c===0)return 'Céu limpo';
  if([1,2].includes(c))return 'Parcialmente nublado';
  if(c===3)return 'Nublado';
  if([45,48].includes(c))return 'Neblina';
  if([51,53,55,56,57].includes(c))return 'Garoa';
  if([61,63,65,66,67,80,81,82].includes(c))return 'Chuva';
  if([71,73,75,77,85,86].includes(c))return 'Neve';
  if([95,96,99].includes(c))return 'Trovoadas';
  return 'Condição atual';
}

function v113WeatherTone(code,isDay=1){
  if(code==null)return 'partly';
  const c=Number(code);
  if(c===0)return isDay?'sun':'night';
  if([1,2].includes(c))return 'partly';
  if(c===3)return 'cloud';
  if([45,48].includes(c))return 'fog';
  if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c))return 'rain';
  if([71,73,75,77,85,86].includes(c))return 'snow';
  if([95,96,99].includes(c))return 'storm';
  return 'partly';
}

function v113WeatherGlyph(code,isDay=1,size=21){
  const tone=v113WeatherTone(code,isDay);
  const attrs=`width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  if(tone==='sun')return `<svg ${attrs}><circle cx="12" cy="12" r="3.5"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4"/></svg>`;
  if(tone==='night')return `<svg ${attrs}><path d="M19.5 15.6A8 8 0 0 1 8.4 4.5a8.3 8.3 0 1 0 11.1 11.1Z"/><path d="m17.8 4 .5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/></svg>`;
  if(tone==='rain')return `<svg ${attrs}><path d="M7 16.5h10a3.7 3.7 0 0 0 .5-7.3A5.5 5.5 0 0 0 7 8a4.3 4.3 0 0 0 0 8.5Z"/><path d="m8 19-1 2M12 19l-1 2M16 19l-1 2"/></svg>`;
  if(tone==='storm')return `<svg ${attrs}><path d="M7 15.5h10a3.7 3.7 0 0 0 .5-7.3A5.5 5.5 0 0 0 7 7a4.3 4.3 0 0 0 0 8.5Z"/><path d="m13 14-3 5h3l-1 3 4-6h-3z"/></svg>`;
  if(tone==='fog')return `<svg ${attrs}><path d="M6 10.5h12M4 14h16M7 17.5h10"/><path d="M8 7.5a5 5 0 0 1 8 0"/></svg>`;
  if(tone==='snow')return `<svg ${attrs}><path d="M7 15.5h10a3.7 3.7 0 0 0 .5-7.3A5.5 5.5 0 0 0 7 7a4.3 4.3 0 0 0 0 8.5Z"/><path d="M8 19h.01M12 20h.01M16 19h.01"/></svg>`;
  if(tone==='cloud')return `<svg ${attrs}><path d="M6.5 17h11a4 4 0 0 0 .5-7.9A6 6 0 0 0 6.7 8a4.5 4.5 0 0 0-.2 9Z"/></svg>`;
  return `<svg ${attrs}><circle cx="8" cy="8" r="2.5"/><path d="M8 2.8v1.2M3 8h1.2M4.5 4.5l.9.9"/><path d="M8 18h9a3.5 3.5 0 0 0 .4-7A5.2 5.2 0 0 0 8 10.2 4 4 0 0 0 8 18Z"/></svg>`;
}

function v113WeatherButtonMarkup(){
  const w=state.weatherV113;
  const tone=v113WeatherTone(w.code,w.isDay);
  const hasTemp=w.temperature!=null&&Number.isFinite(Number(w.temperature));
  const temp=hasTemp?`${Math.round(Number(w.temperature))}°`:'--°';
  const title=w.status==='ready'?`${v113WeatherDescription(w.code)} · ${temp}`:w.status==='loading'?'Atualizando clima…':'Clima local';
  return `<button type="button" class="v113-weather-launcher ${tone}" data-weather-v113 title="${esc(title)}" aria-label="${esc(title)}"><span class="v113-weather-glyph">${v113WeatherGlyph(w.code,w.isDay,20)}</span><strong>${temp}</strong></button>`;
}

function v113InstallWeatherLauncher(){
  const mobileAi=document.querySelector('.mobile-brand [data-view="profile"]');
  if(mobileAi&&!mobileAi.closest('.v113-top-actions')){
    const group=document.createElement('div');group.className='v113-top-actions';
    mobileAi.parentNode.insertBefore(group,mobileAi);group.append(mobileAi);
  }
  const mobileGroup=document.querySelector('.mobile-brand .v113-top-actions');
  if(mobileGroup&&!mobileGroup.querySelector('[data-weather-v113]'))mobileGroup.insertAdjacentHTML('afterbegin',v113WeatherButtonMarkup());
  const desktopAi=document.querySelector('.topbar .toolbar [data-view="profile"]');
  if(desktopAi&&!document.querySelector('.topbar .toolbar [data-weather-v113]'))desktopAi.insertAdjacentHTML('beforebegin',v113WeatherButtonMarkup());
  document.querySelectorAll('[data-weather-v113]').forEach(btn=>{btn.onclick=()=>v113OpenWeather(btn,false);});
}

function v113UpdateWeatherLaunchers(){
  document.querySelectorAll('[data-weather-v113]').forEach(btn=>{
    const holder=document.createElement('div');holder.innerHTML=v113WeatherButtonMarkup();
    const fresh=holder.firstElementChild;if(!fresh)return;
    btn.className=fresh.className;btn.innerHTML=fresh.innerHTML;btn.title=fresh.title;btn.setAttribute('aria-label',fresh.getAttribute('aria-label')||'Clima local');
  });
}

function v113Geolocation(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error('Localização não disponível neste dispositivo.'));return;}
    navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:9000,maximumAge:15*60*1000});
  });
}

async function v113RefreshWeather(forceLocation=false){
  const w=state.weatherV113;
  if(w.status==='loading')return w;
  const fresh=Date.now()-Number(w.updatedAt||0)<8*60*1000;
  if(fresh&&!forceLocation)return w;
  w.status='loading';v113UpdateWeatherLaunchers();
  try{
    let coords=w.coords;
    if(forceLocation||!coords){
      const pos=await v113Geolocation();
      coords={latitude:pos.coords.latitude,longitude:pos.coords.longitude};w.coords=coords;
    }
    const params=new URLSearchParams({latitude:String(coords.latitude),longitude:String(coords.longitude),current:'temperature_2m,apparent_temperature,weather_code,is_day',timezone:'auto',forecast_days:'1'});
    const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível consultar o clima agora.');
    const data=await response.json();const current=data.current||{};
    w.temperature=Number(current.temperature_2m);w.apparent=Number(current.apparent_temperature);w.code=Number(current.weather_code);w.isDay=Number(current.is_day??1);w.updatedAt=Date.now();w.status='ready';w.error='';
  }catch(error){w.status='error';w.error=error?.message||'Clima indisponível';}
  v113UpdateWeatherLaunchers();
  return w;
}

function v113CloseWeatherPopover(){document.querySelector('#v113WeatherPopover')?.remove();}

async function v113OpenWeather(button,force=false){
  v113CloseWeatherPopover();
  if(force||state.weatherV113.status!=='ready')await v113RefreshWeather(force);
  const w=state.weatherV113;
  const pop=document.createElement('div');pop.id='v113WeatherPopover';pop.className='v113-weather-popover';
  const hasTemp=w.temperature!=null&&Number.isFinite(Number(w.temperature));
  const hasApparent=w.apparent!=null&&Number.isFinite(Number(w.apparent));
  const temp=hasTemp?`${Math.round(Number(w.temperature))}°C`:'--';
  const apparent=hasApparent?`${Math.round(Number(w.apparent))}°C`:'--';
  const updated=w.updatedAt?new Date(w.updatedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'--:--';
  pop.innerHTML=w.status==='ready'?`<div class="v113-weather-pop-head"><span class="v113-weather-big ${v113WeatherTone(w.code,w.isDay)}">${v113WeatherGlyph(w.code,w.isDay,29)}</span><div><small>CLIMA AGORA</small><strong>${temp}</strong></div></div><p>${esc(v113WeatherDescription(w.code))}</p><div class="v113-weather-details"><span>Sensação <b>${apparent}</b></span><span>Atualizado <b>${updated}</b></span></div><button type="button" data-weather-refresh>Atualizar</button>`:`<div class="v113-weather-error"><strong>Clima local</strong><p>${esc(w.error||'Toque em atualizar e permita o acesso à localização.')}</p><button type="button" data-weather-refresh>Ativar / atualizar</button></div>`;
  document.body.append(pop);
  const rect=button.getBoundingClientRect();const width=Math.min(286,window.innerWidth-24);const left=Math.max(12,Math.min(window.innerWidth-width-12,rect.right-width));
  pop.style.width=`${width}px`;pop.style.left=`${left}px`;pop.style.top=`${Math.min(window.innerHeight-pop.offsetHeight-12,rect.bottom+10)}px`;
  pop.querySelector('[data-weather-refresh]')?.addEventListener('click',async()=>{await v113RefreshWeather(true);v113OpenWeather(button,false);});
  setTimeout(()=>document.addEventListener('pointerdown',v113WeatherOutside,{once:true}),0);
}
function v113WeatherOutside(event){if(!event.target.closest?.('#v113WeatherPopover')&&!event.target.closest?.('[data-weather-v113]'))v113CloseWeatherPopover();}

async function v113AutoWeather(){
  try{
    if(navigator.permissions?.query){
      const permission=await navigator.permissions.query({name:'geolocation'});
      if(permission.state==='granted')await v113RefreshWeather(false);
      permission.addEventListener?.('change',()=>{if(permission.state==='granted')v113RefreshWeather(true);});
    }
  }catch{}
}

function v113DecorateFlow(){
  const record=currentRecord();
  const calc=calculateRecord(record,state.schedule);
  const count=(record?.punches||[]).length;
  document.querySelectorAll('.workday-flow').forEach(flow=>{
    flow.classList.add('v113-flow');
    const links=[...flow.querySelectorAll('.flow-link')];
    links.forEach(link=>link.classList.remove('v112-next-link','v113-link-done','v113-link-next','v113-link-all-done'));
    if(calc.complete){
      links.forEach(link=>link.classList.add('v113-link-all-done'));
    }else{
      links.forEach((link,index)=>{
        if(count>=index+2)link.classList.add('v113-link-done');
        else if(count>0&&index===Math.min(links.length-1,count-1))link.classList.add('v113-link-next');
      });
    }
    flow.querySelectorAll('.flow-step').forEach((step,index)=>step.style.setProperty('--v113-delay',`${index*.31}s`));
  });
}

function v113RefreshUi(){v113DecorateFlow();v113InstallWeatherLauncher();}
const v113RenderViewBefore=renderView;
renderView=function(){const result=v113RenderViewBefore();queueMicrotask(v113RefreshUi);return result;};

window.addEventListener('pageshow',()=>setTimeout(v113RefreshUi,35));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){setTimeout(v113RefreshUi,35);v113RefreshWeather(false);}});
setInterval(()=>{if(document.visibilityState==='visible'&&state.profile)v113RefreshWeather(false);},10*60*1000);
setTimeout(()=>{v113RefreshUi();v113AutoWeather();},180);
