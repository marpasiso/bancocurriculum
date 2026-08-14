import type { LegalPage } from "./types";

const pages: Record<string, LegalPage> = {
  privacy: {
    title: "Política de Privacidade",
    body: "O MVP trata dados pessoais apenas para cadastro no banco de currículos e acesso controlado por empregadores assinantes."
  },
  terms: {
    title: "Termos de Uso",
    body: "Este MVP é para teste local. Pagamentos são manuais e assinaturas liberam acesso por 7 dias após validação administrativa."
  },
  lgpd: {
    title: "Solicitação sobre dados pessoais",
    body: "Use esta página para pedir alteração, análise de exclusão ou revogação da autorização de uso dos seus dados. O pedido será analisado pela administração."
  }
};

export function findLegalPage(key: string) {
  return pages[key];
}
