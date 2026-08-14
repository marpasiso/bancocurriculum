import type { OptionsObject, VariantType, useSnackbar } from "notistack";
import { ZodError, type ZodIssue } from "zod";

type EnqueueSnackbar = ReturnType<typeof useSnackbar>["enqueueSnackbar"];

const fallbackMessages = {
  success: "Operação concluída com sucesso.",
  error: "Não foi possível concluir a ação. Verifique os dados e tente novamente.",
  warning: "Verifique as informações antes de continuar.",
  info: "Informação registrada."
};

function notify(enqueueSnackbar: EnqueueSnackbar, message: string, variant: VariantType, options?: OptionsObject) {
  enqueueSnackbar(message, {
    variant,
    autoHideDuration: 3600,
    preventDuplicate: true,
    ...options
  });
}

export function notifySuccess(enqueueSnackbar: EnqueueSnackbar, message = fallbackMessages.success, options?: OptionsObject) {
  notify(enqueueSnackbar, message, "success", options);
}

export function notifyError(
  enqueueSnackbar: EnqueueSnackbar,
  error: unknown,
  fallback = fallbackMessages.error,
  options?: OptionsObject
) {
  notify(enqueueSnackbar, getUserFriendlyErrorMessage(error, fallback), "error", options);
}

export function notifyWarning(enqueueSnackbar: EnqueueSnackbar, message = fallbackMessages.warning, options?: OptionsObject) {
  notify(enqueueSnackbar, message, "warning", options);
}

export function notifyInfo(enqueueSnackbar: EnqueueSnackbar, message = fallbackMessages.info, options?: OptionsObject) {
  notify(enqueueSnackbar, message, "info", options);
}

export function parseValidationError(error: unknown, fallback = fallbackMessages.error) {
  if (!(error instanceof ZodError)) {
    return fallback;
  }

  const issue = error.issues[0];
  if (!issue) {
    return fallback;
  }

  return getFriendlyZodIssueMessage(issue, fallback);
}

export function parsePrismaError(error: unknown, fallback = fallbackMessages.error) {
  if (isObjectWithCode(error)) {
    if (error.code === "P2002") {
      return "Esse registro já existe no sistema.";
    }

    if (error.code === "P2003") {
      return "Não foi possível concluir a ação porque há dados relacionados no sistema.";
    }

    if (error.code === "P2025") {
      return "O registro solicitado não foi encontrado.";
    }
  }

  if (error instanceof Error && error.name === "PrismaClientValidationError") {
    return "Algumas informações enviadas não são válidas. Verifique os dados e tente novamente.";
  }

  return fallback;
}

export function getUserFriendlyErrorMessage(error: unknown, fallback = fallbackMessages.error) {
  const technicalMessage = getTechnicalMessage(error);

  if (error instanceof ZodError) {
    return parseValidationError(error, fallback);
  }

  const prismaMessage = parsePrismaError(error, "");
  if (prismaMessage) {
    return prismaMessage;
  }

  if (!technicalMessage) {
    return fallback;
  }

  const normalized = technicalMessage.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  if (normalized.includes("string must contain at least 3 character")) {
    return "A chave Pix informada é muito curta. Verifique e tente novamente.";
  }

  if (normalized.includes("unique constraint failed")) {
    return "Esse registro já existe no sistema.";
  }

  if (normalized.includes("unauthorized") || normalized.includes("forbidden") || normalized.includes("permissao")) {
    return "Você não tem permissão para executar esta ação.";
  }

  if (normalized.includes("invalid credentials") || normalized.includes("e-mail ou senha invalid")) {
    return "E-mail ou senha inválidos.";
  }

  if (normalized.includes("pix")) {
    return getFriendlyPixMessage(normalized, technicalMessage);
  }

  if (isSafePortugueseMessage(technicalMessage)) {
    return ensurePortugueseAccents(technicalMessage);
  }

  return fallback;
}

export function logTechnicalError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

function getTechnicalMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "";
}

function isObjectWithCode(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string";
}

function getFriendlyZodIssueMessage(issue: ZodIssue, fallback: string) {
  const field = issue.path.join(".");
  const message = issue.message;
  const normalized = message.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  if (field.toLowerCase().includes("pixkey") && issue.code === "too_small") {
    return "A chave Pix informada é muito curta. Verifique e tente novamente.";
  }

  if (normalized.includes("required") || normalized.includes("obrigatorio")) {
    return "Preencha os campos obrigatórios antes de continuar.";
  }

  if (isSafePortugueseMessage(message)) {
    return ensurePortugueseAccents(message);
  }

  return fallback;
}

function getFriendlyPixMessage(normalized: string, message: string) {
  if (normalized.includes("invalido") || normalized.includes("invalid")) {
    return "O código Pix informado não é válido. Gere a cobrança novamente e tente confirmar o pagamento.";
  }

  if (isSafePortugueseMessage(message)) {
    return ensurePortugueseAccents(message);
  }

  return "Não foi possível processar o Pix. Verifique os dados e tente novamente.";
}

function isSafePortugueseMessage(message: string) {
  return Boolean(message) && !/[{}[\]\\]/.test(message) && !message.toLowerCase().includes("stack");
}

function ensurePortugueseAccents(message: string) {
  return message
    .replace(/\binvalidos\b/gi, "inválidos")
    .replace(/\binvalida\b/gi, "inválida")
    .replace(/\binvalido\b/gi, "inválido")
    .replace(/\bUsuario\b/g, "Usuário")
    .replace(/\busuario\b/g, "usuário")
    .replace(/\bVoce\b/g, "Você")
    .replace(/\bvoce\b/g, "você")
    .replace(/\bja\b/g, "já")
    .replace(/\bacao\b/g, "ação")
    .replace(/\bacoes\b/g, "ações")
    .replace(/\bpossivel\b/g, "possível")
    .replace(/\bnao\b/g, "não")
    .replace(/\bcobranca\b/g, "cobrança")
    .replace(/\bConfiguracoes\b/g, "Configurações");
}
