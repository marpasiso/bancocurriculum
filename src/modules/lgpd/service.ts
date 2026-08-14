import { createDataRequest } from "@/modules/data-request-skill/service";

export async function createLgpdRequest(input: unknown) {
  return createDataRequest(input);
}
