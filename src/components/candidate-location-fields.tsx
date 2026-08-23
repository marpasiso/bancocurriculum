"use client";

import { useState } from "react";
import { CandidateStateAutocomplete } from "@/components/candidate-state-autocomplete";
import type { BrazilianState } from "@/lib/brazilian-states";

export function CandidateLocationFields() {
  const [selectedState, setSelectedState] = useState<BrazilianState | null>(null);
  const [city, setCity] = useState("");
  const hasState = Boolean(selectedState);

  function handleStateChange(nextState: BrazilianState | null) {
    setSelectedState(nextState);

    if (!nextState) {
      setCity("");
    }
  }

  return (
    <>
      <label>
        Cidade
        <input
          disabled={!hasState}
          maxLength={80}
          name="city"
          onChange={(event) => setCity(event.target.value)}
          placeholder={hasState ? "Informe sua cidade" : "Selecione a UF primeiro"}
          required
          value={city}
        />
      </label>
      <div className="form-field-block">
        <CandidateStateAutocomplete onChange={handleStateChange} value={selectedState} />
      </div>
    </>
  );
}
