# TAREFA: Checkout Transparente — Formulário de Pagamento (Frontend)
## Site institucional StamFlow

---

## REGRAS DE TRABALHO

1. **Não toque em nenhum arquivo além dos listados na seção "Arquivos a modificar".**
   O resto do projeto está funcionando em produção.

2. **Valide TypeScript antes de considerar concluído:**
   `npx tsc --noEmit` deve passar sem erros.

3. **Não instale pacotes além do MercadoPago.js v2**, que é carregado via `<Script>` do
   Next.js, não via npm — não precisa de `npm install`.

4. **Uma etapa por vez.** Ao terminar cada etapa, reporte o resultado e aguarde
   confirmação antes de seguir.

5. **Commits pequenos e frequentes.** Nada de commits com centenas de linhas de diff.

6. **Não altere** `lib/config.ts`, `lib/plans.ts`, `app/layout.tsx`,
   `app/globals.css`, nem nenhum componente além do `CheckoutContent.tsx`
   (e o `Providers.tsx` se necessário para o idempotency_key).

---

## CONTEXTO DO PROJETO

**Next.js 14, static export** (`output: "export"` no `next.config`). O build gera
arquivos estáticos que são publicados no Hostinger. Não há server-side rendering.

**Design tokens** (classes Tailwind + utilitários globais em `app/globals.css`):
- `surface-card` — card com fundo semi-transparente e borda hairline
- `btn-primary` — botão gradiente principal
- `rounded-field` — borda arredondada dos inputs
- `border-hairline` — borda sutil
- `bg-surface/60` — fundo dos inputs
- `text-cloud` — texto principal (branco suave)
- `text-slatey` — texto secundário (cinza azulado)
- `text-muted` — texto terciário (mais apagado)
- `text-raio` — gradiente roxo/azul da marca (usado em destaques)
- `text-signal` — verde de sucesso
- `bg-raio` — fundo do botão primário

**Constantes já existentes:**
- `API_BASE` em `lib/config.ts` = `"https://api.stamflow.com.br"`
- `getCookie()` já existe no `CheckoutContent.tsx`
- `period.backendPlanId` — o plan_id que vai no payload

---

## O QUE EXISTE HOJE

`components/CheckoutContent.tsx` tem dois estágios:

**Coluna esquerda — Identificação (já completa, NÃO MEXER):**
- Step "idle": formulário de criar conta ou login
- Step "awaiting_code": input do código de 6 dígitos
- Step "done" / `profile != null`: conta conectada, mostra nome e e-mail

**Coluna direita — Resumo + Pagamento (precisa de alteração):**
- Mostra o resumo do pedido com preço ✓
- Tem um botão "Ir para o pagamento" que hoje chama `handlePay()`
- `handlePay()` hoje envia `{ plan_id }` e redireciona para `checkout_url`
  **→ Esse é o único comportamento que muda**

---

## O QUE FAZER

### ETAPA 1 — Carregar o MercadoPago.js via Script do Next.js

No arquivo `app/checkout/page.tsx` (ou `app/layout.tsx` **somente** se a página de
checkout já importa o layout — prefira escopar ao `page.tsx` do checkout):

```tsx
import Script from "next/script";

// Dentro do JSX, antes do <CheckoutContent />:
<Script
  src="https://sdk.mercadopago.com/js/v2"
  strategy="beforeInteractive"
/>
```

`beforeInteractive` garante que o SDK esteja disponível antes de qualquer
interação do usuário. O SDK expõe `window.MercadoPago` globalmente.

---

### ETAPA 2 — Adicionar estado de idempotency_key ao CheckoutContent

A chave de idempotência deve ser gerada **uma vez ao montar o componente** e
reutilizada em retries da mesma tentativa. Nova tentativa (novo clique após
erro) = nova chave.

Adicione junto dos outros estados:

```tsx
const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
```

Função para resetar quando o usuário quiser tentar de novo:

```tsx
function resetPayment() {
  setPayError(null);
  setCardError(null);
  setIdempotencyKey(crypto.randomUUID()); // nova tentativa = nova chave
  // Os Secure Fields não precisam ser recriados — o token é gerado no submit
}
```

---

