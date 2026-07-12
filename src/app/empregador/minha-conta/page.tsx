import SaveIcon from "@mui/icons-material/Save";
import LockResetIcon from "@mui/icons-material/LockReset";
import Stack from "@mui/material/Stack";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import {
  changeOwnEmployerPasswordAction,
  updateOwnEmployerAccountAction
} from "@/modules/employer-auth-skill/actions";
import { getEmployerAccount } from "@/modules/employer-auth-skill/service";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";

export default async function EmployerAccountPage({
  searchParams
}: {
  searchParams: { error?: string; passwordChanged?: string; saved?: string };
}) {
  const user = await requireEmployerUser();
  const account = await getEmployerAccount(user.id);
  const employer = account.employer;

  return (
    <main>
      <PageHeader
        eyebrow="Minha conta"
        title="Dados do empregador"
        description="Informações cadastrais da empresa autenticada."
      />

      <Stack spacing={1.5}>
        <section className="dashboard-grid">
          <article className="panel">
            <h2>{employer.companyName}</h2>
            <InfoRow label="E-mail" value={account.email} />
            <InfoRow label="Status" value={employer.isActive ? "Ativa" : "Inativa"} />
            <StatusBadge tone={employer.isActive ? "success" : "danger"}>
              {employer.isActive ? "Conta ativa" : "Conta bloqueada"}
            </StatusBadge>
          </article>

          <article className="panel">
            <h2>Segurança</h2>
            <p className="muted">As sessões continuam protegidas por cookie httpOnly e validação no servidor.</p>
          </article>
        </section>

        <Section title="Alterações cadastrais" description="Atualize apenas os dados da sua própria conta.">
          <form action={updateOwnEmployerAccountAction} className="form-card compact-card">
            <div className="form-grid compact-form-grid">
              <label>Empresa<input name="companyName" required defaultValue={employer.companyName} /></label>
              <label>Responsável<input name="contactName" required defaultValue={employer.contactName} /></label>
              <label>Documento<input name="document" required defaultValue={employer.document} /></label>
              <label>E-mail<input name="email" required type="email" defaultValue={account.email} /></label>
            </div>
            <ResponsiveActions sx={{ mt: 1 }}>
              <AppButton minWidth={150} startIcon={<SaveIcon fontSize="small" />} type="submit" variant="contained">
                Salvar alterações
              </AppButton>
            </ResponsiveActions>
          </form>
        </Section>

        <Section title="Troca de senha" description="Informe sua senha atual para definir uma nova senha.">
          <form action={changeOwnEmployerPasswordAction} className="form-card compact-card">
            <div className="form-grid compact-form-grid">
              <label>Senha atual<input name="currentPassword" required type="password" autoComplete="current-password" /></label>
              <label>Nova senha<input name="newPassword" minLength={8} required type="password" autoComplete="new-password" /></label>
            </div>
            <ResponsiveActions sx={{ mt: 1 }}>
              <AppButton minWidth={130} startIcon={<LockResetIcon fontSize="small" />} type="submit" variant="outlined">
                Trocar senha
              </AppButton>
            </ResponsiveActions>
          </form>
        </Section>
      </Stack>
    </main>
  );
}
