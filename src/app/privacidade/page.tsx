import { PageHeader, Section } from "@/components/ui";
import { getLegalPage } from "@/modules/legal-pages-skill/service";

export default function PrivacyPage() {
  const page = getLegalPage("privacy");

  return (
    <main>
      <PageHeader eyebrow="Legal" title={page.title} description={page.body} />
      <Section title="Compromissos do sistema">
        <div className="card compact-paragraphs">
          <p>
            Usamos os dados apenas para cadastrar candidatos, ajudar
            empregadores autorizados a encontrar pessoas disponíveis e manter a
            segurança do sistema.
          </p>
          <p>
            Se o candidato pedir alteração, exclusão ou retirada da autorização,
            a solicitação será analisada pela administração antes de qualquer
            mudança.
          </p>
        </div>
      </Section>
    </main>
  );
}
