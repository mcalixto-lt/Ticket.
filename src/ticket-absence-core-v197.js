/* Ticket. 1.0.97 — cálculo de ausências e regra informada da empresa. */
'use strict';
const TICKET_ABSENCE_TRAVEL_V197=30;
function ticketAbsenceMinuteV197(time){
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(time||'')))return null;
  const [h,m]=time.split(':').map(Number);return h*60+m;
}
function ticketAbsenceTimeV197(minutes){return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
function ticketAbsenceUnionV197(intervals){
  const sorted=intervals.filter(x=>x&&Number.isFinite(x[0])&&Number.isFinite(x[1])&&x[1]>x[0]).map(x=>[...x]).sort((a,b)=>a[0]-b[0]);
  const out=[];for(const x of sorted){const last=out.at(-1);if(last&&x[0]<=last[1])last[1]=Math.max(last[1],x[1]);else out.push(x);}return out;
}
function ticketAbsenceSubtractV197(intervals,excluded){
  let result=ticketAbsenceUnionV197(intervals);
  for(const [a,b] of ticketAbsenceUnionV197(excluded))result=result.flatMap(([s,e])=>b<=s||a>=e?[[s,e]]:[[s,Math.min(e,a)],[Math.max(s,b),e]].filter(x=>x[1]>x[0]));
  return result;
}
function ticketAbsenceIntersectV197(first,second){return ticketAbsenceUnionV197(first.flatMap(([a,b])=>second.map(([c,d])=>[Math.max(a,c),Math.min(b,d)])));}
function ticketAbsenceLengthV197(intervals){return ticketAbsenceUnionV197(intervals).reduce((n,[a,b])=>n+b-a,0);}
function ticketAbsenceActiveV197(record){return(record?.absences||[]).filter(a=>!a.cancelledAt);}
function ticketAbsenceScheduleV197(record,day){
  const saved=record?.absenceSchedule||{};
  const start=ticketAbsenceMinuteV197(day.entryTime||'08:00');
  const end=ticketAbsenceMinuteV197(day.exitTime||(Number(day.requiredPunches)===2?'12:00':'18:00'));
  const breakStart=ticketAbsenceMinuteV197(saved.breakStart||day.lunchTime||'12:00');
  const breakEnd=ticketAbsenceMinuteV197(saved.breakEnd||day.returnTime||'14:00');
  return{start,end,breakStart,breakEnd,hasBreak:Number(day.requiredPunches)!==2&&Number(day.requiredPunches)!==0};
}
function ticketAbsenceReturnV197(absence,record){
  const captured=absence.origin==='home'
    ?(record.punches||[]).filter(p=>p.type==='entry')
    :(record.absencePunches||[]).filter(p=>p.absenceId===absence.id&&p.type==='medical_return');
  const end=ticketAbsenceMinuteV197(absence.appointmentEnd);
  const suitable=captured.map(p=>ticketAbsenceMinuteV197(p.time)).filter(m=>m!==null&&(end===null||m>=end)).sort((a,b)=>a-b);
  return suitable[0]??ticketAbsenceMinuteV197(absence.workReturn);
}
function ticketAbsenceValidateV197(record,evidenceIds){
  if(record.absences!==undefined&&!Array.isArray(record.absences))throw Error('Ausências inválidas.');
  if(record.absencePunches!==undefined&&!Array.isArray(record.absencePunches))throw Error('Retornos de ausência inválidos.');
  const ids=new Set();
  for(const a of record.absences||[]){
    if(!a||typeof a.id!=='string'||!a.id||ids.has(a.id)||!['declaration','certificate'].includes(a.documentType)||!['home','work'].includes(a.origin)||typeof a.applyCredit!=='boolean'||typeof a.fullDay!=='boolean')throw Error('Registro de ausência inválido.');
    ids.add(a.id);
    if(typeof a.evidenceId!=='string'||!a.evidenceId||(evidenceIds&&!evidenceIds.has(a.evidenceId)))throw Error('Foto do documento de ausência não encontrada.');
    if(a.travelBefore!==30||a.travelAfter!==30||a.policySource!=='company-informed')throw Error('Regra de deslocamento inválida.');
    if(a.fullDay&&a.documentType!=='certificate')throw Error('Afastamento do dia inteiro exige atestado.');
    if(!a.fullDay){
      const s=ticketAbsenceMinuteV197(a.appointmentStart),e=ticketAbsenceMinuteV197(a.appointmentEnd);
      if(s===null||e===null||e<=s)throw Error('Informe horários válidos de entrada e saída do atendimento, no mesmo dia.');
      if(a.origin==='work'&&(ticketAbsenceMinuteV197(a.workExit)===null||ticketAbsenceMinuteV197(a.workExit)>s))throw Error('Informe a saída do trabalho antes do atendimento.');
      if(a.workReturn&&(ticketAbsenceMinuteV197(a.workReturn)===null||ticketAbsenceMinuteV197(a.workReturn)<e))throw Error('O retorno ao trabalho deve ser posterior ao atendimento.');
    }
  }
  if(record.absenceSchedule){
    const s=ticketAbsenceMinuteV197(record.absenceSchedule.breakStart),e=ticketAbsenceMinuteV197(record.absenceSchedule.breakEnd);
    if(s===null||e===null||e<=s)throw Error('Informe um intervalo de almoço válido.');
  }
  const punchIds=new Set();
  for(const p of record.absencePunches||[]){
    if(!p||p.type!=='medical_return'||typeof p.id!=='string'||punchIds.has(p.id)||!ids.has(p.absenceId)||ticketAbsenceMinuteV197(p.time)===null||!p.evidenceId||(evidenceIds&&!evidenceIds.has(p.evidenceId)))throw Error('Comprovante de retorno da ausência inválido.');
    const a=record.absences.find(a=>a.id===p.absenceId);
    if(a.origin!=='work'||ticketAbsenceMinuteV197(p.time)<ticketAbsenceMinuteV197(a.appointmentEnd))throw Error('Retorno anterior ao atendimento.');
    punchIds.add(p.id);
  }
  return record;
}
function ticketAbsenceCalculateV197(record,day){
  const expected=Math.max(0,Number(day.expectedMinutes||0)),required=Number(day.requiredPunches||0);
  const sch=ticketAbsenceScheduleV197(record,day);
  if(sch.start===null||sch.end===null||sch.end<=sch.start)return{complete:false,workedMinutes:0,creditedMinutes:0,balanceMinutes:null,expectedMinutes:expected,requiredPunches:required,status:'Confira a jornada configurada',absenceMinutes:0};
  const active=ticketAbsenceActiveV197(record),attendance=record.absences||[],map=Object.fromEntries((record.punches||[]).map(p=>[p.type,ticketAbsenceMinuteV197(p.time)]));
  const actualBreak=map.lunch!=null&&map.return!=null&&map.return>=map.lunch?[[map.lunch,map.return]]:[];
  const plannedBreak=sch.hasBreak?[[sch.breakStart,sch.breakEnd]]:[];
  const paid=ticketAbsenceSubtractV197([[sch.start,sch.end]],actualBreak.length?actualBreak:plannedBreak);
  let work=[],valid=true,closed=false;
  if(map.entry!=null&&map.exit!=null){
    if(map.exit<map.entry)valid=false;
    if(map.lunch!=null||map.return!=null){
      if(map.lunch==null||map.return==null||map.lunch<map.entry||map.return<map.lunch||map.exit<map.return)valid=false;
      else work=[[map.entry,map.lunch],[map.return,map.exit]];
    }else work=[[map.entry,map.exit]];
    closed=valid;
  }else{
    if(map.entry!=null&&map.lunch!=null&&map.lunch>=map.entry)work.push([map.entry,map.lunch]);
    if(map.return!=null&&map.exit!=null&&map.exit>=map.return)work.push([map.return,map.exit]);
  }
  const away=[];let pendingReturn=false;
  for(const a of attendance){
    if(a.fullDay)continue;
    const back=ticketAbsenceReturnV197(a,record);
    const from=a.origin==='home'?sch.start:ticketAbsenceMinuteV197(a.workExit);
    if(back===null){pendingReturn=true;if(a.origin==='work'&&map.exit!=null&&from!=null)away.push([from,map.exit]);}
    else if(from!==null)away.push([from,back]);
  }
  // Missing meal punches can be skipped only when no worked interval crosses
  // the expected meal: late arrival, early finish, or lunch entirely in absence.
  work=ticketAbsenceSubtractV197(work,away);
  if(closed&&sch.hasBreak&&!actualBreak.length&&ticketAbsenceLengthV197(ticketAbsenceIntersectV197(work,plannedBreak))>0){valid=false;closed=false;}
  const worked=ticketAbsenceLengthV197(work);
  const coverage=[];let appointment=0;
  for(const a of active){
    if(a.fullDay){if(a.applyCredit)coverage.push([sch.start,sch.end]);continue;}
    const start=ticketAbsenceMinuteV197(a.appointmentStart),end=ticketAbsenceMinuteV197(a.appointmentEnd);
    appointment+=end-start;
    if(a.applyCredit)coverage.push([Math.max(0,start-a.travelBefore),Math.min(1440,end+a.travelAfter)]);
  }
  // Only scheduled time actually not worked is creditable. Interval union and
  // the daily deficit cap prevent duplicate documents and credited overtime.
  const notWorked=ticketAbsenceSubtractV197(paid,work);
  const eligible=ticketAbsenceIntersectV197(coverage,notWorked);
  const credited=Math.min(ticketAbsenceLengthV197(eligible),Math.max(0,expected-worked));
  const fullDay=attendance.some(a=>a.fullDay)&&!record.punches?.length;
  const complete=required>0&&((closed&&!pendingReturn)||fullDay);
  return{complete,workedMinutes:worked,creditedMinutes:credited,accountedMinutes:worked+credited,absenceMinutes:attendance.some(a=>a.fullDay)&&!record.punches?.length?ticketAbsenceLengthV197(paid):ticketAbsenceLengthV197(ticketAbsenceIntersectV197(away,paid)),appointmentMinutes:appointment,expectedMinutes:expected,requiredPunches:closed&&valid&&!actualBreak.length?2:required,balanceMinutes:complete?worked+credited-expected:null,uncoveredMinutes:Math.max(0,expected-worked-credited),status:complete?'Completo':pendingReturn?'Aguardando retorno':!valid?'Confira as batidas de almoço':'Em andamento'};
}
