"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TrialModal } from "@/components/TrialModal";
import { EnterpriseModal } from "@/components/EnterpriseModal";

interface ModalApi {
  openTrial: () => void;
  openEnterprise: () => void;
}

const ModalContext = createContext<ModalApi | null>(null);

export function useModals(): ModalApi {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals deve ser usado dentro de <Providers>");
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  const [trialOpen, setTrialOpen] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

  const openTrial = useCallback(() => setTrialOpen(true), []);
  const openEnterprise = useCallback(() => setEnterpriseOpen(true), []);

  return (
    <ModalContext.Provider value={{ openTrial, openEnterprise }}>
      {children}
      <TrialModal open={trialOpen} onClose={() => setTrialOpen(false)} />
      <EnterpriseModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} />
    </ModalContext.Provider>
  );
}
