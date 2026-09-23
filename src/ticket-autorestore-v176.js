/* Ticket. 1.0.76 — restauração silenciosa no login, priorizando Google Drive.
   - Banco local vazio + Google configurado + token válido => restaura sozinho.
   - Não mostra nenhuma tela: a restauração manual continua em Configurações → Armazenamento.
   - Nunca sobrescreve dados locais mais novos: só restaura quando o local está vazio. */
'use strict';
(function(){
  if(typeof v107CloudConfig!=='function'||typeof ticketParseBackup!=='function')return;
  let ranFor=null;

  function googleEnabled(){
    try{const c=v107CloudConfig();return Boolean(String(c.googleClientId||'').trim());}
    catch{return false;}
  }
  function localEmpty(){
    return Array.isArray(state.records)&&state.records.length===0
      &&!state.balance?.history?.length
      &&!(state.balance?.bankDaysOff||[]).filter(x=>!x.cancelledAt).length;
  }
  function tokenKey(){return 'ticket.cloudtoken.'+(state.profile?.cpf||'guest');}
  function getStoredToken(){try{return localStorage.getItem(tokenKey())||'';}catch{return'';}}
  function storeToken(t){try{localStorage.setItem(tokenKey(),t||'');}catch{}}

  /* Baixa o backup mais recente da pasta "Ticket" no Drive. */
  async function pullGoogleBackup(token){
    const folder=await v107GoogleFolder(token);
    const file=await ticketGoogleBackupFile(token,folder);
    if(!file)throw new Error('Nenhum backup no Google Drive ainda.');
    const res=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(file.id)+'?alt=media',{headers:{Authorization:'Bearer '+token}});
    if(!res.ok)throw new Error('Falha ao baixar o backup do Google Drive.');
    const blob=await res.blob();
    return ticketParseBackup(new File([blob],ticketCloudFileName,{type:'application/json'}));
  }

  /* Aplica o payload exatamente como a restauração manual faz. */
  async function applyPayload(payload){
    await ticketCommitRestore(payload);
    state.profile=payload.profile;
    state.records=payload.records||[];
    const settings=Object.fromEntries((payload.settings||[]).map(s=>[s.key.slice(payload.profile.cpf.length+1),s.value]));
    state.schedule=settings.schedule||structuredClone(DEFAULT_SCHEDULE);
    state.balance=settings.balance||{minutes:0,history:[]};
    state.closing=settings.closing||{mode:'custom',startDay:16,endDay:15};
    state.holidays=settings.holidays||[];
    setSession(payload.profile.cpf);
    state.view='dashboard';
    renderShell();
    toast('Suas informações foram recuperadas do Google Drive.');
  }

  /* Tenta restauração silenciosa com o token em memória/persistido. Retorna true se fez. */
  async function silentRestore(){
    if(!googleEnabled()||!localEmpty())return false;
    let token=state.cloudTokens?.google||getStoredToken();
    if(!token)return false;
    const payload=await pullGoogleBackup(token);
    if(payload.profile.cpf!==state.profile.cpf)return false; // não é seu backup
    storeToken(token);
    await applyPayload(payload);
    return true;
  }

  /* Gancha no final do login bem-sucedido (depois de carregar o estado local).
     Restauração silenciosa: nada é exibido; a restauração manual fica em Configurações. */
  const originalRenderShell=renderShell;
  renderShell=function(){
    const out=originalRenderShell();
    const cpf=state.profile?.cpf;
    if(cpf&&ranFor!==cpf){
      ranFor=cpf;
      silentRestore().catch(()=>{});
    }
    return out;
  };
})();
