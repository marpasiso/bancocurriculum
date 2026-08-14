import Image from "next/image";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { NotificationMessage } from "@/components/notification-message";
import {
  confirmPendingPixPaymentAction,
  confirmPixReceivedAction
} from "@/modules/admin-console-skill/actions";
import { generateAdminPixQr, getAdminConsoleData } from "@/modules/admin-console-skill/service";
import { getUserFriendlyErrorMessage, logTechnicalError } from "@/modules/notifications/user-feedback.skill";
import { saveSubscriptionPaymentSettingsAction } from "@/modules/settings/actions";
import {
  getFinancialSettings,
  hasSubscriptionPixSettings
} from "@/modules/settings/operational-settings.skill";
import { requireOperationalAdminUser } from "@/modules/security-skill/permissions";
import { CopyButton } from "@/components/copy-button";
import { PageHeader, Section } from "@/components/ui";
import { formatPaymentStatus } from "@/lib/display-labels";

function compactId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-5)}`;
}

function formatConfiguredAmount(value: string) {
  return value ? `R$ ${Number(value).toFixed(2)}` : "A definir";
}

export default async function AdminPixPaymentsPage({
  searchParams
}: {
  searchParams: {
    employerId?: string;
    description?: string;
    error?: string;
    generate?: string;
  };
}) {
  await requireOperationalAdminUser();
  const [{ employers }, settings] = await Promise.all([
    getAdminConsoleData(),
    getFinancialSettings()
  ]);
  const pixConfigured = hasSubscriptionPixSettings(settings);
  const hasSubscriptionAmount = Number(settings.subscriptionPaymentAmount) > 0;
  const selectedEmployerId = searchParams.employerId ?? employers[0]?.id ?? "";
  const selectedEmployer = employers.find((employer) => employer.id === selectedEmployerId);
  const amountCents = Math.round(Number(settings.subscriptionPaymentAmount) * 100);
  const description = searchParams.description ?? "Assinatura da plataforma";
  const shouldGeneratePix = searchParams.generate === "1";
  const allPayments = employers.flatMap((employer) =>
    employer.payments.map((payment) => ({ ...payment, employer }))
  );
  let pixError = "";
  let pixPreview: Awaited<ReturnType<typeof generateAdminPixQr>> | null = null;

  try {
    pixPreview = shouldGeneratePix && pixConfigured && hasSubscriptionAmount && selectedEmployer
      ? await generateAdminPixQr({
        employerId: selectedEmployerId,
        amountCents,
        pixKey: settings.subscriptionPixKey,
        receiverName: settings.subscriptionPixReceiverName,
        receiverCity: settings.subscriptionPixReceiverCity,
        description
      })
      : null;
  } catch (error) {
    logTechnicalError(error);
    pixError = getUserFriendlyErrorMessage(error, "Não foi possível gerar a cobrança Pix. Verifique os dados e tente novamente.");
  }

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Pagamentos Pix"
        title="Cobrança manual Pix"
        description="Gere a cobrança, confirme o recebimento e ative a assinatura por 7 dias."
      />
      {!pixConfigured ? (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          Configure os dados Pix de assinatura antes de gerar cobrança.
        </Alert>
      ) : null}
      {!hasSubscriptionAmount ? (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          Defina o valor da assinatura antes de gerar cobranca.
        </Alert>
      ) : null}
      {pixError ? <NotificationMessage message={pixError} variant="error" /> : null}

      <section className="metric-grid">
        <article className="metric-card"><span>Valor da assinatura</span><strong>{formatConfiguredAmount(settings.subscriptionPaymentAmount)}</strong></article>
        <article className="metric-card"><span>Pix</span><strong>{pixConfigured ? "Configurado" : "Pendente"}</strong></article>
        <article className="metric-card"><span>Empregadores</span><strong>{employers.length}</strong></article>
        <article className="metric-card"><span>Pagamentos</span><strong>{allPayments.length}</strong></article>
        <article className="metric-card"><span>Recebedor</span><strong>{settings.subscriptionPixReceiverName || "Nao informado"}</strong></article>
        <article className="metric-card"><span>Cidade</span><strong>{settings.subscriptionPixReceiverCity || "Nao informada"}</strong></article>
      </section>

      <Card className="compact-card" sx={{ mb: 1.5, minWidth: 0 }} variant="outlined">
          <CardContent>
            <Typography component="h2" sx={{ mb: 1.5 }} variant="h6">Configurações da assinatura</Typography>
            <Typography color="text.secondary" sx={{ mb: 1.5 }} variant="body2">
              Fonte unica para valor, chave Pix, nome e cidade usados nas cobrancas manuais.
            </Typography>
            <form action={saveSubscriptionPaymentSettingsAction} className="mui-compact-form">
              <Box className="form-grid compact-form-grid" sx={{ minWidth: 0 }}>
                <label>Valor da assinatura
                  <input name="subscriptionPaymentAmount" inputMode="decimal" max="999999.99" min="0.01" required step="0.01" type="number" defaultValue={settings.subscriptionPaymentAmount} />
                </label>
                <label>Chave Pix da assinatura
                  <input name="subscriptionPixKey" maxLength={120} required defaultValue={settings.subscriptionPixKey} />
                </label>
                <label>Nome do recebedor
                  <input name="subscriptionPixReceiverName" maxLength={100} required defaultValue={settings.subscriptionPixReceiverName} />
                </label>
                <label>Cidade do recebedor
                  <input name="subscriptionPixReceiverCity" maxLength={80} required defaultValue={settings.subscriptionPixReceiverCity} />
                </label>
              </Box>
              <ResponsiveActions sx={{ mt: 1 }}>
                <AppButton minWidth={190} startIcon={<SaveIcon fontSize="small" />} type="submit" variant="outlined">
                  Salvar configuracao
                </AppButton>
              </ResponsiveActions>
            </form>
          </CardContent>
      </Card>

      <section className="dashboard-grid admin-operation-grid">
        <Card className="compact-card" sx={{ minWidth: 0, overflow: "visible" }} variant="outlined">
          <CardContent sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={{ mb: 1.5 }} variant="h6">Gerar cobrança Pix</Typography>
            <Alert severity="info" variant="outlined" sx={{ mb: 1.25 }}>
              A cobranca usa automaticamente valor, chave Pix, recebedor e cidade salvos na configuracao acima.
            </Alert>
            <Box component="form" sx={{ display: "grid", gap: 1.25, minWidth: 0 }}>
              <Box className="form-grid compact-form-grid" sx={{ minWidth: 0 }}>
                <label className="full-span">
                  Empregador
                  <select name="employerId" defaultValue={selectedEmployerId} required>
                    {employers.map((employer) => (
                      <option key={employer.id} value={employer.id}>{employer.companyName} - {employer.user.email}</option>
                    ))}
                  </select>
                </label>
                <input type="hidden" name="generate" value="1" />
                <label className="full-span">Descrição do pagamento<textarea name="description" maxLength={72} defaultValue={description} required /></label>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Chip label={`Valor: ${formatConfiguredAmount(settings.subscriptionPaymentAmount)}`} size="small" variant="outlined" />
                <Chip label={`Recebedor: ${settings.subscriptionPixReceiverName || "pendente"}`} size="small" variant="outlined" />
                <Chip label={`Cidade: ${settings.subscriptionPixReceiverCity || "pendente"}`} size="small" variant="outlined" />
              </Stack>
              <Stack direction="row" justifyContent={{ xs: "stretch", sm: "flex-end" }}>
                <AppButton
                  disabled={!pixConfigured || !hasSubscriptionAmount || !selectedEmployer}
                  minWidth={190}
                  size="medium"
                  startIcon={<QrCode2Icon />}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                  type="submit"
                  variant="contained"
                >
                  Gerar cobrança Pix
                </AppButton>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card className="compact-card qr-card" sx={{ minWidth: 0, overflow: "visible" }} variant="outlined">
          <CardContent sx={{ minWidth: 0 }}>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
              <Typography component="h2" variant="h6">QR Code Pix</Typography>
              <QrCode2Icon color="primary" fontSize="small" />
            </Stack>
            {pixPreview ? (
              <div className="qr-panel">
                <Image
                  className="qr-image"
                  src={pixPreview.qrCodeDataUrl}
                  alt="QR Code Pix para pagamento manual"
                  width={260}
                  height={260}
                  unoptimized
                />
                <label>
                  Pix copia e cola
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
                      minWidth: { xs: 0, sm: 180 },
                      width: { xs: "100%", sm: "auto" }
                    }
                  }}
                >
                  <CopyButton value={pixPreview.payload} />
                  <form className="inline-form" action={confirmPixReceivedAction}>
                    <input type="hidden" name="employerId" value={pixPreview.employerId} />
                    <input type="hidden" name="amount" value={(pixPreview.amountCents / 100).toFixed(2)} />
                    <input type="hidden" name="pixKey" value={pixPreview.pixKey} />
                    <input type="hidden" name="receiverName" value={pixPreview.receiverName} />
                    <input type="hidden" name="receiverCity" value={pixPreview.receiverCity} />
                    <input type="hidden" name="description" value={pixPreview.description} />
                    <input type="hidden" name="payload" value={pixPreview.payload} />
                    <AppButton color="success" minWidth={180} startIcon={<CheckCircleOutlineIcon fontSize="small" />} type="submit" variant="contained">
                      Confirmar pagamento
                    </AppButton>
                  </form>
                </ResponsiveActions>
                <p className="muted">Gerar QR Code não ativa assinatura. Acesso liberado somente após confirmar recebimento.</p>
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <h2>Nenhum QR Code gerado</h2>
                <p>Preencha os dados do Pix e gere o código para exibir a cobrança aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Section title="Histórico de pagamentos Pix" description="Pagamentos manuais registrados por empregador.">
        <Divider sx={{ mb: 1.5 }} />
        <Stack alignItems="center" direction="row" spacing={1} sx={{ mb: 1 }}>
          <ReceiptLongIcon color="primary" fontSize="small" />
          <Typography color="text.secondary" variant="body2">Registros confirmados e pendentes</Typography>
        </Stack>
        {allPayments.length === 0 ? (
          <div className="empty-state compact-empty">
            <h2>Nenhum pagamento Pix registrado</h2>
            <p>As cobrancas confirmadas para empregadores aparecerao aqui.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empregador</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Pago em</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map(({ employer, ...payment }) => (
                    <tr key={payment.id}>
                      <td>{employer.companyName}</td>
                      <td>R$ {(payment.amountCents / 100).toFixed(2)}</td>
                      <td>
                        <Chip
                          color={payment.status === "PAID" || payment.status === "USED" ? "success" : "warning"}
                          label={formatPaymentStatus(payment.status)}
                          size="small"
                          variant="outlined"
                        />
                      </td>
                      <td>{payment.paidAt ? payment.paidAt.toLocaleString("pt-BR") : "Pendente"}</td>
                      <td>
                        {payment.status === "RECORDED" ? (
                          <form action={confirmPendingPixPaymentAction}>
                            <input name="employerId" type="hidden" value={employer.id} />
                            <input name="paymentId" type="hidden" value={payment.id} />
                            <AppButton size="small" startIcon={<CheckCircleOutlineIcon fontSize="small" />} type="submit" variant="contained">
                              Confirmar pagamento
                            </AppButton>
                          </form>
                        ) : <span className="muted">{compactId(payment.id)}</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </main>
  );
}
