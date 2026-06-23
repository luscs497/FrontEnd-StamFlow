"use client";

import { Logo } from "@/components/Brand";
import { useModals } from "@/components/Providers";
import { LOGIN_URL } from "@/lib/config";

export function Footer() {
  const { openTrial, openEnterprise } = useModals();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[88rem] px-6 py-16 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size={23} />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-slatey">
              Postura e humor lidos em tempo real, no seu navegador, para cuidar da sua energia ao longo do dia.
            </p>
          </div>

          <FooterCol title="Produto">
            <FooterLink href="#como-funciona">Como funciona</FooterLink>
            <FooterLink href="#privacidade">Privacidade</FooterLink>
            <FooterLink href="#recursos">Recursos</FooterLink>
            <FooterLink href="#planos">Planos</FooterLink>
          </FooterCol>

          <FooterCol title="Conta">
            <FooterLink href={LOGIN_URL}>Entrar</FooterLink>
            <FooterButton onClick={openTrial}>Teste grátis</FooterButton>
            <FooterLink href="#empresas">Para empresas</FooterLink>
            <FooterButton onClick={openEnterprise}>Falar com vendas</FooterButton>
          </FooterCol>

          <FooterCol title="Ajuda">
            <FooterLink href="#duvidas">Dúvidas</FooterLink>
            <FooterLink href={LOGIN_URL}>Recuperar acesso</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-7 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">© {year} StamFlow. Todos os direitos reservados.</p>
          <p className="text-xs text-muted">Feito com energia — e sem enviar o seu vídeo a lugar nenhum.</p>
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
      <button onClick={onClick} className="text-[15px] text-slatey transition-colors hover:text-cloud">
        {children}
      </button>
    </li>
  );
}
