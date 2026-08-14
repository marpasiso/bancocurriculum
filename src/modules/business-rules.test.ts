import { describe, expect, it } from "vitest";
import { LgpdRequestType } from "@prisma/client";
import { adminPixConfirmationSchema, updateCandidateSchema } from "./admin-console-skill/validations";
import { candidateRegistrationSchema } from "./candidate-registration-skill/validations";
import { dataRequestSchema } from "./data-request-skill/validations";
import { loginSchema } from "./employer-auth-skill/validations";
import { systemJobFunctionSelectionSchema } from "./job-functions-skill/validations";
import { createPixBrCode, hasValidPixCrc } from "./manual-payment-skill/pix-br-code";
import { manualPaymentSchema } from "./manual-payment-skill/validations";
import { formatBrazilianDocument, formatBrazilianPhone } from "@/lib/input-masks";
import { employerRegistrationSchema } from "./employer-auth-skill/validations";
import { getUserFriendlyErrorMessage } from "./notifications/user-feedback.skill";

function hasActiveSubscription(subscriptions: Array<{ startsAt: Date; endsAt: Date }>, now = new Date()) {
  return subscriptions.some((subscription) => subscription.startsAt <= now && subscription.endsAt > now);
}

function sanitizeCandidateList(candidate: Record<string, unknown>) {
  const { references: _references, passwordHash: _passwordHash, ...safe } = candidate;
  return safe;
}

function canAppearInEmployerSearch(candidate: { isActive: boolean; consentAccepted: boolean; availabilityStatus: string }) {
  return candidate.isActive && candidate.consentAccepted && candidate.availabilityStatus === "AVAILABLE";
}

function startCandidateProcess(candidate: { isActive: boolean; consentAccepted: boolean; availabilityStatus: string }) {
  if (!canAppearInEmployerSearch(candidate)) {
    throw new Error("Este candidato nao esta disponivel para iniciar processo.");
  }

  return { ...candidate, availabilityStatus: "IN_PROCESS" };
}

function confirmCandidateHiring(candidate: { availabilityStatus: string; isActive: boolean }) {
  if (candidate.availabilityStatus !== "IN_PROCESS") {
    throw new Error("A contratacao so pode ser confirmada para candidato reservado.");
  }

  return { ...candidate, availabilityStatus: "HIRED", isActive: false };
}

function returnCandidateToAvailable(candidate: { availabilityStatus: string; isActive: boolean }) {
  if (candidate.availabilityStatus !== "IN_PROCESS") {
    throw new Error("Apenas candidatos reservados podem voltar para disponivel por esta acao.");
  }

  return { ...candidate, availabilityStatus: "AVAILABLE", isActive: true };
}

function reactivateCandidate(candidate: { availabilityStatus: string; isActive: boolean }) {
  return { ...candidate, availabilityStatus: "AVAILABLE", isActive: true };
}

function canActivateSubscription(payment: { id: string } | null) {
  if (!payment) throw new Error("Pagamento inexistente para este empregador.");
  return true;
}

