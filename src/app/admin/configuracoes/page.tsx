import SaveIcon from "@mui/icons-material/Save";
import Stack from "@mui/material/Stack";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { PageHeader, Section } from "@/components/ui";
import { saveOperationalSettingsAction } from "@/modules/settings/actions";
import { getOperationalSettings } from "@/modules/settings/operational-settings.skill";
import { requireSuperAdminUser } from "@/modules/security-skill/permissions";

export default async function AdminSettingsPage() {
  await requireSuperAdminUser();
  const settings = await getOperationalSettings();

  return (
    <main className="admin-main">
      <PageHeader
        eyebrow="Configurações"
        title="Preferências gerais"
        description="Ajuste identidade visual, acessibilidade e textos institucionais da plataforma."
      />

      <Stack spacing={1.5}>
        <form action={saveOperationalSettingsAction} className="form-card compact-card operational-settings-form">
          <Section title="Acessibilidade visual" description="Preferências simples de leitura aplicadas ao sistema.">
            <div className="form-grid">
              <label>Tamanho da fonte
                <select name="fontSize" defaultValue={settings.fontSize}>
                  <option value="normal">Normal</option>
                  <option value="large">Grande</option>
                  <option value="extra">Extra grande</option>
                </select>
              </label>
              <label className="consent-check">
                <input name="readableText" type="checkbox" defaultChecked={settings.readableText} />
                Melhorar legibilidade dos textos
              </label>
              <label className="consent-check">
                <input name="highContrast" type="checkbox" defaultChecked={settings.highContrast} />
                Acessibilidade visual reforçada
              </label>
            </div>
          </Section>

          <Section title="Plataforma" description="Textos institucionais simples exibidos pela plataforma.">
            <div className="form-grid">
              <label>Nome da plataforma
                <input name="platformName" required defaultValue={settings.platformName} />
              </label>
              <label className="full-span">Descrição da plataforma
                <textarea name="platformDescription" required defaultValue={settings.platformDescription} />
              </label>
            </div>
          </Section>

          <ResponsiveActions>
            <AppButton minWidth={170} size="medium" startIcon={<SaveIcon />} type="submit" variant="contained">
              Salvar configurações
            </AppButton>
          </ResponsiveActions>
        </form>
      </Stack>
    </main>
  );
}
