import { findLegalPage } from "./repository";
import { legalPageKeySchema } from "./validations";

export function getLegalPage(input: unknown) {
  const key = legalPageKeySchema.parse(input);
  return findLegalPage(key);
}
