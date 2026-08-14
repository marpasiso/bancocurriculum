import { getUserFriendlyErrorMessage, logTechnicalError } from "@/modules/notifications/user-feedback.skill";

export function toFriendlyError(error: unknown, fallback = "Não foi possível concluir a ação. Revise os campos e tente novamente.") {
  logTechnicalError(error);
  return getUserFriendlyErrorMessage(error, fallback);
}

export function errorParam(message: string) {
  return encodeURIComponent(message);
}
