import { ButtonLink, InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";
import { listEmployerJobOpenings } from "@/modules/job-openings-skill/service";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { getEmployerSubscriptionState } from "@/modules/subscription-gate-skill/service";

export default async function EmployerDashboardPage() {
  const user = await requireEmployerUser();
  const [subscriptionState, jobOpenings] = await Promise.all([
    getEmployerSubscriptionState(user.employer.id),
    listEmployerJobOpenings({ employerId: user.employer.id })
  ]);
  const subscription = subscriptionState.activeSubscription;
  const openJobOpenings = jobOpenings.filter((jobOpening) => jobOpening.status === "OPEN").length;

  return (
    <main>
      <PageHeader
        eyebrow="Painel"
        title="Painel principal"
        description="Resumo da conta e do acesso aos candidatos"
        actions={<ButtonLink href="/empregador/vagas">Minhas vagas</ButtonLink>}
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
                <p className="muted">Acesso liberado até {subscription.endsAt.toLocaleString("pt-BR")}.</p>
              </>
            ) : (
              <>
                <StatusBadge tone={subscriptionState.status === "pending_payment" ? "warning" : "danger"}>
                  {subscriptionState.ctaLabel}
                </StatusBadge>
                <p className="muted">{subscriptionState.message}</p>
                {subscriptionState.status === "pending_payment" ? (
                  <p className="muted">Aguarde a confirmação administrativa do pagamento.</p>
                ) : (
                  <div className="actions">
                    <ButtonLink href="/empregador/assinatura">
                      {subscriptionState.ctaLabel}
                    </ButtonLink>
                  </div>
                )}
              </>
            )}
          </article>
          <article className="panel">
            <h2>Vagas</h2>
            <InfoRow label="Total cadastrado" value={`${jobOpenings.length}`} />
            <InfoRow label="Abertas" value={`${openJobOpenings}`} />
            <div className="actions">
              <ButtonLink href="/empregador/vagas">Gerenciar vagas</ButtonLink>
              <ButtonLink href="/empregador/vagas/nova" variant="secondary">Nova vaga</ButtonLink>
            </div>
          </article>
        </div>
      </Section>
    </main>
  );
}
