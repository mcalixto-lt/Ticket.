/* Ticket. 1.0.30 — organização das configurações */
'use strict';

function v130ResourcesWithScheduleCard(){
  return `<article class="settings-section-card v130-resources-card">
    <div class="settings-card-head">
      <div>
        <h3>Recursos do Ticket.</h3>
        <p>Gerencie as cópias, o backup e os recursos de configuração da jornada.</p>
      </div>
      <span class="settings-card-icon blue">${v105DatabaseGlyph(22)}</span>
    </div>
    <div class="v105-resource-grid v106-resource-single">
      <button type="button" data-resource-view="storage">
        <span class="resource-icon blue">${v105DatabaseGlyph(21)}</span>
        <strong>Armazenamento</strong>
        <small>Cópias das imagens, backup local e futura sincronização em nuvem.</small>
      </button>
    </div>
    <div class="v130-schedule-inside">
      ${weeklyScheduleCard()}
    </div>
  </article>`;
}

settingsView=function(){
  return `<section class="settings-full">
    <div class="settings-page-intro">
      <span class="settings-kicker">PREFERÊNCIAS</span>
      <h2>Configurações</h2>
      <p>Defina a jornada, o saldo anterior e o período mensal de fechamento. Registros já confirmados permanecem bloqueados.</p>
    </div>
    <div class="settings-stack">
      ${identificationCard()}
      ${v106HowToSettingsCard()}
      ${balanceCard()}
      ${closingCard()}
      ${v130ResourcesWithScheduleCard()}
      ${deviceCards()}
    </div>
  </section>`;
};

const v130BindSettingsBefore=bindSettings;
bindSettings=function(){
  v130BindSettingsBefore();
  document.querySelectorAll('[data-resource-view]').forEach(btn=>{
    const clone=btn.cloneNode(true);
    btn.replaceWith(clone);
    clone.addEventListener('click',()=>navigate(clone.dataset.resourceView));
  });
};
