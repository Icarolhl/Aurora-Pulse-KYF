# Aurora Pulse — Know Your Fan

Aurora Pulse é um prototipo educacional de plataforma Know Your Fan. O projeto coleta dados estruturados dos fãs, valida documentos com OCR e oferece um painel administrativo protegido para analise de engajamento.

## ✨ Funcionalidades

- **Autenticação social** via Google ou Discord usando NextAuth, com captura automática das guilds do Discord vinculadas ao fã.
- **Fluxo de registro em múltiplas etapas** que valida CPF, endereço e perfil de fã com componentes reativos baseados em React Hook Form.
- **Upload e leitura de documentos com OCR** (Tesseract.js) para validar o CPF enviado pelo fã.
- **Painel administrativo** protegido por middleware e login, apresentando listagem dos fãs cadastrados e acesso rápido ao perfil completo.
- **Ferramenta de análise de links** para administradores, que classifica a relevância de conteúdos externos usando a API do OpenRouter.
- **Integração com Supabase** para persistir dados dos fãs e registrar logs de acesso administrativo.

## 🧱 Stack principal

- [Next.js 15](https://nextjs.org/) com App Router
- [React 18](https://react.dev/)
- [NextAuth](https://next-auth.js.org/) para autenticação social e via credenciais
- [Supabase](https://supabase.com/) como banco de dados e camada de API
- [Tailwind CSS 4 (preview)](https://tailwindcss.com/blog/tailwindcss-v4-alpha) para estilos utilitários
- [Framer Motion](https://www.framer.com/motion/) para animações
- [Tesseract.js](https://tesseract.projectnaptha.com/) para OCR client-side
- [OpenRouter](https://openrouter.ai/) para classificação de relevância com IA

## ⚙️ Pré-requisitos

- Node.js 18.18 ou superior
- NPM 9+ (ou o gerenciador de pacotes de sua preferência)
- Conta configurada no Supabase com banco de dados Postgres
- Credenciais válidas para provedores OAuth (Google e Discord)
- Chave de API do OpenRouter habilitada para o modelo `gpt-3.5-turbo`

## 📁 Estrutura de pastas (resumo)

```
src/
├── app/                # Rotas, páginas e handlers de API do Next.js
│   ├── api/            # Endpoints protegidos para registro e rotinas administrativas
│   ├── admin/          # Dashboard administrativo e componentes client-side
│   ├── connect/        # Tela de autenticação social
│   ├── register/       # Formulário multi-etapas do fã
│   └── (demais páginas)
├── components/         # Componentes reutilizáveis (formulários, UI)
├── features/           # Feature modules (ex.: fluxo de registro)
├── context/, hooks/, lib/
│                       # Contextos de estado, hooks customizados e utilitários
```

## 🔐 Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as variáveis abaixo:

| Variável | Descrição |
| --- | --- |
| `NEXTAUTH_URL` | URL base da aplicação (ex.: `http://localhost:3000`). |
| `NEXTAUTH_SECRET` | Chave secreta usada pelo NextAuth para assinar tokens. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciais OAuth do Google. |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Credenciais OAuth do Discord (necessário escopo `identify email guilds`). |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Lista de e-mails (separados por vírgula) autorizados a acessar o painel admin. |
| `ADMIN_USER` / `ADMIN_PASS` | Credenciais opcionais para login administrativo via provider de credenciais. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. |
| `SUPABASE_ANON_KEY` *(opcional)* | Usada para chamadas client-side, caso necessário. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave Service Role do Supabase (mantida apenas no servidor). |
| `OPENROUTER_API_KEY` | Chave de acesso à API do OpenRouter. |

> **Importante:** mantenha as chaves sensíveis fora do controle de versão. Configure variáveis de ambiente equivalentes em produção.

## 🗄️ Estrutura da tabela `fans`

O fluxo de registro espera uma tabela `fans` no Supabase com os campos abaixo (adapte conforme suas necessidades):

| Coluna | Tipo sugerido | Observações |
| --- | --- | --- |
| `id` | `uuid` (default `gen_random_uuid()`) | Chave primária. |
| `created_at` | `timestamptz` (default `now()`) | Registro automático. |
| `nome` | `text` | Nome completo do fã. |
| `cpf` | `text` (único) | CPF formatado (`000.000.000-00`). |
| `email` | `text` | Email obtido via OAuth. |
| `endereco` | `text` | Endereço informado. |
| `estado` | `text` | Estado selecionado. |
| `cidade` | `text` | Cidade selecionada. |
| `interesses` | `text[]` | Lista dinâmica de interesses. |
| `atividades` | `text[]` | Atividades do fã. |
| `eventos_participados` | `text[]` | Eventos já frequentados. |
| `compras_relacionadas` | `text[]` | Histórico de compras relevantes. |
| `guilds_discord` | `text[]` | Guilds retornadas pela API do Discord. |

Garanta também permissões adequadas nas Policies do Supabase para bloquear acesso anônimo e permitir escrita apenas via Service Role.

## 🚀 Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:3000` no navegador.

### Outros comandos úteis

- `npm run build` — gera a build otimizada para produção.
- `npm run start` — inicia a aplicação já compilada.
- `npm run lint` — executa as verificações de lint via ESLint.

## 🔒 Fluxos de autenticação

- Usuários finais acessam `/connect` para autenticar via Google ou Discord.
- Administradores adicionados em `NEXT_PUBLIC_ADMIN_EMAILS` têm acesso ao painel em `/admin`.
- Opcionalmente, é possível configurar o provider de credenciais (`ADMIN_USER`/`ADMIN_PASS`) para um login administrativo alternativo.

## 🤖 Análise de links com IA

Administradores podem enviar URLs via endpoint `/api/link/analyze` para classificar conteúdos segundo o perfil do fã selecionado. O serviço:

1. Valida que a requisição veio de um admin autenticado.
2. Bloqueia hosts privados, protocolos inseguros e páginas com proteções de bot.
3. Faz o scraping do HTML com Cheerio, resume o conteúdo e envia para o modelo `gpt-3.5-turbo` via OpenRouter.
4. Retorna um score de 0 a 100 indicando a relevância do link.

## 🧪 Testes e qualidade

O projeto utiliza ESLint configurado para Next.js. Antes de enviar contribuições, rode:

```bash
npm run lint
```

## 📄 Avisos

- Projeto para fins educacionais; revise segurança, testes e custos antes de usar em produção.
- Substitua todas as credenciais e chaves de API.
- Aurora Pulse é uma marca ficticia criada apenas para demonstração