"use client";

import { useState } from "react";
import { MaskedInput } from "@/components/masked-input";
import { getBrazilianDocumentType, normalizeBrazilianDocument } from "@/lib/input-masks";

type EmployerDocumentInputProps = {
  defaultValue?: string;
};

export function EmployerDocumentInput({ defaultValue = "" }: EmployerDocumentInputProps) {
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">(() => getBrazilianDocumentType(defaultValue));
  const [document, setDocument] = useState(() => normalizeBrazilianDocument(defaultValue));
  const mask = documentType === "CPF" ? "cpf" : "cnpj";

  return (
    <fieldset className="document-field">
      <legend>Tipo de documento</legend>
      <div className="document-type-options">
        <label className="consent-check">
          <input checked={documentType === "CPF"} name="documentType" onChange={() => setDocumentType("CPF")} type="radio" value="CPF" />
          CPF
        </label>
        <label className="consent-check">
          <input checked={documentType === "CNPJ"} name="documentType" onChange={() => setDocumentType("CNPJ")} type="radio" value="CNPJ" />
          CNPJ
        </label>
      </div>
      <label>
        Documento
        <MaskedInput
          key={mask}
          defaultValue={document}
          inputMode="numeric"
          mask={mask}
          name="document"
          onValueChange={(value) => setDocument(normalizeBrazilianDocument(value))}
          placeholder={documentType === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
          required
        />
      </label>
    </fieldset>
  );
}
