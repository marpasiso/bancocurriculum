import { CharacterCountedTextarea } from "@/components/character-counted-textarea";
import { PageHeader, Section } from "@/components/ui";
import { createDataRequestAction } from "@/modules/data-request-skill/actions";
import { getLegalPage } from "@/modules/legal-pages-skill/service";

export default function LgpdPage() {
  const lgpdPage = getLegalPage("lgpd");

  return (
    <main>
      <PageHeader eyebrow="Dados pessoais" title={lgpdPage.title} description={lgpdPage.body} />
      <Section title="Enviar solicitação" description="Informe seus dados de contato e descreva o que precisa. Nenhuma alteração é feita automaticamente.">
        <form className="form-card" action={createDataRequestAction}>
          <div className="form-grid">
            <label>
              O que você deseja solicitar?
              <select name="type" required>
                <option value="">Selecione</option>
                <option value="CORRECTION">Alteração de dados</option>
                <option value="DELETE_REVIEW">Análise de exclusão de dados</option>
                <option value="REVOCATION">Revogação da autorização</option>
              </select>
            </label>
            <label>Nome completo<input name="fullName" autoComplete="name" maxLength={120} required /></label>
            <label className="full-span">E-mail<input name="email" type="email" autoComplete="email" inputMode="email" maxLength={160} required /></label>
            <label className="full-span">
              Descrição
              <CharacterCountedTextarea
                name="description"
                required
                minLength={20}
                maxLength={1000}
                placeholder="Descreva quais dados deseja alterar, excluir ou qual autorização deseja revogar."
              />
              <span className="field-help">Não envie documentos ou senhas por este formulário.</span>
            </label>
          </div>
          <button type="submit">Enviar solicitação</button>
        </form>
      </Section>
    </main>
  );
}
