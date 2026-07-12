import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AdminPixGenerator } from "@/components/admin-pix-generator";
import { PageHeader, Section } from "@/components/ui";
import { formatPaymentStatus } from "@/lib/display-labels";
import { getAdminConsoleData } from "@/modules/admin-console-skill/service";
import { requireOperationalAdminUser } from "@/modules/security-skill/permissions";
import { getFinancialSettings } from "@/modules/settings/operational-settings.skill";

function compactId(id: string) {
  return id.length <= 12 ? id : `${id.slice(0, 6)}...${id.slice(-5)}`;
}

export default async function AdminPixPaymentsPage({ searchParams }: { searchParams: { employerId?: string } }) {
  await requireOperationalAdminUser();
  const [{ employers }, settings] = await Promise.all([getAdminConsoleData(), getFinancialSettings()]);
  const selectedEmployerId = searchParams.employerId ?? employers[0]?.id ?? "";

  return (
    <main className="admin-main">
      <PageHeader eyebrow="Pagamentos Pix" title="Cobrança manual Pix" description="Configure o recebimento uma vez, gere a cobrança e confirme o pagamento para ativar a assinatura por 7 dias." />
      <AdminPixGenerator
          employers={employers}
          initialEmployerId={selectedEmployerId}
          settings={{
            amount: settings.subscriptionPaymentAmount,
            pixKey: settings.subscriptionPixKey,
            receiverName: settings.subscriptionPixReceiverName,
            receiverCity: settings.subscriptionPixReceiverCity
          }}
      />

      <Section title="Histórico de pagamentos Pix" description="Pagamentos manuais registrados por empregador.">
        <Divider sx={{ mb: 1.5 }} />
        <Stack alignItems="center" direction="row" spacing={1} sx={{ mb: 1 }}><ReceiptLongIcon color="primary" fontSize="small" /><Typography color="text.secondary" variant="body2">Registros confirmados e pendentes</Typography></Stack>
        <div className="table-wrap"><table><thead><tr><th>Empregador</th><th>Valor</th><th>Status</th><th>Pago em</th><th>Registro</th></tr></thead>
          <tbody>{employers.flatMap((employer) => employer.payments.map((payment) => (
            <tr key={payment.id}><td>{employer.companyName}</td><td>R$ {(payment.amountCents / 100).toFixed(2)}</td><td><Chip color={payment.status === "PAID" || payment.status === "USED" ? "success" : "warning"} label={formatPaymentStatus(payment.status)} size="small" variant="outlined" /></td><td>{payment.paidAt ? payment.paidAt.toLocaleString("pt-BR") : "Pendente"}</td><td><span className="muted">{compactId(payment.id)}</span></td></tr>
          )))}</tbody>
        </table></div>
      </Section>
    </main>
  );
}