### ETAPA 3 — Inicializar o SDK e criar os Secure Fields

Adicione um `useEffect` que inicializa o MercadoPago e monta os Secure Fields
**depois que o usuário está logado** (`logged === true`). Os campos só fazem
sentido nesse ponto.

```tsx
const mpRef = useRef<any>(null);
const cardFormRef = useRef<any>(null);
const [mpReady, setMpReady] = useState(false);
const [cardError, setCardError] = useState<string | null>(null);

useEffect(() => {
  if (!logged) return; // aguarda login

  async function initMP() {
    try {
      // 1. Busca a public key do backend
      const res = await fetch(`${API_BASE}/subscription/config`);
      if (!res.ok) throw new Error("Não foi possível carregar o checkout.");
      const { mp_public_key } = await res.json();

      // 2. Inicializa o SDK (window.MercadoPago vem do Script carregado)
      mpRef.current = new (window as any).MercadoPago(mp_public_key, {
        locale: "pt-BR",
      });

      // 3. Cria os Secure Fields (renderizam dentro de iframes seguros)
      const fields = mpRef.current.fields.create("cardNumber", {
        placeholder: "Número do cartão",
      }).mount("mp-card-number");

      mpRef.current.fields.create("expirationDate", {
        placeholder: "MM/AA",
      }).mount("mp-expiration-date");

      mpRef.current.fields.create("securityCode", {
        placeholder: "CVV",
      }).mount("mp-security-code");

      cardFormRef.current = fields;
      setMpReady(true);
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Erro ao carregar o checkout.");
    }
  }

  // Aguarda o SDK estar disponível (pode ser que o Script ainda não carregou)
  if ((window as any).MercadoPago) {
    initMP();
  } else {
    const interval = setInterval(() => {
      if ((window as any).MercadoPago) {
        clearInterval(interval);
        initMP();
      }
    }, 100);
    return () => clearInterval(interval);
  }
}, [logged]); // eslint-disable-line react-hooks/exhaustive-deps
```

---

### ETAPA 4 — Adicionar estados do formulário de cartão

```tsx
const [cardHolder, setCardHolder] = useState("");       // nome no cartão
const [cardDoc, setCardDoc] = useState("");             // CPF do titular
const [cardDocType, setCardDocType] = useState("CPF");  // CPF ou CNPJ
```

---

### ETAPA 5 — Reescrever handlePay

Substitua a função `handlePay` inteira:

