import Link from "next/link";
import Chip from "@mui/material/Chip";
import { DashboardCard, EmptyState, PageHeader, Section } from "@/components/ui";
import { formatLgpdRequestStatus, formatLgpdRequestType } from "@/lib/display-labels";
import { getAdminDashboardData } from "@/modules/admin-console-skill/service";
import { requireAdminUser } from "@/modules/security-skill/permissions";

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const { stats, employers, dataRequests } = await getAdminDashboardData();

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Painel"
        title="Painel de controle"
        description="Visão geral administrativa da plataforma"
      />
      <section className="metric-grid">
        <DashboardCard title="Candidatos cadastrados" value={stats.candidateCount} />
        <DashboardCard title="Empregadores cadastrados" value={stats.employerCount} />
        <DashboardCard title="Pagamentos confirmados" value={stats.confirmedPaymentCount} />
        <DashboardCard title="Assinaturas ativas" value={stats.activeSubscriptionCount} />
        <DashboardCard title="Solicitações de dados pendentes" value={stats.lgpdRequestCount} />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <h2>Atalhos administrativos</h2>
          <div className="actions">
            <Link className="button-link" href="/admin/pagamentos-pix">Gerar Pix</Link>
            <Link className="button-link button-secondary" href="/admin/empregadores">Ver empregadores</Link>
            <Link className="button-link button-secondary" href="/admin/solicitacoes-lgpd">Solicitações de dados</Link>
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

      <Section title="Solicitações recentes" description="Pedidos públicos sobre dados pessoais aguardam análise administrativa.">
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
                    <EmptyState title="Nenhuma solicitação recente" description="Pedidos enviados pelo público aparecerão aqui." />
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
