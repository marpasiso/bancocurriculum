import { PageHeader, Section } from "@/components/ui";
import { getLegalPage } from "@/modules/legal-pages-skill/service";

const TERMS_VERSION = "1.0";
const TERMS_EFFECTIVE_DATE = "23/08/2026";

export default function TermsPage() {
  const page = getLegalPage("terms");

  return (
    <main>
      <PageHeader
        eyebrow="Legal"
        title={page.title}
        description={`Versão ${TERMS_VERSION} - Vigência a partir de ${TERMS_EFFECTIVE_DATE}.`}
      />

      <Section title="1. Objetivo da plataforma">
        <div className="card compact-paragraphs">
          <p>
            A plataforma tem como objetivo organizar um banco de candidatos interessados em oportunidades de trabalho e permitir que empregadores assinantes consultem perfis compatíveis com suas vagas.
          </p>
          <p>
            O serviço facilita a aproximação entre candidatos e empregadores, sem garantir contratação, entrevista, vínculo de emprego ou resultado específico.
          </p>
        </div>
      </Section>

      <Section title="2. Cadastro de candidatos">
        <div className="card compact-paragraphs">
          <p>
            O candidato pode preencher cadastro público com seus dados pessoais, dados de contato, cidade, formação, experiências, resumo profissional, referências e funções de interesse.
          </p>
          <p>
            O candidato é responsável pela veracidade, atualização e licitude das informações fornecidas.
          </p>
          <p>
            O candidato não precisa criar login para se cadastrar. O envio do cadastro depende do aceite do consentimento para uso dos dados, conforme a Política de Privacidade.
          </p>
        </div>
      </Section>

      <Section title="3. Uso por empregadores">
        <div className="card compact-paragraphs">
          <p>
            O empregador deve criar conta, acessar sua área restrita e manter assinatura ativa para consultar candidatos.
          </p>
          <p>
            Com assinatura ativa, o empregador pode cadastrar suas próprias vagas, buscar candidatos compatíveis, visualizar detalhes permitidos e reservar candidatos para processo de seleção.
          </p>
          <p>
            O empregador deve usar os dados dos candidatos somente para fins legítimos de recrutamento, seleção e eventual contratação.
          </p>
        </div>
      </Section>

      <Section title="4. Assinatura e pagamento Pix manual">
        <div className="card compact-paragraphs">
          <p>
            O acesso do empregador à busca e aos detalhes dos candidatos depende de assinatura ativa.
          </p>
          <p>
            A cobrança é realizada por Pix manual. A geração de uma cobrança Pix não libera o acesso automaticamente.
          </p>
          <p>
            A liberação ocorre somente após confirmação administrativa do pagamento recebido. Após a confirmação, a assinatura é ativada pelo período informado na plataforma.
          </p>
          <p>
            Enquanto o pagamento estiver pendente, vencido ou não confirmado, o acesso à busca e aos detalhes dos candidatos poderá permanecer bloqueado.
          </p>
        </div>
      </Section>

      <Section title="5. Busca, detalhes e reserva de candidatos">
        <div className="card compact-paragraphs">
          <p>
            O empregador pode buscar candidatos compatíveis com suas vagas, considerando função ou cargo principal, localidade, disponibilidade e demais informações cadastradas.
          </p>
          <p>
            As referências do candidato não são exibidas na listagem. Quando permitido, ficam disponíveis apenas na página de detalhes do candidato.
          </p>
          <p>
            Ao reservar um candidato, ele poderá deixar de aparecer na busca comum enquanto estiver em processo. A contratação somente será considerada confirmada após registro administrativo.
          </p>
        </div>
      </Section>

      <Section title="6. Responsabilidades do usuário">
        <div className="card compact-paragraphs">
          <p>
            Candidatos, empregadores e administradores devem utilizar a plataforma de forma correta, respeitosa e compatível com estes Termos.
          </p>
          <p>
            É proibido inserir informações falsas, ofensivas, discriminatórias, ilícitas ou de terceiros sem autorização.
          </p>
          <p>
            O empregador é responsável por suas decisões de contato, entrevista, seleção, contratação, dispensa e tratamento dos dados acessados.
          </p>
        </div>
      </Section>

      <Section title="7. Proteção de dados pessoais">
        <div className="card compact-paragraphs">
          <p>
            Os dados pessoais serão tratados para cadastro de candidatos, gestão de oportunidades, consulta por empregadores autorizados, atendimento de solicitações e cumprimento de obrigações legais ou administrativas.
          </p>
          <p>
            A plataforma adota controles para restringir o acesso às informações conforme o perfil do usuário e a finalidade de uso.
          </p>
          <p>
            O tratamento de dados pessoais deve observar a Política de Privacidade e a legislação aplicável.
          </p>
        </div>
      </Section>

      <Section title="8. Solicitações sobre dados pessoais">
        <div className="card compact-paragraphs">
          <p>
            O titular dos dados pode solicitar alteração, exclusão ou revogação do consentimento pelos canais disponibilizados na plataforma.
          </p>
          <p>
            As solicitações serão analisadas pela administração, considerando a identidade do solicitante, a natureza do pedido, obrigações legais e registros necessários para segurança e auditoria.
          </p>
        </div>
      </Section>

      <Section title="9. Suspensão por uso indevido">
        <div className="card compact-paragraphs">
          <p>
            O acesso poderá ser suspenso, bloqueado ou limitado em caso de uso indevido, tentativa de fraude, violação destes Termos, risco à segurança, uso inadequado de dados pessoais ou descumprimento de pagamento.
          </p>
          <p>
            A suspensão poderá ocorrer para proteger candidatos, empregadores, administradores e a integridade da plataforma.
          </p>
        </div>
      </Section>

      <Section title="10. Alterações dos Termos">
        <div className="card compact-paragraphs">
          <p>
            Estes Termos poderão ser atualizados para refletir ajustes operacionais, legais, comerciais ou de segurança.
          </p>
          <p>
            A versão vigente será indicada nesta página. A continuidade de uso da plataforma após alteração representa ciência e concordância com os Termos atualizados.
          </p>
        </div>
      </Section>

      <Section title="11. Aceite">
        <div className="card compact-paragraphs">
          <p>
            Ao utilizar a plataforma, o usuário declara que leu, compreendeu e aceitou estes Termos de Uso.
          </p>
          <p>
            Caso não concorde com estes Termos, o usuário não deve utilizar a plataforma.
          </p>
        </div>
      </Section>
    </main>
  );
}
