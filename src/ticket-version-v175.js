/* Ticket. 1.0.75 — aba "Versão" abaixo de "Aplicativo", mostrando a versão atual. */
'use strict';
(function(){
  /* 1) Adiciona a entrada "Versão" ao final do menu de configurações (após "Aplicativo"). */
  try{
    if(typeof ticketSettingsItems169!=='undefined'&&Array.isArray(ticketSettingsItems169)
      &&!ticketSettingsItems169.some(x=>x[0]==='version')){
      ticketSettingsItems169.push(['version','Vers\u00e3o','Vers\u00e3o atual do aplicativo','info','#2e79d9']);
    }
  }catch(e){}

  /* 2) Vers\u00e3o em tempo real, lida do version.json publicado. */
  let versionCache='';
  async function getVersion(){
    if(versionCache)return versionCache;
    try{
      const r=await fetch('public/version.json',{cache:'no-store'});
      if(r.ok){const j=await r.json();if(j&&j.version){versionCache=String(j.version);return versionCache;}}
    }catch(e){}
    return versionCache||'1.0.75';
  }

  /* 3) Quando a se\u00e7\u00e3o \u00e9 "version", renderiza o card com apenas o n\u00famero da vers\u00e3o. */
  const originalSettingsView=window.settingsView;
  window.settingsView=function(){
    try{
      if(typeof ticketSettingsSection169!=='undefined'&&ticketSettingsSection169==='version'){
        return `${head('Vers\u00e3o','Vers\u00e3o atual do aplicativo.')}<div class="settings-stack"><article class="panel" style="text-align:center;padding:34px 18px"><div id="ticketVersionNumber-v175" style="font-size:2.6rem;font-weight:800;color:#7447cf;letter-spacing:1px;line-height:1.1">…</div><small id="ticketVersionNote-v175" style="display:block;margin-top:10px;color:#5b6478">Ticket.</small></article></div>`;
      }
    }catch(e){}
    return originalSettingsView();
  };

  /* 4) Preenche o n\u00famero da vers\u00e3o ap\u00f3s o render. */
  const originalRenderView=window.renderView;
  window.renderView=function(){
    const res=originalRenderView();
    requestAnimationFrame(async()=>{
      const el=document.querySelector('#ticketVersionNumber-v175');
      if(el)el.textContent=await getVersion();
    });
    return res;
  };
})();
