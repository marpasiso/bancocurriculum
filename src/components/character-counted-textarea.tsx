"use client";

import type { TextareaHTMLAttributes } from "react";
import { useState } from "react";

type CharacterCountedTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "defaultValue" | "onChange" | "value"> & {
  defaultValue?: string;
  maxLength: number;
};

export function CharacterCountedTextarea({ defaultValue = "", maxLength, ...props }: CharacterCountedTextareaProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <textarea {...props} maxLength={maxLength} value={value} onChange={(event) => setValue(event.target.value)} />
      <span aria-live="polite" className="field-help">{value.length}/{maxLength}</span>
    </>
  );
}
