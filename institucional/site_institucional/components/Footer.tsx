"use client";

import { Flame, Logo } from "@/components/Brand";
import { useModals } from "@/components/Providers";
import { LOGIN_URL } from "@/lib/config";

/**
 * Rodapé em duas variantes, seguindo os documentos de copy:
 * - "default" (B2C): 4 colunas — logo+texto, Produto, Acesso e Termos.
 * - "empresas" (B2B): 3 colunas — logo+texto, Produto e Termos.
 */
export function Footer({ variant = "default" }: { variant?: "default" | "empresas" }) {
  const { openEnterprise } = useModals();
  const isEmpresas = variant === "empresas";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[88rem] px-6 py-16 sm:px-10">
        <div
          className={`grid gap-10 ${
            isEmpresas ? "lg:grid-cols-[1.6fr_1fr_1fr]" : "lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
          }`}
        >
          <div>
            <Logo size={23} />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-slatey">
              {isEmpresas
                ? "Proteção da saúde, disposição e produtividade, durante a jornada de trabalho no computador."
                : "Proteção da sua saúde, disposição e produtividade, durante a jornada de trabalho no computador."}
            </p>
          </div>

          {isEmpresas ? (
            <FooterCol title="Produto">
              <FooterLink href="/empresas/#stamflow-b2b">Como Funciona</FooterLink>
              <FooterLink href="/empresas/#planos-corporativos">Planos para Empresas</FooterLink>
              <FooterButton onClick={openEnterprise}>Solicitar Demonstração</FooterButton>
            </FooterCol>
          ) : (
            <>
              <FooterCol title="Produto">
                <FooterLink href="/#como-funciona">Como Funciona</FooterLink>
                <FooterLink href="/#recursos">Recursos</FooterLink>
                <FooterLink href="/#planos">Planos</FooterLink>
              </FooterCol>

              <FooterCol title="Acesso">
                <FooterLink href={LOGIN_URL}>Entrar</FooterLink>
                <FooterLink href="/#planos">Escolher meu Plano</FooterLink>
                <FooterButton onClick={openEnterprise}>
                  Solicitar Demonstração para Empresas
                </FooterButton>
              </FooterCol>
            </>
          )}

          <FooterCol title="Termos">
            <FooterLink href={isEmpresas ? "/empresas/#duvidas" : "/#duvidas"}>Dúvidas</FooterLink>
            <FooterLink href="/politica-de-privacidade">Política de privacidade</FooterLink>
            <FooterLink href="/termos-de-uso">Termos de uso</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 space-y-2 border-t border-hairline pt-7">
          <p className="text-xs text-muted">
            Jornada: Startup NE · InoveNow · Dealist. · Empretec · Epicentro IA
          </p>
          <p className="text-xs text-muted">
            Shopping Seaway — Av. Engenheiro Roberto Freire, 1962, Capim Macio, Natal/RN · CNPJ
            67.806.396/0001-30
          </p>
        </div>

        <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-7 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">© {year} StamFlow. Todos os direitos reservados.</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted">
            Feito com Energia, Foco e Flow <Flame size={14} />
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-wider text-muted">{title}</p>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} className="text-[15px] text-slatey transition-colors hover:text-cloud">
        {children}
      </a>
    </li>
  );
}

function FooterButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button onClick={onClick} className="text-left text-[15px] text-slatey transition-colors hover:text-cloud">
        {children}
      </button>
    </li>
  );
}
