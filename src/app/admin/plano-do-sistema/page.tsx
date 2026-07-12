import Image from "next/image";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { CopyButton } from "@/components/copy-button";
import { NotificationMessage } from "@/components/notification-message";
import { PageHeader, Section } from "@/components/ui";
import {
  confirmOperationalRepasseAction,
  saveOperationalRepasseSettingsAction
} from "@/modules/owner-commission-skill/actions";
import {
  getOperationalRepassePixPreview,
  getOperationalRepasseSettings
} from "@/modules/owner-commission-skill/service";
import { requireSuperAdminUser } from "@/modules/security-skill/permissions";

type SearchParams = {
  error?: string;
};

const planTypeLabels = {
  MONTHLY: "Mensal",
  ANNUAL: "Anual"
};

const statusLabels = {
  ACTIVE: "Ativo",
  PENDING: "Pendente",
  OVERDUE: "Vencido",
  CANCELED: "Cancelado",
  EXEMPT: "Isento"
};

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusColor(status: string) {
  if (status === "ACTIVE" || status === "EXEMPT") return "success";
  if (status === "OVERDUE" || status === "CANCELED") return "error";
  return "warning";
}

export default async function AdminCommissionsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireSuperAdminUser();
  const [settings, pixPreview] = await Promise.all([
    getOperationalRepasseSettings(),
    getOperationalRepassePixPreview()
  ]);

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Plano de manutenção"
        title="Plano de manutenção do sistema"
        description="Área restrita para controlar o custo operacional do sistema e gerar Pix independente da assinatura dos empregadores."
      />
      {searchParams.error ? <NotificationMessage message={searchParams.error} variant="error" /> : null}

      <section className="metric-grid">
        <article className="metric-card"><span>Plano</span><strong>{settings.maintenancePlanName}</strong></article>
        <article className="metric-card"><span>Tipo</span><strong>{planTypeLabels[settings.maintenancePlanType]}</strong></article>
        <article className="metric-card"><span>Valor</span><strong>{formatMoney(settings.maintenancePlanValue)}</strong></article>
        <article className="metric-card"><span>Vencimento</span><strong>{settings.maintenancePlanDueDate || "Não informado"}</strong></article>
        <article className="metric-card"><span>Status</span><strong>{statusLabels[settings.maintenancePlanStatus]}</strong></article>
        <article className="metric-card"><span>Pix</span><strong>{pixPreview.pixConfigured ? "Configurado" : "Pendente"}</strong></article>
      </section>

      <section className="dashboard-grid admin-operation-grid">
        <Card className="compact-card" sx={{ minWidth: 0 }} variant="outlined">
          <CardContent>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
              <Typography component="h2" variant="h6">Dados do plano</Typography>
              <Chip
                color={statusColor(settings.maintenancePlanStatus)}
                label={statusLabels[settings.maintenancePlanStatus]}
                size="small"
                variant="outlined"
              />
            </Stack>
            <form action={saveOperationalRepasseSettingsAction} className="mui-compact-form">
              <div className="form-grid compact-form-grid">
                <label>Nome do plano
                  <input name="maintenancePlanName" required defaultValue={settings.maintenancePlanName} />
                </label>
                <label>Tipo do plano
                  <select name="maintenancePlanType" required defaultValue={settings.maintenancePlanType}>
                    <option value="MONTHLY">Mensal</option>
                    <option value="ANNUAL">Anual</option>
                  </select>
                </label>
                <label>Valor do plano
                  <input name="maintenancePlanValue" required step="0.01" min="0" type="number" defaultValue={settings.maintenancePlanValue} />
                </label>
                <label>Data de vencimento
                  <input name="maintenancePlanDueDate" type="date" defaultValue={settings.maintenancePlanDueDate} />
                </label>
                <label>Status
                  <select name="maintenancePlanStatus" required defaultValue={settings.maintenancePlanStatus}>
                    <option value="ACTIVE">Ativo</option>
                    <option value="PENDING">Pendente</option>
                    <option value="OVERDUE">Vencido</option>
                    <option value="CANCELED">Cancelado</option>
                    <option value="EXEMPT">Isento</option>
                  </select>
                </label>
                <label>Chave Pix do plano
                  <input name="operationalPixKey" required defaultValue={settings.operationalPixKey} />
                </label>
                <label>Nome do recebedor
                  <input name="operationalPixReceiverName" maxLength={25} required defaultValue={settings.operationalPixReceiverName} />
                </label>
                <label>Cidade do recebedor
                  <input name="operationalPixReceiverCity" maxLength={25} required defaultValue={settings.operationalPixReceiverCity} />
                </label>
                <label className="full-span">Observações
                  <textarea name="maintenancePlanNotes" maxLength={500} defaultValue={settings.maintenancePlanNotes} />
                </label>
              </div>
              <ResponsiveActions sx={{ mt: 1 }}>
                <AppButton minWidth={190} startIcon={<SaveIcon fontSize="small" />} type="submit" variant="contained">
                  Salvar plano
                </AppButton>
              </ResponsiveActions>
            </form>
          </CardContent>
        </Card>

        <Card className="compact-card qr-card" sx={{ minWidth: 0 }} variant="outlined">
          <CardContent>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
              <Typography component="h2" variant="h6">Pix do plano de manutenção</Typography>
              <QrCode2Icon color="primary" fontSize="small" />
            </Stack>
            {!pixPreview.pixConfigured ? (
              <Alert severity="warning" variant="outlined">Configure os dados Pix do plano antes de gerar a cobrança.</Alert>
            ) : pixPreview.amountCents <= 0 ? (
              <Alert severity="info" variant="outlined">Informe um valor maior que zero para gerar o Pix do plano.</Alert>
            ) : (
              <div className="qr-panel">
                <Image
                  className="qr-image"
                  src={pixPreview.qrCodeDataUrl}
                  alt="QR Code Pix do plano de manutenção"
                  width={260}
                  height={260}
                  unoptimized
                />
                <Typography color="text.secondary" variant="body2">
                  Valor do plano: <strong>{formatMoney(pixPreview.amountCents / 100)}</strong>
                </Typography>
                <label>Pix copia e cola
                  <textarea readOnly value={pixPreview.payload} />
                </label>
                <ResponsiveActions
                  className="pix-action-row"
                  justifyContent="flex-start"
                  sx={{
                    display: "grid",
                    gap: 1,
                    gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" },
                    width: "100%",
                    "& > .MuiButton-root": {
                      minWidth: 0,
                      width: "100%"
                    },
                    "& > .inline-form": {
                      width: { xs: "100%", sm: "auto" }
                    },
                    "& > .inline-form .MuiButton-root": {
                      minWidth: { xs: 0, sm: 190 },
                      width: { xs: "100%", sm: "auto" }
                    }
                  }}
                >
                  <CopyButton value={pixPreview.payload} />
                  <form action={confirmOperationalRepasseAction} className="inline-form">
                    <input type="hidden" name="payload" value={pixPreview.payload} />
                    <AppButton color="success" minWidth={190} startIcon={<CheckCircleOutlineIcon fontSize="small" />} type="submit" variant="contained">
                      Confirmar pagamento
                    </AppButton>
                  </form>
                </ResponsiveActions>
                <p className="muted">Este Pix pertence ao plano de manutenção do sistema. Ele não ativa assinatura de empregador.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Section title="Registros legados" description="Comissões automáticas geradas anteriormente foram preservadas para auditoria, mas não fazem parte do plano de manutenção atual.">
        <article className="panel">
          <p className="muted">
            A estrutura antiga de comissões foi mantida no banco para histórico e segurança. Novas cobranças de assinatura de empregador não geram comissão automática nesta tela.
          </p>
        </article>
      </Section>
    </main>
  );
}
