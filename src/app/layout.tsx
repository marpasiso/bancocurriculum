import type { Metadata } from "next";
import "./globals.css";
import { getSafeSessionUser } from "@/modules/security-skill/session";
import { AdminDashboardLayout, EmployerDashboardLayout } from "@/components/dashboard-layout";
import { MuiProvider } from "@/components/mui-provider";
import { PublicLayout } from "@/components/public-layout";
import { getOperationalSettings } from "@/modules/settings/operational-settings.skill";

export const metadata: Metadata = {
  title: "Janaina Pinheiro Treinamentos",
  description: "Banco de Pessoas para Oportunidades de Trabalho."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getSafeSessionUser(), getOperationalSettings()]);
  const bodyClassName = [
    settings.fontSize === "large" ? "font-large" : "",
    settings.fontSize === "extra" ? "font-extra-large" : "",
    settings.readableText ? "readable-text" : "",
    settings.highContrast ? "high-contrast" : ""
  ].filter(Boolean).join(" ");
  const content = !user ? (
    <PublicLayout>{children}</PublicLayout>
  ) : user.role === "EMPLOYER" ? (
    <EmployerDashboardLayout user={user}>{children}</EmployerDashboardLayout>
  ) : (
    <AdminDashboardLayout user={user}>{children}</AdminDashboardLayout>
  );

  return (
    <html lang="pt-BR">
      <body className={bodyClassName}>
        <MuiProvider>
          {content}
        </MuiProvider>
      </body>
    </html>
  );
}
