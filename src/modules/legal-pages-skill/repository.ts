import type { LegalPage } from "./types";

const pages: Record<string, LegalPage> = {
  privacy: {
    title: "Politica de Privacidade",
    body: "O MVP trata dados pessoais apenas para cadastro no banco de curriculos e acesso controlado por empregadores assinantes."
  },
  terms: {
    title: "Termos de Uso",
    body: "Este MVP e para teste local. Pagamentos sao manuais e assinaturas liberam acesso por 7 dias apos validacao administrativa."
  },
  lgpd: {
    title: "Direitos LGPD",
    body: "Titulares podem solicitar alteracao, exclusao ou revogacao. As solicitacoes sao analisadas no painel admin e nao apagam dados automaticamente."
  }
};

export function findLegalPage(key: string) {
  return pages[key];
}
