"use client";

import { AppButton } from "@/components/app-actions";
import { ButtonLink } from "@/components/ui";
import {
  cancelEmployerJobOpeningAction,
  closeEmployerJobOpeningAction,
  pauseEmployerJobOpeningAction,
  resumeEmployerJobOpeningAction
} from "@/modules/job-openings-skill/actions";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { useState } from "react";

type JobOpeningActionsProps = {
  jobOpeningId: string;
  status: "OPEN" | "PAUSED" | "CLOSED" | "CANCELED";
};

export function JobOpeningActions({ jobOpeningId, status }: JobOpeningActionsProps) {
  const [confirmation, setConfirmation] = useState<"close" | "cancel" | null>(null);

  return (
    <>
      <div className="actions">
        {status === "OPEN" ? (
          <ButtonLink href={`/empregador/buscar-candidatos?jobOpeningId=${encodeURIComponent(jobOpeningId)}`}>
            Buscar candidatos para esta vaga
          </ButtonLink>
        ) : null}

        {status === "OPEN" ? (
          <form action={pauseEmployerJobOpeningAction} className="inline-form">
            <input name="jobOpeningId" type="hidden" value={jobOpeningId} />
            <AppButton type="submit" variant="outlined">Pausar vaga</AppButton>
          </form>
        ) : null}

        {status === "PAUSED" ? (
          <form action={resumeEmployerJobOpeningAction} className="inline-form">
            <input name="jobOpeningId" type="hidden" value={jobOpeningId} />
            <AppButton type="submit" variant="outlined">Tirar da pausa</AppButton>
          </form>
        ) : null}

        {status === "OPEN" || status === "PAUSED" ? (
          <AppButton onClick={() => setConfirmation("close")} type="button" variant="outlined">
            Encerrar vaga
          </AppButton>
        ) : null}

        {status !== "CANCELED" && status !== "CLOSED" ? (
          <AppButton color="error" onClick={() => setConfirmation("cancel")} type="button" variant="outlined">
            Cancelar vaga
          </AppButton>
        ) : null}
      </div>

      <Dialog
        aria-labelledby="close-job-opening-title"
        fullWidth
        maxWidth="xs"
        onClose={() => setConfirmation(null)}
        open={confirmation === "close"}
      >
        <DialogTitle id="close-job-opening-title">Encerrar vaga</DialogTitle>
        <DialogContent>
          <p>Confirme se deseja encerrar esta vaga.</p>
        </DialogContent>
        <DialogActions>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
            <Box component="form" action={closeEmployerJobOpeningAction} className="inline-form" sx={{ flex: 1 }}>
              <input name="jobOpeningId" type="hidden" value={jobOpeningId} />
              <input name="confirmClose" type="hidden" value="yes" />
              <AppButton fullWidth type="submit" variant="contained">Confirmar</AppButton>
            </Box>
            <AppButton fullWidth onClick={() => setConfirmation(null)} type="button" variant="outlined">
              Cancelar
            </AppButton>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        aria-labelledby="cancel-job-opening-title"
        fullWidth
        maxWidth="xs"
        onClose={() => setConfirmation(null)}
        open={confirmation === "cancel"}
      >
        <DialogTitle id="cancel-job-opening-title">Cancelar vaga</DialogTitle>
        <DialogContent>
          <p>Esta ação deve ser usada somente se a vaga não será mais utilizada.</p>
        </DialogContent>
        <DialogActions>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
            <Box component="form" action={cancelEmployerJobOpeningAction} className="inline-form" sx={{ flex: 1 }}>
              <input name="jobOpeningId" type="hidden" value={jobOpeningId} />
              <input name="confirmCancel" type="hidden" value="yes" />
              <AppButton color="error" fullWidth type="submit" variant="contained">Confirmar</AppButton>
            </Box>
            <AppButton fullWidth onClick={() => setConfirmation(null)} type="button" variant="outlined">
              Voltar
            </AppButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}
