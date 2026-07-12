import { ButtonLink, InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { getActiveSubscription } from "@/modules/subscription-gate-skill/service";

export default async function EmployerDashboardPage() {
  const user = await requireEmployerUser();
  const subscription = await getActiveSubscription(user.employer.id);

  return (
    <main>
      <PageHeader
        eyebrow="Painel"
        title="Painel principal"
        description="Resumo da conta e do acesso aos candidatos"
        actions={<ButtonLink href="/empregador/buscar-candidatos">Buscar candidatos</ButtonLink>}
      />
      <Section>
        <div className="dashboard-grid">
          <article className="panel">
            <h2>{user.employer.companyName}</h2>
            <InfoRow label="Conta" value={user.employer.isActive ? "Ativa" : "Inativa"} />
            <InfoRow label="E-mail" value={user.email} />
          </article>
          <article className={`panel ${subscription ? "notice-success" : "notice-danger"}`}>
            <h2>Status da assinatura</h2>
            {subscription ? (
              <>
                <StatusBadge tone="success">Assinatura ativa</StatusBadge>
                <p className="muted">Acesso liberado ate {subscription.endsAt.toLocaleString("pt-BR")}.</p>
              </>
            ) : (
              <>
                <StatusBadge tone="danger">Acesso bloqueado</StatusBadge>
                <p className="muted">Sem assinatura ativa. Busca e detalhes permanecem bloqueados.</p>
              </>
            )}
          </article>
        </div>
      </Section>
    </main>
  );
}
