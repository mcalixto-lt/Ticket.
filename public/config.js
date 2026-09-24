/* Configuração pública. Client IDs OAuth identificam o app e não são senhas.
   ---------------------------------------------------------------
   GOOGLE DRIVE (salvar/restaurar dados na nuvem)
   1. Acesse https://console.cloud.google.com (conta Google SUA)
   2. Crie um projeto (ex.: "Ticket").
   3. Em "APIs e serviços" > "Biblioteca": ative "Google Drive API".
   4. Em "Configuração do consentimento" (Identity & API Management):
      escolha público externo; nome: "Ticket"; e-mail de contato; adicione
      a conta Google como USUÁRIO DE TESTE (modo teste = até 10 contas).
   5. Em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0":
      - Tipo: Aplicativo da Web (Web application)
      - Origens JavaScript autorizadas:
          https://SEU-DOMINIO.onrender.com
          http://localhost:10000
      - (URI de redirecionamento: não é obrigatório para este fluxo)
   6. Copie o ID gerado (termina em .apps.googleusercontent.com) e cole
      abaixo no googleClientId.
   --------------------------------------------------------------- */
window.TICKET_CONFIG={
  aiEndpoint:'/api/chat',
  googleClientId:'365915632788-30afd2mv1a9rr42gjfjt9t0mui8tkmuf.apps.googleusercontent.com',
  microsoftClientId:'',
  microsoftTenant:'common'
};