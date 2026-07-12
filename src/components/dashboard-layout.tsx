import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import Image from "next/image";
import { getEmployerSubscriptionNotice } from "@/modules/subscription-gate-skill/service";
import { DashboardNav } from "./dashboard-nav";
import { EmployerSubscriptionNotice } from "./employer-subscription-notice";

type DashboardUser = {
  email: string;
  role: UserRole;
  employer?: { id: string; companyName: string; isActive: boolean } | null;
};

type DashboardItem = {
  href: string;
  label: string;
};

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function adminItems(role: UserRole): DashboardItem[] {
  if (role === "SUPER_ADMIN") {
    return [
      { href: "/admin/dashboard", label: "Painel" },
      { href: "/admin/plano-do-sistema", label: "Plano do sistema" },
      { href: "/admin/funcoes", label: "Funções e vagas" },
      { href: "/admin/administradores", label: "Administradores" },
      { href: "/admin/configuracoes", label: "Configurações" }
    ];
  }

  if (role === "ADMIN") {
    return [
      { href: "/admin/dashboard", label: "Painel" },
      { href: "/admin/candidatos", label: "Candidatos" },
      { href: "/admin/empregadores", label: "Empregadores" },
      { href: "/admin/funcoes", label: "Funções e vagas" },
      { href: "/admin/pagamentos-pix", label: "Pagamentos Pix" },
      { href: "/admin/solicitacoes-lgpd", label: "Solicitações LGPD" }
    ];
  }

  return [];
}

const employerItems: DashboardItem[] = [
  { href: "/empregador/dashboard", label: "Painel" },
  { href: "/empregador/buscar-candidatos", label: "Buscar candidatos" },
  { href: "/empregador/assinatura", label: "Assinatura" },
  { href: "/empregador/minha-conta", label: "Minha conta" }
];

function Sidebar({
  user,
  title,
  items
}: {
  user: DashboardUser;
  title: string;
  items: DashboardItem[];
}) {
  return (
    <aside className="dashboard-sidebar" aria-label="Menu lateral">
      <div className="dashboard-brand">
        <Image
          alt="Janaina Pinheiro Treinamentos"
          className="dashboard-brand-logo"
          height={220}
          priority
          src="/brand/logo-janaina.jpeg"
          width={640}
        />
        <span className="dashboard-brand-title">{title}</span>
      </div>
      <DashboardNav items={items} />
      <div className="dashboard-user">
        <span>{initials(user.email)}</span>
        <div>
          <strong>{user.email}</strong>
          <small>{user.role === "EMPLOYER" ? "Empregador" : "Usuário administrativo"}</small>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ user, title }: { user: DashboardUser; title: string }) {
  return (
    <header className="dashboard-topbar">
      <label className="mobile-sidebar-button" htmlFor="dashboard-drawer-toggle">
        Menu
      </label>
      <div>
        <strong>{title}</strong>
        <span>Banco de Pessoas para Oportunidades de Trabalho</span>
      </div>
      <div className="topbar-account">
        <span>{initials(user.email)}</span>
      </div>
    </header>
  );
}

function DashboardLayout({
  user,
  title,
  items,
  children
}: {
  user: DashboardUser;
  title: string;
  items: DashboardItem[];
  children: ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <input className="dashboard-drawer-toggle" id="dashboard-drawer-toggle" type="checkbox" />
      <Sidebar user={user} title={title} items={items} />
      <label className="dashboard-drawer-backdrop" htmlFor="dashboard-drawer-toggle" />
      <div className="dashboard-main">
        <Topbar user={user} title={title} />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}

export function AdminDashboardLayout({ user, children }: { user: DashboardUser; children: ReactNode }) {
  return (
    <DashboardLayout user={user} title={user.role === "SUPER_ADMIN" ? "Área do sistema" : "Painel administrativo"} items={adminItems(user.role)}>
      {children}
    </DashboardLayout>
  );
}

export async function EmployerDashboardLayout({ user, children }: { user: DashboardUser; children: ReactNode }) {
  const subscriptionNotice = user.employer
    ? await getEmployerSubscriptionNotice(user.employer.id)
    : { shouldShow: false, hasHistory: false };

  return (
    <DashboardLayout user={user} title="Área do empregador" items={employerItems}>
      {user.employer ? (
        <EmployerSubscriptionNotice hasHistory={subscriptionNotice.hasHistory} shouldShow={subscriptionNotice.shouldShow} />
      ) : null}
      {children}
    </DashboardLayout>
  );
}
