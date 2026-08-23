import Link from "next/link";
import { redirect } from "next/navigation";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ReplayIcon from "@mui/icons-material/Replay";
import RestoreIcon from "@mui/icons-material/Restore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { CharacterCountedTextarea } from "@/components/character-counted-textarea";
import { MaskedInput } from "@/components/masked-input";
import { SearchFormBar } from "@/components/search-form-bar";
import { AppDataTable, type AppDataTableColumn } from "@/components/ui/AppDataTable";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableActions } from "@/components/ui/TableActions";
import { errorParam, toFriendlyError } from "@/lib/validation-errors";
import {
  deleteCandidateByAdminAction,
  confirmCandidateHiringByAdminAction,
  inactivateCandidateByAdminAction,
  reactivateCandidateByAdminAction,
  returnCandidateToAvailableByAdminAction,
  updateCandidateByAdminAction,
  viewCandidateByAdminAction
} from "@/modules/admin-console-skill/actions";
import { getAdminCandidateDetails, getAdminCandidatesData } from "@/modules/admin-console-skill/service";
import { requireAdminUser } from "@/modules/security-skill/permissions";
import { InfoRow, PageHeader, Section, StatusBadge } from "@/components/ui";

type AdminCandidatesSearchParams = {
  candidateId?: string;
  editCandidateId?: string;
  q?: string;
  name?: string;
  city?: string;
  role?: string;
};

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    CANDIDATE_DETAIL_VIEWED: "Detalhes do candidato visualizados",
    CANDIDATE_REGISTERED_WITH_CONSENT: "Candidato cadastrado com autorização",
    CANDIDATE_VIEWED_BY_ADMIN: "Detalhes do candidato visualizados",
    CANDIDATE_UPDATED: "Cadastro do candidato atualizado",
    CANDIDATE_INACTIVATED: "Candidato inativado",
    CANDIDATE_REACTIVATED: "Candidato reativado",
    CANDIDATE_ANONYMIZED: "Dados do candidato anonimizados",
    CANDIDATE_PROCESS_STARTED: "Candidato reservado por empregador",
    CANDIDATE_HIRED_CONFIRMED: "Contratação confirmada",
    CANDIDATE_RETURNED_TO_AVAILABLE: "Candidato devolvido para disponível"
  };

  return labels[action] ?? "Evento administrativo registrado";
}

function availabilityLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponível",
    IN_PROCESS: "Reservado",
    HIRED: "Contratado",
    UNAVAILABLE: "Indisponível"
  };

  return labels[status] ?? "Não informado";
}

function availabilityTone(status: string): "success" | "danger" | "warning" | "neutral" {
  if (status === "AVAILABLE") return "success";
  if (status === "IN_PROCESS") return "warning";
  if (status === "HIRED") return "neutral";
  return "danger";
}

function disabledReason(input: {
  action: "edit" | "inactivate" | "reactivate" | "delete";
  isActive: boolean;
  // isSuperAdmin: boolean;
}) {

  if (input.action === "inactivate" && !input.isActive) {
    return "O candidato já está inativo.";
  }

  if (input.action === "reactivate" && input.isActive) {
    return "O candidato já está ativo.";
  }

  return "";
}

