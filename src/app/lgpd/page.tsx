import { createDataRequestAction } from "@/modules/data-request-skill/actions";
import { getLegalPage } from "@/modules/legal-pages-skill/service";
import { PageHeader, Section } from "@/components/ui";

export default function LgpdPage() {
  const lgpdPage = getLegalPage("lgpd");

  return (
    <main>
      <PageHeader eyebrow="Direitos LGPD" title={lgpdPage.title} description={lgpdPage.body} />
      <Section title="Solicitar atendimento" description="A solicitação será registrada para análise no painel administrativo.">
        <form className="form-card" action={createDataRequestAction}>
          <div className="form-grid">
            <label>
              Tipo de solicitação
              <select name="type" required>
                <option value="CORRECTION">Alteração de dados</option>
                <option value="DELETE_REVIEW">Exclusão de dados</option>
                <option value="REVOCATION">Revogação de consentimento</option>
                <option value="ACCESS">Acesso aos dados</option>
              </select>
            </label>
            <label>Nome completo<input name="fullName" autoComplete="name" required /></label>
            <label className="full-span">E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label className="full-span">Descrição<textarea name="description" required /></label>
          </div>
          <button type="submit">Enviar solicitação</button>
        </form>
      </Section>
    </main>
  );
}
