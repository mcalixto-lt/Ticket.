/* Ticket. 1.0.5 — pequenos ajustes de integração entre as camadas */
'use strict';

const v105StorageBeforeHotfix=storageView;
storageView=function(){return v105StorageBeforeHotfix().replace('id="exportData"','id="exportBackupV105"');};

const v105RenderBeforeHotfix=renderView;
renderView=function(){
  const result=v105RenderBeforeHotfix();
  if(state.view==='storage'){
    document.querySelector('#exportBackupV105')?.addEventListener('click',exportData);
  }
  if(state.view==='reports'){
    const periodSelected=v105ReportPeriod(state.reportMonth||monthKey(todayIso()));
    const accumulated=previousBalance()+accumulatedBalance(state.records,state.schedule,{afterDate:state.balance.referenceDate||'',throughDate:periodSelected.endDate});
    document.querySelectorAll('.v105-report-stats article').forEach(card=>{
      if(card.querySelector('span')?.textContent.trim()==='Saldo total acumulado'){
        const value=card.querySelector('strong');
        if(value){value.textContent=formatDuration(accumulated,{signed:true});value.classList.toggle('negative-text',accumulated<0);value.classList.toggle('positive-text',accumulated>=0);}
      }
    });
  }
  return result;
};
