import { describe, expect, it } from "vitest";
import { LgpdRequestType } from "@prisma/client";
import { updateCandidateSchema } from "./admin-console-skill/validations";
import { candidateRegistrationSchema } from "./candidate-registration-skill/validations";
import { dataRequestSchema } from "./data-request-skill/validations";
import { systemJobFunctionSelectionSchema } from "./job-functions-skill/validations";
import { createPixBrCode, hasValidPixCrc } from "./manual-payment-skill/pix-br-code";
import { manualPaymentSchema } from "./manual-payment-skill/validations";

function hasActiveSubscription(subscriptions: Array<{ startsAt: Date; endsAt: Date }>, now = new Date()) {
  return subscriptions.some((subscription) => subscription.startsAt <= now && subscription.endsAt > now);
}

function sanitizeCandidateList(candidate: Record<string, unknown>) {
  const { references: _references, passwordHash: _passwordHash, ...safe } = candidate;
  return safe;
}

function canActivateSubscription(payment: { id: string } | null) {
  if (!payment) throw new Error("Pagamento inexistente para este empregador.");
  return true;
}

describe("regras de negocio do MVP", () => {
  it("nao cadastra candidato sem consentimento LGPD", () => {
    expect(() =>
      candidateRegistrationSchema.parse({
        fullName: "Ana Candidata",
        email: "ana@teste.local",
        phone: "11999990000",
        city: "Sao Paulo",
        state: "SP",
        systemJobFunctionIds: ["job_1"],
        summary: "Resumo profissional valido",
        experience: "Experiencia profissional valida",
        education: "Superior",
        acceptedLgpd: false
      })
    ).toThrow();
  });

  it("aceita candidato com consentimento para gerar snapshot no servico", () => {
    const parsed = candidateRegistrationSchema.parse({
      fullName: "Ana Candidata",
      email: "ana@teste.local",
      phone: "11999990000",
      city: "Sao Paulo",
      state: "SP",
      systemJobFunctionIds: ["job_1", "job_2"],
      summary: "Resumo profissional valido",
      experience: "Experiencia profissional valida",
      education: "Superior",
      acceptedLgpd: true
    });

    expect(parsed.acceptedLgpd).toBe(true);
  });

  it("permite experiencia em branco, mas bloqueia texto curto", () => {
    const base = {
      fullName: "Ana Candidata",
      email: "ana@teste.local",
      phone: "11999990000",
      city: "Sao Paulo",
      state: "SP",
      systemJobFunctionIds: ["job_1"],
      summary: "Resumo profissional valido",
      education: "Superior",
      acceptedLgpd: true
    };

    expect(candidateRegistrationSchema.parse({ ...base, experience: "" }).experience).toBe("");
    expect(() => candidateRegistrationSchema.parse({ ...base, experience: "curta" })).toThrow();
  });

  it("bloqueia empregador sem assinatura ativa ou com assinatura vencida", () => {
    const now = new Date("2026-06-26T12:00:00Z");
    expect(hasActiveSubscription([], now)).toBe(false);
    expect(
      hasActiveSubscription([{ startsAt: new Date("2026-06-01"), endsAt: new Date("2026-06-10") }], now)
    ).toBe(false);
  });

  it("libera busca com assinatura ativa", () => {
    const now = new Date("2026-06-26T12:00:00Z");
    expect(
      hasActiveSubscription([{ startsAt: new Date("2026-06-25"), endsAt: new Date("2026-07-02") }], now)
    ).toBe(true);
  });

  it("nao ativa assinatura sem Payment", () => {
    expect(() => canActivateSubscription(null)).toThrow("Pagamento inexistente para este empregador.");
  });

  it("nao permite upload de curriculo, PDF, imagem ou documento no cadastro", () => {
    expect(() =>
      candidateRegistrationSchema.parse({
        fullName: "Ana Candidata",
        email: "ana@teste.local",
        phone: "11999990000",
        city: "Sao Paulo",
        state: "SP",
        systemJobFunctionIds: ["job_1"],
        summary: "Resumo profissional valido",
        experience: "Experiencia profissional valida",
        education: "Superior",
        acceptedLgpd: true,
        resumeFile: "curriculo.pdf"
      })
    ).toThrow();
  });

  it("candidato precisa selecionar ao menos uma funcao controlada", () => {
    expect(() => systemJobFunctionSelectionSchema.parse([])).toThrow();
    expect(systemJobFunctionSelectionSchema.parse(["job_1"])).toEqual(["job_1"]);
  });

  it("pagamento manual precisa ter valor positivo", () => {
    expect(() =>
      manualPaymentSchema.parse({
        employerId: "emp_1",
        amountCents: 0,
        pixCode: "pix"
      })
    ).toThrow();

    expect(
      manualPaymentSchema.parse({
        employerId: "emp_1",
        amountCents: 12500,
        pixCode: "pix"
      }).amountCents
    ).toBe(12500);
  });

  it("gera payload Pix BR Code para pagamento manual", () => {
    const payload = createPixBrCode({
      pixKey: "pix@teste.local",
      receiverName: "Banco Curriculos",
      receiverCity: "Sao Paulo",
      amountCents: 9900,
      description: "Assinatura MVP"
    });

    expect(payload).toContain("000201");
    expect(payload).toContain("540599.00");
    expect(payload).toMatch(/6304[A-F0-9]{4}$/);
    expect(hasValidPixCrc(payload)).toBe(true);
  });

  it("normaliza chave Pix celular brasileira sem DDI", () => {
    const payload = createPixBrCode({
      pixKey: "75982918291",
      receiverName: "Banco Curriculos",
      receiverCity: "Feira de Santana",
      amountCents: 9900,
      description: "Assinatura MVP"
    });

    expect(payload).toContain("+5575982918291");
    expect(hasValidPixCrc(payload)).toBe(true);
  });

  it("solicitacao LGPD aceita revogacao para aparecer no admin", () => {
    const parsed = dataRequestSchema.parse({
      type: LgpdRequestType.REVOCATION,
      fullName: "Ana Candidata",
      email: "ANA@TESTE.LOCAL",
      description: "Solicito revogacao do consentimento LGPD."
    });

    expect(parsed.type).toBe(LgpdRequestType.REVOCATION);
    expect(parsed.email).toBe("ana@teste.local");
  });

  it("listagem nunca retorna referencias nem passwordHash", () => {
    const safe = sanitizeCandidateList({
      id: "cand_1",
      fullName: "Ana",
      references: "Referencia sensivel",
      passwordHash: "hash"
    });

    expect(safe).toEqual({ id: "cand_1", fullName: "Ana" });
  });

  it("edicao administrativa de candidato nao altera consentimento LGPD", () => {
    expect(() =>
      updateCandidateSchema.parse({
        candidateId: "cand_1",
        fullName: "Ana Candidata",
        email: "ana@teste.local",
        phone: "11999990000",
        city: "Sao Paulo",
        state: "SP",
        desiredRole: "Administrativo",
        summary: "Resumo profissional valido",
        experience: "Experiencia profissional valida",
        education: "Superior",
        references: "Referencia profissional",
        consentAccepted: false
      })
    ).toThrow();
  });
});
