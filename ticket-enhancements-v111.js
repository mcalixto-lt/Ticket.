/* Ticket. 1.0.11 — calendário detalhado, conclusão de jornada, saldo removível e fluxo animado */
'use strict';

state.calendarSelectedDate = state.calendarSelectedDate || '';

function v111ModalRoot(){
  let root=document.querySelector('#v111ModalRoot');
  if(!root){
    root=document.createElement('div');
    root.id='v111ModalRoot';
    document.body.append(root);
  }
  return root;
}

function v111CloseModal(){
  const root=document.querySelector('#v111ModalRoot');
  if(root){ root.classList.remove('open'); root.innerHTML=''; }
}

function v111OpenModal(content,extraClass=''){
  const root=v111ModalRoot();
  root.className=`v111-modal-root open ${extraClass}`.trim();
  root.innerHTML=`<div class="v111-modal-backdrop" data-v111-close></div><section class="v111-modal-card" role="dialog" aria-modal="true">${content}</section>`;
  root.querySelectorAll('[data-v111-close]').forEach(el=>el.addEventListener('click',v111CloseModal));
}

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#v111ModalRoot.open'))v111CloseModal();});

function v111PunchLabel(type){
  if(typeof v105PunchLabel==='function')return v105PunchLabel(type);
  return PUNCH_TYPES.find(p=>p.key===type)?.label||'Ponto';
}

