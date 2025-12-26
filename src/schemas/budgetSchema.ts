import { z } from "zod";

export const budgetTable = z.object({
  //   AuthId: z.string(),
  BudgetName: z.string(),
  Amount: z.number(),
  Category: z.string(),
});

export type budgetTableType = z.infer<typeof budgetTable>;

export const getBudgetData = z.object({
  _id: z.string(),
  Amount: z.number(),
  BudgetName: z.string(),
  Category: z.string(),
});

export type getBudgetType = z.infer<typeof getBudgetData>;
