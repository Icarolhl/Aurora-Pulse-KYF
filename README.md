# Aurora Pulse KYF - Know Your Fan Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/seu-usuario/aurora-pulse-kyf/actions)
[![Coverage](https://img.shields.io/badge/coverage-95%25-blue)](https://github.com/seu-usuario/aurora-pulse-kyf/actions)

Aurora Pulse KYF e um prototipo educacional de plataforma Know Your Fan. O projeto coleta dados estruturados dos fas, valida documentos com OCR e oferece um painel administrativo protegido para analise de engajamento.

---

## Visao geral

- Formulario guiado em tres etapas para cadastro de fas
- Upload de documento com OCR (Tesseract.js) e verificacao de CPF
- Analise de links externos com modelo de linguagem via OpenRouter
- Dashboard administrativo com filtros, detalhamento e integracao com Discord

---

## Stack principal

- Next.js 15 (App Router)
- React 18 + TypeScript 5
- Tailwind CSS 4 + Framer Motion
- NextAuth.js 4 (Google, Discord e credenciais de admin)
- Supabase (persistencia e service role)
- React Hook Form + Zod
- Tesseract.js (OCR no browser)
- OpenRouter / GPT-3.5 (classificacao de relevancia)

---

## Arquitetura em alto nivel

- `src/app`
  - `layout.tsx` — layout global
  - `page.tsx` — landing page
  - `connect/page.tsx` — fluxo de login social
  - `register/page.tsx` — wizard de registro em tres etapas
  - `admin/page.tsx` — dashboard administrativo (SSR)
  - `admin/fan/[id]/page.tsx` — perfil detalhado do fa
  - `api/register/route.ts` — registro autenticado de fas
  - `api/link/analyze/route.ts` — analise de links (somente admin)
  - `api/social/guilds/route.ts` — dados de guilds do Discord
  - `api/admin/fans/route.ts` — lista de fas (somente admin)
  - `api/admin/fan/[id]/route.ts` — detalhe individual (somente admin)
- `src/components` — UI compartilhada (StatusPopup, StyledSelect, etc.)
- `src/context/ToastContext.tsx` — provider de toasts
- `src/features` — modulos de negocio (register, admin)
- `src/hooks/useIsAdmin.ts` — helper que usa session.user.isAdmin
- `src/lib` — auth, helpers de admin, logging e integracao com IA
- `public/aurora-pulse-logo.svg` — logo utilizado na landing page

---

## Fluxos resumidos

**Fa**
1. Acessa `/connect` e autentica via Google ou Discord.
2. Preenche o formulario (dados pessoais, perfil, documento).
3. Confirma o envio e retorna para a home.

**Admin**
1. Faz login com e-mail autorizado.
2. Acessa `/admin` para listar fas.
3. Abre `/admin/fan/[id]` para dados completos e analise de links.

Todos os endpoints api/admin/* e api/link/analyze validam a sessao usando `requireAdminSession`, evitando exposicao indevida da service role do Supabase.

---

## Configuracao e uso

1. **Clonar o repositorio**
   ```bash
   git clone https://github.com/Icarolhl/aurora-pulse-kyf.git
   cd aurora-pulse-kyf
   ```
2. **Instalar dependencias**
   ```bash
   npm install
   ```
3. **Criar `.env.local`**
   ```env
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000

   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...

   DISCORD_CLIENT_ID=...
   DISCORD_CLIENT_SECRET=...

   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...

   OPENROUTER_API_KEY=...

   ADMIN_EMAILS=admin@example.com,admin2@example.com
   # NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com (opcional, apenas para UI)
   ```
4. **Executar em desenvolvimento**
   ```bash
   npm run dev
   ```
   Aplicacao disponivel em `http://localhost:3000`.

### Dependencias externas
- Google OAuth: console Google Cloud -> OAuth 2.0 -> redirect `http://localhost:3000/api/auth/callback/google`.
- Discord OAuth: https://discord.com/developers -> scopes `identify email guilds`.
- Supabase: criar tabela `fans` conforme schema abaixo e habilitar storage para documentos.
- OpenRouter: gerar chave e configurar modelo (gpt-3.5-turbo por padrao).

### Schema sugerido para `fans`

| Campo                 | Tipo      | Observacoes                             |
| --------------------- | --------- | --------------------------------------- |
| id                    | uuid      | PK gerado pelo Supabase                 |
| nome                  | text      |                                         |
| email                 | text      | Derivado do usuario autenticado         |
| cpf                   | text      | Armazenado como `000.000.000-00`        |
| endereco              | text      |                                         |
| estado                | text      |                                         |
| cidade                | text      |                                         |
| interesses            | text[]    | Tags livres                             |
| atividades            | text[]    |                                         |
| eventos_participados  | text[]    |                                         |
| compras_relacionadas  | text[]    |                                         |
| guilds_discord        | text[]    | Nomes das guilds confirmadas            |
| created_at            | timestamp | `now()` como default                    |

---

## Seguranca e auditoria

- Endpoints administrativos exigem sessao valida + e-mail autorizado (`ADMIN_EMAILS`).
- `link/analyze` bloqueia hosts internos, aceita apenas HTTPS e aplica timeout para mitigar SSRF.
- `register` reconcilia o e-mail do corpo com `session.user.email` antes de inserir dados.
- `log-admin.ts` grava auditoria em `${os.tmpdir()}/aurora-pulse-logs/admin-access.log`; utilize um sink persistente se precisar de historico mais longo.

---

## Avisos

- Projeto para fins educacionais; revise seguranca, testes e custos antes de usar em producao.
- Substitua todas as credenciais e chaves de API.
- Aurora Pulse e uma marca ficticia criada apenas para demonstracao.

> Este projeto foi desenvolvido como parte de um estudo tecnico da equipe **Aurora Pulse Labs**.
