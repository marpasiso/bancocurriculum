"use client";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { SnackbarProvider, useSnackbar } from "notistack";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning
} from "@/modules/notifications/user-feedback.skill";

const successMessages: Record<string, string> = {
  saved: "Alterações salvas com sucesso.",
  passwordChanged: "Senha alterada com sucesso.",
  created: "Cadastro realizado com sucesso.",
  updated: "Atualização realizada com sucesso.",
  login: "Login realizado com sucesso.",
  employerRegistered: "Conta de empregador criada com sucesso.",
  pixConfirmed: "Pagamento Pix confirmado e assinatura ativada com sucesso.",
  paymentCreated: "Pagamento Pix registrado com sucesso.",
  subscriptionActivated: "Assinatura ativada com sucesso.",
  adminCreated: "Administrador cadastrado com sucesso.",
  adminUpdated: "Administrador atualizado com sucesso.",
  adminBlocked: "Administrador bloqueado com sucesso.",
  adminUnblocked: "Administrador reativado com sucesso.",
  employerBlocked: "Empregador bloqueado com sucesso.",
  employerUnblocked: "Empregador reativado com sucesso.",
  candidateUpdated: "Dados do candidato atualizados com sucesso.",
  candidateInactivated: "Candidato inativado com sucesso.",
  candidateInProcess: "Candidato reservado com sucesso.",
  candidateReactivated: "Candidato reativado com sucesso.",
  candidateAnonymized: "Candidato anonimizado com sucesso.",
  candidateDeleted: "Candidato excluído com sucesso.",
  activated: "Registro ativado com sucesso.",
  deactivated: "Registro inativado com sucesso."
};

const pathSuccessMessages: Record<string, Partial<Record<keyof typeof successMessages, string>>> = {
  "/admin/configuracoes": {
    saved: "Configurações salvas com sucesso."
  },
  "/empregador/funcoes": {
    created: "Função cadastrada com sucesso.",
    updated: "Função atualizada com sucesso.",
    activated: "Função ativada com sucesso.",
    deactivated: "Função inativada com sucesso."
  },
  "/admin/funcoes": {
    created: "Opção de trabalho cadastrada com sucesso.",
    updated: "Opção de trabalho atualizada com sucesso.",
    activated: "Opção de trabalho ativada com sucesso.",
    deactivated: "Opção de trabalho inativada com sucesso."
  },
  "/candidato/obrigado": {
    created: "Currículo cadastrado com sucesso."
  },
  "/lgpd/obrigado": {
    created: "Solicitação de dados registrada com sucesso."
  },
  "/admin/empregadores": {
    updated: "Dados do empregador atualizados com sucesso."
  },
  "/admin/pagamentos-pix": {
    saved: "Configurações da assinatura salvas com sucesso."
  },
  "/empregador/assinatura": {
    paymentCreated: "Cobrança Pix gerada. O acesso será liberado após confirmação do pagamento."
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  return (
    <SnackbarProvider
      action={(snackbarId) => <SnackbarCloseButton snackbarId={snackbarId} />}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      autoHideDuration={3600}
      maxSnack={3}
      preventDuplicate
    >
      <Suspense fallback={null}>
        <NotificationEvents />
      </Suspense>
      {children}
    </SnackbarProvider>
  );
}

function SnackbarCloseButton({ snackbarId }: { snackbarId: string | number }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton
      aria-label="Fechar notificação"
      color="inherit"
      onClick={() => closeSnackbar(snackbarId)}
      size="small"
      sx={{
        flexShrink: 0,
        height: 28,
        minHeight: 28,
        minWidth: 28,
        p: 0.25,
        width: 28
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );
}

function NotificationEvents() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const lastKeyRef = useRef("");
  const searchKey = searchParams.toString();

  const pathMessages = useMemo(() => pathSuccessMessages[pathname] ?? {}, [pathname]);

  useEffect(() => {
    const eventKey = `${pathname}?${searchKey}`;
    if (!searchKey || lastKeyRef.current === eventKey) {
      return;
    }

    lastKeyRef.current = eventKey;

    const error = searchParams.get("error");
    if (error) {
      notifyError(enqueueSnackbar, error);
      clearNotificationParams();
      return;
    }

    if (searchParams.get("warning")) {
      notifyWarning(enqueueSnackbar, searchParams.get("warning") ?? undefined);
      clearNotificationParams();
      return;
    }

    if (searchParams.get("info")) {
      notifyInfo(enqueueSnackbar, searchParams.get("info") ?? undefined);
      clearNotificationParams();
      return;
    }

    for (const [key, fallbackMessage] of Object.entries(successMessages)) {
      if (searchParams.get(key) === "1") {
        notifySuccess(enqueueSnackbar, pathMessages[key] ?? fallbackMessage);
        clearNotificationParams();
        return;
      }
    }
    function clearNotificationParams() {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("error");
      nextParams.delete("warning");
      nextParams.delete("info");

      for (const key of Object.keys(successMessages)) {
        nextParams.delete(key);
      }

      const nextSearch = nextParams.toString();
      router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
    }
  }, [enqueueSnackbar, pathMessages, pathname, router, searchKey, searchParams]);

  return null;
}


