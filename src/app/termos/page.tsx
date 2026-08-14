import { PageHeader, Section } from "@/components/ui";
import { getLegalPage } from "@/modules/legal-pages-skill/service";

export default function TermsPage() {
  const page = getLegalPage("terms");

  return (
    <main>
      <PageHeader eyebrow="Legal" title={page.title} description={page.body} />
      <Section title="Uso local">
        <div className="card">
          <p>Este sistema foi preparado para teste local do MVP com Next.js, Prisma e MySQL/MariaDB.</p>
          <p>Pagamentos sao manuais, assinaturas sao ativadas por admin e o acesso vence automaticamente ao fim do periodo.</p>
        </div>
      </Section>
    </main>
  );
}
