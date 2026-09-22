/* Ticket. v1.0.75 — Pacote de publicação na internet */

Este pacote é um sistema web limpo, SEM dados pessoais, pronto para publicar.

Conteúdo:
- app.js, index.html, package.json, render.yaml, version.json, .gitignore
- public/  (sw.js, manifest.webmanifest, config.js, favicon.png, app-icon-v174.png, ícones)
- server/  (index.mjs — Express + IA Gemini)
- src/     (todos os módulos ticket-*)
- tests/

O que está limpo por padrão:
- public/config.js -> Client IDs OAuth VAZIOS (preencha antes de ativar Drive/OneDrive)
- Nenhum CPF, foto ou token está embutido
- Testes usam apenas CPFs sintéticos (12345678909)

Versão: 1.0.75 (2026-09-22)
- Backup automático 08:30/12:30/13:30/14:30/15:30/18:30 (só grava, não recupera sozinho)
- Popover de notificação ("Nenhuma novidade." quando vazio)
- Seta da jornada piscando inteira
- Logout após 24h sem interatividade
- Favicon em PNG
- Aba "Versão" em Configurações
- Feriados 2026-2032 (nacionais, estaduais AL, municipais Maceió + pontos facultativos)
- Calendário: "Feriado"/"Facultativo"/"Folga" (Folga só quando você registra)
- Botão "Zerar dados" removido do Armazenamento (já existe no Perfil)

COMO RODAR LOCAL:
  1. Instale Node.js 20+
  2. npm ci
  3. npm start
  4. Abra http://localhost:10000

COMO PUBLICAR NA INTERNET (Render):
  1. Crie um repositório Git e suba estes arquivos (branch main)
  2. Conecte no Render (render.yaml já configurado: npm ci / npm start / /health)
  3. Configure a variável de ambiente GEMINI_API_KEY (opcional, p/ Assistente IA)
  4. Para Google Drive/OneDrive: edite public/config.js com seus Client IDs OAuth
     e defina ALLOWED_ORIGINS com a URL do seu domínio (ex.: https://seu-app.onrender.com)
  5. Sempre sirva por HTTPS (necessário para câmera, PWA e OAuth)

RESTRIÇÕES IMPORTANTES:
  - O login é por CPF local (IndexedDB). Não há servidor de usuários, senha ou
    autenticação corporativa. Mantenha backups e não compartilhe a mesma URL
    com credenciais.
  - O backup automático funciona com o app aberto OU ao reabrir (recupera o devido).
  - Valide câmera, PWA e nuvem em dispositivo real.
