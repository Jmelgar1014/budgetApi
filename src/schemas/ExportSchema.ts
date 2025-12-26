import { z } from "zod";

export const exportTable = z.object({
  Vendor: z.string(),
  Amount: z.number(),
  Category: z.string(),
  PurchaseType: z.string(),
  PurchaseDate: z.number(),
});

export type tableExport = z.infer<typeof exportTable>;