export default async function AdminCandidatesPage({
  searchParams
}: {
  searchParams: AdminCandidatesSearchParams;
}) {
  const admin = await requireAdminUser();
  const filters = {
    name: searchParams.name ?? "",
    city: searchParams.city ?? "",
    role: searchParams.role ?? ""
  };
  const selectedCandidateId = searchParams.editCandidateId ?? searchParams.candidateId;
  const candidates = await getAdminCandidatesData(filters);
  let selectedCandidate: Awaited<ReturnType<typeof getAdminCandidateDetails>> | null = null;

  if (selectedCandidateId) {
    try {
      selectedCandidate = await getAdminCandidateDetails(admin.id, admin.role, { candidateId: selectedCandidateId });
    } catch (error) {
      redirect(`/admin/candidatos?error=${errorParam(toFriendlyError(error))}`);
    }
  }

  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const isEditing = Boolean(searchParams.editCandidateId && selectedCandidate);
  type CandidateRow = (typeof candidates)[number];
  const candidateColumns: AppDataTableColumn<CandidateRow>[] = [
    {
      header: "Candidato",
      render: (candidate) => (
        <div>
          <Typography fontWeight={850} variant="body2">{candidate.fullName}</Typography>
          <Typography color="text.secondary" variant="body2">{candidate.email}</Typography>
          <Typography color="text.secondary" variant="body2">{candidate.phone}</Typography>
        </div>
      ),
      span: 2
    },
    {
      header: "Cargo/Funções",
      render: (candidate) => (
        <Stack spacing={0.75}>
          {candidate.interestFunctions.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" spacing={0.5} useFlexGap>
              {candidate.interestFunctions.map((item) => (
                <Chip key={item.id} label={item.systemJobFunction.name} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2">{candidate.desiredRole}</Typography>
          )}
        </Stack>
      ),
      span: 2
    },
    { header: "Local", render: (candidate) => `${candidate.city}/${candidate.state}` },
    {
      header: "Status",
      render: (candidate) => (
        <Stack spacing={0.5}>
          <StatusChip label={candidate.isActive ? "Ativo" : "Inativo"} tone={candidate.isActive ? "success" : "danger"} />
          <StatusChip label={availabilityLabel(candidate.availabilityStatus)} tone={availabilityTone(candidate.availabilityStatus)} />
        </Stack>
      ),
      whiteSpace: "normal"
    },
    {
      header: "Autorização",
      render: (candidate) => (
        <StatusChip
          label={candidate._count.consentSnapshots > 0 ? "Registrada" : "Ausente"}
          tone={candidate._count.consentSnapshots > 0 ? "success" : "danger"}
        />
      ),
      whiteSpace: "nowrap"
    },
    {
      align: "right",
      header: "Visualizações",
      render: (candidate) => candidate._count.views,
      whiteSpace: "nowrap"
    }
  ];

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Candidatos"
        title="Candidatos cadastrados"
        description="Listagem administrativa de currículos com autorização de uso dos dados registrada."
      />

      <SearchFormBar
        clearHref="/admin/candidatos"
        fields={[
          { defaultValue: filters.name, label: "Nome", name: "name", placeholder: "Nome do candidato" },
          { defaultValue: filters.city, label: "Cidade", name: "city", placeholder: "Cidade" },
          { defaultValue: filters.role, label: "Cargo/Função", name: "role", placeholder: "Cargo ou função" }
        ]}
        label="Buscar candidato"
      />

      {selectedCandidate ? (
        <Section
          title={isEditing ? "Editar candidato" : "Detalhes administrativos"}
          description="Dados completos para uso administrativo. A autorização de uso dos dados é somente informativa nesta tela."
        >
          {isEditing ? (
            <form action={updateCandidateByAdminAction} className="form-card compact-card">
              <input name="candidateId" type="hidden" value={selectedCandidate.id} />
              <div className="form-grid compact-form-grid">
                <label>Nome completo<input name="fullName" maxLength={120} required defaultValue={selectedCandidate.fullName} /></label>
                <label>E-mail<input name="email" inputMode="email" maxLength={160} required type="email" defaultValue={selectedCandidate.email} /></label>
                <label>Telefone<MaskedInput defaultValue={selectedCandidate.phone} inputMode="tel" mask="phone" name="phone" required /></label>
                <label>Cidade<input name="city" maxLength={80} required defaultValue={selectedCandidate.city} /></label>
                <label>UF<input name="state" inputMode="text" minLength={2} maxLength={2} required defaultValue={selectedCandidate.state} /></label>
                <label>Cargo/Função<input name="desiredRole" maxLength={120} required defaultValue={selectedCandidate.desiredRole} /></label>
                <label className="full-span">Resumo profissional<CharacterCountedTextarea defaultValue={selectedCandidate.summary} maxLength={800} name="summary" required /></label>
                <label className="full-span">Experiência<CharacterCountedTextarea defaultValue={selectedCandidate.experience} maxLength={1500} name="experience" /></label>
                <label className="full-span">Formação<CharacterCountedTextarea defaultValue={selectedCandidate.education} maxLength={800} name="education" required /></label>
                <label className="full-span">Referências<CharacterCountedTextarea defaultValue={selectedCandidate.references ?? ""} maxLength={1000} name="references" /></label>
              </div>
              <ResponsiveActions sx={{ mt: 1 }}>
                <AppButton component={Link} href={`/admin/candidatos?candidateId=${encodeURIComponent(selectedCandidate.id)}`} minWidth={104} startIcon={<ClearIcon fontSize="small" />} variant="outlined">
                  Cancelar
                </AppButton>
                <AppButton minWidth={150} startIcon={<EditIcon fontSize="small" />} type="submit" variant="contained">
                  Salvar alterações
                </AppButton>
              </ResponsiveActions>
            </form>
          ) : (
            <section className="panel compact-card">
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                <div>
                  <Stack alignItems="center" direction="row" spacing={1} sx={{ mb: 1 }} useFlexGap>
                    <StatusBadge tone={selectedCandidate.isActive ? "success" : "danger"}>
                      {selectedCandidate.isActive ? "Ativo" : "Inativo"}
                    </StatusBadge>
                    <StatusBadge tone={availabilityTone(selectedCandidate.availabilityStatus)}>
                      {availabilityLabel(selectedCandidate.availabilityStatus)}
                    </StatusBadge>
                    <Chip
                      color={selectedCandidate.consentAccepted ? "success" : "error"}
                      label={selectedCandidate.consentAccepted ? "Autorização registrada" : "Autorização ausente"}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography component="h2" variant="h6">{selectedCandidate.fullName}</Typography>
                  <p className="muted">{selectedCandidate.email} · {selectedCandidate.phone}</p>
                </div>
                <Stack direction="row" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                  <AppButton component={Link} href={`/admin/candidatos?editCandidateId=${encodeURIComponent(selectedCandidate.id)}`} minWidth={88} size="small" startIcon={<EditIcon fontSize="small" />} variant="outlined">
                    Editar
                  </AppButton>
                </Stack>
              </Stack>

              <Divider sx={{ my: 1.5 }} />
              <section className="dashboard-grid">
                <article>
                  <h3>Cadastro</h3>
                  <InfoRow label="Cargo/Função" value={selectedCandidate.desiredRole} />
                  <InfoRow label="Disponibilidade" value={availabilityLabel(selectedCandidate.availabilityStatus)} />
                  <InfoRow label="Local" value={`${selectedCandidate.city}/${selectedCandidate.state}`} />
                  <InfoRow label="Criado em" value={selectedCandidate.createdAt.toLocaleString("pt-BR")} />
                  <InfoRow label="Atualizado em" value={selectedCandidate.updatedAt.toLocaleString("pt-BR")} />
                </article>
                <article>
                  <h3>Dados e autorização</h3>
                  <InfoRow label="Aceito em" value={selectedCandidate.consentAcceptedAt?.toLocaleString("pt-BR") ?? "Não informado"} />
                  <InfoRow label="Versão" value={selectedCandidate.consentTextVersion ?? "Não informada"} />
                  <InfoRow label="Registros" value={selectedCandidate.consentSnapshots.length} />
                  <InfoRow label="Origem registrada" value={selectedCandidate.consentIp ?? "Não informada"} />
                </article>
              </section>

              <Divider sx={{ my: 1.5 }} />
              <section className="dashboard-grid">
                <article>
                  <h3>Resumo</h3>
                  <p>{selectedCandidate.summary}</p>
                  <h3>Experiência</h3>
                  <p>{selectedCandidate.experience || "Não informada"}</p>
                </article>
                <article>
                  <h3>Formação</h3>
                  <p>{selectedCandidate.education}</p>
                  <h3>Referências</h3>
                  <p>{selectedCandidate.references || "Não informadas"}</p>
                </article>
              </section>

              <Divider sx={{ my: 1.5 }} />
              <section className="dashboard-grid">
                <article>
                  <h3>Funções de interesse</h3>
                  {selectedCandidate.interestFunctions.length === 0 ? (
                    <p className="muted">Nenhuma função vinculada.</p>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" spacing={0.75} useFlexGap>
                      {selectedCandidate.interestFunctions.map((item) => (
                        <Chip key={item.id} label={item.systemJobFunction.name} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  )}
                </article>
                <article>
                  <h3>Histórico básico</h3>
                  {selectedCandidate.auditLogs.length === 0 ? (
                    <p className="muted">Nenhum registro administrativo anterior.</p>
                  ) : (
                    <Stack spacing={0.75}>
                      {selectedCandidate.auditLogs.map((log) => (
                        <p className="muted" key={log.id}>
                          {formatAuditAction(log.action)} · {log.createdAt.toLocaleString("pt-BR")} · {log.user?.email ?? "Sistema"}
                        </p>
                      ))}
                    </Stack>
                  )}
                </article>
              </section>
            </section>
          )}
        </Section>
      ) : null}

      <Section title="Resultado" description={`${candidates.length} candidato(s) encontrado(s).`}>
        <AppDataTable
          actionCount={7}
          actions={(candidate) => {
            const inactivateReason = disabledReason({ action: "inactivate", isActive: candidate.isActive });
            const reactivateReason = disabledReason({ action: "reactivate", isActive: candidate.isActive });
            const deleteReason = disabledReason({ action: "delete", isActive: candidate.isActive });

            return (
              <TableActions
                actions={[
                  {
                    formAction: viewCandidateByAdminAction,
                    hiddenInputs: [{ name: "candidateId", value: candidate.id }],
                    icon: <VisibilityIcon fontSize="small" />,
                    label: "Visualizar detalhes administrativos"
                  },
                  {
                    href: `/admin/candidatos?editCandidateId=${encodeURIComponent(candidate.id)}`,
                    icon: <EditIcon fontSize="small" />,
                    label: "Editar candidato"
                  },
                  {
                    color: "success",
                    confirmMessage: "Confirma que este candidato foi contratado? Ele deixará de aparecer nas buscas.",
                    disabled: candidate.availabilityStatus !== "IN_PROCESS",
                    formAction: confirmCandidateHiringByAdminAction,
                    hiddenInputs: [{ name: "candidateId", value: candidate.id }],
                    icon: <CheckCircleIcon fontSize="small" />,
                    label: candidate.availabilityStatus === "IN_PROCESS" ? "Confirmar contratação" : "Contratação exige candidato reservado"
                  },
                  {
                    color: "warning",
                    confirmMessage: "Deseja devolver este candidato para disponível nas buscas?",
                    disabled: candidate.availabilityStatus !== "IN_PROCESS",
                    formAction: returnCandidateToAvailableByAdminAction,
                    hiddenInputs: [{ name: "candidateId", value: candidate.id }],
                    icon: <ReplayIcon fontSize="small" />,
                    label: candidate.availabilityStatus === "IN_PROCESS" ? "Devolver para disponível" : "Devolução exige candidato reservado"
                  },
                  {
                    color: "error",
                    disabled: Boolean(inactivateReason),
                    formAction: inactivateCandidateByAdminAction,
                    hiddenInputs: [{ name: "candidateId", value: candidate.id }],
                    icon: <BlockIcon fontSize="small" />,
                    label: inactivateReason || "Inativar candidato"
                  },
                  {
                    color: "success",
                    disabled: Boolean(reactivateReason),
                    formAction: reactivateCandidateByAdminAction,
                    hiddenInputs: [{ name: "candidateId", value: candidate.id }],
                    icon: <RestoreIcon fontSize="small" />,
                    label: reactivateReason || "Reativar candidato"
                  },
                  {
                    color: "error",
                    confirmMessage: "Confirma a exclusão deste candidato? Esta ação remove o cadastro e não pode ser desfeita.",
                    disabled: Boolean(deleteReason),
                    formAction: deleteCandidateByAdminAction,
                    hiddenInputs: [{ name: "candidateId", value: candidate.id }],
                    icon: <DeleteOutlineIcon fontSize="small" />,
                    label: deleteReason || "Excluir candidato"
                  }
                ]}
              />
            );
          }}
          columns={candidateColumns}
          emptyMessage="Ajuste a busca ou cadastre novos candidatos."
          getRowId={(candidate) => candidate.id}
          rows={candidates}
        />
      </Section>
    </main>
  );
}



