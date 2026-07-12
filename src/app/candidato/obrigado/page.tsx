import { ButtonLink, PageHeader } from "@/components/ui";

export default function CandidateThanksPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Cadastro recebido"
        title="Currículo cadastrado com sucesso."
        description="O cadastro foi salvo com snapshot do consentimento LGPD para manter rastreabilidade."
        actions={<ButtonLink href="/">Voltar ao início</ButtonLink>}
      />
      <div className="notice notice-success">
        <p className="success">Obrigado. Seus dados já estão disponíveis conforme as regras do MVP.</p>
      </div>
    </main>
  );
}
