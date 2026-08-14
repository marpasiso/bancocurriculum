import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { AppButton, AppIconButton, ResponsiveActions } from "@/components/app-actions";
import { PageHeader, Section } from "@/components/ui";
import { formatUserRole } from "@/lib/display-labels";
import {
  blockAdminUserAction,
  createAdminUserAction,
  unblockAdminUserAction,
  updateAdminUserRoleAction
} from "@/modules/admin-console-skill/actions";
import { getAdminUsersData } from "@/modules/admin-console-skill/service";
import { requireSuperAdminUser } from "@/modules/security-skill/permissions";

function blockReason(input: {
  currentUserId: string;
  targetUserId: string;
  targetRole: string;
  targetActive: boolean;
  activePrincipalAdmins: number;
}) {
  if (!input.targetActive) return "Usuário já bloqueado.";
  if (input.currentUserId === input.targetUserId) return "Você não pode bloquear a si mesmo.";
  if (input.targetRole === "SUPER_ADMIN" && input.activePrincipalAdmins <= 1) {
    return "Não é permitido bloquear o último administrador principal ativo.";
  }
  return "";
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: { editUserId?: string };
}) {
  const currentUser = await requireSuperAdminUser();
  const users = await getAdminUsersData();
  const activePrincipalAdmins = users.filter((user) => user.role === "SUPER_ADMIN" && user.isActive).length;
  const editingUser = users.find((user) => user.id === searchParams.editUserId);

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Administradores"
        title="Gestão de administradores"
        description="Crie, ajuste perfis e bloqueie usuários administrativos com permissão elevada."
      />

      <Section title="Criar administrador" description="A senha será armazenada com hash e a ação será auditada.">
        <form action={createAdminUserAction} className="form-card compact-card admin-user-form">
          <label>E-mail<input name="email" required type="email" /></label>
          <label>Senha inicial<input name="password" minLength={8} required type="password" /></label>
          <label>Perfil
            <select name="role" defaultValue="ADMIN">
              <option value="ADMIN">Administrador</option>
              <option value="SUPER_ADMIN">Administrador principal</option>
            </select>
          </label>
          <AppButton minWidth={96} startIcon={<PersonAddAltIcon fontSize="small" />} type="submit" variant="contained">
            Criar
          </AppButton>
        </form>
      </Section>

      {editingUser ? (
        <Section title="Editar administrador" description="Altere o perfil do administrador selecionado.">
          <form action={updateAdminUserRoleAction} className="form-card compact-card admin-user-form admin-edit-user-form">
            <input name="userId" type="hidden" value={editingUser.id} />
            <Alert severity="info" variant="outlined">
              Editando {editingUser.email}
            </Alert>
            <label>Perfil
              <select name="role" defaultValue={editingUser.role} disabled={!editingUser.isActive}>
                <option value="ADMIN">Administrador</option>
                <option value="SUPER_ADMIN">Administrador principal</option>
              </select>
            </label>
            <ResponsiveActions justifyContent="flex-start">
              <AppButton href="/admin/administradores" minWidth={96} variant="outlined">Cancelar</AppButton>
              <AppButton disabled={!editingUser.isActive} minWidth={120} startIcon={<EditIcon fontSize="small" />} type="submit" variant="contained">
                Salvar perfil
              </AppButton>
            </ResponsiveActions>
          </form>
        </Section>
      ) : null}

      <Section title="Usuários administrativos" description="Ninguém pode bloquear a si mesmo ou remover o último administrador principal ativo.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const reason = blockReason({
                  currentUserId: currentUser.id,
                  targetUserId: user.id,
                  targetRole: user.role,
                  targetActive: user.isActive,
                  activePrincipalAdmins
                });

                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      <Chip
                        color={user.role === "SUPER_ADMIN" ? "success" : "default"}
                        label={formatUserRole(user.role)}
                        size="small"
                        variant="outlined"
                      />
                    </td>
                    <td>
                      <Chip
                        color={user.isActive ? "success" : "error"}
                        label={user.isActive ? "Ativo" : "Bloqueado"}
                        size="small"
                        variant="outlined"
                      />
                    </td>
                    <td>{user.createdAt.toLocaleString("pt-BR")}</td>
                    <td>
                      <Stack direction="row" flexWrap="wrap" spacing={0.5} useFlexGap>
                        <AppIconButton
                          disabled={!user.isActive}
                          href={`/admin/administradores?editUserId=${encodeURIComponent(user.id)}`}
                          label={user.isActive ? "Editar administrador" : "Usuário bloqueado não pode ser editado"}
                        >
                          <EditIcon fontSize="small" />
                        </AppIconButton>
                        {user.isActive ? (
                          <form action={blockAdminUserAction} className="inline-form">
                            <input name="userId" type="hidden" value={user.id} />
                            <AppIconButton color="error" disabled={Boolean(reason)} label={reason || "Bloquear usuário"} type="submit">
                              <BlockIcon fontSize="small" />
                            </AppIconButton>
                          </form>
                        ) : (
                          <form action={unblockAdminUserAction} className="inline-form">
                            <input name="userId" type="hidden" value={user.id} />
                            <AppIconButton color="success" label="Desbloquear usuário" type="submit">
                              <CheckCircleOutlineIcon fontSize="small" />
                            </AppIconButton>
                          </form>
                        )}
                      </Stack>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </main>
  );
}
