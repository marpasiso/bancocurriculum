import { z } from "zod";

export const legalPageKeySchema = z.enum(["privacy", "terms", "lgpd"]);
