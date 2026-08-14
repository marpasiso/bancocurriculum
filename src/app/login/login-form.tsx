"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Alert, Box, Stack, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AppButton } from "@/components/app-actions";
import { notifyWarning } from "@/modules/notifications/user-feedback.skill";

type LoginFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultEmail?: string;
  defaultError?: string;
};

export function LoginForm({ action, defaultEmail = "", defaultError = "" }: LoginFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [formError, setFormError] = useState(defaultError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const lastValidationRef = useRef("");

  useEffect(() => {
    if (!defaultError) return;
    submittingRef.current = false;
    lastValidationRef.current = "";
    setIsSubmitting(false);
    setFormError(defaultError);
  }, [defaultError]);

  function showValidation(message: string) {
    if (lastValidationRef.current === message) return;
    lastValidationRef.current = message;
    notifyWarning(enqueueSnackbar, message);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const email = form.elements.namedItem("email") as HTMLInputElement | null;
    const password = form.elements.namedItem("password") as HTMLInputElement | null;

    if (submittingRef.current) {
      event.preventDefault();
      return;
    }

    if (!email?.value.trim() || !password?.value) {
      event.preventDefault();
      setFormError("Preencha e-mail e senha para entrar.");
      showValidation("Preencha e-mail e senha para entrar.");
      (email?.value.trim() ? password : email)?.focus();
      return;
    }

    if (!email.validity.valid) {
      event.preventDefault();
      setFormError("Informe um e-mail válido para entrar.");
      showValidation("Informe um e-mail válido para entrar.");
      email.focus();
      return;
    }

    setFormError("");
    submittingRef.current = true;
    setIsSubmitting(true);
  }

  return (
    <Box action={action} component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={{ xs: 1.25, md: 2 }}>
        {formError ? (
          <Alert severity="error" variant="outlined">
            {formError}
          </Alert>
        ) : null}
        <TextField
          autoComplete="email"
          defaultValue={defaultEmail}
          fullWidth
          label="E-mail"
          name="email"
          inputProps={{ inputMode: "email", maxLength: 160 }}
          required
          size="small"
          type="email"
          onChange={() => setFormError("")}
        />
        <TextField
          autoComplete="current-password"
          fullWidth
          label="Senha"
          name="password"
          required
          size="small"
          type="password"
          onChange={() => setFormError("")}
        />
        <AppButton
          aria-busy={isSubmitting}
          disabled={isSubmitting}
          fullWidth
          minWidth="100%"
          size="medium"
          startIcon={<LockOutlinedIcon fontSize="small" />}
          type="submit"
          variant="contained"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </AppButton>
      </Stack>
    </Box>
  );
}
