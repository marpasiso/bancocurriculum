"use client";

import type { ReactNode } from "react";
import { AppIconButton } from "@/components/app-actions";

export function ConfirmActionButton({
  children,
  confirmMessage,
  disabled,
  label
}: {
  children: ReactNode;
  confirmMessage: string;
  disabled?: boolean;
  label: string;
}) {
  return (
    <AppIconButton
      color="error"
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
  );
}
