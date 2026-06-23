# StamFlow — Site institucional

Landing page de apresentação do StamFlow, no modelo `webflow.com` / `stripe.com`:
apresenta o produto, os planos e converte para o teste grátis. **Não tem área
logada própria** — o login é externo (`login.stamflow.com.br`) e o cadastro só
acontece pelo fluxo de teste grátis.

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion**, com
**export estático** (`output: "export"`) para hospedagem estática (Hostinger).

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Para gerar o site estático (pasta `out/`):

```bash
npm run build
```

O conteúdo de `out/` é o que vai para a hospedagem estática.

## Estrutura

```
app/
  layout.tsx        # fontes (Rubik + Inter), metadata, atmosfera, providers
  page.tsx          # composição das seções
  globals.css       # tokens visuais + utilitários de marca
components/
  Header, Hero, TrustStrip, HowItWorks, Privacy, Features,
  ForCompanies, Plans, FAQ, FinalCTA, Footer
  EnergyWave.tsx    # o "sinal de energia" — elemento-assinatura
  Brand.tsx         # raio + wordmark
  Providers.tsx     # contexto que abre os modais (trial / empresarial)
  TrialModal.tsx    # cadastro do teste grátis (nome, e-mail, senha)
  EnterpriseModal.tsx # formulário empresarial -> link wa.me
  ui/               # Modal, Alert, Section (reveal/heading)
lib/
  config.ts         # URLs externas, endpoints e constantes (WhatsApp, etc.)
  plans.ts          # planos mockados + fetch simulado (loading/erro/sucesso)
  faq.ts, motion.ts
```

## Integrações futuras (hoje tudo mockado)

Os pontos de integração já estão isolados e comentados no código:

- **Teste grátis** (`components/TrialModal.tsx`): `POST /auth/register` →
  `POST /subscription/trial/start` → redirecionar ao painel.
- **Planos individuais** (`lib/plans.ts` → `fetchIndividualPlans`):
  trocar pelo `GET /subscription_plan/plans?type=individual`. A UI já lida com
  carregando / erro / sucesso e com preços/nomes variáveis.
- **Empresarial** (`components/EnterpriseModal.tsx`): `POST /enterprise/request`,
  que devolve o link `wa.me`. Hoje o link é montado localmente.

Ajustes rápidos antes de publicar:

- `lib/config.ts` → `SALES_WHATSAPP`: número oficial de vendas (só dígitos, com DDI).
- `lib/config.ts` → `LOGIN_URL` / `API_BASE`: confirmar domínios.
- `lib/plans.ts` → `SIMULATE_ERROR = true` para visualizar o estado de erro dos planos.

## Acessibilidade

Mobile completo, foco visível no teclado, modais com `role="dialog"`,
trap de foco e fechamento por Esc, estados comunicados além da cor, e
`prefers-reduced-motion` respeitado.
