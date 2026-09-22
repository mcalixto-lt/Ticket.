/* Ticket. 1.0.10 — resposta rápida, pesquisa web automática e fontes */
'use strict';

state.aiForceWeb=Boolean(state.aiForceWeb);

function v110FormatSource(source,index){
  const title=String(source?.title||`Fonte ${index+1}`).trim();
  const url=String(source?.url||'').trim();
  return url?`${index+1}. ${title} — ${url}`:`${index+1}. ${title}`;
}

function v110AppendSources(answer,sources){
  const list=Array.isArray(sources)?sources.filter(s=>s?.url).slice(0,5):[];
  if(!list.length)return answer;
  return `${answer}\n\nFontes consultadas:\n${list.map(v110FormatSource).join('\n')}`;
}

async function v110ChatRequest(text,history,forceWeb=false){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),70000);
  try{
    const response=await fetch(v107AiEndpoint(),{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      signal:controller.signal,
      body:JSON.stringify({
        message:text,
        history,
        forceWeb,
        context:{
          view:state.view,
          version:'1.0.10',
          platform:navigator.userAgent.includes('Android')?'Android':'Web/PWA',
          localDateTime:new Date().toISOString(),
          timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'',
          language:navigator.language||'pt-BR'
        }
      })
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      const error=new Error(data.error||`Falha do Assistente (${response.status})`);
      error.status=response.status;error.data=data;throw error;
    }
    return data;
  }finally{clearTimeout(timeout);}
}

const v110ProfileBase=profileView;
profileView=function(){
  let markup=v110ProfileBase();
  markup=markup.replace('Assistente geral para ajudar no que você precisar.','Assistente geral com pesquisa na internet quando necessário.');
  markup=markup.replace('<button type="button" data-ai-prompt="Quero fazer uma pergunta geral.">Pergunta geral</button>', '<button type="button" data-ai-prompt="Quero fazer uma pergunta geral.">Pergunta geral</button><button type="button" id="aiWebV110" class="v110-web-toggle" title="Forçar pesquisa na internet">🌐 Internet</button>');
  markup=markup.replace('A IA recebe a sua pergunta e um contexto técnico mínimo do aplicativo. Registros, fotos, CPF e credenciais não são enviados automaticamente.','A IA pode pesquisar na internet automaticamente quando a pergunta exigir informação atual. Registros, fotos, CPF e credenciais não são enviados automaticamente.');
  return markup;
};

v107SendAi=async function(message){
  const text=String(message||'').trim();
  if(!text)return;
  const forceWeb=Boolean(state.aiForceWeb);
  state.aiForceWeb=false;
  state.aiMessages.push({role:'user',content:text});
  state.aiMessages.push({role:'assistant',content:forceWeb?'Pesquisando na internet…':'Preparando resposta…',pending:true});
  renderView();

  const slowTimer=setTimeout(()=>v109SetPending('Ainda processando… o servidor gratuito pode estar acordando.'),7000);
  try{
    const history=state.aiMessages.filter(m=>!m.pending).slice(-14).map(({role,content})=>({role,content}));
    let data;
    try{
      data=await v110ChatRequest(text,history,forceWeb);
    }catch(firstError){
      if([502,503,504].includes(Number(firstError.status||0))){
        v109SetPending('Tentando uma rota alternativa…');
        await new Promise(resolve=>setTimeout(resolve,650));
        data=await v110ChatRequest(text,history,forceWeb);
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
    console.warn('Ticket IA 1.0.10:',error,error?.data||'');
    state.aiServiceStatus='offline';
    state.aiMessages=state.aiMessages.filter(m=>!m.pending);
    const backendMessage=String(error?.data?.error||error?.message||'').trim();
    const detail=backendMessage&&backendMessage!=='Failed to fetch'&&backendMessage!=='The user aborted a request.'?backendMessage:'';
    state.aiMessages.push({role:'assistant',content:detail?`Não consegui concluir agora: ${detail}`:v108AiFallback(text)});
  }finally{
    clearTimeout(slowTimer);
    renderView();
  }
};

function v110Bind(){
  if(state.view!=='profile')return;
  document.querySelector('#aiWebV110')?.addEventListener('click',()=>{
    state.aiForceWeb=!state.aiForceWeb;
    const btn=document.querySelector('#aiWebV110');
    if(btn){btn.classList.toggle('active',state.aiForceWeb);btn.textContent=state.aiForceWeb?'🌐 Internet ligada':'🌐 Internet';}
    const input=document.querySelector('#aiFormV107 textarea');
    input?.focus();
    if(state.aiForceWeb)toast('A próxima pergunta vai pesquisar na internet.');
  });
}

const v110RenderBefore=renderView;
renderView=function(){const result=v110RenderBefore();queueMicrotask(v110Bind);return result;};
