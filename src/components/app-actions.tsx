import Button, { type ButtonProps } from "@mui/material/Button";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import Stack, { type StackProps } from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import type { ElementType, ReactNode } from "react";

export function AppButton({
  children,
  minWidth = 112,
  sx,
  ...props
}: ButtonProps & { minWidth?: number | string }) {
  return (
    <Button
      size={props.size ?? "small"}
      sx={{
        height: "var(--control-height, 36px)",
        minHeight: "var(--control-height, 36px)",
        minWidth,
        width: props.fullWidth ? "100%" : "auto",
        whiteSpace: "nowrap",
        textTransform: "none",
        "& .MuiButton-startIcon": { flexShrink: 0 },
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AppIconButton({
  label,
  children,
  disabled,
  ...props
}: IconButtonProps & { component?: ElementType; href?: string; label: string; children: ReactNode }) {
  const button = (
    <IconButton
      aria-label={label}
      disabled={disabled}
      size={props.size ?? "small"}
      sx={{ flexShrink: 0 }}
      {...props}
    >
      {children}
    </IconButton>
  );

  return (
    <Tooltip title={label}>
      {disabled ? <span>{button}</span> : button}
    </Tooltip>
  );
}

export function ResponsiveActions({
  children,
  justifyContent = "flex-end",
  sx,
  ...props
}: StackProps) {
  return (
    <Stack
      direction={{ xs: "row", sm: "row" }}
      alignItems="center"
      flexWrap="nowrap"
      gap={1}
      justifyContent={justifyContent}
      sx={{
        "& .MuiButton-root": {
          flex: "0 0 auto",
          height: "var(--control-height, 36px)",
          justifyContent: "center",
          minWidth: "var(--app-action-min-width, 112px)"
        },
        "& .MuiIconButton-root": {
          flexShrink: 0,
          height: "var(--control-height, 36px)",
          width: "var(--control-height, 36px)"
        },
        overflowX: "visible",
        ...sx
      }}
      useFlexGap
      {...props}
    >
      {children}
    </Stack>
  );
}
