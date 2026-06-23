"use client";

import { useState } from "react";
import { Modal, CloseButton } from "@/components/ui/Modal";
import { Alert, Spinner } from "@/components/ui/Alert";
import { SALES_WHATSAPP } from "@/lib/config";

type Status = "idle" | "loading" | "error" | "success";

interface Form {
  empresa: string;
  contato: string;
  colaboradores: string;
  gestores: string;
}

interface FieldErrors {
  empresa?: string;
  contato?: string;
  colaboradores?: string;
  gestores?: string;
}

/**
 * Fluxo empresarial: sem preço fixo nem checkout. O formulário monta um link
 * wa.me pré-preenchido com o resumo do pedido (clique-para-conversar).
 * Integração futura: POST /enterprise/request -> devolve o link + confirmação.
 */
export function EnterpriseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<Form>({ empresa: "", contato: "", colaboradores: "", gestores: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [waLink, setWaLink] = useState("");

  function set<K extends keyof Form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm({ empresa: "", contato: "", colaboradores: "", gestores: "" });
    setErrors({});
    setStatus("idle");
    setWaLink("");
  }

  function handleClose() {
    onClose();
    window.setTimeout(reset, 250);
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (form.empresa.trim().length < 2) next.empresa = "Informe o nome da empresa.";
    if (form.contato.trim().length < 3) next.contato = "Deixe um e-mail ou telefone de contato.";
    if (!/^\d+$/.test(form.colaboradores) || Number(form.colaboradores) < 1)
      next.colaboradores = "Quantos colaboradores? (número)";
    if (!/^\d+$/.test(form.gestores) || Number(form.gestores) < 1)
      next.gestores = "Quantas licenças de gestor? (número)";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildWaLink(): string {
    const resumo = [
      "Olá! Quero falar sobre o StamFlow para empresas.",
      "",
      `Empresa: ${form.empresa}`,
      `Contato: ${form.contato}`,
      `Colaboradores: ${form.colaboradores}`,
      `Licenças de gestor: ${form.gestores}`,
    ].join("\n");
    return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(resumo)}`;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setStatus("loading");

    // ── Integração futura ───────────────────────────────────────────────
    // const r = await fetch(ENDPOINTS.enterpriseRequest, { method: "POST",
    //   headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    // const data = await r.json(); setWaLink(data.whatsappUrl);
    // ────────────────────────────────────────────────────────────────────

    await new Promise((res) => setTimeout(res, 1000));
    setWaLink(buildWaLink());
    setStatus("success");
  }

  return (
    <Modal open={open} onClose={handleClose} labelledBy="ent-title">
      <CloseButton onClose={handleClose} />

      {status === "success" ? (
        <div className="pt-2 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-raio text-ink">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 11.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 id="ent-title" className="font-display text-2xl font-bold">
            Pedido pronto
          </h2>
          <p className="mt-2 text-sm text-slatey">
            Montamos um resumo com os dados de <strong className="text-cloud">{form.empresa}</strong>. É só abrir
            a conversa — já vai tudo preenchido.
          </p>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
            </svg>
            Abrir conversa no WhatsApp
          </a>
          <p className="mt-3 text-xs text-muted">Sem compromisso. Respondemos com um plano sob medida.</p>
        </div>
      ) : (
        <>
          <p className="eyebrow mb-2">
            <span className="eyebrow-tick" /> Para empresas
          </p>
          <h2 id="ent-title" className="font-display text-2xl font-bold">
            Energia da equipe, sob medida
          </h2>
          <p className="mt-1.5 text-sm text-slatey">
            Conte o tamanho do time. Montamos um plano por licenças e seguimos a conversa no WhatsApp.
          </p>

          <div className="mt-5 space-y-4">
            <Field
              id="ent-empresa"
              label="Nome da empresa"
              value={form.empresa}
              onChange={(v) => set("empresa", v)}
              error={errors.empresa}
              placeholder="Sua empresa"
            />
            <Field
              id="ent-contato"
              label="Contato (e-mail ou telefone)"
              value={form.contato}
              onChange={(v) => set("contato", v)}
              error={errors.contato}
              placeholder="Como falamos com você"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="ent-colab"
                label="Colaboradores"
                value={form.colaboradores}
                onChange={(v) => set("colaboradores", v.replace(/\D/g, ""))}
                error={errors.colaboradores}
                inputMode="numeric"
                placeholder="Ex.: 40"
              />
              <Field
                id="ent-gestores"
                label="Licenças de gestor"
                value={form.gestores}
                onChange={(v) => set("gestores", v.replace(/\D/g, ""))}
                error={errors.gestores}
                inputMode="numeric"
                placeholder="Ex.: 3"
              />
            </div>

            {status === "error" && (
              <Alert tone="error">Algo falhou ao montar o pedido. Tente novamente.</Alert>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <Spinner /> Montando pedido…
                </>
              ) : (
                "Gerar pedido e abrir WhatsApp"
              )}
            </button>
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
  placeholder,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-cloud">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
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
