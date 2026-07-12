import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";

type StatusTone = "success" | "danger" | "warning" | "neutral" | "info";

const colorByTone: Record<StatusTone, ChipProps["color"]> = {
  danger: "error",
  info: "info",
  neutral: "default",
  success: "success",
  warning: "warning"
};

export function StatusChip({
  label,
  tone = "neutral",
  ...props
}: Omit<ChipProps, "color" | "label" | "size" | "variant"> & {
  label: string;
  tone?: StatusTone;
}) {
  return (
    <Chip
      color={colorByTone[tone]}
      label={label}
      size="small"
      variant="outlined"
      {...props}
    />
  );
}
