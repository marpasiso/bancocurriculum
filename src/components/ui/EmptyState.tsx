import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function EmptyState({
  action,
  description,
  title = "Nenhum registro encontrado"
}: {
  action?: ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <Box
      sx={{
        alignItems: "center",
        color: "text.secondary",
        display: "grid",
        gap: 1,
        justifyItems: "center",
        minHeight: 128,
        px: 2,
        py: 4,
        textAlign: "center"
      }}
    >
      <InboxOutlinedIcon color="disabled" />
      <Typography color="text.primary" fontWeight={850}>
        {title}
      </Typography>
      {description ? <Typography variant="body2">{description}</Typography> : null}
      {action}
    </Box>
  );
}
