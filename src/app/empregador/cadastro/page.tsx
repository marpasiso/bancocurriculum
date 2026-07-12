import { registerEmployerAction } from "@/modules/employer-auth-skill/actions";
import { ButtonLink, PageHeader, Section } from "@/components/ui";

export default function EmployerRegisterPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Empregador"
        title="Crie sua conta para consultar candidatos."
        description="A busca será liberada quando a assinatura manual estiver ativa no painel administrativo."
        actions={<ButtonLink href="/login" variant="secondary">Já tenho conta</ButtonLink>}
      />
      <Section>
        <form className="form-card" action={registerEmployerAction}>
          <div className="form-grid">
            <label>Empresa<input name="companyName" autoComplete="organization" required /></label>
            <label>Responsável<input name="contactName" autoComplete="name" required /></label>
            <label>Documento<input name="document" required /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label className="full-span">Senha<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
          </div>
          <button type="submit">Criar conta de empregador</button>
        </form>
      </Section>
    </main>
  );
}
