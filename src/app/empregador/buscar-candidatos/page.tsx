import Link from "next/link";
import { SearchFormBar } from "@/components/search-form-bar";
import { EmptyState, PageHeader, Section, StatusBadge } from "@/components/ui";
import { searchCandidatesForEmployer } from "@/modules/candidate-search-skill/service";
import { getUserFriendlyErrorMessage, logTechnicalError } from "@/modules/notifications/user-feedback.skill";
import { requireEmployerUser } from "@/modules/security-skill/permissions";

export default async function EmployerCandidateSearchPage({
  searchParams
}: {
  searchParams: { city?: string; q?: string; role?: string };
}) {
  const user = await requireEmployerUser();
  const query = searchParams.q ?? "";
  const role = searchParams.role ?? "";
  const city = searchParams.city ?? "";
  let candidates: Awaited<ReturnType<typeof searchCandidatesForEmployer>> = [];
  let error = "";

  try {
    candidates = await searchCandidatesForEmployer({ employerId: user.employer.id, query, role, city });
  } catch (err) {
    logTechnicalError(err);
    error = getUserFriendlyErrorMessage(err, "Busca bloqueada. Verifique sua assinatura e tente novamente.");
  }

  return (
    <main>
      <PageHeader
        eyebrow="Busca segura"
        title="Buscar candidatos"
        description="Resultados exibem apenas dados de listagem. Referências ficam restritas aos detalhes."
      />
      <SearchFormBar
        clearHref="/empregador/buscar-candidatos"
        fields={[
          { defaultValue: query, label: "Busca geral", name: "q", placeholder: "Nome, resumo ou UF" },
          { defaultValue: role, label: "Cargo/Função", name: "role", placeholder: "Ex.: administrativo" },
          { defaultValue: city, label: "Cidade", name: "city", placeholder: "Ex.: Feira de Santana" }
        ]}
        label="Buscar candidato"
      />
      {error ? (
        <div className="notice notice-danger section">
          <StatusBadge tone="danger">Assinatura necessária</StatusBadge>
          <h2>Acesso à busca bloqueado</h2>
          <p>{error}</p>
          <p className="muted">Solicite ao admin o registro do Pix manual e a ativação da assinatura para liberar a consulta.</p>
        </div>
      ) : (
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
                      <span className="meta-pill">{candidate.desiredRole}</span>
                      <span className="meta-pill">{candidate.city}/{candidate.state}</span>
                    </div>
                  </div>
                  <p>{candidate.summary}</p>
                  <Link href={`/empregador/candidatos/${candidate.id}`}>Ver detalhes seguros</Link>
                </article>
              ))}
            </section>
          )}
        </Section>
      )}
    </main>
  );
}
