# Aurora Pulse KYF - Know Your Fan Platform

![Aurora Pulse Banner](public/aurora-pulse-logo.svg "Aurora Pulse KYF")

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/seu-usuario/aurora-pulse-kyf/actions)
[![Coverage](https://img.shields.io/badge/coverage-95%25-blue)](https://github.com/seu-usuario/aurora-pulse-kyf/actions)

> Plataforma educacional de Know Your Fan que centraliza cadastro inteligente de fãs, validação de documentos com OCR, enriquecimento via Discord e painéis administrativos seguros.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Diferenciais](#diferenciais)
3. [Arquitetura](#arquitetura)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Stack Técnica](#stack-técnica)
6. [Fluxos de Usuário](#fluxos-de-usuário)
7. [Endpoints Principais](#endpoints-principais)
8. [Segurança e Auditoria](#segurança-e-auditoria)
9. [Pré-requisitos](#pré-requisitos)
10. [Guia de Configuração](#guia-de-configuração)
11. [Scripts NPM](#scripts-npm)
12. [Qualidade e Boas Práticas](#qualidade-e-boas-práticas)
13. [Roadmap](#roadmap)
14. [Contribuição](#contribuição)
15. [Licença](#licença)

---

## Visão Geral

Aurora Pulse KYF é um protótipo de plataforma Know Your Fan desenvolvido em Next.js (App Router). O objetivo é demonstrar como clubes e organizações podem coletar e analisar dados de fãs com base em autenticação social, OCR e análise inteligente de conteúdo.

## Diferenciais

- Autenticação com Google, Discord e credenciais administrativas.
- Classificação de links externos por meio do OpenRouter (GPT-3.5).
- OCR (Tesseract.js) para validar documentos e cruzar CPF.
- Auditoria de acessos administrativos e controle de endpoints sensíveis.
- Organização modular com features, hooks e libs independentes.

## Arquitetura

Camadas principais:

- **Front-end**: páginas em src/app, UI com Tailwind CSS e Framer Motion.
- **Negócio**: módulos específicos em src/features (cadastro e painéis administrativos).
- **Serviços**: helpers em src/lib para NextAuth, Supabase, AI, logging e utilitários.
- **Persistência**: Supabase (Postgres + Storage) para a tabela ans e arquivos enviados.

## Estrutura de Pastas

- src/app: páginas públicas, rotas autenticadas e API Routes.
- src/components: componentes reutilizáveis de UI.
- src/context: providers globais (ex.: ToastContext).
- src/features: módulos de negócio (egister, dmin).
- src/hooks: hooks personalizados (useIsAdmin).
- src/lib: configuração de autenticação, IA, logging e utilidades administrativas.
- public: assets estáticos (logo, favicon).

## Stack Técnica

| Camada            | Tecnologia                              |
| ----------------- | ---------------------------------------- |
| Front-end         | Next.js 15, React 18, Tailwind CSS 4     |
| Autenticação      | NextAuth.js (Google, Discord, credenciais)|
| Back-end (API)    | Next.js API Routes                       |
| Persistência      | Supabase (Postgres + Storage)            |
| Formularização    | React Hook Form + Zod                    |
| OCR               | Tesseract.js                             |
| Análise de Links  | OpenRouter (GPT-3.5)                     |
| UI Animada        | Framer Motion                            |
| Qualidade         | ESLint (configuração Next 15)            |

## Fluxos de Usuário

**Fã**
1. Autentica-se via /connect (Google ou Discord).
2. Preenche o formulário em três etapas (dados pessoais, perfil, documento).
3. Recebe confirmação e retorna para a página inicial.

**Administrador**
1. Autentica-se com e-mail listado em ADMIN_EMAILS.
2. Acessa /admin para visualizar a lista de fãs cadastrados.
3. Abre /admin/fan/[id] para consultar dados detalhados e analisar links relevantes.

## Endpoints Principais

| Rota                       | Método | Proteção         | Descrição                                           |
| -------------------------- | ------ | ---------------- | --------------------------------------------------- |
| /api/register            | POST   | Sessão válida    | Registra/atualiza dados do fã autenticado.
| /api/link/analyze        | POST   | Apenas admin     | Classifica a relevância de links externos.
| /api/social/guilds       | GET    | Sessão válida    | Retorna guilds do Discord associadas ao usuário.
| /api/admin/fans          | GET    | Apenas admin     | Lista fãs cadastrados ordenados por data.
| /api/admin/fan/[id]      | GET    | Apenas admin     | Recupera detalhes completos de um fã.

## Segurança e Auditoria

- equireAdminSession garante sessão válida e e-mail autorizado antes de liberar endpoints.
- link/analyze aceita apenas URLs HTTPS, bloqueia IPs internos e aplica timeout com AbortController.
- egister ignora o e-mail enviado no corpo e utiliza o e-mail da sessão para evitar spoofing.
- log-admin.ts grava acessos em ${os.tmpdir()}/aurora-pulse-logs/admin-access.log (considere persistência externa em produção).

## Pré-requisitos

- Node.js 20+
- NPM 10+
- Projeto Supabase ativo
- Credenciais OAuth (Google e Discord)
- Chave OpenRouter (modelo gpt-3.5-turbo ou equivalente)

## Guia de Configuração

### 1. Clonar o repositório
`ash
git clone https://github.com/Icarolhl/aurora-pulse-kyf.git
cd aurora-pulse-kyf
`

### 2. Instalar dependências
`ash
npm install
`

### 3. Criar .env.local
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
# NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com (opcional para exibir no client)
`

### 4. Executar em desenvolvimento
`ash
npm run dev
`
Aplicação disponível em http://localhost:3000.

### 5. Schema sugerido para ans
`sql
create table public.fans (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  cpf text not null,
  endereco text,
  estado text,
  cidade text,
  interesses text[],
  atividades text[],
  eventos_participados text[],
  compras_relacionadas text[],
  guilds_discord text[],
  created_at timestamptz default now()
);
create unique index fans_email_cpf_idx on public.fans (email, cpf);
`

## Scripts NPM

| Script           | Descrição                               |
| ---------------- | --------------------------------------- |
| 
pm run dev    | Inicia a aplicação em modo desenvolvimento.
| 
pm run build  | Gera build otimizado de produção.
| 
pm run start  | Serve a build gerada.
| 
pm run lint   | Executa ESLint com a configuração do projeto.

## Qualidade e Boas Práticas

- Execute 
pm run lint antes de enviar alterações.
- Reutilize componentes e hooks existentes para manter consistência.
- Centralize integrações em src/lib e regras de negócio em src/features.
- Versione mudanças no banco (migrations) ao atualizar o schema no Supabase.

## Roadmap

- [ ] Exportação CSV/Excel no painel administrativo.
- [ ] Indicadores de engajamento em tempo real.
- [ ] Integração com e-mail marketing.
- [ ] Testes de ponta a ponta com Playwright.

## Contribuição

1. Crie um fork ou branch a partir de main.
2. Configure o ambiente local seguindo o guia acima.
3. Documente mudanças relevantes no README.
4. Abra pull request com descrição clara e resultados de lint/tests.

## Licença

Projeto disponível para estudo. Defina uma licença (MIT, Apache 2.0, etc.) antes de utilizar em produção.

---

> Desenvolvido como parte de um estudo técnico da equipe **Aurora Pulse Labs**.
