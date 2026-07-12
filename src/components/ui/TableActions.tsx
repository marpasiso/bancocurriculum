import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";
import type { ReactNode } from "react";
import { ConfirmActionButton } from "../confirm-action-button";

type HiddenInput = {
  name: string;
  value: string;
};

export type TableAction = {
  confirmMessage?: string;
  color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  disabled?: boolean;
  formAction?: (formData: FormData) => void | Promise<void>;
  hiddenInputs?: HiddenInput[];
  href?: string;
  icon: ReactNode;
  label: string;
};

function ActionButton({ action }: { action: TableAction }) {
  const button = (
    <IconButton
      aria-label={action.label}
      color={action.color === "default" ? undefined : action.color}
      disabled={action.disabled}
      size="small"
      sx={{ height: 34, width: 34 }}
      type={action.formAction ? "submit" : "button"}
    >
      {action.icon}
    </IconButton>
  );

  if (action.href && !action.disabled) {
    return (
      <Tooltip title={action.label}>
        <IconButton
          aria-label={action.label}
          color={action.color === "default" ? undefined : action.color}
          component={Link}
          href={action.href}
          size="small"
          sx={{ height: 34, width: 34 }}
        >
          {action.icon}
        </IconButton>
      </Tooltip>
    );
  }

  if (action.formAction) {
    const formButton = action.confirmMessage ? (
      <ConfirmActionButton
        confirmMessage={action.confirmMessage}
        disabled={action.disabled}
        label={action.label}
      >
        {action.icon}
      </ConfirmActionButton>
    ) : (
      button
    );

    return (
      <Tooltip title={action.label}>
        <form action={action.formAction} className="inline-form">
          {action.hiddenInputs?.map((input) => (
            <input key={input.name} name={input.name} type="hidden" value={input.value} />
          ))}
          {action.disabled && !action.confirmMessage ? <span>{formButton}</span> : formButton}
        </form>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={action.label}>
      {action.disabled ? <span>{button}</span> : button}
    </Tooltip>
  );
}

export function TableActions({ actions }: { actions: TableAction[] }) {
  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="nowrap"
      justifyContent="flex-end"
      spacing={0.25}
      sx={{ width: actions.length * 36 }}
      useFlexGap
    >
      {actions.map((action) => (
        <ActionButton action={action} key={action.label} />
      ))}
    </Stack>
  );
}
