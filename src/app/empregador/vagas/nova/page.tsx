import { AppButton } from "@/components/app-actions";
import { ButtonLink, EmptyState, PageHeader, Section } from "@/components/ui";
import { createEmployerJobOpeningAction } from "@/modules/job-openings-skill/actions";
import { getActiveSystemJobFunctions } from "@/modules/job-functions-skill/service";
import { requireEmployerUser } from "@/modules/security-skill/permissions";

const states = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"]
] as const;

export default async function NewEmployerJobOpeningPage() {
  await requireEmployerUser();
  const jobFunctions = await getActiveSystemJobFunctions();

  return (
    <main>
      <PageHeader
        actions={<ButtonLink href="/empregador/vagas" variant="secondary">Voltar para vagas</ButtonLink>}
        description="Cadastre uma vaga da sua empresa e escolha o cargo principal usado para encontrar candidatos compatíveis."
        eyebrow="Vagas"
        title="Nova vaga"
      />

      <Section>
        {jobFunctions.length === 0 ? (
          <EmptyState
            description="No momento não há funções ou cargos ativos para vincular a uma vaga. Solicite ao administrador a ativação de uma função antes de cadastrar vagas."
            title="Cadastro de vaga indisponível"
          />
        ) : (
          <form action={createEmployerJobOpeningAction} className="form-card">
            <div className="form-grid">
              <label className="full-span">
                Título da vaga
                <span className="field-help">Use um nome livre para identificar a oportunidade na sua empresa.</span>
                <input maxLength={120} name="title" required placeholder="Ex.: Auxiliar administrativo para escritório" />
              </label>

              <label>
                Função/cargo principal
                <span className="field-help">Este campo será usado para encontrar candidatos com interesses compatíveis.</span>
                <select name="systemJobFunctionId" required>
                  <option value="">Selecione a função/cargo principal</option>
                  {jobFunctions.map((jobFunction) => (
                    <option key={jobFunction.id} value={jobFunction.id}>
                      {jobFunction.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantidade
                <input defaultValue="1" inputMode="numeric" min="1" max="999" name="quantity" required type="number" />
              </label>

              <label>
                Cidade
                <input maxLength={80} name="city" required placeholder="Ex.: Ribeira do Pombal" />
              </label>

              <label>
                UF
                <select name="state" required>
                  <option value="">Selecione a UF</option>
                  {states.map(([state, name]) => (
                    <option key={state} value={state}>
                      {state} - {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full-span">
                Descrição
                <textarea maxLength={1500} name="description" required placeholder="Descreva as principais atividades da vaga." />
              </label>

              <label className="full-span">
                Requisitos
                <textarea maxLength={1500} name="requirements" required placeholder="Informe experiência, formação ou requisitos desejados." />
              </label>
            </div>

            <div className="actions employer-edit-actions">
              <AppButton type="submit" variant="contained">Cadastrar vaga</AppButton>
            </div>
          </form>
        )}
      </Section>
    </main>
  );
}
