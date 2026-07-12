"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useState } from "react";

type JobFunctionOption = {
  id: string;
  name: string;
  description?: string | null;
};

export function CandidateJobFunctionsAutocomplete({ options }: { options: JobFunctionOption[] }) {
  const [selected, setSelected] = useState<JobFunctionOption[]>([]);

  return (
    <>
      <Autocomplete
        disableCloseOnSelect
        filterSelectedOptions
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        multiple
        noOptionsText="Nenhuma função disponível"
        onChange={(_, value) => setSelected(value)}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            helperText="Selecione uma ou mais funções para as quais deseja se candidatar."
            label="Funções de interesse"
            required={selected.length === 0}
            size="small"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.name}
              size="small"
              variant="outlined"
            />
          ))
        }
        size="small"
        value={selected}
      />
      {selected.map((option) => (
        <input key={option.id} name="systemJobFunctionIds" type="hidden" value={option.id} />
      ))}
    </>
  );
}
