"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { formatBrazilianCnpj, formatBrazilianCpf, formatBrazilianDocument, formatBrazilianPhone } from "@/lib/input-masks";

type MaskType = "phone" | "document" | "cpf" | "cnpj";

type MaskedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "onChange" | "value"> & {
  defaultValue?: string;
  mask: MaskType;
  onValueChange?: (value: string) => void;
};

const formatters = {
  phone: formatBrazilianPhone,
  document: formatBrazilianDocument,
  cpf: formatBrazilianCpf,
  cnpj: formatBrazilianCnpj
};

export function MaskedInput({ defaultValue = "", mask, onValueChange, ...props }: MaskedInputProps) {
  const [value, setValue] = useState(() => formatters[mask](defaultValue));
  const maxLength = mask === "phone" ? 15 : mask === "cpf" ? 14 : mask === "cnpj" ? 18 : 18;

  return <input {...props} maxLength={props.maxLength ?? maxLength} value={value} onChange={(event) => {
    const nextValue = formatters[mask](event.target.value);
    setValue(nextValue);
    onValueChange?.(nextValue);
  }} />;
}
