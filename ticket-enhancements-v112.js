/* Ticket. 1.0.12 — calendário com mês completo e animações persistentes */
'use strict';

function v112CalendarMonthLabel(key){
  try{return formatMonthLabel(key);}catch{return key;}
}

calendarView=function(){
  const [y,m]=state.calendarMonth.split('-').map(Number);
  const first=new Date(y,m-1,1,12);
  const last=new Date(y,m,0,12);
  const lead=(first.getDay()+6)%7;
  const cells=[];
  for(let i=0;i<lead;i++)cells.push(null);
  for(let d=1;d<=last.getDate();d++)cells.push(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  while(cells.length%7)cells.push(null);
  const selector=`<label class="v112-calendar-selector" aria-label="Selecionar mês"><span class="v112-calendar-month-label">${esc(v112CalendarMonthLabel(state.calendarMonth))}</span><input id="calMonth" type="month" value="${state.calendarMonth}" aria-label="Selecionar mês"></label>`;
  return `<div class="page-head v112-calendar-head"><div><h2>Calendário</h2><p>Toque em um dia para visualizar as batidas registradas.</p></div>${selector}</div><article class="calendar-card v111-calendar-card"><div class="calendar-week"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div class="calendar-grid">${cells.map(iso=>{
    if(!iso)return'<div></div>';
    const r=state.records.find(x=>x.date===iso);
    const c=r?calculateRecord(r,state.schedule):null;
    const sch=scheduleForDate(iso,state.schedule);
    const dots=[];
    if(r){
      dots.push(`<i class="dot ${c.complete?'complete':'pending'}"></i>`);
      if(c.complete&&c.balanceMinutes>0)dots.push('<i class="dot positive"></i>');
      if(c.complete&&c.balanceMinutes<0)dots.push('<i class="dot negative"></i>');
    }
    return `<button class="day ${!sch.active?'off':''} ${iso===todayIso()?'today':''} ${r?'has-record':''}" data-day="${iso}" aria-label="${formatDateBr(iso)}${r?', possui registro':', sem registro'}"><b>${Number(iso.slice(8))}</b>${r?`<span class="v111-day-count">${(r.punches||[]).length}</span>`:''}<div class="dots">${dots.join('')}</div></button>`;
  }).join('')}</div><div class="v111-calendar-legend"><span><i class="dot complete"></i> Completo</span><span><i class="dot pending"></i> Pendente</span><span><i class="dot positive"></i> Extra</span><span><i class="dot negative"></i> Negativo</span></div></article>`;
};

bindCalendar=function(){
  const month=document.querySelector('#calMonth');
  if(month)month.addEventListener('change',e=>{
    if(!e.target.value)return;
    state.calendarMonth=e.target.value;
    renderView();
  });
  document.querySelectorAll('[data-day]').forEach(btn=>btn.addEventListener('click',()=>v111CalendarDayModal(btn.dataset.day)));
};

function v112DecorateWorkdayFlow(){
  const record=currentRecord();
  const calc=calculateRecord(record,state.schedule);
  const count=(record?.punches||[]).length;
  const activeLink=!calc.complete&&count>0?Math.min(2,count-1):-1;
  document.querySelectorAll('.workday-flow').forEach(flow=>{
    flow.classList.add('v112-flow');
    flow.querySelectorAll('.flow-step').forEach((step,index)=>{
      step.style.setProperty('--v112-flow-delay',`${index*.34}s`);
    });
    flow.querySelectorAll('.flow-link').forEach((link,index)=>{
      link.classList.toggle('v112-next-link',index===activeLink);
    });
  });
}

let v112MotionRaf=0;
function v112RestartMotion(){
  cancelAnimationFrame(v112MotionRaf);
  document.body?.classList.remove('v112-motion');
  v112MotionRaf=requestAnimationFrame(()=>requestAnimationFrame(()=>document.body?.classList.add('v112-motion')));
}

function v112RefreshMotion(){
  v112DecorateWorkdayFlow();
  v112RestartMotion();
}

const v112RenderViewBefore=renderView;
renderView=function(){
  const result=v112RenderViewBefore();
  queueMicrotask(v112RefreshMotion);
  return result;
};

window.addEventListener('pageshow',()=>setTimeout(v112RefreshMotion,40));
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')setTimeout(v112RefreshMotion,50);
});
window.addEventListener('focus',()=>setTimeout(v112RefreshMotion,50));
setTimeout(v112RefreshMotion,120);