function v111CalendarDayModal(iso){
  const record=state.records.find(r=>r.date===iso);
  const schedule=record?.scheduleSnapshot||scheduleForDate(iso,state.schedule);
  const calc=record?calculateRecord(record,state.schedule):null;
  const title=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date(`${iso}T12:00:00`));
  const punches=[...(record?.punches||[])].sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  const rows=punches.length?punches.map((p,i)=>`<div class="v111-day-punch"><span class="v111-day-order">${i+1}ª</span><span class="v111-day-glyph ${esc(p.type||'')}">${icon(p.type==='entry'?'entry':p.type==='lunch'?'lunch':p.type==='return'?'return':'exit',18)}</span><div><small>${esc(v111PunchLabel(p.type))}</small><strong>${esc(p.time||'--:--')}</strong></div><span class="v111-day-lock">${typeof lockGlyph==='function'?lockGlyph(13):''} Bloqueado</span></div>`).join(''):`<div class="v111-day-empty">${icon('calendar',25)}<strong>Sem registro neste dia</strong><span>${schedule.active?'Nenhuma batida foi registrada.':'Dia configurado como folga.'}</span></div>`;
  const summary=record?`<div class="v111-day-summary"><div><small>Status</small><strong>${esc(calc.status)}</strong></div><div><small>Total trabalhado</small><strong>${formatDuration(calc.workedMinutes)}</strong></div><div><small>Saldo do dia</small><strong class="${calc.balanceMinutes==null?'':calc.balanceMinutes>=0?'positive':'negative'}">${calc.balanceMinutes==null?'--h--':formatDuration(calc.balanceMinutes,{signed:true})}</strong></div></div>`:'';
  v111OpenModal(`<header class="v111-modal-head"><div><span class="v111-modal-kicker">REGISTRO DO DIA</span><h3>${esc(title)}</h3><p>Confira as batidas registradas e bloqueadas desta data.</p></div><button type="button" class="v111-modal-x" data-v111-close aria-label="Fechar">×</button></header>${rows}${summary}<div class="v111-modal-actions"><button type="button" class="secondary" data-v111-close>Fechar</button>${record?'<button type="button" class="primary" id="v111GoRecords">Abrir Registros</button>':''}</div>`,'calendar-detail');
  document.querySelector('#v111GoRecords')?.addEventListener('click',()=>{v111CloseModal();navigate('records');});
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
  const selector=`<div class="v111-calendar-selector"><input id="calMonth" class="input-compact" type="month" value="${state.calendarMonth}" aria-label="Selecionar mês"></div>`;
  return `${head('Calendário','Toque em um dia para visualizar as batidas registradas.',selector)}<article class="calendar-card v111-calendar-card"><div class="calendar-week"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div class="calendar-grid">${cells.map(iso=>{
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
  if(month)month.onchange=e=>{if(e.target.value){state.calendarMonth=e.target.value;renderView();}};
  document.querySelectorAll('[data-day]').forEach(btn=>btn.addEventListener('click',()=>v111CalendarDayModal(btn.dataset.day)));
};

function v111JourneyCompleteModal(record){
  const calc=calculateRecord(record,state.schedule);
  v111OpenModal(`<div class="v111-complete-hero"><span class="v111-complete-icon">${icon('target',34)}</span><span class="v111-spark s1">✦</span><span class="v111-spark s2">✧</span><span class="v111-spark s3">✦</span><h3>Parabéns!</h3><p>Você concluiu sua jornada de hoje, bom descanso!</p><div class="v111-complete-summary"><div><small>Total trabalhado</small><strong>${formatDuration(calc.workedMinutes)}</strong></div><div><small>Saldo do dia</small><strong class="${calc.balanceMinutes>=0?'positive':'negative'}">${formatDuration(calc.balanceMinutes||0,{signed:true})}</strong></div></div><button type="button" class="primary" data-v111-close>Concluir</button></div>`,'journey-complete');
}

const v111SubmitCaptureBefore=submitCapture;
submitCapture=async function(event){
  const form=event.currentTarget;
  const data=Object.fromEntries(new FormData(form));
  const date=String(data.date||document.querySelector('#captureDateV105')?.value||todayIso());
  const before=state.records.find(r=>r.date===date);
  const beforeCount=(before?.punches||[]).length;
  await v111SubmitCaptureBefore(event);
  const after=state.records.find(r=>r.date===date);
  const afterCount=(after?.punches||[]).length;
  if(state.view!=='dashboard'&&after&&afterCount>beforeCount&&date===todayIso()&&calculateRecord(after,state.schedule).complete){
    setTimeout(()=>v111JourneyCompleteModal(after),120);
  }
};

const v111BalanceCardBefore=balanceCard;
balanceCard=function(){
  let html=v111BalanceCardBefore();
  const hasPrevious=Boolean(state.balance.referenceDate||state.balance.note||Number(state.balance.minutes||0)!==0);
  if(!hasPrevious)return html;
  const button=`<button type="button" id="deletePreviousBalanceV111" class="v111-delete-balance">${icon('trash',17)} Excluir Saldo Anterior</button>`;
  return html.replace('</article>',`${button}</article>`);
};

async function v111DeletePreviousBalance(){
  const previous=Number(state.balance.minutes||0);
  const history=[...(state.balance.history||[]),{
    minutes:0,
    previousMinutes:previous,
    referenceDate:'',
    note:'Saldo anterior excluído',
    deleted:true,
    changedAt:new Date().toISOString()
  }];
  state.balance={minutes:0,referenceDate:'',note:'',history};
  await saveSetting(state.profile.cpf,'balance',state.balance);
  v111CloseModal();
  toast('Saldo anterior excluído. O saldo agora considera apenas os registros do Ticket.');
  renderView();
}

function v111ConfirmDeleteBalance(){
  v111OpenModal(`<header class="v111-modal-head"><div><span class="v111-modal-kicker danger-text">SALDO ANTERIOR</span><h3>Excluir saldo anterior?</h3><p>O valor informado anteriormente deixará de participar do cálculo. O saldo passará a considerar somente os registros feitos no Ticket. até que você defina outro saldo anterior.</p></div><button type="button" class="v111-modal-x" data-v111-close aria-label="Fechar">×</button></header><div class="v111-modal-actions"><button type="button" class="secondary" data-v111-close>Cancelar</button><button type="button" class="v111-danger-btn" id="v111ConfirmDeleteBalance">${icon('trash',17)} Excluir Saldo Anterior</button></div>`,'balance-delete');
  document.querySelector('#v111ConfirmDeleteBalance')?.addEventListener('click',v111DeletePreviousBalance);
}

const v111BindSettingsBefore=bindSettings;
bindSettings=function(){
  v111BindSettingsBefore();
  document.querySelector('#deletePreviousBalanceV111')?.addEventListener('click',v111ConfirmDeleteBalance);
};

function v111DecorateFlow(){
  document.querySelectorAll('.workday-flow').forEach(flow=>{
    flow.classList.add('v111-flow');
    flow.querySelectorAll('.flow-step').forEach((step,index)=>step.style.setProperty('--v111-delay',`${index*.38}s`));
  });
}
const v111RenderViewBefore=renderView;
renderView=function(){
  const result=v111RenderViewBefore();
  queueMicrotask(v111DecorateFlow);
  return result;
};
