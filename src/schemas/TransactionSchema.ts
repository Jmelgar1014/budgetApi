import { z } from "zod";

export const transactionType = z.object({
  Vendor: z.string(),
  Amount: z.number(),
  Category: z.string(),
  Description: z.string().optional(),
  PurchaseDate: z.date(),
  PurchaseType: z.string(),
  ImagePath: z.instanceof(File).optional(),
});

export type transactionTableType = z.infer<typeof transactionType>;

export const TransactionDetailed = z.object({
  Amount: z.number(),
  Vendor: z.string(),
  Category: z.string(),
  Description: z.optional(z.string()),
  PurchaseDate: z.number(),
  PurchaseType: z.string(),
  _creationTime: z.number(),
  _id: z.string(),
  AuthId: z.string(),
  ImagePath: z.optional(z.string()),
});
export type DetailedTransaction = z.infer<typeof TransactionDetailed>;

export const convertDate = transactionType.transform((date) => date.valueOf());

export const addTransactionForm = z.object({
  Vendor: z.string(),
  Amount: z.number(),
  Category: z.string(),
  Description: z.string().optional(),
  PurchaseDate: z.number(),
  PurchaseType: z.string(),
  ImagePath: z.optional(z.string()),
});

export const UpdateTransactions = z.object({
  Vendor: z.string().optional(),
  Category: z.string().optional(),
  Description: z.string().optional(),
  Amount: z.number().optional(),
  PurchaseDate: z.date().optional(),
  PurchaseType: z.string().optional(),
  ImagePath: z.instanceof(File).optional(),
});
