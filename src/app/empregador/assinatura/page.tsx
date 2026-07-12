import Image from "next/image";
import { CopyButton } from "@/components/copy-button";
import { ButtonLink, InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";
import { generateManualPixQr } from "@/modules/manual-payment-skill/service";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import {
  getFinancialSettings,
  getSubscriptionPaymentAmountCents,
  hasSubscriptionPixSettings
} from "@/modules/settings/operational-settings.skill";
import {
  getActiveSubscription,
  getEmployerSubscriptionNotice
} from "@/modules/subscription-gate-skill/service";

function formatMoney(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EmployerSubscriptionPage() {
  const user = await requireEmployerUser();
  const [subscription, settings, subscriptionNotice] = await Promise.all([
    getActiveSubscription(user.employer.id),
    getFinancialSettings(),
    getEmployerSubscriptionNotice(user.employer.id)
  ]);
  const actionLabel = subscriptionNotice.hasHistory ? "Renovar assinatura" : "Assinar";
  const pixConfigured = hasSubscriptionPixSettings(settings);
  const pix = pixConfigured
    ? await generateManualPixQr({
        employerId: user.employer.id,
        amountCents: await getSubscriptionPaymentAmountCents(),
        pixKey: settings.subscriptionPixKey,
        receiverName: settings.subscriptionPixReceiverName,
        receiverCity: settings.subscriptionPixReceiverCity,
        description: `Assinatura ${user.employer.companyName}`.slice(0, 72)
      })
    : null;

  return (
    <main>
      <PageHeader
        eyebrow="Assinatura"
        title="Status da assinatura"
        description="Acesso à busca e aos detalhes exige assinatura ativa."
        actions={!subscription && pix ? <ButtonLink href="#cobranca-pix">{actionLabel}</ButtonLink> : undefined}
      />
      <section className="dashboard-grid">
        <article className={`panel ${subscription ? "notice-success" : "notice-danger"}`}>
          <h2>Situação atual</h2>
          <StatusBadge tone={subscription ? "success" : "danger"}>
            {subscription ? "Ativa" : "Bloqueada"}
          </StatusBadge>
          {subscription ? (
            <>
              <InfoRow label="Início" value={subscription.startsAt.toLocaleString("pt-BR")} />
              <InfoRow label="Vencimento" value={subscription.endsAt.toLocaleString("pt-BR")} />
            </>
          ) : (
            <p className="muted">Faça o pagamento pelo Pix abaixo para solicitar a liberação do acesso por 7 dias.</p>
          )}
        </article>
        <article className="panel">
          <h2>{subscriptionNotice.hasHistory ? "Renovação" : "Primeira assinatura"}</h2>
          <p className="muted">
            O pagamento manual Pix de {formatMoney(settings.subscriptionPaymentAmount)} libera acesso por 7 dias após confirmação administrativa.
          </p>
          {!subscription && pix ? <ButtonLink href="#cobranca-pix">{actionLabel}</ButtonLink> : null}
        </article>
      </section>

      {!subscription ? (
        <Section title={`${actionLabel} via Pix`} description="Escaneie o QR Code ou copie o código Pix.">
          <article className="card qr-panel employer-subscription-pix" id="cobranca-pix">
            {pix ? (
              <>
                <Image
                  alt="QR Code Pix para pagamento da assinatura"
                  className="qr-image"
                  height={260}
                  src={pix.qrCodeDataUrl}
                  unoptimized
                  width={260}
                />
                <label>
                  Pix copia e cola
                  <textarea readOnly value={pix.payload} />
                </label>
                <div className="subscription-pix-action">
                  <CopyButton value={pix.payload} />
                </div>
                <p className="muted">
                  Após o pagamento, aguarde a confirmação administrativa. O QR Code sozinho não ativa a assinatura.
                </p>
              </>
            ) : (
              <p className="notice-warning">
                A cobrança Pix ainda não está disponível. Entre em contato com o administrador para configurar o recebimento.
              </p>
            )}
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
