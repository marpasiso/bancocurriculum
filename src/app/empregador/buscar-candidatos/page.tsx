import Link from "next/link";
import { SearchFormBar } from "@/components/search-form-bar";
import { ButtonLink, EmptyState, PageHeader, Section, StatusBadge } from "@/components/ui";
import { searchCandidatesForEmployer } from "@/modules/candidate-search-skill/service";
import { getEmployerJobOpening } from "@/modules/job-openings-skill/service";
import { getUserFriendlyErrorMessage, logTechnicalError } from "@/modules/notifications/user-feedback.skill";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { getEmployerSubscriptionState } from "@/modules/subscription-gate-skill/service";

export default async function EmployerCandidateSearchPage({
  searchParams
}: {
  searchParams: { city?: string; jobOpeningId?: string; q?: string; role?: string };
}) {
  const user = await requireEmployerUser();
  const subscriptionState = await getEmployerSubscriptionState(user.employer.id);
  const query = searchParams.q ?? "";
  const role = searchParams.role ?? "";
  const city = searchParams.city ?? "";
  const jobOpeningId = searchParams.jobOpeningId ?? "";
  const jobOpening = jobOpeningId
    ? await getEmployerJobOpening({ employerId: user.employer.id, jobOpeningId })
    : null;
  let candidates: Awaited<ReturnType<typeof searchCandidatesForEmployer>> = [];
  let error = "";

  if (subscriptionState.status === "active") {
    try {
      candidates = await searchCandidatesForEmployer({
        employerId: user.employer.id,
        query,
        role,
        city,
        jobOpeningId
      });
    } catch (err) {
      logTechnicalError(err);
      error = getUserFriendlyErrorMessage(err, "Busca bloqueada. Verifique sua assinatura e tente novamente.");
    }
  }

  return (
    <main>
      <PageHeader
        description="Resultados exibem apenas dados de listagem. Referências ficam restritas aos detalhes."
        eyebrow="Busca segura"
        title="Buscar candidatos"
      />

      {subscriptionState.status !== "active" ? (
        <div className="notice notice-danger section">
          <StatusBadge tone={subscriptionState.status === "pending_payment" ? "warning" : "danger"}>
            {subscriptionState.ctaLabel}
          </StatusBadge>
          <h2>Assinatura necessária</h2>
          <p>Para consultar candidatos, é necessário ter uma assinatura ativa.</p>
          {subscriptionState.status === "pending_payment" ? (
            <p className="muted">A cobrança Pix já foi gerada. Aguarde a confirmação administrativa do pagamento.</p>
          ) : (
            <div className="actions">
              <ButtonLink href="/empregador/assinatura">{subscriptionState.ctaLabel}</ButtonLink>
            </div>
          )}
        </div>
      ) : error ? (
        <div className="notice notice-danger section">
          <StatusBadge tone="danger">Assinatura necessária</StatusBadge>
          <h2>Acesso à busca bloqueado</h2>
          <p>{error}</p>
          <div className="actions">
            <ButtonLink href="/empregador/assinatura">Renovar assinatura</ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <SearchFormBar
            clearHref={jobOpening ? `/empregador/buscar-candidatos?jobOpeningId=${encodeURIComponent(jobOpening.id)}` : "/empregador/buscar-candidatos"}
            fields={[
              { defaultValue: query, label: "Busca geral", name: "q", placeholder: "Nome, resumo ou UF" },
              { defaultValue: role, label: "Cargo/Função", name: "role", placeholder: "Ex.: administrativo" },
              { defaultValue: city, label: "Cidade", name: "city", placeholder: "Ex.: Feira de Santana" }
            ]}
            hiddenFields={jobOpening ? [{ name: "jobOpeningId", value: jobOpening.id }] : []}
            label={jobOpening ? `Buscar candidatos para ${jobOpening.title}` : "Buscar candidato"}
          />

          {jobOpening ? (
            <div className="notice section">
              <StatusBadge tone={jobOpening.status === "OPEN" ? "success" : "warning"}>
                {jobOpening.status === "OPEN" ? "Vaga aberta" : "Vaga indisponível"}
              </StatusBadge>
              <h2>{jobOpening.title}</h2>
              <p className="muted">{jobOpening.systemJobFunction.name} - {jobOpening.city}/{jobOpening.state}</p>
            </div>
          ) : null}

          <Section title="Resultados" description={`${candidates.length} candidato(s) encontrado(s).`}>
            {candidates.length === 0 ? (
              <EmptyState title="Nenhum candidato encontrado" description="Ajuste o termo de busca ou tente outro cargo, cidade ou UF." />
            ) : (
              <section className="grid">
                {candidates.map((candidate) => (
                  <article className="card candidate-card" key={candidate.id}>
                    <div>
                      <StatusBadge tone="neutral">Disponível</StatusBadge>
                      <h2>{candidate.fullName}</h2>
                      <div className="candidate-meta">
                        {candidate.interestFunctions.length === 0 ? (
                          <span className="meta-pill">{candidate.desiredRole}</span>
                        ) : null}
                        <span className="meta-pill">{candidate.city}/{candidate.state}</span>
                      </div>
                      {candidate.interestFunctions.length > 0 ? (
                        <div className="candidate-meta" aria-label="Funções de interesse">
                          {candidate.interestFunctions.map((item) => (
                            <span className="meta-pill" key={item.id}>{item.systemJobFunction.name}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <p>{candidate.summary}</p>
                    <Link href={`/empregador/candidatos/${candidate.id}${jobOpening ? `?jobOpeningId=${encodeURIComponent(jobOpening.id)}` : ""}`}>
                      Ver detalhes seguros
                    </Link>
                  </article>
                ))}
              </section>
            )}
          </Section>
        </>
      )}
    </main>
  );
}
