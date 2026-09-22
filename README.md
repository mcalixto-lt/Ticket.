# Ticket. 1.0.71

O sininho avisa cinco minutos antes de 08h, 12h, 13h, 14h, 15h e 18h,
enquanto o aplicativo está aberto. Não há envio push com o aplicativo fechado.
Os dígitos centrais do CPF são ocultados durante a digitação.
Use o botão Voltar do navegador/aparelho para navegar: os botões visuais foram removidos.

O pacote de publicação contém apenas código, recursos ativos, configuração,
guia de implantação e verificações do sistema. Não contém arquivos de atualização,
pacotes anteriores ou prévias. Os identificadores de versão usados pelo cache
fazem parte do aplicativo e devem ser mantidos.

O `render.yaml` já habilita publicação automática a cada commit na branch `main`.
Isso passa a funcionar depois que o serviço Render for vinculado ao repositório
GitHub autorizado. O arquivo sozinho não conecta contas nem publica o serviço.

## Abertura e visual

Toda abertura mostra a animação e depois a tela de acesso. Sem perfil salvo,
a aba Criar cadastro aparece selecionada; com perfil salvo, aparece Entrar.
Criar cadastro mostra a confirmação e retorna ao login. A sessão antiga não
entra automaticamente, e os dados do colaborador permanecem preservados.

Desktop e celular usam o mesmo layout mobile, com largura máxima de 430px.
No computador, a interface fica centralizada. Mais contém o menu de cartões
para abrir cada configuração separadamente.

Abra `index.html` para visualizar localmente. Para câmera, sincronização e
uso diário, execute o servidor local ou publique por HTTPS. Arquivos locais
e o endereço publicado possuem armazenamentos separados no navegador;
restaure o arquivo completo ao migrar seus dados.

Aplicativo web instalável (PWA) para cadastro por CPF, registro de jornada com comprovantes, folgas, feriados, banco de horas, calendário, relatórios e cópia/restauração completa dos dados.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm ci
npm start
```

Abra `http://localhost:10000`. Para executar as verificações:

```bash
npm test
```

## Publicar no GitHub e Render

1. Crie um repositório vazio no GitHub.
2. Na pasta deste projeto, execute:

```bash
git init
git add .
git commit -m "Publica Ticket 1.0.71"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

3. No Render, escolha **New > Blueprint**, conecte o repositório e confirme o `render.yaml`.
4. Cadastre `GEMINI_API_KEY` no Render se desejar usar o assistente. O restante do sistema funciona sem essa chave.
5. Após a publicação, instale o Ticket pelo navegador do celular para usá-lo como aplicativo.

O servidor entrega o aplicativo e a API no mesmo endereço. A rota `/health` informa o estado do serviço.

## Google Drive e OneDrive

A integração grava uma cópia completa chamada `Ticket_backup_atual.json`, incluindo cadastro, registros, fotos e configurações. Para ativá-la, edite `public/config.js`:

```js
window.TICKET_CONFIG = {
  aiEndpoint: '/api/chat',
  googleClientId: 'SEU_CLIENT_ID_GOOGLE',
  microsoftClientId: 'SEU_CLIENT_ID_MICROSOFT',
  microsoftTenant: 'common'
};
```

No Google Cloud, crie um cliente OAuth do tipo aplicativo Web e autorize a origem HTTPS fornecida pelo Render. No Microsoft Entra, registre um aplicativo de página única, informe a mesma URL HTTPS e conceda acesso a arquivos do usuário. Os Client IDs são identificadores públicos; nunca coloque segredo de cliente neste arquivo.

A sincronização ocorre enquanto o Ticket está aberto e a autorização da conta está válida. Se a sessão expirar, entre novamente pela tela **Armazenamento**. Antes de usar em produção, teste envio e restauração nas contas reais configuradas.

## Armazenamento e restauração

- **Neste navegador:** salvamento automático em IndexedDB. A limpeza dos dados do navegador pode apagar tudo.
- **Google Drive / OneDrive:** cópia completa na conta autorizada, depois de configurar OAuth.
- **Celular ou cartão SD:** escolhe uma pasta compatível pelo navegador e atualiza o arquivo completo enquanto o aplicativo está aberto.
- **Restaurar:** recompõe cadastro, datas, batidas, fotos, horários, saldo e configurações.

A seleção direta de pastas depende do suporte do navegador. Em celulares sem esse recurso, use a exportação/download e escolha o destino pelo sistema.

## Segurança e uso

O CPF identifica o cadastro local; esta versão não possui servidor de usuários, senha ou autenticação corporativa. Use HTTPS, mantenha backups e não use este cadastro local como único controle de acesso para dados sensíveis. Câmera, instalação PWA, seleção de pasta e OAuth devem ser testados no aparelho e navegador usados no trabalho.
