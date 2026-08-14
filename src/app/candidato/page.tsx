import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { CharacterCountedTextarea } from "@/components/character-counted-textarea";
import { CandidateJobFunctionsAutocomplete } from "@/components/candidate-job-functions-autocomplete";
import { CandidateStateAutocomplete } from "@/components/candidate-state-autocomplete";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { MaskedInput } from "@/components/masked-input";
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
        description="O cadastro é simples, sem envio de arquivos, e pede sua autorização para uso dos dados."
      />
      <Section>
        <form className="form-card" action={createCandidateAction}>
          <div className="form-grid">
            <label>Nome completo<input name="fullName" autoComplete="name" maxLength={120} required /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" inputMode="email" maxLength={160} required /></label>
            <label>Telefone<MaskedInput autoComplete="tel" inputMode="tel" mask="phone" name="phone" required /></label>
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
            <label>Cidade<input name="city" maxLength={80} required /></label>
            <div className="form-field-block">
              <CandidateStateAutocomplete />
            </div>
            <label className="full-span">Resumo profissional<CharacterCountedTextarea maxLength={800} name="summary" required /></label>
            <label className="full-span">Experiência<CharacterCountedTextarea maxLength={1500} name="experience" /></label>
            <label className="full-span">Formação<CharacterCountedTextarea maxLength={800} name="education" required /></label>
            <label className="full-span">
              Referências
              <span className="field-help">As referências ficam restritas aos detalhes, nunca na listagem.</span>
              <CharacterCountedTextarea maxLength={1000} name="references" />
            </label>
            <label className="full-span notice notice-warning candidate-consent">
              <span>Autorização de uso dos dados</span>
              <span className="field-help">{CONSENT_TEXT}</span>
              <span className="consent-check">
                <input name="acceptedLgpd" type="checkbox" required />
                <span>Li e autorizo o uso dos meus dados.</span>
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
