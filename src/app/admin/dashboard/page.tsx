import Link from "next/link";
import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import { DashboardCard, EmptyState, PageHeader, Section } from "@/components/ui";
import { formatLgpdRequestType } from "@/lib/display-labels";
import { getAdminDashboardData } from "@/modules/admin-console-skill/service";
import { requireAdminUser } from "@/modules/security-skill/permissions";

function formatDataRequestStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    IN_REVIEW: "Em análise",
    COMPLETED: "Concluído",
    RESOLVED: "Concluído",
    REJECTED: "Recusado",
    CANCELED: "Cancelado"
  };

  return labels[status] ?? "Pendente";
}

function getDataRequestStatusColor(status: string): ChipProps["color"] {
  if (status === "PENDING") return "warning";
  if (status === "IN_REVIEW") return "info";
  if (status === "COMPLETED" || status === "RESOLVED") return "success";
  if (status === "REJECTED" || status === "CANCELED") return "error";
  return "default";
}

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
            <Link className="button-link" href="/admin/pagamentos-pix">
              Gerar Pix
            </Link>
            <Link className="button-link button-secondary" href="/admin/empregadores">
              Ver empregadores
            </Link>
            <Link className="button-link button-secondary" href="/admin/solicitacoes-lgpd">
              Solicitações de dados
            </Link>
          </div>
        </article>

        <article className="panel">
          <h2>Últimos empregadores</h2>
          {employers.length === 0 ? (
            <p className="muted">Nenhum empregador cadastrado ainda.</p>
          ) : (
            employers.slice(0, 4).map((employer) => (
              <p key={employer.id}>
                <strong>{employer.companyName}</strong>
                <br />
                <span className="muted">{employer.user.email}</span>
              </p>
            ))
          )}
        </article>
      </section>

      <Section
        title="Solicitações recentes"
        description="Pedidos públicos sobre dados pessoais aguardam análise administrativa."
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {dataRequests.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="Nenhuma solicitação recente"
                      description="Pedidos enviados pelo público aparecerão aqui."
                    />
                  </td>
                </tr>
              ) : (
                dataRequests.slice(0, 5).map((request) => (
                  <tr key={request.id}>
                    <td>{request.fullName}</td>
                    <td>{formatLgpdRequestType(request.type)}</td>
                    <td><Chip color={request.status === 'PENDING' ? "warning" : "success"} label={formatDataRequestStatus(request.status)} size="small" variant="filled" /></td>
                    <td>{request.createdAt.toLocaleString("pt-BR")}</td>
                    <td>{request.status === 'PENDING' ? (<Link className="inline-button" href="/admin/solicitacoes-lgpd">
                        Gerenciar
                      </Link>) : ( <span className="muted">Atendida</span> )
                      }
                      
                    </td>
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
