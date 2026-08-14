import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
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
  const buttonColor = action.color === "default" ? undefined : action.color;
  const button = (
    <IconButton
      aria-label={action.label}
      color={buttonColor}
      disabled={action.disabled}
      size="small"
      sx={{ display: { xs: "none", md: "inline-flex" }, height: 34, width: 34 }}
      type={action.formAction ? "submit" : "button"}
    >
      {action.icon}
    </IconButton>
  );
  const labeledButton = (
    <Button
      aria-label={action.label}
      color={buttonColor}
      disabled={action.disabled}
      size="small"
      startIcon={action.icon}
      sx={{
        display: { xs: "inline-flex", md: "none" },
        justifyContent: "flex-start",
        maxWidth: "100%",
        minHeight: 34,
        minWidth: 0,
        textAlign: "left",
        textTransform: "none",
        whiteSpace: "normal"
      }}
      type={action.formAction ? "submit" : "button"}
      variant={action.color && action.color !== "default" ? "outlined" : "text"}
    >
      {action.label}
    </Button>
  );

  if (action.href && !action.disabled) {
    return (
      <Tooltip title={action.label}>
        <Stack component="span">
          <IconButton
            aria-label={action.label}
            color={buttonColor}
            component={Link}
            href={action.href}
            size="small"
            sx={{ display: { xs: "none", md: "inline-flex" }, height: 34, width: 34 }}
          >
            {action.icon}
          </IconButton>
          <Button
            aria-label={action.label}
            color={buttonColor}
            component={Link}
            href={action.href}
            size="small"
            startIcon={action.icon}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              justifyContent: "flex-start",
              maxWidth: "100%",
              minHeight: 34,
              textTransform: "none",
              whiteSpace: "normal"
            }}
          >
            {action.label}
          </Button>
        </Stack>
      </Tooltip>
    );
  }

  if (action.formAction) {
    const formButton = action.confirmMessage ? (
      <ConfirmActionButton
        color={action.color}
        confirmMessage={action.confirmMessage}
        disabled={action.disabled}
        label={action.label}
      >
        {action.icon}
      </ConfirmActionButton>
    ) : (
      <>
        {button}
        {labeledButton}
      </>
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
      {action.disabled ? <span>{button}{labeledButton}</span> : <>{button}{labeledButton}</>}
    </Tooltip>
  );
}

export function TableActions({ actions }: { actions: TableAction[] }) {
  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap={{ xs: "wrap", md: "nowrap" }}
      justifyContent={{ xs: "flex-start", md: "flex-end" }}
      spacing={0.25}
      sx={{ width: { xs: "100%", md: actions.length * 36 } }}
      useFlexGap
    >
      {actions.map((action) => (
        <ActionButton action={action} key={action.label} />
      ))}
    </Stack>
  );
}
