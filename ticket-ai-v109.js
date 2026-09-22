/* Ticket. 1.0.9 — aquecimento do backend, retry e mensagens de erro úteis */
'use strict';

state.aiServiceStatus=state.aiServiceStatus||'checking';
state.aiLastHealth=state.aiLastHealth||0;

function v109HealthUrl(){return v107AiEndpoint().replace(/\/api\/chat(?:\?.*)?$/,'/health');}

async function v109WarmAi(force=false){
  const now=Date.now();
  if(!force&&now-Number(state.aiLastHealth||0)<120000)return state.aiServiceStatus;
  state.aiLastHealth=now;
  state.aiServiceStatus='checking';
  try{
    const response=await fetch(v109HealthUrl(),{method:'GET',cache:'no-store'});
    const data=await response.json().catch(()=>({}));
    state.aiServiceStatus=response.ok&&data.configured?'online':'error';
  }catch{
    state.aiServiceStatus='offline';
  }
  return state.aiServiceStatus;
}

function v109AiStatusText(){
  if(state.aiServiceStatus==='online')return 'Gemini conectado';
  if(state.aiServiceStatus==='checking')return 'Conectando ao Gemini…';
  if(state.aiServiceStatus==='error')return 'Gemini requer atenção';
  return 'Gemini temporariamente indisponível';
}

const v109ProfileBase=profileView;
profileView=function(){
  const markup=v109ProfileBase();
  queueMicrotask(()=>v109WarmAi(false));
  return markup.replace(
    '<p>Um assistente geral com conhecimento especial do Ticket.</p>',
    `<p>Assistente geral para ajudar no que você precisar. <small class="v109-ai-status">${esc(v109AiStatusText())}</small></p>`
  );
};

function v109SetPending(text){
  const pending=state.aiMessages.findLast?.(m=>m.pending)||[...state.aiMessages].reverse().find(m=>m.pending);
  if(pending){pending.content=text;if(state.view==='profile')renderView();}
}

async function v109ChatRequest(text,history){
  const response=await fetch(v107AiEndpoint(),{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message:text,history,context:{view:state.view,version:'1.0.9',platform:navigator.userAgent.includes('Android')?'Android':'Web/PWA'}})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){
    const error=new Error(data.error||`Falha do Assistente (${response.status})`);
    error.status=response.status;error.data=data;throw error;
  }
  return data;
}

v107SendAi=async function(message){
  const text=String(message||'').trim();
  if(!text)return;
  state.aiMessages.push({role:'user',content:text});
  state.aiMessages.push({role:'assistant',content:'Conectando ao Gemini…',pending:true});
  renderView();

  const slowTimer=setTimeout(()=>v109SetPending('Acordando o assistente e preparando a resposta…'),4500);
  try{
    await v109WarmAi(false);
    const history=state.aiMessages.filter(m=>!m.pending).slice(-16).map(({role,content})=>({role,content}));
    let data;
    try{
      data=await v109ChatRequest(text,history);
    }catch(firstError){
      if([502,503,504].includes(Number(firstError.status||0))){
        v109SetPending('Tentando novamente com o Gemini…');
        await new Promise(resolve=>setTimeout(resolve,1600));
        data=await v109ChatRequest(text,history);
      }else throw firstError;
    }
    state.aiServiceStatus='online';
    state.aiMessages=state.aiMessages.filter(m=>!m.pending);
    state.aiMessages.push({role:'assistant',content:String(data.answer||'Não recebi uma resposta.')});
  }catch(error){
    console.warn('Ticket IA 1.0.9:',error,error?.data||'');
    state.aiServiceStatus='offline';
    state.aiMessages=state.aiMessages.filter(m=>!m.pending);
    const backendMessage=String(error?.data?.error||error?.message||'').trim();
    const detail=backendMessage&&backendMessage!=='Failed to fetch'?backendMessage:'';
    state.aiMessages.push({role:'assistant',content:detail?`Não consegui consultar o Gemini agora: ${detail}`:v108AiFallback(text)});
  }finally{
    clearTimeout(slowTimer);
    renderView();
  }
};

setTimeout(()=>v109WarmAi(true),1200);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')v109WarmAi(false);});