```tsx
async function handlePay() {
  if (!period || !mpReady) return;
  setPayError(null);
  setCardError(null);
  setPayBusy(true);

  try {
    // 1. Gera o card_token via Secure Fields (dados nunca tocam nosso servidor)
    const token = await mpRef.current.fields.createCardToken({
      cardholderName: cardHolder.trim(),
      identificationType: cardDocType,
      identificationNumber: cardDoc.replace(/\D/g, ""),
    });

    if (!token?.id) throw new Error("Não foi possível tokenizar o cartão.");

    // 2. Chama o backend com o token
    const res = await fetch(`${API_BASE}/subscription/checkout/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({
        plan_id: period.backendPlanId,
        card_token_id: token.id,
        idempotency_key: idempotencyKey,
        managers_quantity: 0,
        employees_quantity: 0,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      // Sucesso: redireciona para a página de confirmação
      clearCart();
      window.location.href = "/pagamento-concluido/";
      return;
    }

    // Tratamento de erros
    if (res.status === 401) {
      setProfile(null);
      throw new Error("Sessão expirada. Entre novamente.");
    }

    if (res.status === 400 && typeof data?.detail === "object") {
      // Cartão recusado — detail é { message, status_detail }
      throw new Error(data.detail.message);
    }

    // Outros erros (400 string, 403, 404, 409, 500)
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : data?.message || "Não foi possível processar o pagamento.";
    throw new Error(msg);

  } catch (e) {
    setPayError(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
    // Gera nova chave para próxima tentativa
    setIdempotencyKey(crypto.randomUUID());
  } finally {
    setPayBusy(false);
  }
}
```

---

### ETAPA 6 — Substituir o botão na coluna direita pelo formulário de cartão

Na coluna direita (`<motion.aside ...>`), **substitua** o bloco que começa em
`{payError && ...}` e vai até o fechamento do `</motion.aside>` pelo seguinte:

```tsx
{/* Formulário de cartão — aparece só após login */}
{logged && (
  <div className="mt-6">
    <h2 className="font-display text-xl font-bold text-cloud">
      3. Dados do cartão
    </h2>

    {!mpReady && (
      <div className="mt-4 h-48 animate-pulse rounded-2xl bg-white/5" aria-hidden="true" />
    )}

    {mpReady && (
      <div className="mt-4 grid gap-4">
        {/* Campo: número do cartão (iframe do MP) */}
        <div>
          <span className="mb-1.5 block text-[13.5px] font-medium text-slatey">
            Número do cartão
          </span>
          <div
            id="mp-card-number"
            className="w-full rounded-field border border-hairline bg-surface/60 px-4 py-3 text-[15px] text-cloud"
            style={{ minHeight: "48px" }}
          />
        </div>

        {/* Validade e CVV lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="mb-1.5 block text-[13.5px] font-medium text-slatey">
              Validade
            </span>
            <div
              id="mp-expiration-date"
              className="w-full rounded-field border border-hairline bg-surface/60 px-4 py-3 text-[15px] text-cloud"
              style={{ minHeight: "48px" }}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[13.5px] font-medium text-slatey">
              CVV
            </span>
            <div
              id="mp-security-code"
              className="w-full rounded-field border border-hairline bg-surface/60 px-4 py-3 text-[15px] text-cloud"
              style={{ minHeight: "48px" }}
            />
          </div>
        </div>

        {/* Nome no cartão */}
        <Field
          label="Nome impresso no cartão"
          value={cardHolder}
          onChange={setCardHolder}
          autoComplete="cc-name"
          placeholder="Exatamente como no cartão"
        />

        {/* CPF do titular */}
        <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
          <div>
            <span className="mb-1.5 block text-[13.5px] font-medium text-slatey">
              Tipo
            </span>
            <select
              value={cardDocType}
              onChange={(e) => setCardDocType(e.target.value)}
              className="rounded-field border border-hairline bg-surface/60 px-3 py-3 text-[15px] text-cloud focus:border-raio/60 focus:outline-none focus:ring-2 focus:ring-raio/25"
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>
          <Field
            label="Documento do titular"
            value={cardDoc}
            onChange={setCardDoc}
            inputMode="numeric"
            autoComplete="off"
            placeholder={cardDocType === "CPF" ? "000.000.000-00" : "00.000.000/0001-00"}
          />
        </div>
      </div>
    )}

    {(payError || cardError) && (
      <div className="mt-4">
        <Alert tone="error">{payError || cardError}</Alert>
      </div>
    )}

    <button
      type="button"
      onClick={handlePay}
      disabled={!mpReady || payBusy || !cardHolder.trim() || !cardDoc.trim()}
      className="btn-primary mt-5 w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
    >
      {payBusy ? "Processando pagamento..." : `Pagar ${formatBRL(price.total)}`}
    </button>

    <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-muted">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 10.5V7.5a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      Dados do cartão tokenizados pelo Mercado Pago · nunca tocam nosso servidor
    </p>
  </div>
)}

