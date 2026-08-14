import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link className={`button-link ${variant === "secondary" ? "button-secondary" : ""}`} href={href}>
      {children}
    </Link>
  );
}

export function Section({
  title,
  description,
  children
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      {title ? (
        <div className="section-heading">
          <h2>{title}</h2>
          {description ? <p className="muted">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatusBadge({
  tone,
  children
}: {
  tone: "success" | "danger" | "warning" | "neutral";
  children: ReactNode;
}) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function DashboardCard({
  title,
  value,
  description
}: {
  title: string;
  value: ReactNode;
  description?: string;
}) {
  return (
    <article className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      {description ? <small>{description}</small> : null}
    </article>
  );
}

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="table-wrap data-table">{children}</div>;
}

export function ActionButton({
  children,
  type = "button"
}: {
  children: ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button className="action-button" type={type}>
      {children}
    </button>
  );
}
