'use strict';
maskCpf=function(value=''){const digits=cpfDigits(value);return digits.length===11?`${digits.slice(0,3)}.***.***-${digits.slice(-2)}`:formatCpf(digits);};
paths.info='<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 4 3c-1 1-1 2-1 3M12 18h.01"/>';
paths.device='<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>';
// Reuse the actual settings forms; the menu is identical at every viewport size.
const ticketSettingsSource169=settingsView;
let ticketSettingsSection169='';
const ticketSettingsItems169=[
  ['schedule','Jornada Semanal','Dias de trabalho e horários','clock','#7447cf'],
  ['balance','Saldo anterior','Saldo de horas e folgas','hourglass','#10a981'],
  ['closing','Período de fechamento','Organize o ciclo mensal','calendar','#2e79d9'],
  ['calendar','Calendário','Consulte suas jornadas por data','calendar','#ef8835'],
  ['storage','Armazenamento','Fotos, comprovantes e restauração','cloud','#169fd1'],
  ['device','Aplicativo','Instalação e atualizações','device','#e25c82']
];
settingsView=function(){
  if(ticketSettingsSection169){
    const template=document.createElement('template');template.innerHTML=ticketSettingsSource169();
    const index=ticketSettingsItems169.findIndex(x=>x[0]===ticketSettingsSection169);
    const sourceIndex={schedule:1,balance:2,closing:3,storage:5,device:7}[ticketSettingsSection169];
    const card=template.content.querySelector('.settings-stack')?.children[sourceIndex];
    if(ticketSettingsSection169==='device')card?.querySelector('#settingsLogout')?.closest('article')?.remove();
    if(card){const inner=card.tagName==='DETAILS'?Array.from(card.children).filter(x=>x.tagName!=='SUMMARY').map(x=>x.outerHTML).join(''):card.outerHTML;
      return `${head(ticketSettingsItems169[index][1],'Ajuste suas preferências.')}<div class="settings-stack">${inner}</div>`;}
  }
  return `${head('Mais','Seu perfil, sua jornada e suas preferências.')}<button class="ticket-menu-profile169" data-resource-view="registration">${ticketUserSilhouette()}<span><strong>${esc(state.profile.fullName)}</strong><small>Meu cadastro</small></span>${icon('chev',20)}</button><h3 class="ticket-menu-label169">CONFIGURAÇÕES</h3><div class="ticket-menu169">${ticketSettingsItems169.map(([key,label,description,glyph,color])=>`<button data-ticket-section="${key}" style="--item-color:${color}"><span class="ticket-menu-icon169">${icon(glyph,24)}</span><span><strong>${label}</strong><small>${description}</small></span>${icon('chev',18)}</button>`).join('')}</div><button class="ticket-menu-logout169" data-ticket-logout>Sair da conta</button>`;
};
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-ticket-section],[data-ticket-logout]');if(!button)return;
  if(button.hasAttribute('data-ticket-logout')){ticketSettingsSection169='';logout();return;}
  const section=button.dataset.ticketSection;
  if(section==='storage'){navigate('storage');return;}
  if(section==='calendar'){navigate('calendar');return;}
  ticketSettingsSection169=section;
  history.pushState({ticketApp:true,ticketNavigation162:true,view:'settings',section169:section},'',location.pathname+location.search+'#settings');
  renderView();window.scrollTo(0,0);
});
window.addEventListener('popstate',event=>{ticketSettingsSection169=event.state?.section169||'';if(state.profile&&state.view==='settings')renderView();});
const ticketNavigate169=navigate;
navigate=function(view){if(view==='settings')ticketSettingsSection169='';return ticketNavigate169(view);};
const ticketRender169=renderView;
renderView=function(){
  const result=ticketRender169();
  const actions=document.querySelector('.mobile-brand-actions-v151');
  if(actions&&!actions.querySelector('[data-ticket-profile169]')){
    const button=document.createElement('button');button.className='icon-btn';button.dataset.ticketProfile169='';button.setAttribute('aria-label','Meu cadastro');button.innerHTML=icon('user',24);button.onclick=()=>navigate('registration');actions.append(button);
  }
  if(state.view==='capture'){
    const description=document.querySelector('.v116-main-capture-card .v105-capture-title p');if(description)description.textContent='Enquadre bem a imagem para confirmar o registro.';
    const environment=document.querySelector('.v116-environment-title p');if(environment)environment.textContent='Opcional — evidência complementar.';
  }
  return result;
};
