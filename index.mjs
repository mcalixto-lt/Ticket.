import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const app=express();
app.set('trust proxy',1);
app.use(express.json({limit:'300kb'}));

const PORT=Number(process.env.PORT||10000);
const SMART_MODEL=process.env.GEMINI_MODEL||'gemini-3.5-flash';
const FAST_MODEL=process.env.GEMINI_FAST_MODEL||'gemini-3.1-flash-lite';
const SEARCH_MODEL=process.env.GEMINI_SEARCH_MODEL||'gemini-2.5-flash-lite';
const WEB_SEARCH_ENABLED=String(process.env.GEMINI_WEB_SEARCH||'true').toLowerCase()!=='false';
const explicitOrigins=String(process.env.ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);
const usage=new Map();
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY||''});
const WEB_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

/* Lê a versão publicada para /health e o log de inicialização (não hardcoded). */
let APP_VERSION='1.0.0';
try{APP_VERSION=JSON.parse(readFileSync(path.join(WEB_ROOT,'version.json'),'utf8')).version||APP_VERSION;}catch{}

function originAllowed(origin='',host=''){
  if(!origin)return true;
  try{if(new URL(origin).host===host)return true;}catch{}
  if(explicitOrigins.includes(origin))return true;
  if(/^https:\/\/ticket-app(?:-[a-z0-9-]+)?\.onrender\.com$/i.test(origin))return true;
  if(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin))return true;
  return false;
}

app.use((req,res,next)=>{
  const origin=req.headers.origin||'';
  const allowed=originAllowed(origin,req.headers.host||'');
  if(origin&&allowed)res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');
  if(req.method==='OPTIONS')return allowed?res.sendStatus(204):res.sendStatus(403);
  if(origin&&!allowed)return res.status(403).json({error:'Origem não autorizada.'});
  next();
});

function rateLimit(req,res,next){
  const key=req.ip||req.socket.remoteAddress||'unknown';
  const now=Date.now();
  const windowMs=10*60*1000;
  const max=60;
  const item=usage.get(key)||{start:now,count:0};
  if(now-item.start>windowMs){item.start=now;item.count=0;}
  item.count++;usage.set(key,item);
  if(item.count>max)return res.status(429).json({error:'Muitas solicitações. Aguarde alguns minutos.'});
  next();
}

function errorStatus(error){
  const raw=Number(error?.status||error?.code||0);
  return Number.isFinite(raw)?raw:0;
}

function normalizeText(value=''){
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}

function needsWebSearch(message=''){
  const q=normalizeText(message);
  return /\b(hoje|amanha|agora|neste momento|tempo|clima|previsao|noticia|noticias|ultima|ultimas|ultimo|ultimos|atual|atuais|recente|recentes|placar|resultado|jogo|partida|cotacao|cambio|dolar|euro|bitcoin|preco|precos|valor atual|transito|voo|aeroporto|agenda|horario|feriado|presidente atual|governador atual|prefeito atual|pesquise|pesquisar|procure|buscar|busque|internet|web|site|fonte|fontes|link|links)\b/.test(q);
}

function isComplex(message=''){
  const q=normalizeText(message);
  return String(message).length>1800||/\b(analise profundamente|analise detalhada|debug|depure|arquitetura|refatore|refatorar|codigo completo|estrategia detalhada|compare detalhadamente|plano completo)\b/.test(q);
}

function modelConfig(model,systemInstruction,{useWeb=false,complex=false}={}){
  const config={systemInstruction,maxOutputTokens:complex?1700:900};
  if(/^gemini-3/i.test(model))config.thinkingConfig={thinkingLevel:complex?ThinkingLevel.MEDIUM:ThinkingLevel.LOW};
  else if(/^gemini-2\.5/i.test(model))config.thinkingConfig={thinkingBudget:complex?384:0};
  if(useWeb)config.tools=[{googleSearch:{}}];
  return config;
}

