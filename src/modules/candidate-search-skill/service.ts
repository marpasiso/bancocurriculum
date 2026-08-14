import { ensureEmployerCanAccessCandidates } from "@/modules/subscription-gate-skill/service";
import { getEmployerJobOpening } from "@/modules/job-openings-skill/service";
import { searchCandidateList } from "./repository";
import { candidateSearchSchema } from "./validations";

export async function searchCandidatesForEmployer(input: unknown) {
  const data = candidateSearchSchema.parse(input);
  const query = data.query.trim();
  const role = data.role.trim();
  const city = data.city.trim();
  await ensureEmployerCanAccessCandidates(data.employerId);

  if (data.jobOpeningId) {
    const jobOpening = await getEmployerJobOpening({
      employerId: data.employerId,
      jobOpeningId: data.jobOpeningId
    });

    if (!jobOpening || jobOpening.status !== "OPEN") {
      throw new Error("Vaga aberta não encontrada para este empregador.");
    }

    return searchCandidateList({
      query,
      role,
      city: city || jobOpening.city,
      systemJobFunctionId: jobOpening.systemJobFunctionId
    });
  }

  return searchCandidateList({ query, role, city });
}
