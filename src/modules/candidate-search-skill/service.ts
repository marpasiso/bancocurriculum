import { ensureEmployerCanAccessCandidates } from "@/modules/subscription-gate-skill/service";
import { searchCandidateList } from "./repository";
import { candidateSearchSchema } from "./validations";

export async function searchCandidatesForEmployer(input: unknown) {
  const data = candidateSearchSchema.parse(input);
  await ensureEmployerCanAccessCandidates(data.employerId);
  return searchCandidateList({ query: data.query, role: data.role, city: data.city });
}
