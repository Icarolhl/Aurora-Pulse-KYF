# Aurora Pulse KYF -- Know Your Fan Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/seu-usuario/aurora-pulse-kyf/actions)
[![Coverage](https://img.shields.io/badge/coverage-95%25-blue)](https://github.com/seu-usuario/aurora-pulse-kyf/actions)

Aurora Pulse KYF e um prototipo de plataforma Know Your Fan criado para estudos: coleta dados estruturados dos fas, valida documentos com OCR e oferece um painel administrativo protegido para analise de engajamento.

---

## Objetivos

- Coletar informacoes de fas por meio de um formulario guiado em tres etapas
- Validar documentos com OCR (Tesseract.js) e checar consistencia de CPF
- Analisar links externos com um modelo de linguagem (via OpenRouter) e gerar scores de relevancia
- Disponibilizar dashboard para administradores com filtros e detalhamento de perfis

---

## Tecnologias

- Next.js 15 (App Router)
- React 18 + TypeScript 5
- Tailwind CSS 4 e Framer Motion
- NextAuth.js 4 (Google, Discord e credenciais de admin)
- Supabase (persistencia e OCR storage)
- React Hook Form + Zod
- Tesseract.js (OCR em browser)
- OpenRouter / GPT-3.5 para analise de relevancia

---

## Arquitetura em alto nivel

`
src/
  app/
    page.tsx                # Landing page
    connect/page.tsx        # Login social
    register/page.tsx       # Formulario multietapas
    admin/page.tsx          # Dashboard administrativo (SSR)
    admin/fan/[id]/page.tsx # Perfil detalhado do fa
    api/
      register/route.ts     # Registro de fas autenticados
      link/analyze/route.ts # Analise de links (somente admin)
      social/guilds/route.ts# Guilds carregadas do Discord
      admin/fans/route.ts   # Lista de fas (somente admin)
      admin/fan/[id]/route.ts# Perfil individual (somente admin)
  components/               # UI compartilhada (StatusPopup, StyledSelect etc.)
  context/ToastContext.tsx  # Toast provider global
  features/
    register/components/    # Etapas do wizard (dados pessoais, perfil, documento)
    admin/components/       # FanLinkAnalyzer e widgets do painel
  hooks/useIsAdmin.ts       # Hook que usa session.user.isAdmin
  lib/
    auth.ts                 # Configuracao do NextAuth e enrichment de sessao
    admin-auth.ts           # Helper para exigir sessao admin nos endpoints
    admin-emails.ts         # Normaliza lista de e-mails admin via env
    log-admin.ts            # Registro de auditoria em arquivo temporario
    ai.ts                   # Chamada ao modelo GPT via OpenRouter
`

---

## Fluxos principais

- **Fa**
  1. Acessa /connect e faz login com Google ou Discord.
  2. Preenche o formulario de registro (dados pessoais, perfil, documento).
  3. Confirma o envio e retorna para a home.

- **Admin**
  1. Faz login social com um e-mail autorizado.
  2. Acessa /admin para ver a lista de fas.
  3. Abre /admin/fan/[id] para detalhes, analise de links e dados enriquecidos.

Todos os endpoints pi/admin/* e pi/link/analyze validam a sessao no servidor usando equireAdminSession, garantindo que a Supabase service role key nao seja exposta a usuarios comuns.

---

## Configuracao

1. **Clone o repositorio**
   `ash
   git clone https://github.com/Icarolhl/aurora-pulse-kyf.git
   cd aurora-pulse-kyf
   `
2. **Instale dependencias**
   `ash
   npm install
   `
3. **Crie o arquivo .env.local**
   `env
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
   `
   > ADMIN_EMAILS e usado somente no servidor. Se precisar expor a lista no client para personalizar UI, defina tambem NEXT_PUBLIC_ADMIN_EMAILS, sabendo que ficara visivel ao bundle publico.
4. **Execute em desenvolvimento**
   `ash
   npm run dev
   `
   A aplicacao fica disponivel em http://localhost:3000.

### Dependencias externas
- **Google OAuth**: configure credenciais usando o console Google.
- **Discord OAuth**: registre o app em https://discord.com/developers e habilite scopes identify email guilds.
- **Supabase**: crie projeto, defina tabela ans (schema abaixo) e habilite storage para uploads.
- **OpenRouter**: gere chave para o modelo gpt-3.5-turbo (pode trocar o modelo conforme necessidade/custos).

### Estrutura da tabela ans

| Campo                 | Tipo      | Observacoes |
| --------------------- | --------- | ----------- |
| id                    | uuid      | PK (gerado pelo Supabase) |
| nome                  | text      | |
| email                 | text      | Derivado do usuario autenticado |
| cpf                   | text      | Armazenado com mascara 000.000.000-00 |
| endereco              | text      | |
| estado                | text      | |
| cidade                | text      | |
| interesses            | text[]    | Tags livres |
| atividades            | text[]    | |
| eventos_participados  | text[]    | |
| compras_relacionadas  | text[]    | |
| guilds_discord        | text[]    | Nomes das guilds confirmadas |
| created_at            | timestamp | Default 
ow() |

---

## Auditoria e logs

Chamadas administrativas registram um log em ${os.tmpdir()}/aurora-pulse-logs/admin-access.log. Em ambientes serverless, esse caminho e efemero; envie os arquivos para um sink persistente (ex.: bucket, observability) se precisar de historico mais longo.

---

## Avisos

- Projeto educacional: nao utilize em producao sem revisao de seguranca, testes e controles de custo de IA.
- Substitua todas as chaves e segredos antes de compartilhar o codigo.
- A marca Aurora Pulse e totalmente ficticia.
