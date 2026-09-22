/* Ticket. 1.0.73 — logout automático após 24h sem interação.
   Marca a última atividade em localStorage e, ao abrir (ou em 24h seguidas
   com a aba aberta sem nenhuma interação), volta para a tela de login. */
'use strict';
(function(){
  const IDLE_MS=24*60*60*1000; // 24 horas
  const KEY='ticketLastActivity';
  let lastTouch=0;
  function now(){return Date.now();}
  function readLast(){let v=0;try{v=Number(localStorage.getItem(KEY))||0;}catch{v=0;}return v;}
  function touch(force){
    const t=now();
    if(!force&&t-lastTouch<30000)return; // throttling para eventos frequentes
    lastTouch=t;
    try{localStorage.setItem(KEY,String(t));}catch{}
  }
  const FREQ=['mousemove','wheel','scroll'];
  const HARD=['mousedown','keydown','touchstart','click'];
  FREQ.forEach(ev=>window.addEventListener(ev,()=>touch(false),{passive:true,capture:true}));
  HARD.forEach(ev=>window.addEventListener(ev,()=>touch(true),{passive:true,capture:true}));

  function expired(){const l=readLast();return l>0&&(now()-l)>IDLE_MS;}
  function doLogout(){
    if(typeof logout==='function'){logout();return;}
    if(typeof clearSession==='function')clearSession();
    if(typeof state!=='undefined'&&state)state.profile=null;
    if(typeof renderAuth==='function')renderAuth('login');
  }
  function check(){
    if(typeof getSession!=='function'||!getSession())return;
    if(expired()){doLogout();try{localStorage.removeItem(KEY);}catch{}}
  }
  // Verifica ao abrir; enquanto a aba ficar 24h sem interação, desloga sozinha.
  check();
  setInterval(check,60000);
})();
