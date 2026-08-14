"use client";

import { AppButton } from "@/components/app-actions";
import { startCandidateProcessAction } from "@/modules/candidate-detail-skill/actions";
import Stack from "@mui/material/Stack";
import { useMemo, useState } from "react";

type CompatibleJobOpening = {
  id: string;
  systemJobFunction: {
    name: string;
  };
  title: string;
};

type CandidateReservationFormProps = {
  candidateId: string;
  compatibleJobOpenings: CompatibleJobOpening[];
  helpMessage?: string;
};

export function CandidateReservationForm({
  candidateId,
  compatibleJobOpenings,
  helpMessage
}: CandidateReservationFormProps) {
  const [selectedJobOpeningId, setSelectedJobOpeningId] = useState("");
  const compatibleJobOpeningIds = useMemo(
    () => new Set(compatibleJobOpenings.map((jobOpening) => jobOpening.id)),
    [compatibleJobOpenings]
  );
  const canReserve = compatibleJobOpeningIds.has(selectedJobOpeningId);

  return (
    <form action={startCandidateProcessAction} className="inline-form">
      <input name="candidateId" type="hidden" value={candidateId} />
      <Stack
        alignItems={{ xs: "stretch", sm: "end" }}
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ width: "100%" }}
      >
        <label className="job-reservation-select" htmlFor="candidate-reservation-job">
          Vaga compatível
          <select
            aria-label="Vaga compatível para reserva"
            id="candidate-reservation-job"
            name="jobOpeningId"
            onChange={(event) => setSelectedJobOpeningId(event.target.value)}
            required
            value={selectedJobOpeningId}
          >
            <option value="">Selecione a vaga compatível</option>
            {compatibleJobOpenings.map((jobOpening) => (
              <option key={jobOpening.id} value={jobOpening.id}>
                {jobOpening.title} - {jobOpening.systemJobFunction.name}
              </option>
            ))}
          </select>
        </label>
        <AppButton
          disabled={!canReserve}
          sx={{ width: { xs: "100%", sm: "auto" } }}
          type="submit"
          variant="contained"
        >
          Reservar candidato
        </AppButton>
      </Stack>
      {helpMessage ? <span className="field-help">{helpMessage}</span> : null}
    </form>
  );
}
