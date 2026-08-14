import { ButtonLink, PageHeader } from "@/components/ui";

export default function LgpdThanksPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Dados pessoais"
        title="Solicitação registrada."
        description="Sua solicitação foi salva para análise. Nenhum dado é apagado automaticamente por este fluxo."
        actions={<ButtonLink href="/">Voltar ao início</ButtonLink>}
      />
      <div className="notice notice-success">
        <p className="success">Registro concluído e encaminhado para análise administrativa.</p>
      </div>
    </main>
  );
}
