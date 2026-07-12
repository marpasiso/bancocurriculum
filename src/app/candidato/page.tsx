import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { CandidateJobFunctionsAutocomplete } from "@/components/candidate-job-functions-autocomplete";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { createCandidateAction } from "@/modules/candidate-registration-skill/actions";
import { getActiveSystemJobFunctions } from "@/modules/job-functions-skill/service";
import { CONSENT_TEXT } from "@/modules/lgpd-consent-skill/service";

export default async function CandidatePage({ searchParams }: { searchParams: { error?: string } }) {
  const jobFunctions = await getActiveSystemJobFunctions();

  return (
    <main>
      <PageHeader
        eyebrow="Cadastro de candidato"
        title="Informe seus dados profissionais com segurança."
        description="O cadastro é simples, sem envio de arquivos, e exige consentimento LGPD para manter transparência no uso dos dados."
      />
      <Section>
        <form className="form-card" action={createCandidateAction}>
          <div className="form-grid">
            <label>Nome completo<input name="fullName" autoComplete="name" required /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label>Telefone<input name="phone" autoComplete="tel" required /></label>
            <div className="full-span form-field-block">
              {jobFunctions.length > 0 ? (
                <CandidateJobFunctionsAutocomplete options={jobFunctions} />
              ) : (
                <EmptyState
                  title="Nenhuma função disponível"
                  description="No momento ainda não há funções ativas para cadastro. Tente novamente mais tarde."
                />
              )}
            </div>
            <label>Cidade<input name="city" required /></label>
            <label>UF<input name="state" minLength={2} maxLength={2} required /></label>
            <label className="full-span">Resumo profissional<textarea name="summary" required /></label>
            <label className="full-span">Experiência<textarea name="experience" /></label>
            <label className="full-span">Formação<textarea name="education" required /></label>
            <label className="full-span">
              Referências
              <span className="field-help">As referências ficam restritas aos detalhes, nunca na listagem.</span>
              <textarea name="references" />
            </label>
            <label className="full-span notice notice-warning candidate-consent">
              <span>Consentimento LGPD</span>
              <span className="field-help">{CONSENT_TEXT}</span>
              <span className="consent-check">
                <input name="acceptedLgpd" type="checkbox" required />
                <span>Li e autorizo o tratamento dos meus dados.</span>
              </span>
            </label>
          </div>
          <ResponsiveActions sx={{ mt: 1.5 }}>
            <AppButton disabled={jobFunctions.length === 0} minWidth={180} size="medium" type="submit" variant="contained">
              Cadastrar currículo
            </AppButton>
          </ResponsiveActions>
        </form>
      </Section>
    </main>
  );
}
