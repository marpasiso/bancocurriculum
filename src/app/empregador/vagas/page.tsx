import { ButtonLink, EmptyState, InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";
import { listEmployerJobOpenings } from "@/modules/job-openings-skill/service";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { JobOpeningActions } from "./job-opening-actions";

const statusLabel = {
  OPEN: "Aberta",
  PAUSED: "Pausada",
  CLOSED: "Encerrada",
  CANCELED: "Cancelada"
} as const;

const statusTone = {
  OPEN: "success",
  PAUSED: "warning",
  CLOSED: "neutral",
  CANCELED: "danger"
} as const;

export default async function EmployerJobOpeningsPage() {
  const user = await requireEmployerUser();
  const jobOpenings = await listEmployerJobOpenings({ employerId: user.employer.id });

  return (
    <main>
      <PageHeader
        actions={<ButtonLink href="/empregador/vagas/nova">Nova vaga</ButtonLink>}
        description="Gerencie as vagas da sua empresa e use vagas abertas para buscar candidatos compatíveis."
        eyebrow="Vagas"
        title="Minhas vagas"
      />

      <Section title="Vagas cadastradas" description={`${jobOpenings.length} vaga(s) encontrada(s).`}>
        {jobOpenings.length === 0 ? (
          <EmptyState
            action={<ButtonLink href="/empregador/vagas/nova">Cadastrar primeira vaga</ButtonLink>}
            description="Cadastre uma vaga para buscar candidatos compatíveis com a função desejada."
            title="Nenhuma vaga cadastrada"
          />
        ) : (
          <section className="grid">
            {jobOpenings.map((jobOpening) => (
              <article className="card candidate-card" key={jobOpening.id}>
                <div>
                  <StatusBadge tone={statusTone[jobOpening.status]}>
                    {statusLabel[jobOpening.status]}
                  </StatusBadge>
                  <h2>{jobOpening.title}</h2>
                  <div className="candidate-meta">
                    <span className="meta-pill">Função/cargo: {jobOpening.systemJobFunction.name}</span>
                    <span className="meta-pill">{jobOpening.city}/{jobOpening.state}</span>
                    <span className="meta-pill">{jobOpening.quantity} vaga(s)</span>
                  </div>
                </div>

                <p>{jobOpening.description}</p>
                <InfoRow label="Reservas ativas" value={`${jobOpening._count.reservations}`} />

                <JobOpeningActions jobOpeningId={jobOpening.id} status={jobOpening.status} />
              </article>
            ))}
          </section>
        )}
      </Section>
    </main>
  );
}