function extractSources(response){
  const chunks=response?.candidates?.[0]?.groundingMetadata?.groundingChunks||[];
  const seen=new Set();const sources=[];
  for(const chunk of chunks){
    const web=chunk?.web;
    if(!web?.uri||seen.has(web.uri))continue;
    seen.add(web.uri);sources.push({title:String(web.title||'Fonte'),url:String(web.uri)});
    if(sources.length>=5)break;
  }
  return sources;
}

async function askGemini(model,prompt,systemInstruction,options={}){
  return ai.models.generateContent({model,contents:prompt,config:modelConfig(model,systemInstruction,options)});
}

app.get('/health',(req,res)=>res.json({
  ok:true,
  service:'ticket-app-ai',
  provider:'gemini',
  smartModel:SMART_MODEL,
  fastModel:FAST_MODEL,
  searchModel:SEARCH_MODEL,
  webSearch:WEB_SEARCH_ENABLED,
  configured:Boolean(process.env.GEMINI_API_KEY),
  mode:'general-web-assistant',
  version:APP_VERSION
}));

app.post('/api/chat',rateLimit,async(req,res)=>{
  if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:'GEMINI_API_KEY não configurada no servidor.',code:'gemini_not_configured'});
  const message=String(req.body?.message||'').trim();
  if(!message)return res.status(400).json({error:'Mensagem vazia.'});
  if(message.length>6000)return res.status(400).json({error:'Mensagem muito longa.'});

  const history=Array.isArray(req.body?.history)?req.body.history.slice(-10):[];
  const context=req.body?.context||{};
  const transcript=history.map(item=>`${item.role==='assistant'?'Assistente':'Usuário'}: ${String(item.content||'').slice(0,1400)}`).join('\n');
  const useWeb=WEB_SEARCH_ENABLED&&(Boolean(req.body?.forceWeb)||needsWebSearch(message));
  const complex=isComplex(message);
  const localDateTime=String(context.localDateTime||'');
  const timeZone=String(context.timeZone||'');

  const systemInstruction=`Você é o Assistente Ticket. IA, um assistente geral. Responda diretamente ao pedido do usuário e ajude em qualquer tarefa legítima: dúvidas gerais, tecnologia, informática, programação, redes, hardware, software, textos, cálculos, estudos, planejamento, produtividade, ideias, organização e troubleshooting. Não limite a conversa ao Ticket. Quando o assunto for o aplicativo Ticket., use conhecimento especializado sobre registro de ponto, comprovantes, fotos, jornada, saldo, fechamento, banco de horas, calendário, relatórios e armazenamento. Responda em português do Brasil salvo pedido contrário. Seja objetivo, resolutivo e não invente fatos ou ações. Quando a pergunta exigir informação atual e a Pesquisa Google estiver habilitada, use-a. Se faltar um dado essencial, faça apenas a pergunta necessária. Não peça senha, token, chave secreta ou credencial. Data/hora do aparelho: ${localDateTime||'não informada'}; fuso: ${timeZone||'não informado'}.`;
  const prompt=`${transcript?`Histórico recente:\n${transcript}\n\n`:''}Mensagem atual: ${message}`;

  const plans=[];
  if(useWeb){
    plans.push({model:SEARCH_MODEL,useWeb:true,complex:false,label:'search'});
    plans.push({model:FAST_MODEL,useWeb:false,complex:false,label:'fast-fallback'});
  }else if(complex){
    plans.push({model:SMART_MODEL,useWeb:false,complex:true,label:'smart'});
    if(SMART_MODEL!==FAST_MODEL)plans.push({model:FAST_MODEL,useWeb:false,complex:false,label:'fast-fallback'});
  }else{
    plans.push({model:FAST_MODEL,useWeb:false,complex:false,label:'fast'});
    if(FAST_MODEL!==SMART_MODEL)plans.push({model:SMART_MODEL,useWeb:false,complex:false,label:'smart-fallback'});
  }

  const attempts=[];let lastError=null;
  for(const plan of plans){
    const started=Date.now();
    try{
      const response=await askGemini(plan.model,prompt,systemInstruction,{useWeb:plan.useWeb,complex:plan.complex});
      const answer=String(response.text||'').trim();
      if(!answer)throw Object.assign(new Error('Resposta vazia do modelo.'),{status:502});
      return res.json({answer,provider:'gemini',model:plan.model,usedWeb:plan.useWeb,sources:plan.useWeb?extractSources(response):[],latencyMs:Date.now()-started,mode:'general-web-assistant'});
    }catch(error){
      lastError=error;
      const status=errorStatus(error);
      attempts.push({model:plan.model,web:plan.useWeb,status:status||null,ms:Date.now()-started});
      console.warn('Ticket Gemini plan failed',plan.label,plan.model,status,error?.message||error);
      if(status===401||status===403)break;
    }
  }

  const status=errorStatus(lastError);
  if(status===401||status===403)return res.status(503).json({error:'A chave do Gemini ou o recurso solicitado foi recusado pelo Google.',code:'gemini_auth',attempts});
  if(status===429)return res.status(429).json({error:'O limite gratuito do Gemini foi atingido temporariamente. Tente novamente em alguns instantes.',code:'gemini_quota',attempts});
  return res.status(503).json({error:'O Gemini não respondeu agora. O Ticket tentou automaticamente outra rota.',code:'gemini_unavailable',attempts});
});

