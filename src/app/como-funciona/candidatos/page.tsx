import { ButtonLink, PageHeader, Section } from "@/components/ui";

export default function CandidateHowItWorksPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Para candidatos"
        title="Cadastro direto, claro e com consentimento."
        description="O candidato informa seus dados profissionais, aceita o consentimento LGPD e passa a fazer parte do banco de currículos local."
        actions={<ButtonLink href="/candidato">Cadastrar currículo</ButtonLink>}
      />
      <Section title="Etapas do cadastro">
        <div className="grid">
          <article className="card">
            <h2>1. Dados profissionais</h2>
            <p>Nome, contato, localidade, cargo desejado, resumo, experiência e formação.</p>
          </article>
          <article className="card">
            <h2>2. Consentimento LGPD</h2>
            <p>O aceite é obrigatório e gera um snapshot de consentimento para auditoria.</p>
          </article>
          <article className="card">
            <h2>3. Sem upload</h2>
            <p>O MVP não recebe PDF, imagem ou documento. O cadastro é feito por formulário.</p>
          </article>
        </div>
      </Section>
    </main>
  );
}
