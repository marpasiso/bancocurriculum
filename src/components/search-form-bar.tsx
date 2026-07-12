"use client";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";

type SearchField = {
  defaultValue?: string;
  label?: string;
  name: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  value?: string;
};

export function SearchFormBar({
  action,
  clearHref,
  fields,
  label,
  loading = false,
  name = "q",
  onChange,
  onClear,
  onSearch,
  placeholder,
  searchLabel = "Buscar",
  value
}: {
  action?: string;
  clearHref?: string;
  fields?: SearchField[];
  label: string;
  loading?: boolean;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onSearch?: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  searchLabel?: string;
  value?: string;
}) {
  const searchFields = fields ?? [{ name, onChange, placeholder: placeholder ?? label, value }];

  return (
    <Box
      action={action}
      className="form-card compact-card"
      component="form"
      onSubmit={onSearch}
      sx={{ display: "grid", gap: 0.75, p: 1.5 }}
    >
      <Typography
        component="label"
        sx={{
          color: "#24364b",
          fontSize: "0.86rem",
          fontWeight: 850,
          lineHeight: 1.2
        }}
      >
        {label}
      </Typography>
      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ width: "100%" }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          sx={{ flex: "1 1 auto", minWidth: 0, width: "100%" }}
        >
          {searchFields.map((field) => (
            <TextField
              defaultValue={field.defaultValue}
              fullWidth
              inputProps={{ "aria-label": field.label ?? label }}
              key={field.name}
              label={field.label}
              name={field.name}
              onChange={field.onChange}
              placeholder={field.placeholder}
              size="small"
              sx={{
                minWidth: 0,
                "& .MuiInputBase-root": {
                  height: 42
                },
                "& .MuiInputBase-input": {
                  boxSizing: "border-box",
                  height: 42,
                  py: 0
                }
              }}
              value={field.value}
            />
          ))}
        </Stack>
        <Stack
          direction={{ xs: "row", sm: "row" }}
          spacing={1}
          sx={{
            flex: "0 0 auto",
            width: { xs: "100%", sm: "auto" },
            "& .MuiButton-root": {
              flex: { xs: "1 1 0", sm: "0 0 116px" },
              height: 42,
              minWidth: { xs: 0, sm: 116 },
              whiteSpace: "nowrap"
            },
            "@media (max-width: 360px)": {
              flexDirection: "column",
              "& .MuiButton-root": {
                width: "100%"
              }
            }
          }}
        >
          <Button disabled={loading} size="small" startIcon={<SearchIcon fontSize="small" />} type="submit" variant="contained">
            {loading ? "Buscando" : searchLabel}
          </Button>
          <Button
            component={Link}
            disabled={loading}
            href={clearHref ?? "#"}
            onClick={onClear}
            size="small"
            startIcon={<ClearIcon fontSize="small" />}
            variant="outlined"
          >
            Limpar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
