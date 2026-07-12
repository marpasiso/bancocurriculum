import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { AppIconButton } from "@/components/app-actions";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { formatLgpdRequestStatus, formatLgpdRequestType } from "@/lib/display-labels";
import { getAdminConsoleData } from "@/modules/admin-console-skill/service";
import { requireOperationalAdminUser } from "@/modules/security-skill/permissions";

export default async function AdminLgpdRequestsPage() {
  await requireOperationalAdminUser();
  const { dataRequests } = await getAdminConsoleData();

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Solicitações LGPD"
        title="Pedidos de titulares"
        description="Pedidos enviados pelo formulário público de Direitos LGPD, incluindo alteração, exclusão e revogação de consentimento."
      />
      <Section title="Fila de análise" description={`${dataRequests.length} solicitação(ões) registrada(s) em /lgpd, /direitos-lgpd ou /solicitar-remocao.`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Descrição</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dataRequests.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState title="Nenhuma solicitação LGPD" description="Pedidos de titulares aparecerão aqui para análise." />
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
                    <td>
                      <Stack direction="row" spacing={0.5}>
                        <AppIconButton disabled label="Processamento LGPD administrativo ainda não implementado">
                          <HourglassEmptyIcon fontSize="small" />
                        </AppIconButton>
                        <AppIconButton disabled label="Conclusão exige regra administrativa e auditoria própria">
                          <CheckCircleOutlineIcon fontSize="small" />
                        </AppIconButton>
                        <AppIconButton disabled label="Rejeição exige justificativa e auditoria própria">
                          <DoNotDisturbIcon fontSize="small" />
                        </AppIconButton>
                      </Stack>
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
