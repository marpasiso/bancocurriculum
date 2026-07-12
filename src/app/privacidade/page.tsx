import { PageHeader, Section } from "@/components/ui";
import { getLegalPage } from "@/modules/legal-pages-skill/service";

export default function PrivacyPage() {
  const page = getLegalPage("privacy");

  return (
    <main>
      <PageHeader eyebrow="Legal" title={page.title} description={page.body} />
      <Section title="Compromissos do MVP">
        <div className="card">
          <p>Os dados sao usados para cadastro, busca controlada por empregadores assinantes e auditoria de acesso.</p>
          <p>Solicitações LGPD são registradas para análise administrativa e não executam exclusão automática.</p>
        </div>
      </Section>
    </main>
  );
}
