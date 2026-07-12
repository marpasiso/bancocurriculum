import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { AppDataTable, type AppDataTableColumn } from "@/components/ui/AppDataTable";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableActions } from "@/components/ui/TableActions";
import {
  blockEmployerAction,
  unblockEmployerAction,
  updateEmployerAction,
  viewEmployerAction
} from "@/modules/admin-console-skill/actions";
import { getAdminConsoleData } from "@/modules/admin-console-skill/service";
import { requireOperationalAdminUser } from "@/modules/security-skill/permissions";
import { PageHeader, Section } from "@/components/ui";

function hasActiveSubscription(subscriptions: { startsAt: Date; endsAt: Date }[]) {
  const now = new Date();
  return subscriptions.some((subscription) => subscription.startsAt <= now && subscription.endsAt > now);
}

export default async function AdminEmployersPage({
  searchParams
}: {
  searchParams: { editEmployerId?: string; updated?: string; viewEmployerId?: string };
}) {
  await requireOperationalAdminUser();
  const { employers } = await getAdminConsoleData();
  const selectedEmployer = employers.find((employer) => employer.id === searchParams.viewEmployerId);
  const editingEmployer = employers.find((employer) => employer.id === searchParams.editEmployerId);
  type EmployerRow = (typeof employers)[number];
  const employerColumns: AppDataTableColumn<EmployerRow>[] = [
    {
      header: "Empresa",
      render: (employer) => (
        <div>
          <Typography fontWeight={850} variant="body2">{employer.companyName}</Typography>
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <EmailIcon color="disabled" fontSize="small" />
            <Typography color="text.secondary" variant="body2">{employer.user.email}</Typography>
          </Stack>
        </div>
      ),
      span: 3
    },
    {
      header: "Status da conta",
      render: (employer) => (
        <StatusChip label={employer.isActive ? "Ativa" : "Bloqueada"} tone={employer.isActive ? "success" : "danger"} />
      ),
      whiteSpace: "nowrap"
    },
    {
      header: "Assinatura",
      render: (employer) => {
        const activeSubscription = hasActiveSubscription(employer.subscriptions);
        return (
          <StatusChip
            icon={<WorkspacePremiumIcon />}
            label={activeSubscription ? "Ativa" : "Sem assinatura ativa"}
            tone={activeSubscription ? "success" : "warning"}
          />
        );
      },
      whiteSpace: "nowrap"
    },
    {
      align: "right",
      header: "Pagamentos",
      render: (employer) => employer.payments.length,
      whiteSpace: "nowrap"
    }
  ];

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Empregadores"
        title="Contas de empregadores"
        description="Acompanhe status de conta, pagamentos e assinaturas vinculadas."
      />
      {editingEmployer ? (
        <section className="panel compact-card employer-summary-panel">
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
            <div>
              <h2>Editar empregador</h2>
              <p className="muted">Atualize os dados cadastrais da empresa e do usuário vinculado.</p>
            </div>
            <AppButton component={Link} href="/admin/empregadores" minWidth={96} variant="outlined">
              Cancelar
            </AppButton>
          </Stack>
          <form action={updateEmployerAction} className="mui-compact-form employer-edit-form">
            <input name="employerId" type="hidden" value={editingEmployer.id} />
            <div className="form-grid compact-form-grid">
              <label>
                Empresa
                <input name="companyName" required type="text" defaultValue={editingEmployer.companyName} />
              </label>
              <label>
                Nome do contato
                <input name="contactName" required type="text" defaultValue={editingEmployer.contactName} />
              </label>
              <label>
                Documento
                <input name="document" required type="text" defaultValue={editingEmployer.document} />
              </label>
              <label>
                E-mail de login
                <input name="email" required type="email" defaultValue={editingEmployer.user.email} />
              </label>
            </div>
            <ResponsiveActions className="employer-edit-actions">
              <AppButton component={Link} href="/admin/empregadores" minWidth={96} variant="outlined">
                Cancelar
              </AppButton>
              <AppButton minWidth={140} startIcon={<EditIcon />} type="submit" variant="contained">
                Salvar alterações
              </AppButton>
            </ResponsiveActions>
          </form>
        </section>
      ) : null}
      {selectedEmployer ? (
        <section className="panel compact-card employer-summary-panel">
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
            <div>
              <h2>{selectedEmployer.companyName}</h2>
              <p className="muted">{selectedEmployer.user.email}</p>
            </div>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Chip
                color={selectedEmployer.isActive ? "success" : "error"}
                label={selectedEmployer.isActive ? "Conta ativa" : "Conta bloqueada"}
                size="small"
                variant="outlined"
              />
              <Chip label={`${selectedEmployer.payments.length} pagamento(s)`} size="small" variant="outlined" />
              <Chip label={`${selectedEmployer.subscriptions.length} assinatura(s)`} size="small" variant="outlined" />
            </Stack>
          </Stack>
        </section>
      ) : null}
      <Section title="Empregadores cadastrados" description={`${employers.length} conta(s) cadastrada(s).`}>
        <AppDataTable
          actionCount={4}
          actions={(employer) => (
            <TableActions
              actions={[
                {
                  formAction: viewEmployerAction,
                  hiddenInputs: [{ name: "employerId", value: employer.id }],
                  icon: <VisibilityIcon fontSize="small" />,
                  label: "Visualizar empregador"
                },
                {
                  href: `/admin/empregadores?editEmployerId=${encodeURIComponent(employer.id)}`,
                  icon: <EditIcon fontSize="small" />,
                  label: "Editar empregador"
                },
                employer.isActive
                  ? {
                      color: "error",
                      formAction: blockEmployerAction,
                      hiddenInputs: [{ name: "employerId", value: employer.id }],
                      icon: <BlockIcon fontSize="small" />,
                      label: "Bloquear empregador"
                    }
                  : {
                      color: "success",
                      formAction: unblockEmployerAction,
                      hiddenInputs: [{ name: "employerId", value: employer.id }],
                      icon: <CheckCircleOutlineIcon fontSize="small" />,
                      label: "Ativar empregador"
                    },
                {
                  href: `/admin/pagamentos-pix?employerId=${encodeURIComponent(employer.id)}`,
                  icon: <WorkspacePremiumIcon fontSize="small" />,
                  label: "Gerenciar assinatura via Pix manual"
                }
              ]}
            />
          )}
          columns={employerColumns}
          emptyMessage="Nenhuma conta de empregador foi encontrada."
          getRowId={(employer) => employer.id}
          rows={employers}
        />
      </Section>
    </main>
  );
}
