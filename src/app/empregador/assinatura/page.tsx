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
  if (!value) return "valor definido pelo administrador";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMoneyCents(value: number) {
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EmployerSubscriptionPage() {
  const user = await requireEmployerUser();
  const [subscriptionState, settings, pendingPix] = await Promise.all([
    getEmployerSubscriptionState(user.employer.id),
    getFinancialSettings(),
    getPendingSubscriptionPix(user.employer.id)
  ]);
  const subscription = subscriptionState.activeSubscription;
  const statusTone = subscriptionState.status === "active"
    ? "success"
    : subscriptionState.status === "pending_payment"
      ? "warning"
      : "danger";
  const pageTitle = subscriptionState.status === "active" ? "Assinatura ativa" : subscriptionState.ctaLabel;

  return (
    <main>
      <PageHeader
        eyebrow="Assinatura"
        title={pageTitle}
        description="Acesso à busca e aos detalhes exige assinatura ativa."
      />
      <section className="dashboard-grid">
        <article className={`panel ${subscription ? "notice-success" : "notice-danger"}`}>
          <h2>Situação atual</h2>
          <StatusBadge tone={statusTone}>
            {subscription ? "Ativa" : subscriptionState.ctaLabel}
          </StatusBadge>
          {subscription ? (
            <>
              <InfoRow label="Início" value={subscription.startsAt.toLocaleString("pt-BR")} />
              <InfoRow label="Vencimento" value={subscription.endsAt.toLocaleString("pt-BR")} />
            </>
          ) : (
            <p className="muted">{subscriptionState.message}</p>
          )}
        </article>
        <article className="panel">
          <h2>{subscriptionState.status === "active" ? "Acesso liberado" : subscriptionState.ctaLabel}</h2>
          <p className="muted">
            O pagamento manual Pix de {formatMoney(settings.subscriptionPaymentAmount)} libera acesso por 7 dias após confirmação administrativa.
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
          {subscriptionState.status === "pending_payment" ? (
            <p className="muted">A cobrança já foi gerada. Realize o pagamento e aguarde a confirmação administrativa.</p>
          ) : null}
        </article>
      </section>

      {pendingPix ? (
        <Section title="Cobrança Pix pendente" description="Gerar Pix não libera acesso. O acesso só é liberado após confirmação administrativa do pagamento.">
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

      <Section title="Instruções">
        <article className="card">
          <p>Depois que o administrador confirmar o recebimento do Pix, a busca e os detalhes são liberados automaticamente pela regra da assinatura.</p>
        </article>
      </Section>
    </main>
  );
}
