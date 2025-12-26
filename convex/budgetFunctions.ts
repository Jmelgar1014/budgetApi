import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBudget = mutation({
  args: {
    AuthId: v.string(),
    BudgetName: v.string(),
    Amount: v.number(),
    Category: v.string(),
  },
  handler: async (ctx, args) => {
    const newBudget = await ctx.db.insert("budgets", {
      AuthId: args.AuthId,
      BudgetName: args.BudgetName,
      Amount: args.Amount,
      Category: args.Category,
    });
    return newBudget;
  },
});

export const deleteBudget = mutation({
  args: {
    AuthId: v.string(),
    Id: v.id("budgets"),
  },
  handler: async (ctx, args) => {
    const budgetExists = await ctx.db.get(args.Id);

    if (!budgetExists || budgetExists.AuthId !== args.AuthId) {
      throw new Error("Budget is not Found or Unauthorized");
    }
    const removedBudget = await ctx.db.delete(args.Id);

    return removedBudget;
  },
});

export const getBudgets = query({
  args: { AuthId: v.string() },
  handler: async (ctx, args) => {
    const budgets = await ctx.db
      .query("budgets")
      .filter((item) => item.and(item.eq(item.field("AuthId"), args.AuthId)))
      .collect();

    return budgets;
  },
});