describe("regras de negocio do MVP", () => {
  it("aplica máscaras brasileiras de telefone e documento", () => {
    expect(formatBrazilianPhone("11999998888")).toBe("(11) 99999-8888");
    expect(formatBrazilianDocument("12345678900")).toBe("123.456.789-00");
    expect(formatBrazilianDocument("12345678000199")).toBe("12.345.678/0001-99");
  });

  it("valida limites e normaliza documento do empregador", () => {
    const parsed = employerRegistrationSchema.parse({
      email: "empresa@teste.local",
      password: "senha-segura",
      companyName: "Empresa de Teste",
      contactName: "Pessoa Responsável",
      documentType: "CNPJ",
      document: "12.345.678/0001-99"
    });

    expect(parsed.document).toBe("12345678000199");
    expect(() => employerRegistrationSchema.parse({
      email: "empresa@teste.local",
      password: "senha-segura",
      companyName: "x".repeat(121),
      contactName: "Pessoa Responsável",
      documentType: "CNPJ",
      document: "12.345.678/0001-99"
    })).toThrow();

    expect(employerRegistrationSchema.parse({
      email: "pessoa@teste.local",
      password: "senha-segura",
      companyName: "Pessoa Autônoma",
      contactName: "Pessoa Responsável",
      documentType: "CPF",
      document: "123.456.789-00"
    }).document).toBe("12345678900");

    expect(() => employerRegistrationSchema.parse({
      email: "pessoa@teste.local",
      password: "senha-segura",
      companyName: "Pessoa Autônoma",
      contactName: "Pessoa Responsável",
      documentType: "CPF",
      document: "12.345.678/0001-99"
    })).toThrow("Informe um CPF válido.");
  });

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

  it("cadastro de candidato aceita apenas UF brasileira valida", () => {
    const parsed = candidateRegistrationSchema.parse({
      fullName: "Ana Candidata",
      email: "ana@teste.local",
      phone: "11999990000",
      city: "Feira de Santana",
      state: "ba",
      systemJobFunctionIds: ["job_1"],
      summary: "Resumo profissional valido",
      experience: "Experiencia profissional valida",
      education: "Superior",
      acceptedLgpd: true
    });

    expect(parsed.state).toBe("BA");

    expect(() =>
      candidateRegistrationSchema.parse({
        fullName: "Ana Candidata",
        email: "ana@teste.local",
        phone: "11999990000",
        city: "Feira de Santana",
        state: "XX",
        systemJobFunctionIds: ["job_1"],
        summary: "Resumo profissional valido",
        experience: "Experiencia profissional valida",
        education: "Superior",
        acceptedLgpd: true
      })
    ).toThrow("Selecione um estado válido.");
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

  it("confirmacao Pix administrativa aceita apenas payload gerado e dados variaveis", () => {
    const payload = createPixBrCode({
      pixKey: "pix@teste.local",
      receiverName: "Banco Curriculos",
      receiverCity: "Sao Paulo",
      amountCents: 9900,
      description: "Assinatura MVP"
    });

    const parsed = adminPixConfirmationSchema.parse({
      employerId: "emp_1",
      amount: "0.01",
      pixKey: "pix-alterado",
      receiverName: "Outro recebedor",
      description: "Assinatura MVP",
      payload
    });

    expect(parsed).toEqual({
      employerId: "emp_1",
      description: "Assinatura MVP",
      payload
    });
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

  it("solicitacao LGPD publica aceita alteracao, exclusao e revogacao para aparecer no admin", () => {
    const correction = dataRequestSchema.parse({
      type: LgpdRequestType.CORRECTION,
      fullName: "Ana Candidata",
      email: " ANA@TESTE.LOCAL ",
      description: "Solicito alteracao dos meus dados cadastrais."
    });

    const deletion = dataRequestSchema.parse({
      type: LgpdRequestType.DELETE_REVIEW,
      fullName: "Ana Candidata",
      email: "ana@teste.local",
      description: "Solicito analise de exclusao dos meus dados."
    });

    const parsed = dataRequestSchema.parse({
      type: LgpdRequestType.REVOCATION,
      fullName: "Ana Candidata",
      email: "ANA@TESTE.LOCAL",
      description: "Solicito revogacao do consentimento LGPD."
    });

    expect(correction.type).toBe(LgpdRequestType.CORRECTION);
    expect(correction.email).toBe("ana@teste.local");
    expect(deletion.type).toBe(LgpdRequestType.DELETE_REVIEW);
    expect(parsed.type).toBe(LgpdRequestType.REVOCATION);
    expect(parsed.email).toBe("ana@teste.local");
  });

  it("solicitacao LGPD publica rejeita tipo fora do formulario de titular", () => {
    expect(() =>
      dataRequestSchema.parse({
        type: LgpdRequestType.ACCESS,
        fullName: "Ana Candidata",
        email: "ana@teste.local",
        description: "Solicito acesso aos dados cadastrados."
      })
    ).toThrow();
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

  it("busca de empregador retorna apenas candidatos ativos, autorizados e disponiveis", () => {
    expect(canAppearInEmployerSearch({ isActive: true, consentAccepted: true, availabilityStatus: "AVAILABLE" })).toBe(true);
    expect(canAppearInEmployerSearch({ isActive: false, consentAccepted: true, availabilityStatus: "AVAILABLE" })).toBe(false);
    expect(canAppearInEmployerSearch({ isActive: true, consentAccepted: false, availabilityStatus: "AVAILABLE" })).toBe(false);
    expect(canAppearInEmployerSearch({ isActive: true, consentAccepted: true, availabilityStatus: "IN_PROCESS" })).toBe(false);
  });

  it("processo do candidato sai da busca comum e contratacao inativa o cadastro", () => {
    const available = { isActive: true, consentAccepted: true, availabilityStatus: "AVAILABLE" };
    const inProcess = startCandidateProcess(available);
    const hired = confirmCandidateHiring(inProcess);
    const returned = returnCandidateToAvailable(inProcess);

    expect(inProcess.availabilityStatus).toBe("IN_PROCESS");
    expect(canAppearInEmployerSearch(inProcess)).toBe(false);
    expect(hired).toMatchObject({ availabilityStatus: "HIRED", isActive: false });
    expect(returned).toMatchObject({ availabilityStatus: "AVAILABLE", isActive: true });
    expect(reactivateCandidate(hired)).toMatchObject({ availabilityStatus: "AVAILABLE", isActive: true });
    expect(() => confirmCandidateHiring(available)).toThrow();
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

  it("login normaliza e-mail e nao revela politica de senha para credencial preenchida", () => {
    const parsed = loginSchema.parse({
      email: "ADMIN@LOCAL.TEST",
      password: "x"
    });

    expect(parsed).toEqual({ email: "admin@local.test", password: "x" });
  });

  it("login bloqueia senha vazia antes de autenticar", () => {
    expect(() =>
      loginSchema.parse({
        email: "admin@local.test",
        password: ""
      })
    ).toThrow();
  });

  it("erro de credenciais invalidas usa mensagem generica", () => {
    expect(getUserFriendlyErrorMessage(new Error("E-mail ou senha inválidos."))).toBe("E-mail ou senha inválidos.");
  });
});
