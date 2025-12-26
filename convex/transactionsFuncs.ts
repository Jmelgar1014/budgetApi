import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

import { v } from "convex/values";

// Create a new task with the given text
export const addTransaction = mutation({
  args: {
    Vendor: v.string(),
    Category: v.string(),
    Description: v.optional(v.string()),
    Amount: v.number(),
    PurchaseDate: v.number(),
    PurchaseType: v.string(),
    AuthId: v.string(),
    ImagePath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const newTransaction = await ctx.db.insert("transactions", {
      Vendor: args.Vendor,
      Amount: args.Amount,
      Category: args.Category,
      Description: args.Description,
      PurchaseDate: args.PurchaseDate,
      PurchaseType: args.PurchaseType,
      AuthId: args.AuthId,
      ImagePath: args.ImagePath,
    });
    return newTransaction;
  },
});

export const getTransactions = query({
  args: {
    month: v.number(),
    year: v.number(),
    AuthId: v.string(),
  },
  handler: async (ctx, args) => {
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59).getTime();
    const transactions = await ctx.db
      .query("transactions")
      .filter((item) =>
        item.and(
          item.gte(item.field("PurchaseDate"), startOfMonth),
          item.lte(item.field("PurchaseDate"), endOfMonth),
          item.eq(item.field("AuthId"), args.AuthId)
        )
      )
      .order("desc")
      .collect();
    return transactions;
  },
});

export const getTransactionsPaginated = query({
  args: {
    month: v.number(),
    year: v.number(),
    AuthId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59).getTime();
    const transactions = await ctx.db
      .query("transactions")
      .filter((item) =>
        item.and(
          item.gte(item.field("PurchaseDate"), startOfMonth),
          item.lte(item.field("PurchaseDate"), endOfMonth),
          item.eq(item.field("AuthId"), args.AuthId)
        )
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return transactions;
  },
});

export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const transactionExists = await ctx.db.get(args.id);

    if (!transactionExists) {
      throw new Error("Transaction not found");
    }
    const removedTransaction = await ctx.db.delete(args.id);
    return removedTransaction;
  },
});

export const getTransactionDetails = query({
  args: {
    AuthId: v.string(),
    TransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("transactions")
      .filter((item) =>
        item.and(
          item.eq(item.field("AuthId"), args.AuthId),
          item.eq(item.field("_id"), args.TransactionId)
        )
      )
      .first();

    if (!transaction) {
      throw new Error("Transaction not Found");
    }

    return transaction;
  },
});

export const getTransactionPerParams = query({
  args: {
    AuthId: v.string(),
    InputValue: v.optional(v.string()),
    Category: v.optional(v.string()),
    Month: v.number(),
    Year: v.number(),
  },
  handler: async (ctx, args) => {
    const startOfMonth = new Date(args.Year, args.Month - 1, 1).getTime();
    const endOfMonth = new Date(args.Year, args.Month, 0, 23, 59, 59).getTime();
    if (args.InputValue && args.Category) {
      return await ctx.db
        .query("transactions")
        .withSearchIndex("by_vendor", (q) =>
          q
            .search("Vendor", args.InputValue as string)
            .eq("AuthId", args.AuthId)
            .eq("Category", args.Category as string)
        )
        .filter((item) =>
          item.and(
            item.gte(item.field("PurchaseDate"), startOfMonth),
            item.lte(item.field("PurchaseDate"), endOfMonth)
          )
        )
        .collect();
    }
    if (args.InputValue) {
      return await ctx.db
        .query("transactions")
        .withSearchIndex("by_vendor", (q) =>
          q
            .search("Vendor", args.InputValue as string)
            .eq("AuthId", args.AuthId)
        )
        .filter((item) =>
          item.and(
            item.gte(item.field("PurchaseDate"), startOfMonth),
            item.lte(item.field("PurchaseDate"), endOfMonth)
          )
        )
        .collect();
    }

    if (args.Category) {
      return await ctx.db
        .query("transactions")
        .filter((item) =>
          item.and(
            item.eq(item.field("AuthId"), args.AuthId),
            item.eq(item.field("Category"), args.Category),
            item.gte(item.field("PurchaseDate"), startOfMonth),
            item.lte(item.field("PurchaseDate"), endOfMonth)
          )
        )
        .collect();
    }
  },
});

export const updateTransaction = mutation({
  args: {
    AuthId: v.string(),
    TransactionId: v.id("transactions"),
    Vendor: v.optional(v.string()),
    Category: v.optional(v.string()),
    Description: v.optional(v.string()),
    Amount: v.optional(v.number()),
    PurchaseDate: v.optional(v.number()),
    PurchaseType: v.optional(v.string()),
    ImagePath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.TransactionId);

    const updates: Partial<typeof transaction> = {};

    if (args.Vendor !== undefined) updates.Vendor = args.Vendor;
    if (args.Category !== undefined) updates.Category = args.Category;
    if (args.Description !== undefined) updates.Description = args.Description;
    if (args.Amount !== undefined) updates.Amount = args.Amount;
    if (args.PurchaseDate !== undefined)
      updates.PurchaseDate = args.PurchaseDate;
    if (args.PurchaseType !== undefined)
      updates.PurchaseType = args.PurchaseType;
    if (args.ImagePath !== undefined) updates.ImagePath = args.ImagePath;

    await ctx.db.patch(args.TransactionId, updates);

    return transaction;
  },
});
