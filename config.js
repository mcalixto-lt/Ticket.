/* Configuração pública. Client IDs OAuth identificam o app e não são senhas.
   O googleClientId é resolvido em tempo de execução pelo servidor:
   usa a variável de ambiente GOOGLE_CLIENT_ID (painel do Render);
   se ausente, usa o valor padrão embutido no servidor.
   O ID válido termina em .apps.googleusercontent.com */
window.TICKET_CONFIG={
  aiEndpoint:'/api/chat',
  googleClientId:'__GOOGLE_CLIENT_ID__',
  microsoftClientId:'__MICROSOFT_CLIENT_ID__',
  microsoftTenant:'common'
};
