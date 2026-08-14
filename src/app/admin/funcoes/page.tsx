import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { AppDataTable, type AppDataTableColumn } from "@/components/ui/AppDataTable";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableActions } from "@/components/ui/TableActions";
import { PageHeader, Section } from "@/components/ui";
import {
  activateGlobalJobFunctionAction,
  createGlobalJobFunctionAction,
  deactivateGlobalJobFunctionAction,
  updateGlobalJobFunctionAction
} from "@/modules/job-functions-skill/actions";
import { getAdminSystemJobFunctions } from "@/modules/job-functions-skill/service";
import { requireAdminUser } from "@/modules/security-skill/permissions";

export default async function AdminJobFunctionsPage({
  searchParams
}: {
  searchParams: { edit?: string };
}) {
  await requireAdminUser();
  const jobFunctions = await getAdminSystemJobFunctions();
  const editingJobFunction = jobFunctions.find((jobFunction) => jobFunction.id === searchParams.edit);
  type JobFunctionRow = (typeof jobFunctions)[number];
  const columns: AppDataTableColumn<JobFunctionRow>[] = [
    {
      header: "Função global",
      render: (jobFunction) => (
        <div>
          <Typography fontWeight={850} variant="body2">{jobFunction.name}</Typography>
          <Typography color="text.secondary" variant="body2">Categoria: {jobFunction.category || "Geral"}</Typography>
          {jobFunction.description ? (
            <Typography color="text.secondary" variant="body2">{jobFunction.description}</Typography>
          ) : null}
        </div>
      ),
      span: 3
    },
    {
      header: "Status",
      render: (jobFunction) => (
        <StatusChip label={jobFunction.isActive ? "Ativa" : "Inativa"} tone={jobFunction.isActive ? "success" : "neutral"} />
      ),
      whiteSpace: "nowrap",
      width: 130
    },
    {
      align: "right",
      header: "Candidatos",
      render: (jobFunction) => jobFunction._count.candidates,
      whiteSpace: "nowrap",
      width: 120
    }
  ];

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Funções globais"
        title="Funções globais do sistema"
        description="Gerencie a lista global usada no cadastro de candidatos e nas vagas dos empregadores."
      />

      <Section
        title={editingJobFunction ? "Editar função global" : "Cadastrar função global"}
        description="Empregadores cadastram vagas próprias, mas usam esta lista global de funções administrada pelo sistema."
      >
        <form action={editingJobFunction ? updateGlobalJobFunctionAction : createGlobalJobFunctionAction} className="form-card compact-card job-function-form">
          {editingJobFunction ? <input name="jobFunctionId" type="hidden" value={editingJobFunction.id} /> : null}
          <label>
            Nome
            <input name="name" required defaultValue={editingJobFunction?.name ?? ""} placeholder="Ex.: Auxiliar administrativo" />
          </label>
          <label>
            Categoria
            <input name="category" required defaultValue={editingJobFunction?.category ?? "Geral"} maxLength={80} placeholder="Ex.: Administrativo" />
          </label>
          <label>
            Descrição opcional
            <textarea name="description" defaultValue={editingJobFunction?.description ?? ""} maxLength={500} />
          </label>
          <ResponsiveActions>
            {editingJobFunction ? (
              <AppButton component={Link} href="/admin/funcoes" minWidth={96} startIcon={<ClearIcon fontSize="small" />} variant="outlined">
                Cancelar
              </AppButton>
            ) : null}
            <AppButton minWidth={150} startIcon={editingJobFunction ? <EditIcon fontSize="small" /> : <AddCircleOutlineIcon fontSize="small" />} type="submit" variant="contained">
              {editingJobFunction ? "Salvar alterações" : "Cadastrar"}
            </AppButton>
          </ResponsiveActions>
        </form>
      </Section>

      <Section title="Lista global" description={`${jobFunctions.length} função(ões) global(is) cadastrada(s).`}>
        <AppDataTable
          actionCount={2}
          actions={(jobFunction) => (
            <TableActions
              actions={[
                {
                  href: `/admin/funcoes?edit=${encodeURIComponent(jobFunction.id)}`,
                  icon: <EditIcon fontSize="small" />,
                  label: "Editar função"
                },
                jobFunction.isActive
                  ? {
                      color: "error",
                      formAction: deactivateGlobalJobFunctionAction,
                      hiddenInputs: [{ name: "jobFunctionId", value: jobFunction.id }],
                      icon: <BlockIcon fontSize="small" />,
                      label: "Inativar função"
                    }
                  : {
                      color: "success",
                      formAction: activateGlobalJobFunctionAction,
                      hiddenInputs: [{ name: "jobFunctionId", value: jobFunction.id }],
                      icon: <CheckCircleOutlineIcon fontSize="small" />,
                      label: "Ativar função"
                    }
              ]}
            />
          )}
          columns={columns}
          emptyMessage="Cadastre a primeira função global para liberar o cadastro de interesses dos candidatos e o cadastro de vagas dos empregadores."
          getRowId={(jobFunction) => jobFunction.id}
          rows={jobFunctions}
        />
      </Section>
    </main>
  );
}
