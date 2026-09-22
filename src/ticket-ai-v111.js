/* Ticket. 1.0.11 — Assistente IA com rota rápida e pré-aquecimento em uso */
'use strict';

state.aiLastWarmV111=state.aiLastWarmV111||0;

async function v111WarmAiFast(force=false){
  const now=Date.now();
  if(!force&&now-Number(state.aiLastWarmV111||0)<240000)return;
  state.aiLastWarmV111=now;
  try{
    const response=await fetch(v109HealthUrl(),{method:'GET',cache:'no-store'});
    const data=await response.json().catch(()=>({}));
    state.aiServiceStatus=response.ok&&data.configured?'online':'error';
  }catch{
    state.aiServiceStatus='offline';
  }
}

function v111AiDirectRequest(text,history,forceWeb=false){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),75000);
  return fetch(v107AiEndpoint(),{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    signal:controller.signal,
    body:JSON.stringify({
      message:text,
      history,
      forceWeb,
      context:{
        view:state.view,
        version:'1.0.11',
        platform:navigator.userAgent.includes('Android')?'Android':'Web/PWA',
        localDateTime:new Date().toISOString(),
        timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'',
        language:navigator.language||'pt-BR'
      }
    })
  }).then(async response=>{
    clearTimeout(timeout);
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      const error=new Error(data.error||`Falha do Assistente (${response.status})`);
      error.status=response.status;error.data=data;throw error;
    }
    return data;
  }).catch(error=>{clearTimeout(timeout);throw error;});
}

v107SendAi=async function(message){
  const text=String(message||'').trim();
  if(!text)return;
  const forceWeb=Boolean(state.aiForceWeb);
  state.aiForceWeb=false;
  state.aiMessages.push({role:'user',content:text});
  state.aiMessages.push({role:'assistant',content:forceWeb?'Pesquisando…':'Pensando…',pending:true});
  renderView();
  const slowTimer=setTimeout(()=>v109SetPending(forceWeb?'Consultando fontes atuais…':'Preparando a resposta…'),6500);
  try{
    const history=state.aiMessages.filter(m=>!m.pending).slice(-10).map(({role,content})=>({role,content}));
    let data;
    try{
      data=await v111AiDirectRequest(text,history,forceWeb);
    }catch(firstError){
      if([502,503,504].includes(Number(firstError.status||0))){
        v109SetPending('Reconectando…');
        await new Promise(resolve=>setTimeout(resolve,450));
        data=await v111AiDirectRequest(text,history,forceWeb);
      }else throw firstError;
    }
    state.aiServiceStatus='online';
    state.aiMessages=state.aiMessages.filter(m=>!m.pending);
    state.aiMessages.push({
      role:'assistant',
      content:v110AppendSources(String(data.answer||'Não recebi uma resposta.'),data.sources),
      usedWeb:Boolean(data.usedWeb),
      model:data.model||''
    });
  }catch(error){
    console.warn('Ticket IA 1.0.11:',error,error?.data||'');
    state.aiServiceStatus='offline';
    state.aiMessages=state.aiMessages.filter(m=>!m.pending);
    const detail=String(error?.data?.error||error?.message||'').trim();
    state.aiMessages.push({role:'assistant',content:detail&&detail!=='Failed to fetch'&&detail!=='The user aborted a request.'?`Não consegui concluir agora: ${detail}`:v108AiFallback(text)});
  }finally{
    clearTimeout(slowTimer);
    renderView();
  }
};

setTimeout(()=>v111WarmAiFast(true),120);
setInterval(()=>{if(document.visibilityState==='visible'&&state.profile)v111WarmAiFast(true);},8*60*1000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')v111WarmAiFast(false);});
