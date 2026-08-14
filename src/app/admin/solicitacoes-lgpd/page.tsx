import Chip from "@mui/material/Chip";
import { DashboardCard, EmptyState, PageHeader, Section } from "@/components/ui";
import { formatLgpdRequestStatus, formatLgpdRequestType } from "@/lib/display-labels";
import { getAdminConsoleData } from "@/modules/admin-console-skill/service";
import { requireOperationalAdminUser } from "@/modules/security-skill/permissions";

function countByType(dataRequests: Array<{ type: string }>, type: string) {
  return dataRequests.filter((request) => request.type === type).length;
}

export default async function AdminLgpdRequestsPage() {
  await requireOperationalAdminUser();
  const { dataRequests } = await getAdminConsoleData();

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Solicitações de dados"
        title="Pedidos sobre dados pessoais"
        description="Acompanhe pedidos públicos de alteração, análise de exclusão e revogação da autorização de uso dos dados."
      />

      <section className="metric-grid">
        <DashboardCard title="Total de solicitações" value={dataRequests.length} />
        <DashboardCard title="Alterações" value={countByType(dataRequests, "CORRECTION")} />
        <DashboardCard title="Exclusões em análise" value={countByType(dataRequests, "DELETE_REVIEW")} />
        <DashboardCard title="Revogações de autorização" value={countByType(dataRequests, "REVOCATION")} />
      </section>

      <Section title="Fila de análise" description="Analise cada pedido antes de alterar qualquer dado do cadastro.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Pedido</th>
                <th>Status</th>
                <th>Descrição</th>
                <th>Recebido em</th>
              </tr>
            </thead>
            <tbody>
              {dataRequests.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="Nenhuma solicitação de dados" description="Pedidos enviados pelo público aparecerão aqui para análise." />
                  </td>
                </tr>
              ) : (
                dataRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.fullName}</strong>
                      <p className="muted">{request.email}</p>
                    </td>
                    <td>{formatLgpdRequestType(request.type)}</td>
                    <td><Chip color="warning" label={formatLgpdRequestStatus("PENDING")} size="small" variant="outlined" /></td>
                    <td>{request.description}</td>
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
