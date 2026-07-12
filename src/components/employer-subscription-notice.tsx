"use client";

import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { notifyInfo, notifyWarning } from "@/modules/notifications/user-feedback.skill";

export function EmployerSubscriptionNotice({
  hasHistory,
  shouldShow
}: {
  hasHistory: boolean;
  shouldShow: boolean;
}) {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const displayedRef = useRef(false);

  useEffect(() => {
    if (!shouldShow || displayedRef.current) {
      return;
    }

    displayedRef.current = true;
    const message = hasHistory
      ? "Sua assinatura está vencida. Renove para voltar a consultar candidatos."
      : "Assine para acessar a busca e os detalhes dos candidatos.";

    notifyInfo(enqueueSnackbar, message, {
      autoHideDuration: 8000,
      className: "subscription-notice-snackbar",
      action: (snackbarId) => (
        <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={0.5} sx={{ flexShrink: 0, ml: 1 }}>
          <Button
            color="inherit"
            component={Link}
            href="/empregador/assinatura#cobranca-pix"
            onClick={() => closeSnackbar(snackbarId)}
            size="small"
            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
            variant="outlined"
          >
            {hasHistory ? "Renovar assinatura" : "Assinar"}
          </Button>
          <IconButton
            aria-label="Fechar notificação"
            color="inherit"
            onClick={() => closeSnackbar(snackbarId)}
            size="small"
            sx={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: "50%",
              p: 0,
              flexShrink: 0,
            }}
          >
  <CloseIcon fontSize="small" />
</IconButton>
        </Stack>
      )
    });
  }, [closeSnackbar, enqueueSnackbar, hasHistory, shouldShow]);

  return null;
}
