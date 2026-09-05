import Link from "next/link";
import { AppButton, ResponsiveActions } from "@/components/app-actions";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { requireEmployerUser } from "@/modules/security-skill/permissions";
import { cancelCandidateReservationByEmployerAction } from "@/modules/candidate-reservation-skill/actions";
import { listEmployerCandidateReservations } from "@/modules/candidate-reservation-skill/service";

function formatReservationStatus(status: string) {
 const labels: Record<string, string> = {
  ACTIVE: "Ativa",
  CANCELED: "Cancelada",
  HIRED: "Contratado"
};

return labels[status] ?? status;
}

function formatDate(date: Date) {
 return new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short"
}).format(date);
}

export default async function EmployerReservationsPage() {
 const user = await requireEmployerUser();
 const reservations = await listEmployerCandidateReservations(user.employer.id);

 return (
  <main>
  <PageHeader
  eyebrow="Reservas"
  title="Candidatos reservados"
  description="Acompanhe os candidatos que sua empresa reservou para oportunidades abertas."
  />

  <Section>
  {reservations.length === 0 ? (
     <EmptyState
     title="Nenhuma reserva encontrada"
     description="Quando sua empresa reservar um candidato, ele aparecerá aqui."
     />
     ) : (
     <div className="table-card">
     <table>
     <thead>
     <tr>
     <th>Candidato</th>
     <th>Vaga</th>
     <th>Cidade/UF</th>
     <th>Status</th>
     <th>Reservado em</th>
     <th>Ações</th>
     </tr>
     </thead>
     <tbody>
     {reservations.map((reservation) => (
      <tr key={reservation.id}>
      <td>
      <strong>{reservation.candidate.fullName}</strong>
      </td>
      <td>{reservation.jobOpening.title}</td>
      <td>
      {reservation.candidate.city}/{reservation.candidate.state}
      </td>
      <td>{formatReservationStatus(reservation.status)}</td>
      <td>{formatDate(reservation.createdAt)}</td>
      <td className="reservation-actions-cell">
      <Link
      className="reservation-details-link"
      href={`/empregador/candidatos/${reservation.candidate.id}`}
      >
      Ver detalhes
      </Link>
      <div className="reservation-actions">

      {reservation.status === "ACTIVE" ? (
        <form action={cancelCandidateReservationByEmployerAction}>
        <input type="hidden" name="reservationId" value={reservation.id} />
        <button className="reservation-cancel-button" type="submit">
        Cancelar reserva
        </button>
        </form>
        ) : null}
      </div>
      </td>
      </tr>
      ))}
     </tbody>
     </table>
     </div>
     )}
     </Section>
     </main>
     );
}