"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { AppButton, AppIconButton } from "@/components/app-actions";

export function ConfirmActionButton({
  children,
  confirmMessage,
  color = "error",
  disabled,
  label
}: {
  children: ReactNode;
  confirmMessage: string;
  color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  disabled?: boolean;
  label: string;
}) {
  const buttonColor = color === "default" ? undefined : color;

  return (
    <>
      <Box sx={{ display: { xs: "none", md: "inline-flex" } }}>
        <AppIconButton
          color={color}
          disabled={disabled}
          label={label}
          onClick={(event) => {
            if (!window.confirm(confirmMessage)) {
              event.preventDefault();
            }
          }}
          type="submit"
        >
          {children}
        </AppIconButton>
      </Box>
      <Box sx={{ display: { xs: "inline-flex", md: "none" } }}>
        <AppButton
          color={buttonColor}
          disabled={disabled}
          minWidth={0}
          onClick={(event) => {
            if (!window.confirm(confirmMessage)) {
              event.preventDefault();
            }
          }}
          startIcon={children}
          sx={{ justifyContent: "flex-start", whiteSpace: "normal" }}
          type="submit"
          variant={color === "default" ? "text" : "outlined"}
        >
          {label}
        </AppButton>
      </Box>
    </>
  );
}
