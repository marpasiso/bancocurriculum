import { InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { getCandidateDetailsForEmployer } from "@/modules/candidate-detail-skill/service";
import { getUserFriendlyErrorMessage, logTechnicalError } from "@/modules/notifications/user-feedback.skill";

export default async function CandidateDetailsPage({ params }: { params: { id: string } }) {
  const user = await requireEmployerUser();

  try {
    const candidate = await getCandidateDetailsForEmployer({
      employerId: user.employer.id,
      candidateId: params.id,
      viewedById: user.id
    });

    return (
      <main>
        <PageHeader
          eyebrow="Detalhes do candidato"
          title={candidate.fullName}
          description="Visualização registrada com segurança antes da exibição dos dados."
          actions={<StatusBadge tone="success">Acesso autorizado</StatusBadge>}
        />
        <section className="dashboard-grid">
          <article className="panel">
            <h2>Resumo</h2>
            <InfoRow label="Cargo" value={candidate.desiredRole} />
            <InfoRow label="Local" value={`${candidate.city}/${candidate.state}`} />
            <p>{candidate.summary}</p>
          </article>
          <article className="panel">
            <h2>Contato</h2>
            <InfoRow label="E-mail" value={candidate.email} />
            <InfoRow label="Telefone" value={candidate.phone} />
          </article>
        </section>
        <Section title="Experiencia profissional">
          <article className="card">
            <p>{candidate.experience}</p>
          </article>
        </Section>
        <Section title="Formação">
          <article className="card">
            <p>{candidate.education}</p>
          </article>
        </Section>
        <Section title="Referencias" description="Referencias aparecem somente na tela de detalhes.">
          <article className="card">
            <p>{candidate.references || "Nao informadas"}</p>
          </article>
        </Section>
      </main>
    );
  } catch (err) {
    logTechnicalError(err);
    const errorMessage = getUserFriendlyErrorMessage(err, "Acesso negado. Verifique sua assinatura e tente novamente.");

    return (
      <main>
        <PageHeader
          eyebrow="Acesso restrito"
          title="Detalhes bloqueados"
          description="A visualização de detalhes exige conta ativa e assinatura vigente."
        />
        <div className="notice notice-danger">
          <StatusBadge tone="danger">Bloqueado</StatusBadge>
          <p>{errorMessage}</p>
        </div>
      </main>
    );
  }
}
