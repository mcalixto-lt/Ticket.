/* Ticket. 1.0.8 — Assistente IA geral com contexto do Ticket */
'use strict';

function v108AiFallback(text){
  const q=String(text||'').toLowerCase();
  if(q.includes('armazen'))return 'A IA online está indisponível no momento. No Ticket., abra Configurações → Recursos do Ticket. → Armazenamento para escolher Local, Google Drive ou OneDrive.';
  if(q.includes('jornada'))return 'A IA online está indisponível no momento. No Ticket., abra Configurações → Jornada semanal para ajustar dias, horários, carga e batidas.';
  if(q.includes('saldo'))return 'A IA online está indisponível no momento. No Ticket., use Configurações → Definir saldo anterior para ajustar o saldo oficial anterior ao sistema.';
  if(q.includes('foto')||q.includes('comprovante'))return 'A IA online está indisponível no momento. Em Registrar ponto, capture o comprovante, informe DATA e HORA e confirme o registro.';
  return 'A IA online está indisponível no momento. Quando a conexão voltar, poderei ajudar com perguntas gerais, tecnologia, textos, cálculos, estudos, planejamento e também com o Ticket.';
}

v107AiFallback=v108AiFallback;

profileView=function(){
  if(!state.aiMessages.length){
    state.aiMessages.push({role:'assistant',content:'Olá! Sou o Assistente Ticket. IA. Posso ajudar com o Ticket. e também com dúvidas gerais, tecnologia, textos, cálculos, estudos, planejamento e outras tarefas.'});
  }
  return `<section class="v107-ai-page"><div class="v107-ai-head"><div><span class="v105-kicker">ASSISTENTE INTELIGENTE</span><h2>Assistente Ticket. IA</h2><p>Um assistente geral com conhecimento especial do Ticket.</p></div><span class="v107-ai-orb">${v107AiGlyph(30)}</span></div><article class="v107-ai-card"><div id="aiMessagesV107" class="v107-ai-messages">${state.aiMessages.slice(-24).map(m=>v107AiBubble(m.role,m.content)).join('')}</div><div class="v107-ai-quick"><button type="button" data-ai-prompt="Me ajude com o Ticket.">Ticket.</button><button type="button" data-ai-prompt="Preciso de ajuda com tecnologia e informática.">Tecnologia</button><button type="button" data-ai-prompt="Me ajude a escrever ou revisar um texto.">Textos</button><button type="button" data-ai-prompt="Quero fazer uma pergunta geral.">Pergunta geral</button></div><form id="aiFormV107" class="v107-ai-form"><textarea name="message" rows="2" maxlength="4000" placeholder="Pergunte o que precisar..." required></textarea><button type="submit" aria-label="Enviar">${v107AiGlyph(20)}<span>Enviar</span></button></form><small class="v107-ai-privacy">A IA recebe a sua pergunta e um contexto técnico mínimo do aplicativo. Registros, fotos, CPF e credenciais não são enviados automaticamente.</small></article></section>`;
};

v107SendAi=async function(message){
  const text=String(message||'').trim();
  if(!text)return;
  state.aiMessages.push({role:'user',content:text});
  renderView();
  state.aiMessages.push({role:'assistant',content:'Pensando…',pending:true});
  renderView();
  try{
    const history=state.aiMessages.filter(m=>!m.pending).slice(-14).map(({role,content})=>({role,content}));
    const res=await fetch(v107AiEndpoint(),{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text,history,context:{view:state.view,version:'1.0.8',platform:navigator.userAgent.includes('Android')?'Android':'Web'}})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||'IA online indisponível');
    state.aiMessages=state.aiMessages.filter(m=>!m.pending);
    state.aiMessages.push({role:'assistant',content:String(data.answer||'Não recebi uma resposta.')});
  }catch(error){
    console.warn('Ticket IA:',error);
    state.aiMessages=state.aiMessages.filter(m=>!m.pending);
    state.aiMessages.push({role:'assistant',content:v108AiFallback(text)});
  }
  renderView();
};
