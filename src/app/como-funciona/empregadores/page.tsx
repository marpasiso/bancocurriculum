import { ButtonLink, PageHeader, Section } from "@/components/ui";
import { getFinancialSettings } from "@/modules/settings/operational-settings.skill";

function formatMoney(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EmployerHowItWorksPage() {
  const settings = await getFinancialSettings();

  return (
    <main>
      <PageHeader
        eyebrow="Para empregadores"
        title="Consulta profissional com acesso controlado."
        description="Empregadores podem buscar candidatos somente quando a conta está ativa e possui assinatura vigente."
        actions={<ButtonLink href="/empregador/cadastro">Cadastrar empresa</ButtonLink>}
      />
      <Section title="Regras de acesso">
        <div className="grid">
          <article className="card">
            <h2>Conta autenticada</h2>
            <p>O empregador cria conta com senha protegida e usa sessão segura.</p>
          </article>
          <article className="card">
            <h2>Assinatura ativa</h2>
            <p>O Pix manual de {formatMoney(settings.subscriptionPaymentAmount)} libera busca e detalhes por 7 dias.</p>
          </article>
          <article className="card">
            <h2>Auditoria</h2>
            <p>Cada visualização de detalhe registra CandidateView e AuditLog.</p>
          </article>
        </div>
      </Section>
    </main>
  );
}
