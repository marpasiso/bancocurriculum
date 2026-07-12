import Link from "next/link";
import Chip from "@mui/material/Chip";
import { DashboardCard, EmptyState, PageHeader, Section } from "@/components/ui";
import { formatLgpdRequestStatus, formatLgpdRequestType } from "@/lib/display-labels";
import { getAdminDashboardData, getSuperAdminDashboardData } from "@/modules/admin-console-skill/service";
import { requireAdminUser } from "@/modules/security-skill/permissions";

function formatMoneyFromCents(value: number) {
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboardPage() {
  const user = await requireAdminUser();

  if (user.role === "SUPER_ADMIN") {
    const { stats, plan } = await getSuperAdminDashboardData();
    const statusLabels = {
      ACTIVE: "Ativo",
      PENDING: "Pendente",
      OVERDUE: "Vencido",
      CANCELED: "Cancelado",
      EXEMPT: "Isento"
    };

    return (
      <main className="admin-main">
        <PageHeader
          eyebrow="Super admin"
          title="Painel do administrador principal"
          description="Visão do ganho do plano de manutenção e da saúde geral do sistema."
        />
        <section className="metric-grid">
          <DashboardCard title="Ganho do super admin" value={formatMoneyFromCents(stats.superAdminGainCents)} />
          <DashboardCard title="Valor do plano" value={formatMoneyFromCents(plan.valueCents)} />
          <DashboardCard title="Status do plano" value={statusLabels[plan.status]} />
          <DashboardCard title="Assinaturas ativas" value={stats.activeSubscriptionCount} />
          <DashboardCard title="Empregadores" value={stats.employerCount} />
          <DashboardCard title="Candidatos" value={stats.candidateCount} />
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <h2>Plano de manutenção</h2>
            <p><strong>{plan.name}</strong></p>
            <p className="muted">
              Cobrança {plan.type === "MONTHLY" ? "mensal" : "anual"}
              {plan.dueDate ? ` · vencimento em ${new Date(`${plan.dueDate}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}.
            </p>
            <div className="actions">
              <Link className="button-link" href="/admin/plano-do-sistema">Gerenciar plano</Link>
            </div>
          </article>
          <article className="panel">
            <h2>Gestão do sistema</h2>
            <p className="muted">Acesse configurações globais e controle os usuários administrativos.</p>
            <div className="actions">
              <Link className="button-link button-secondary" href="/admin/administradores">Administradores</Link>
              <Link className="button-link button-secondary" href="/admin/configuracoes">Configurações</Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  const { stats, employers, dataRequests } = await getAdminDashboardData();

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Painel"
        title="Painel administrativo"
        description="Visão do faturamento das assinaturas e da operação diária."
      />
      <section className="metric-grid">
        <DashboardCard title="Faturamento total" value={formatMoneyFromCents(stats.totalRevenueCents)} />
        <DashboardCard title="Pagamentos confirmados" value={stats.confirmedPaymentCount} />
        <DashboardCard title="Assinaturas ativas" value={stats.activeSubscriptionCount} />
        <DashboardCard title="Custo operacional do sistema" value={formatMoneyFromCents(stats.operationalCostCents)} />
        <DashboardCard title="Ganho líquido do admin" value={formatMoneyFromCents(stats.estimatedNetCents)} />
        <DashboardCard title="Candidatos cadastrados" value={stats.candidateCount} />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <h2>Atalhos administrativos</h2>
          <div className="actions">
            <Link className="button-link" href="/admin/pagamentos-pix">Gerar Pix</Link>
            <Link className="button-link button-secondary" href="/admin/empregadores">Ver empregadores</Link>
            <Link className="button-link button-secondary" href="/admin/solicitacoes-lgpd">Solicitações LGPD</Link>
          </div>
        </article>
        <article className="panel">
          <h2>Últimos empregadores</h2>
          {employers.length === 0 ? (
            <p className="muted">Nenhum empregador cadastrado ainda.</p>
          ) : (
            employers.slice(0, 4).map((employer) => (
              <p key={employer.id}>
                <strong>{employer.companyName}</strong><br />
                <span className="muted">{employer.user.email}</span>
              </p>
            ))
          )}
        </article>
      </section>

      <Section title="Solicitações recentes" description="Pedidos públicos de LGPD aguardam análise administrativa.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {dataRequests.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="Nenhuma solicitação recente" description="Pedidos LGPD enviados pelo público aparecerão aqui." />
                  </td>
                </tr>
              ) : (
                dataRequests.slice(0, 5).map((request) => (
                  <tr key={request.id}>
                    <td>{request.fullName}</td>
                    <td>{formatLgpdRequestType(request.type)}</td>
                    <td><Chip color="warning" label={formatLgpdRequestStatus("PENDING")} size="small" variant="outlined" /></td>
                    <td>{request.createdAt.toLocaleString("pt-BR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </main>
  );
}
