import { InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";
import { getCandidateDetailsForEmployer } from "@/modules/candidate-detail-skill/service";
import { listOpenEmployerJobOpenings } from "@/modules/job-openings-skill/service";
import { getUserFriendlyErrorMessage, logTechnicalError } from "@/modules/notifications/user-feedback.skill";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { CandidateReservationForm } from "./reservation-form";

export default async function CandidateDetailsPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { jobOpeningId?: string };
}) {
  const user = await requireEmployerUser();

  try {
    const [candidate, jobOpenings] = await Promise.all([
      getCandidateDetailsForEmployer({
        employerId: user.employer.id,
        candidateId: params.id,
        viewedById: user.id
      }),
      listOpenEmployerJobOpenings({ employerId: user.employer.id })
    ]);
    const compatibleJobOpenings = jobOpenings.filter((jobOpening) =>
      candidate.interestFunctions.some(
        (interestFunction) => interestFunction.systemJobFunctionId === jobOpening.systemJobFunction.id
      )
    );
    const reservationHelpMessage =
      jobOpenings.length === 0
        ? "Cadastre uma vaga aberta antes de reservar candidatos."
        : compatibleJobOpenings.length === 0
          ? "Nenhuma vaga aberta da empresa é compatível com os interesses deste candidato."
          : searchParams.jobOpeningId && !compatibleJobOpenings.some((jobOpening) => jobOpening.id === searchParams.jobOpeningId)
            ? "A vaga selecionada não está aberta ou não é compatível. Escolha outra vaga."
            : undefined;

    return (
      <main>
        <PageHeader
          actions={
            <CandidateReservationForm
              candidateId={candidate.id}
              compatibleJobOpenings={compatibleJobOpenings}
              helpMessage={reservationHelpMessage}
            />
          }
          description="Visualização registrada com segurança antes da exibição dos dados."
          eyebrow="Detalhes do candidato"
          title={candidate.fullName}
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
        <Section title="Experiência profissional">
          <article className="card">
            <p>{candidate.experience}</p>
          </article>
        </Section>
        <Section title="Formação">
          <article className="card">
            <p>{candidate.education}</p>
          </article>
        </Section>
        <Section title="Referências" description="Referências aparecem somente na tela de detalhes.">
          <article className="card">
            <p>{candidate.references || "Não informadas"}</p>
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
          description="A visualização de detalhes exige conta ativa, assinatura vigente e candidato disponível."
          eyebrow="Acesso restrito"
          title="Detalhes bloqueados"
        />
        <div className="notice notice-danger">
          <StatusBadge tone="danger">Bloqueado</StatusBadge>
          <p>{errorMessage}</p>
        </div>
      </main>
    );
  }
}
