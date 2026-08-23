import Image from "next/image";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { CopyButton } from "@/components/copy-button";
import { InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";
import { requestEmployerSubscriptionPaymentAction } from "@/modules/subscription-gate-skill/actions";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { getFinancialSettings } from "@/modules/settings/operational-settings.skill";
import {
  getEmployerSubscriptionState,
  getPendingSubscriptionPix
} from "@/modules/subscription-gate-skill/service";

function formatMoney(value: string) {
  if (!value) return "Valor definido pelo administrador";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMoneyCents(value: number) {
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: Date) {
  return value.toLocaleDateString("pt-BR");
}

export default async function EmployerSubscriptionPage() {
  const user = await requireEmployerUser();
  const [subscriptionState, settings, pendingPix] = await Promise.all([
    getEmployerSubscriptionState(user.employer.id),
    getFinancialSettings(),
    getPendingSubscriptionPix(user.employer.id)
  ]);
  const subscription = subscriptionState.activeSubscription;
  const latestSubscription = subscriptionState.latestSubscription;
  const statusTone = subscriptionState.status === "active"
    ? "success"
    : subscriptionState.status === "pending_payment"
      ? "warning"
      : "danger";
  const statusLabel = subscriptionState.status === "active" ? "Ativa" : subscriptionState.ctaLabel;
  const amountLabel = pendingPix
    ? formatMoneyCents(pendingPix.payment.amountCents)
    : formatMoney(settings.subscriptionPaymentAmount);
  const nextStep = subscriptionState.status === "active"
    ? "Sua assinatura está ativa. Você já pode consultar candidatos enquanto o período estiver vigente."
    : subscriptionState.status === "pending_payment"
      ? "Efetue o pagamento usando a cobrança Pix. Após confirmação administrativa, o acesso será liberado."
      : "Solicite a cobrança Pix para iniciar ou renovar sua assinatura.";

  return (
    <main>
      <PageHeader
        eyebrow="Assinatura"
        title="Assinatura"
        description="Acesso à busca e aos detalhes exige assinatura ativa."
      />
      <section className="dashboard-grid">
        <article className={`panel ${subscription ? "notice-success" : "notice-danger"}`}>
          <h2>Status da assinatura</h2>
          <InfoRow label="Status" value={<StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>} />
          <InfoRow label="Plano contratado" value="Acesso ao Banco de Currículos - 7 dias" />
          <InfoRow label="Valor" value={amountLabel} />
          <InfoRow label="Forma de pagamento" value="Pix" />
          {subscriptionState.status === "pending_payment" ? (
            <>
              <InfoRow label="Período da assinatura" value="7 dias" />
              <InfoRow label="Início" value="Após confirmação do pagamento" />
            </>
          ) : null}
          {subscription ? (
            <InfoRow label="Assinatura ativa até" value={formatDate(subscription.endsAt)} />
          ) : null}
          {subscriptionState.status === "expired" && latestSubscription ? (
            <InfoRow label="Assinatura vencida em" value={formatDate(latestSubscription.endsAt)} />
          ) : null}
          <InfoRow label="Próximo passo" value={nextStep} />
        </article>
        <article className="panel">
          <h2>{subscriptionState.status === "active" ? "Acesso liberado" : "Pagamento"}</h2>
          <p className="muted">
            A geração da cobrança não libera o acesso automaticamente. Após o pagamento, aguarde a confirmação administrativa para ativação da assinatura.
          </p>
          {!subscription && subscriptionState.status !== "pending_payment" ? (
            <form action={requestEmployerSubscriptionPaymentAction}>
              <ResponsiveActions justifyContent="flex-start" sx={{ mt: 1 }}>
                <AppButton minWidth={170} type="submit" variant="contained">
                  {subscriptionState.ctaLabel}
                </AppButton>
              </ResponsiveActions>
            </form>
          ) : null}
        </article>
      </section>

      {pendingPix ? (
        <Section title="Cobrança Pix" description="Use os dados abaixo para realizar o pagamento da assinatura.">
          <article className="card qr-panel">
            <Image
              alt="QR Code Pix da assinatura"
              className="qr-image"
              height={260}
              src={pendingPix.qrCodeDataUrl}
              unoptimized
              width={260}
            />
            <InfoRow label="Valor" value={formatMoneyCents(pendingPix.payment.amountCents)} />
            <label>
              Pix copia e cola
              <textarea readOnly value={pendingPix.payment.pixCode} />
            </label>
            <ResponsiveActions justifyContent="flex-start">
              <CopyButton value={pendingPix.payment.pixCode} />
            </ResponsiveActions>
          </article>
        </Section>
      ) : null}
    </main>
  );
}
