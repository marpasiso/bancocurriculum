"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Button from "@mui/material/Button";
import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button
      color="primary"
      onClick={copy}
      size="small"
      startIcon={<ContentCopyIcon fontSize="small" />}
      sx={{ minWidth: 158, whiteSpace: "nowrap", textTransform: "none" }}
      type="button"
      variant="outlined"
    >
      {copied ? "Código copiado" : "Copiar código Pix"}
    </Button>
  );
}
