"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { CopyButton } from "@/components/copy-button";
import { confirmPixReceivedAction } from "@/modules/admin-console-skill/actions";
import { notifyError, notifySuccess } from "@/modules/notifications/user-feedback.skill";

type Employer = { id: string; companyName: string; user: { email: string } };
type Preview = {
  employerId: string;
  amountCents: number;
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  description: string;
  payload: string;
  qrCodeDataUrl: string;
};

export function AdminPixGenerator({ employers, settings, initialEmployerId }: {
  employers: Employer[];
  settings: { amount: string; pixKey: string; receiverName: string; receiverCity: string };
  initialEmployerId: string;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const configured = Boolean(currentSettings.pixKey && currentSettings.receiverName && currentSettings.receiverCity);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/subscription-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionPaymentAmount: String(form.get("subscriptionPaymentAmount") ?? ""),
          subscriptionPixKey: String(form.get("subscriptionPixKey") ?? ""),
          subscriptionPixReceiverName: String(form.get("subscriptionPixReceiverName") ?? ""),
          subscriptionPixReceiverCity: String(form.get("subscriptionPixReceiverCity") ?? "")
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCurrentSettings(result);
      setPreview(null);
      notifySuccess(enqueueSnackbar, "Configuração Pix salva. Gere uma nova cobrança quando desejar.");
    } catch (caught) {
      notifyError(enqueueSnackbar, caught, "Não foi possível salvar a configuração Pix.");
    } finally {
      setSaving(false);
    }
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/pix-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerId: String(form.get("employerId") ?? ""),
          amountCents: Math.round(Number(currentSettings.amount) * 100),
          pixKey: currentSettings.pixKey,
          receiverName: currentSettings.receiverName,
          receiverCity: currentSettings.receiverCity,
          description: String(form.get("description") ?? "")
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setPreview(result);
    } catch (caught) {
      setPreview(null);
      notifyError(enqueueSnackbar, caught, "Não foi possível gerar a cobrança Pix.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!configured ? <Alert severity="warning" sx={{ mb: 1.5 }}>Configure os dados Pix da assinatura antes de gerar uma cobrança.</Alert> : null}
      <Card className="compact-card" sx={{ mb: 1.5, minWidth: 0 }} variant="outlined">
        <CardContent>
          <Typography component="h2" sx={{ mb: 1.5 }} variant="h6">Configuração da assinatura</Typography>
          <Box component="form" onSubmit={saveSettings} className="mui-compact-form">
            <Box className="form-grid compact-form-grid" sx={{ minWidth: 0 }}>
              <label>Valor da assinatura<input name="subscriptionPaymentAmount" required step="0.01" type="number" defaultValue={currentSettings.amount} /></label>
              <label>Chave Pix da assinatura<input name="subscriptionPixKey" required defaultValue={currentSettings.pixKey} /></label>
              <label>Nome do recebedor<input name="subscriptionPixReceiverName" maxLength={25} required defaultValue={currentSettings.receiverName} /></label>
              <label>Cidade do recebedor<input name="subscriptionPixReceiverCity" maxLength={25} required defaultValue={currentSettings.receiverCity} /></label>
            </Box>
            <ResponsiveActions sx={{ mt: 1 }}><AppButton disabled={saving} minWidth={210} startIcon={<SaveIcon fontSize="small" />} type="submit" variant="contained">{saving ? "Salvando..." : "Salvar configuração"}</AppButton></ResponsiveActions>
          </Box>
        </CardContent>
      </Card>
      <section className="dashboard-grid admin-operation-grid">
      <Card className="compact-card" sx={{ minWidth: 0, overflow: "visible" }} variant="outlined">
        <CardContent sx={{ minWidth: 0 }}>
          <Typography component="h2" sx={{ mb: 1.5 }} variant="h6">Gerar cobrança Pix</Typography>
          <Box component="form" onSubmit={generate} sx={{ display: "grid", gap: 1.25, minWidth: 0 }}>
            <Box className="form-grid compact-form-grid" sx={{ minWidth: 0 }}>
              <label className="full-span">Empregador
                <select name="employerId" defaultValue={initialEmployerId} required>
                  {employers.map((employer) => <option key={employer.id} value={employer.id}>{employer.companyName} - {employer.user.email}</option>)}
                </select>
              </label>
              <div className="full-span panel">
                <strong>Configuração utilizada</strong>
                <p className="muted">Assinatura de R$ {Number(currentSettings.amount).toFixed(2).replace(".", ",")} para {currentSettings.receiverName || "recebedor não configurado"}.</p>
              </div>
              <label className="full-span">Descrição do pagamento
                <textarea name="description" maxLength={72} defaultValue="Assinatura da plataforma" required />
              </label>
            </Box>
            <Stack direction="row" justifyContent={{ xs: "stretch", sm: "flex-end" }}>
              <AppButton disabled={loading || !configured || employers.length === 0} minWidth={190} startIcon={<QrCode2Icon />} sx={{ width: { xs: "100%", sm: "auto" } }} type="submit" variant="contained">
                {loading ? "Gerando..." : "Gerar cobrança Pix"}
              </AppButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card className="compact-card qr-card" sx={{ minWidth: 0, overflow: "visible" }} variant="outlined">
        <CardContent sx={{ minWidth: 0 }}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
            <Typography component="h2" variant="h6">QR Code Pix</Typography><QrCode2Icon color="primary" fontSize="small" />
          </Stack>
          {preview ? <div className="qr-panel">
            <Image className="qr-image" src={preview.qrCodeDataUrl} alt="QR Code Pix para pagamento manual" width={260} height={260} unoptimized />
            <label>Pix copia e cola<textarea readOnly value={preview.payload} /></label>
            <ResponsiveActions
              className="pix-action-row"
              justifyContent="flex-start"
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                width: "100%",
                "& > .MuiButton-root": { minWidth: 0, width: "100%" },
                "& > .inline-form": { minWidth: 0, width: "100%" },
                "& > .inline-form .MuiButton-root": { minWidth: 0, width: "100%" }
              }}
            >
              <CopyButton value={preview.payload} />
              <form className="inline-form" action={confirmPixReceivedAction}>
                <input type="hidden" name="employerId" value={preview.employerId} /><input type="hidden" name="amount" value={(preview.amountCents / 100).toFixed(2)} />
                <input type="hidden" name="pixKey" value={preview.pixKey} /><input type="hidden" name="receiverName" value={preview.receiverName} /><input type="hidden" name="receiverCity" value={preview.receiverCity} />
                <input type="hidden" name="description" value={preview.description} /><input type="hidden" name="payload" value={preview.payload} />
                <AppButton color="success" minWidth={180} startIcon={<CheckCircleOutlineIcon fontSize="small" />} type="submit" variant="contained">Confirmar pagamento</AppButton>
              </form>
            </ResponsiveActions>
            <p className="muted">Gerar QR Code não ativa assinatura. O acesso é liberado somente após confirmar o recebimento.</p>
          </div> : <div className="empty-state compact-empty"><h2>Nenhum QR Code gerado</h2><p>Selecione o empregador e gere o código para exibir a cobrança aqui.</p></div>}
        </CardContent>
      </Card>
      </section>
    </>
  );
}