{/* Enquanto não está logado, mostra orientação */}
{!logged && !checkingSession && (
  <p className="mt-6 text-center text-[13px] text-muted">
    Identifique-se ao lado para liberar o pagamento.
  </p>
)}
{authStep === "awaiting_code" && (
  <p className="mt-6 text-center text-[13px] text-muted">
    Verifique o e-mail ao lado para liberar o pagamento.
  </p>
)}
```

---

### ETAPA 7 — Remover o botão antigo e o texto "Mercado Pago" da coluna direita

O botão "Ir para o pagamento" e o parágrafo com o ícone de cadeado que existem
hoje **foram substituídos** pelo bloco da Etapa 6. Confirme que não sobraram
duplicatas no JSX.

---

### ETAPA 8 — Validar e testar

```bash
npx tsc --noEmit
npm run build
```

Ambos precisam passar sem erros.

**Teste manual no browser (`npm run dev`):**
1. Acesse `/checkout` com um item no carrinho
2. Crie uma conta → verifique o código → confirme que o formulário de cartão aparece
3. Preencha com cartão de teste do Mercado Pago: `5031 4332 1540 6351`, validade `11/30`, CVV `123`, nome `APRO`, CPF qualquer
4. Clique em "Pagar" — deve redirecionar para `/pagamento-concluido/`
5. Teste com cartão de saldo insuficiente: `5031 4332 1540 6351` com nome `FUND` — deve mostrar a mensagem de erro específica sem travar a página

---

## CONTRATO DO BACKEND (para referência)

### GET /subscription/config
- Sem autenticação
- Retorna: `{ "mp_public_key": "APP_USR-..." }`

### POST /subscription/checkout/subscribe
- Requer cookie de sessão (`credentials: "include"`)
- Requer header `X-CSRF-Token` com o valor do cookie `csrf_token` (não-httponly, JS lê)
- Payload:
```json
{
  "plan_id": 3,
  "card_token_id": "<token do MP.js>",
  "idempotency_key": "<UUID gerado 1x por tentativa>",
  "managers_quantity": 0,
  "employees_quantity": 0
}
```

**Respostas:**

| HTTP | Formato do `detail` | Quando |
|------|---------------------|--------|
| 200 | — | Sucesso. Redirecionar para `/pagamento-concluido/` |
| 400 | **objeto** `{message, status_detail}` | Cartão recusado. Exibir `detail.message` |
| 400 | string | Dado inválido (CPF, licença, etc.) |
| 401 | — | Sessão expirada |
| 403 | string | CSRF inválido |
| 409 | string | Idempotência / já tem assinatura ativa |
| 500 | string | Falha no Mercado Pago |

**Regra de ouro para extrair a mensagem de erro:**
```ts
const msg = typeof data?.detail === "object"
  ? data.detail.message
  : (data?.detail ?? data?.message ?? "Erro ao processar o pagamento.");
```

---

## CUIDADOS ESPECÍFICOS DO MERCADOPAGO.JS

**Os Secure Fields montam em `<div id="mp-card-number">` etc.** O elemento
precisa existir no DOM quando `.mount("mp-card-number")` for chamado. Como o
estado `mpReady` controla a visibilidade, isso está garantido — mas cuidado com
re-renders que desmontem o DOM enquanto o SDK já inicializou.

**`createCardToken` é assíncrono** e pode rejeitar com objeto `{message, cause}`.
Trate o erro assim:
```ts
try {
  const token = await mpRef.current.fields.createCardToken({ ... });
} catch (e: any) {
  const msg = e?.message || e?.cause?.[0]?.description || "Dados do cartão inválidos.";
  throw new Error(msg);
}
```

**O token é de uso único.** O backend já valida isso. Se o pagamento falhar e o
usuário quiser tentar de novo, o token anterior não pode ser reutilizado — os
Secure Fields permitem gerar um novo token no próximo submit sem precisar ser
recriados.

**Não use `window.MercadoPago` como tipo TypeScript.** Declare como `(window as any).MercadoPago`.

---

## ARQUIVOS A MODIFICAR

| Arquivo | O que muda |
|---|---|
| `app/checkout/page.tsx` | Adicionar `<Script src="https://sdk.mercadopago.com/js/v2" strategy="beforeInteractive" />` |
| `components/CheckoutContent.tsx` | Etapas 2 a 7 acima |

**Nenhum outro arquivo.**

---

## ARQUIVOS QUE NÃO DEVEM SER TOCADOS

- `lib/config.ts`
- `lib/plans.ts`
- `app/globals.css`
- `app/layout.tsx`
- Qualquer componente além de `CheckoutContent.tsx`
- Qualquer página além de `app/checkout/page.tsx`

---

## DÍVIDAS TÉCNICAS (registrar, não implementar)

- Feedback visual nos Secure Fields quando o número do cartão for inválido
  (o SDK expõe eventos `change` nos fields para isso)
- Suporte a débito (requer campo adicional no token)
- Plano corporativo: `managers_quantity` e `employees_quantity` > 0
- Internacionalização dos erros de tokenização do SDK
