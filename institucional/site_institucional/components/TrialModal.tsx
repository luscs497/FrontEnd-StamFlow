"use client";

import { useState } from "react";
import { Modal, CloseButton } from "@/components/ui/Modal";
import { Alert, Spinner } from "@/components/ui/Alert";
import { LOGIN_URL, TRIAL_DAYS } from "@/lib/config";

type Status = "idle" | "loading" | "error" | "success";

interface FieldErrors {
  nome?: string;
  email?: string;
  senha?: string;
}

/**
 * Fluxo de teste grátis (cadastro real, mockado nesta fase).
 * Integração futura: POST /auth/register -> POST /subscription/trial/start,
 * e então redirecionar para o painel (login.stamflow.com.br).
 */
export function TrialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  function reset() {
    setNome("");
    setEmail("");
    setSenha("");
    setErrors({});
    setStatus("idle");
  }

  function handleClose() {
    onClose();
    // pequeno atraso para não "piscar" o reset durante a animação de saída
    window.setTimeout(reset, 250);
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (nome.trim().length < 2) next.nome = "Digite o seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Use um e-mail válido.";
    if (senha.length < 8) next.senha = "A senha precisa de pelo menos 8 caracteres.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setStatus("loading");

    // ── Integração futura ───────────────────────────────────────────────
    // const r = await fetch(ENDPOINTS.register, { method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ nome, email, senha }) });
    // if (!r.ok) throw ...
    // await fetch(ENDPOINTS.trialStart, { method: "POST", ... });
    // window.location.href = LOGIN_URL; // ou painel
    // ────────────────────────────────────────────────────────────────────

    // Mock: simula a chamada de rede.
    await new Promise((res) => setTimeout(res, 1100));
    setStatus("success");
  }

  return (
    <Modal open={open} onClose={handleClose} labelledBy="trial-title">
      <CloseButton onClose={handleClose} />

      {status === "success" ? (
        <div className="pt-2 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-raio text-ink">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 11.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 id="trial-title" className="font-display text-2xl font-bold">
            Conta criada
          </h2>
          <p className="mt-2 text-sm text-slatey">
            Seu teste de {TRIAL_DAYS} dias com o produto completo já está ativo. Vamos te levar ao seu painel.
          </p>
          <a href={LOGIN_URL} className="btn-primary mt-5 w-full">
            Ir para o meu painel
          </a>
          <p className="mt-3 text-xs text-muted">
            Não redirecionou?{" "}
            <a href={LOGIN_URL} className="text-brand-cyan underline underline-offset-2">
              Abrir manualmente
            </a>
          </p>
        </div>
      ) : (
        <>
          <p className="eyebrow mb-2">
            <span className="eyebrow-tick" /> Teste grátis · {TRIAL_DAYS} dias
          </p>
          <h2 id="trial-title" className="font-display text-2xl font-bold">
            Comece em menos de um minuto
          </h2>
          <p className="mt-1.5 text-sm text-slatey">
            Produto completo, sem cartão. Você cuida da sua energia hoje mesmo.
          </p>

          <div className="mt-5 space-y-4">
            <Field
              id="trial-nome"
              label="Nome completo"
              value={nome}
              onChange={setNome}
              error={errors.nome}
              autoComplete="name"
              placeholder="Como podemos te chamar"
            />
            <Field
              id="trial-email"
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              autoComplete="email"
              placeholder="voce@email.com"
            />
            <Field
              id="trial-senha"
              label="Senha"
              type="password"
              value={senha}
              onChange={setSenha}
              error={errors.senha}
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
            />

            {status === "error" && (
              <Alert tone="error">Não foi possível criar a conta agora. Tente novamente em instantes.</Alert>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <Spinner /> Criando conta…
                </>
              ) : (
                "Começar teste grátis"
              )}
            </button>

            <p className="text-center text-xs text-muted">
              Já tem conta?{" "}
              <a href={LOGIN_URL} className="text-brand-cyan underline underline-offset-2">
                Entrar
              </a>
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-cloud">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      {error && (
        <p id={describedBy} className="mt-1.5 text-xs text-[rgb(252,165,165)]">
          {error}
        </p>
      )}
    </div>
  );
}
