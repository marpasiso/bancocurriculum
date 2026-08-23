"use client";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import {
  brazilianStates,
  formatBrazilianStateOption,
  type BrazilianState
} from "@/lib/brazilian-states";

type CandidateStateAutocompleteProps = {
  name?: string;
  onChange?: (value: BrazilianState | null) => void;
  value?: BrazilianState | null;
};

export function CandidateStateAutocomplete({ name = "state", onChange, value }: CandidateStateAutocompleteProps) {
  const [internalSelected, setInternalSelected] = useState<BrazilianState | null>(null);
  const selected = value === undefined ? internalSelected : value;

  function handleChange(nextValue: BrazilianState | null) {
    if (value === undefined) {
      setInternalSelected(nextValue);
    }

    onChange?.(nextValue);
  }

  return (
    <label>
      UF
      <Autocomplete
        autoHighlight
        fullWidth
        getOptionLabel={formatBrazilianStateOption}
        isOptionEqualToValue={(option, currentValue) => option.code === currentValue.code}
        noOptionsText="Nenhum estado encontrado"
        onChange={(_, nextValue) => handleChange(nextValue)}
        options={brazilianStates}
        renderInput={(params) => (
          <TextField
            {...params}
            inputProps={{
              ...params.inputProps,
              "aria-label": "UF"
            }}
            placeholder="Selecione"
            required
            size="small"
          />
        )}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: "var(--control-height)",
            padding: "0 36px 0 0",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            color: "var(--text)",
            font: "inherit"
          },
          "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
            boxSizing: "border-box",
            minHeight: "calc(var(--control-height) - 2px)",
            padding: "7px 9px !important",
            color: "var(--text)",
            font: "inherit"
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--border-strong)"
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--border-strong)"
          },
          "& .MuiOutlinedInput-root.Mui-focused": {
            outline: "3px solid rgba(28, 126, 214, 0.25)",
            outlineOffset: "2px"
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--accent)",
            borderWidth: "1px"
          },
          "& .MuiAutocomplete-endAdornment": {
            right: "8px"
          },
          "& .MuiAutocomplete-endAdornment .MuiButtonBase-root": {
            width: "28px",
            minWidth: "28px",
            height: "28px",
            minHeight: "28px",
            padding: "2px",
            border: 0,
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: "var(--muted)"
          }
        }}
        value={selected}
      />
      <input name={name} readOnly type="hidden" value={selected?.code ?? ""} />
    </label>
  );
}
