"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";

export function CopyIdButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copyId() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Tooltip arrow title={copied ? "Copiado" : "Copiar ID"}>
      <IconButton
        aria-label="Copiar ID completo"
        className="copy-id-button"
        onClick={copyId}
        size="small"
        type="button"
      >
        <ContentCopyIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}