const staticOptions={index:false,setHeaders(res,file){
  if(file.endsWith('index.html')||file.endsWith('config.js')||file.endsWith('version.json'))res.setHeader('Cache-Control','no-cache');
  else res.setHeader('Cache-Control','public, max-age=3600');
}};
/* Injeta o Google/Microsoft Client ID (via variável de ambiente) no config.js,
   com fallback para o valor padrão abaixo. Sem env e sem fallback => campo vazio. */
const CONFIG_TEMPLATE_PATH=path.join(WEB_ROOT,'public','config.js');
const DEFAULT_GOOGLE_CLIENT_ID='365915632788-30afd2mv1a9rr42gjfjt9t0mui8tkmuf.apps.googleusercontent.com';
function injectConfig(res){
  let cfg;
  try{cfg=readFileSync(CONFIG_TEMPLATE_PATH,'utf8');}
  catch{cfg='window.TICKET_CONFIG={aiEndpoint:"/api/chat",googleClientId:"",microsoftClientId:"",microsoftTenant:"common"};';}
  const google=String(process.env.GOOGLE_CLIENT_ID||'').trim()||DEFAULT_GOOGLE_CLIENT_ID;
  const msft=String(process.env.MICROSOFT_CLIENT_ID||'').trim();
  cfg=cfg.split('__GOOGLE_CLIENT_ID__').join(google).split('__MICROSOFT_CLIENT_ID__').join(msft);
  res.type('application/javascript');
  res.setHeader('Cache-Control','no-cache');
  res.send(cfg);
}
app.get('/public/config.js',injectConfig);
app.get('/config.js',injectConfig);
app.use('/src',express.static(path.join(WEB_ROOT,'src'),staticOptions));
app.use('/public',express.static(path.join(WEB_ROOT,'public'),staticOptions));
app.get('/app.js',(req,res)=>res.sendFile(path.join(WEB_ROOT,'app.js')));
app.get('/version.json',(req,res)=>{res.setHeader('Cache-Control','no-cache');res.sendFile(path.join(WEB_ROOT,'version.json'));});
app.get(['/','/index.html'],(req,res)=>{res.setHeader('Cache-Control','no-cache');res.sendFile(path.join(WEB_ROOT,'index.html'));});
app.use((req,res,next)=>{
  const hasHiddenSegment=req.path.split('/').some(segment=>segment.startsWith('.'));
  if(req.method==='GET'&&!hasHiddenSegment&&!path.extname(req.path)&&req.accepts('html'))return res.sendFile(path.join(WEB_ROOT,'index.html'));
  next();
});

app.listen(PORT,'0.0.0.0',()=>console.log(`Ticket ${APP_VERSION} listening on ${PORT}; fast ${FAST_MODEL}; search ${SEARCH_MODEL}; smart ${SMART_MODEL}`));
