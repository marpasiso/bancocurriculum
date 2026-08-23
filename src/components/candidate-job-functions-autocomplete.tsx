"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useState } from "react";

const MAX_SELECTED_JOB_FUNCTIONS = 8;

type JobFunctionOption = {
  id: string;
  name: string;
  description?: string | null;
};

export function CandidateJobFunctionsAutocomplete({ options }: { options: JobFunctionOption[] }) {
  const [selected, setSelected] = useState<JobFunctionOption[]>([]);
  const reachedLimit = selected.length >= MAX_SELECTED_JOB_FUNCTIONS;

  return (
    <>
      <Autocomplete
        disableCloseOnSelect
        filterSelectedOptions
        getOptionDisabled={() => reachedLimit}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        multiple
        noOptionsText="Nenhuma função disponível"
        onChange={(_, value) => {
          if (value.length <= MAX_SELECTED_JOB_FUNCTIONS) {
            setSelected(value);
          }
        }}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            helperText={
              reachedLimit
                ? `Você pode selecionar no máximo ${MAX_SELECTED_JOB_FUNCTIONS} funções.`
                : `Selecione até ${MAX_SELECTED_JOB_FUNCTIONS} funções de interesse.`
            }
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
