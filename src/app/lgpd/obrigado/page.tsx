import { ButtonLink, PageHeader } from "@/components/ui";

export default function LgpdThanksPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Solicitação LGPD"
        title="Solicitação registrada."
        description="A solicitação foi salva para análise administrativa. Nenhum dado é apagado automaticamente por este fluxo."
        actions={<ButtonLink href="/">Voltar ao início</ButtonLink>}
      />
      <div className="notice notice-success">
        <p className="success">Registro concluído e disponível no painel admin.</p>
      </div>
    </main>
  );
}
