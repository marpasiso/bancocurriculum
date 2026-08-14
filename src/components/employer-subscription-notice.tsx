"use client";

import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { notifyWarning } from "@/modules/notifications/user-feedback.skill";

type SubscriptionNoticeStatus = "pending_payment" | "expired" | "new";

const noticeByStatus: Record<SubscriptionNoticeStatus, { message: string; actionLabel: string }> = {
  pending_payment: {
    message: "Existe uma cobrança Pix pendente. Aguarde a confirmação do pagamento.",
    actionLabel: "Ver assinatura"
  },
  expired: {
    message: "Sua assinatura está vencida. Renove para voltar a consultar candidatos.",
    actionLabel: "Renovar assinatura"
  },
  new: {
    message: "Assinatura necessária. Assine para consultar candidatos.",
    actionLabel: "Assinar"
  }
};

export function EmployerSubscriptionNotice({
  employerId,
  status
}: {
  employerId: string;
  status: SubscriptionNoticeStatus | null;
}) {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const displayedStatusRef = useRef<SubscriptionNoticeStatus | null>(null);

  useEffect(() => {
    if (!status || displayedStatusRef.current === status) {
      return;
    }

    const storageKey = `employer-subscription-notice:${employerId}:${status}`;
    if (window.sessionStorage.getItem(storageKey) === "shown") {
      return;
    }

    displayedStatusRef.current = status;
    window.sessionStorage.setItem(storageKey, "shown");
    const notice = noticeByStatus[status];

    notifyWarning(enqueueSnackbar, notice.message, {
      autoHideDuration: 8000,
      action: (snackbarId) => (
        <Stack alignItems="center" direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: 1 }}>
          <Button
            color="inherit"
            component={Link}
            href="/empregador/assinatura"
            onClick={() => closeSnackbar(snackbarId)}
            size="small"
            sx={{
              flexShrink: 0,
              fontWeight: 700,
              minWidth: 0,
              px: 0.75,
              whiteSpace: "nowrap",
              width: "auto"
            }}
          >
            {notice.actionLabel}
          </Button>
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
        </Stack>
      )
    });
  }, [closeSnackbar, employerId, enqueueSnackbar, status]);

  return null;
}
