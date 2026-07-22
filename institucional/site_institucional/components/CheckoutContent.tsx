"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/Providers";
import { Alert } from "@/components/ui/Alert";
import { API_BASE, LOGIN_URL } from "@/lib/config";
import { formatBRL, priceFor } from "@/lib/plans";

/**
 * Checkout real (/checkout) com verificação de e-mail por código de 6 dígitos.
 *
 * Fluxo "Criar conta":
 *   1. Preenche nome / CPF / e-mail / senha → "Criar conta e continuar"
 *   2. Backend cria a conta, gera código 6 dígitos (hash), envia por e-mail.
 *   3. Tela vira: input de 6 dígitos + botão "Verificar".
 *   4. Código correto → email_verificado=true → faz login automático.
 *   5. Formulário de cartão (Secure Fields do Mercado Pago) é liberado.
 *
 * Fluxo "Já tenho conta": login direto, sem etapa de código.
 */

type Profile = { nome?: string; email?: string } | null;
type AuthTab = "entrar" | "criar";
// "idle" = formulário | "awaiting_code" = input do código | "done" = logado
type AuthStep = "idle" | "awaiting_code" | "done";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : "";
}

export function CheckoutContent() {
  const { item, period, clearCart } = useCart();

  // Sessão
  const [profile, setProfile] = useState<Profile>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Formulários
  const [tab, setTab] = useState<AuthTab>("criar");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Etapa de verificação por código
  const [authStep, setAuthStep] = useState<AuthStep>("idle");
  const [pendingClientId, setPendingClientId] = useState<number | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pagamento
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  // Uma chave por tentativa: gerada no mount e renovada a cada nova tentativa,
  // para que um retry da mesma tentativa não gere cobrança duplicada.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  // SDK do Mercado Pago
  const mpRef = useRef<any>(null);
  const fieldsRef = useRef<any[]>([]);
  const [mpReady, setMpReady] = useState(false);

  // Dados do cartão que não passam pelos Secure Fields
  const [cardHolder, setCardHolder] = useState("");
  const [cardDoc, setCardDoc] = useState("");
  const [cardDocType, setCardDocType] = useState("CPF");

  const logged = !!profile || authStep === "done";

  function resetPayment() {
    setPayError(null);
    setIdempotencyKey(crypto.randomUUID());
  }

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/account/profile`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfile({ nome: data?.conta?.nome_completo, email: data?.conta?.email });
        return;
      }
    } catch { /* sem sessão */ }
    setProfile(null);
  }, []);

  useEffect(() => {
    (async () => {
      await fetchProfile();
      setCheckingSession(false);
    })();
  }, [fetchProfile]);

  // Limpa o intervalo do cooldown ao desmontar
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  /**
   * Inicializa o SDK e monta os Secure Fields — só depois do login, que é
   * quando os containers `#mp-*` passam a existir no DOM. O `mount()` exige o
   * elemento já renderizado, então os containers não podem depender de mpReady.
   */
  useEffect(() => {
    if (!logged) return;

    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;

    function unmountFields() {
      for (const field of fieldsRef.current) {
        try { field.unmount(); } catch { /* já desmontado pelo SDK */ }
      }
      fieldsRef.current = [];
    }

    async function initMP() {
      try {
        const res = await fetch(`${API_BASE}/subscription/config`);
        if (!res.ok) throw new Error("Não foi possível carregar o checkout.");
        const { mp_public_key } = await res.json();
        if (cancelled) return;

        mpRef.current = new (window as any).MercadoPago(mp_public_key, { locale: "pt-BR" });

        fieldsRef.current = [
          mpRef.current.fields.create("cardNumber", { placeholder: "Número do cartão" }).mount("mp-card-number"),
          mpRef.current.fields.create("expirationDate", { placeholder: "MM/AA" }).mount("mp-expiration-date"),
          mpRef.current.fields.create("securityCode", { placeholder: "CVV" }).mount("mp-security-code"),
        ];

        // O efeito pode ter sido limpo enquanto os fields eram criados; nesse
        // caso o cleanup já rodou e não veria estes fields.
        if (cancelled) { unmountFields(); return; }
        setMpReady(true);
      } catch (e) {
        if (cancelled) return;
        setPayError(e instanceof Error ? e.message : "Erro ao carregar o checkout.");
      }
    }

    if ((window as any).MercadoPago) {
      initMP();
    } else {
      poll = setInterval(() => {
        if ((window as any).MercadoPago) {
          clearInterval(poll!);
          poll = null;
          initMP();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      unmountFields();
      mpRef.current = null;
      setMpReady(false);
    };
  }, [logged]);

  function startCooldown(seconds = 60) {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((v) => {
        if (v <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  async function doLogin(loginEmail: string, loginSenha: string) {
    const body = new URLSearchParams({ username: loginEmail, password: loginSenha });
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || "E-mail ou senha inválidos.");
    }
  }

  async function handleAuth() {
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (tab === "criar") {
        if (!nome.trim() || !cpf.trim() || !email.trim() || senha.length < 8) {
          throw new Error("Preencha todos os campos (senha com pelo menos 8 caracteres).");
        }
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome_completo: nome.trim(),
            email: email.trim(),
            senha,
            cpf: cpf.replace(/\D/g, ""),
          }),
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.detail || "Não foi possível criar a conta.");
        }
        const created = await res.json();
        // Vai para a etapa do código
        setPendingClientId(created.id);
        setPendingEmail(email.trim());
        setAuthStep("awaiting_code");
        startCooldown(60);
      } else {
        if (!email.trim() || !senha) throw new Error("Informe e-mail e senha.");
        await doLogin(email.trim(), senha);
        await fetchProfile();
        setAuthStep("done");
      }
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleVerifyCode() {
    if (!pendingClientId || code.length !== 6) return;
    setCodeError(null);
    setCodeBusy(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: pendingClientId, code: code.trim() }),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || "Código incorreto ou expirado.");
      // Código validado — faz login
      await doLogin(pendingEmail, senha);
      await fetchProfile();
      setAuthStep("done");
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : "Não foi possível verificar. Tente de novo.");
    } finally {
      setCodeBusy(false);
    }
  }

  async function handleResend() {
    if (!pendingClientId || resendCooldown > 0) return;
    setCodeError(null);
    try {
      await fetch(`${API_BASE}/auth/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: pendingClientId }),
      });
      setCode("");
      startCooldown(60);
    } catch { /* ignora falha silenciosa */ }
  }

  async function handlePay() {
    if (!period || !mpReady) return;
    setPayError(null);
    setPayBusy(true);
    try {
      // 1. Tokeniza o cartão no próprio Mercado Pago — os dados digitados nos
      //    Secure Fields nunca chegam ao nosso servidor.
      let token: any;
      try {
        token = await mpRef.current.fields.createCardToken({
          cardholderName: cardHolder.trim(),
          identificationType: cardDocType,
          identificationNumber: cardDoc.replace(/\D/g, ""),
        });
      } catch (e: any) {
        // O SDK rejeita com objeto simples, não com Error.
        const msg =
          e?.message ||
          e?.cause?.[0]?.description ||
          "Dados do cartão inválidos.";
        throw new Error(msg);
      }

      if (!token?.id) throw new Error("Não foi possível tokenizar o cartão.");

      // 2. Cobrança, já com o token de uso único.
      const res = await fetch(`${API_BASE}/subscription/checkout/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCookie("csrf_token"),
        },
        body: JSON.stringify({
          plan_id: period.backendPlanId,
          card_token_id: token.id,
          idempotency_key: idempotencyKey,
          managers_quantity: 0,
          employees_quantity: 0,
        }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        clearCart();
        window.location.href = "/pagamento-concluido/";
        return;
      }

      if (res.status === 401) {
        setProfile(null);
        throw new Error("Sessão expirada. Entre novamente.");
      }

      // Cartão recusado: o detail vem como { message, status_detail }.
      if (res.status === 400 && data?.detail && typeof data.detail === "object") {
        throw new Error(data.detail.message || "Pagamento recusado pela operadora.");
      }

      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : data?.message || "Não foi possível processar o pagamento.",
      );
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
      // Tentativa nova = chave nova; o token anterior também já foi queimado.
      setIdempotencyKey(crypto.randomUUID());
    } finally {
      setPayBusy(false);
    }
  }

  /* ─── Carrinho vazio ─── */
  if (!item || !period) {
    return (
      <main className="relative flex min-h-[70vh] items-center overflow-hidden py-24">
        <div className="relative mx-auto max-w-[42rem] px-6 text-center sm:px-10">
          <h1 className="font-display text-4xl font-bold text-cloud">Seu carrinho está vazio.</h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-slatey">
            Escolha o período do seu plano e volte aqui para concluir.
          </p>
          <a href="/#planos" className="btn-primary mt-8 inline-block px-8 py-4 text-base">Ver planos</a>
        </div>
      </main>
    );
  }

  const price = priceFor(period);

  return (
    <main className="relative overflow-hidden pb-28 pt-32 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-raio/10 blur-[120px]" />
      <div className="relative mx-auto max-w-[72rem] px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <p className="eyebrow"><span className="eyebrow-tick" /> Finalizar compra</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-cloud sm:text-5xl">Quase lá.</h1>
        </motion.div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* ───── Coluna esquerda: identificação ───── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-7 sm:p-9" aria-label="Identificação"
          >
            <h2 className="font-display text-xl font-bold text-cloud">1. Identificação</h2>

            {checkingSession ? (
              <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/5" aria-hidden="true" />
            ) : logged ? (
              /* Conta conectada */
              <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-hairline bg-surface/50 p-5">
                <div>
                  <p className="text-[15px] font-semibold text-cloud">{profile?.nome || "Conta conectada"}</p>
                  <p className="mt-0.5 text-[14px] text-slatey">{profile?.email || pendingEmail}</p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7.3l2.6 2.6L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            ) : authStep === "awaiting_code" ? (
              /* ─── Etapa do código ─── */
              <AnimatePresence mode="wait">
                <motion.div key="code-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mt-5">
                  <div className="rounded-2xl border border-hairline bg-surface/50 p-5">
                    <p className="text-[14px] font-semibold text-cloud">Verifique seu e-mail</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-slatey">
                      Enviamos um código de 6 dígitos para{" "}
                      <span className="font-medium text-cloud">{pendingEmail}</span>.
                      Válido por 10 minutos.
                    </p>
                  </div>

                  <div className="mt-5">
                    <label className="block">
                      <span className="mb-2 block text-[13.5px] font-medium text-slatey">Código de verificação</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="w-full rounded-field border border-hairline bg-surface/60 px-4 py-3.5 text-center font-display text-3xl font-bold tracking-[0.35em] text-cloud placeholder:text-muted focus:border-raio/60 focus:outline-none focus:ring-2 focus:ring-raio/25"
                      />
                    </label>
                  </div>

                  {codeError && <div className="mt-3"><Alert tone="error">{codeError}</Alert></div>}

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={codeBusy || code.length !== 6}
                    className="btn-primary mt-4 w-full py-3.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {codeBusy ? "Verificando..." : "Verificar código"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="mt-3 w-full rounded-lg py-2 text-[13px] font-medium text-muted transition-colors hover:text-cloud disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Reenviar código em ${resendCooldown}s` : "Não recebi — reenviar código"}
                  </button>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* ─── Formulário de login/cadastro ─── */
              <>
                <div className="mt-5 inline-flex rounded-full border border-hairline bg-surface/60 p-1">
                  {(["criar", "entrar"] as AuthTab[]).map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => { setTab(t); setAuthError(null); }}
                      className={`rounded-full px-5 py-2 text-[14px] font-semibold transition-colors ${tab === t ? "bg-raio text-white" : "text-slatey hover:text-cloud"}`}
                    >
                      {t === "criar" ? "Criar conta" : "Já tenho conta"}
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4">
                  {tab === "criar" && (
                    <>
                      <Field label="Nome completo" value={nome} onChange={setNome} autoComplete="name" />
                      <Field label="CPF" value={cpf} onChange={setCpf} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" />
                    </>
                  )}
                  <Field label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" />
                  <Field
                    label={tab === "criar" ? "Senha (mín. 8 caracteres)" : "Senha"}
                    type="password" value={senha} onChange={setSenha}
                    autoComplete={tab === "criar" ? "new-password" : "current-password"}
                  />
                </div>

                {authError && <div className="mt-4"><Alert tone="error">{authError}</Alert></div>}

                <button
                  type="button" onClick={handleAuth} disabled={authBusy}
                  className="btn-primary mt-6 w-full py-3.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authBusy
                    ? "Um instante..."
                    : tab === "criar"
                    ? "Criar conta e verificar e-mail"
                    : "Entrar e continuar"}
                </button>

                {tab === "criar" && (
                  <p className="mt-3 text-[13px] leading-relaxed text-muted">
                    Você receberá um código de 6 dígitos para confirmar seu e-mail antes de pagar.
                    O CPF é exigido pelo Mercado Pago para assinaturas recorrentes.
                  </p>
                )}

                {tab === "criar" && (
                  <p className="mt-2 text-[13px] text-muted">
                    Ao criar uma conta você concorda com os nossos{" "}
                    <a
                      href="/termos-de-uso/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-cloud"
                    >
                      Termos de Uso
                    </a>{" "}
                    e a nossa{" "}
                    <a
                      href="/politica-de-privacidade/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-cloud"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </p>
                )}
              </>
            )}
          </motion.section>

          {/* ───── Coluna direita: resumo + pagamento ───── */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-7 sm:p-9 lg:sticky lg:top-28" aria-label="Resumo do pedido"
          >
            <h2 className="font-display text-xl font-bold text-cloud">2. Resumo do pedido</h2>

            <div className="mt-5 rounded-2xl border border-hairline bg-surface/50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[15px] font-bold text-cloud">StamFlow Individual</p>
                  <p className="mt-0.5 text-[13.5px] text-slatey">Período {period.label.toLowerCase()}</p>
                </div>
                <p className="shrink-0 font-display text-[15px] font-bold text-cloud tabular-nums">{formatBRL(price.total)}</p>
              </div>
              <div className="mt-4 border-t border-hairline pt-4 text-[13.5px] leading-relaxed text-muted">
                Equivale a <span className="text-slatey">{formatBRL(price.perMonth)}/mês</span>
                {price.savingsPct > 0 && (
                  <> · <span className="font-semibold text-signal">economia de {price.savingsPct}%</span></>
                )}
                <br />
                Cobrança recorrente a cada {period.months === 1 ? "mês" : `${period.months} meses`} · cancele quando quiser.
              </div>
            </div>

            {logged && (
              <div className="mt-7">
                <h2 className="font-display text-xl font-bold text-cloud">3. Dados do cartão</h2>

                {/* Os containers dos Secure Fields precisam existir no DOM antes
                    do mount() do SDK, então ficam sempre montados aqui; o
                    skeleton apenas os cobre enquanto o SDK não está pronto. */}
                <div className="relative mt-4">
                  {!mpReady && (
                    <div
                      className="absolute inset-0 z-10 animate-pulse rounded-2xl bg-white/5"
                      aria-hidden="true"
                    />
                  )}

                  <div
                    className={`grid gap-4 transition-opacity duration-200 ${mpReady ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    aria-hidden={!mpReady}
                  >
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

                    <Field
                      label="Nome impresso no cartão"
                      value={cardHolder}
                      onChange={setCardHolder}
                      autoComplete="cc-name"
                      placeholder="Exatamente como no cartão"
                    />

                    <div className="grid grid-cols-[auto_1fr] items-end gap-3">
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
                </div>

                {payError && <div className="mt-4"><Alert tone="error">{payError}</Alert></div>}

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

            {!logged && !checkingSession && authStep !== "awaiting_code" && (
              <p className="mt-6 text-center text-[13px] text-muted">
                Identifique-se ao lado para liberar o pagamento.
              </p>
            )}
            {authStep === "awaiting_code" && (
              <p className="mt-6 text-center text-[13px] text-muted">
                Verifique o e-mail ao lado para liberar o pagamento.
              </p>
            )}
          </motion.aside>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, inputMode, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string; inputMode?: "numeric" | "text"; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13.5px] font-medium text-slatey">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete} inputMode={inputMode} placeholder={placeholder}
        className="w-full rounded-field border border-hairline bg-surface/60 px-4 py-3 text-[15px] text-cloud placeholder:text-muted focus:border-raio/60 focus:outline-none focus:ring-2 focus:ring-raio/25"
      />
    </label>
  );
}
