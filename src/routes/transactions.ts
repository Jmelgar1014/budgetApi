import express from "express";
import { api } from "../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { getAuth, clerkClient, requireAuth } from "@clerk/express";
import { rateLimit } from "../rateLimit";
import { z } from "zod";
import {
  addTransactionForm,
  TransactionDetailed,
} from "../schemas/TransactionSchema";
import { Id } from "../../convex/_generated/dataModel";
import { logger } from "../utilities/logger";

const router = express.Router();

const getConvexClient = () => {
  if (!process.env.CONVEX_URL) {
    throw new Error("Convex URL is missing");
  }
  console.log(process.env.CONVEX_URL);
  return new ConvexHttpClient(process.env.CONVEX_URL);
};
const convex = getConvexClient();

router.get("/", async (req, res) => {
  try {
    console.log("This endpoint is working:");
    const { userId } = getAuth(req);

    // logger.info("Get request received", { userId: userId });
    console.log("Where are now at this point");

    // console.log(userId);

    if (!userId) {
      logger.info("User is not authorized", { userId: userId });
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rateLimits = rateLimit();

    // const { success, limit, remaining } = await rateLimits.limit(userId);

    // if (!success) {
    //   return res.status(429).json({
    //     error: "Rate Limit Exceeded",
    //     limit: limit,
    //     remaining: remaining,
    //     reset: new Date(Date.now() + 60000),
    //   });
    // }

    const { month, year } = req.query;
    const currentDate = new Date();

    const currentMonth = currentDate.getMonth() + 1;

    const currentYear = currentDate.getFullYear();
    const finalMonth = month ? parseInt(month as string) : currentMonth;
    const finalYear = year ? parseInt(year as string) : currentYear;

    console.log(req.originalUrl);

    const transactions = await convex.query(
      api.transactionsFuncs.getTransactions,
      {
        AuthId: userId,
        month: finalMonth,
        year: finalYear,
      }
    );

    logger.info("Request has been made");

    const result = z.array(TransactionDetailed).safeParse(transactions);

    if (!result.success) {
      return res.json({ error: "Data is not valid" });
    }

    logger.info("Results were sent back to user");

    return res.json({ data: result.data });
  } catch (error) {
    console.log(error);
    logger.error("Error found in the catch block", { Error: error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    logger.info("Request was made by user", { user: userId });
    if (!userId) {
      logger.error("There was an issue with authorizing user", {
        user: userId,
      });
      return res.status(401).json({ error: "Unauthorized" });
    }

    // const rateLimits = rateLimit();

    // const { success, limit, remaining } = await rateLimits.limit(userId);

    // if (!success) {
    //   logger.error("User exceeded rate limit", { user: userId });
    //   return res.status(429).json({
    //     error: "Rate Limit Exceeded",
    //     limit: limit,
    //     remaining: remaining,
    //     reset: new Date(Date.now() + 60000),
    //   });
    // }

    console.log(req.body);

    const jsonResult = addTransactionForm.safeParse(req.body);

    if (!jsonResult.success) {
      logger.error("Requested data could not be parsed", { data: req.body });
      return res.status(400).json({ error: "Data is not valid" });
    }

    const tranasctionAdded = await convex.mutation(
      api.transactionsFuncs.addTransaction,
      { ...jsonResult.data, AuthId: userId }
    );

    console.log(tranasctionAdded);

    logger.info("Request was successful");
    return res
      .status(200)
      .json({ message: "Transaction was added successfully" });
  } catch (error) {
    console.log(error);

    logger.error("There was an error found in the catch block", {
      Error: error,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/filters", async (req, res) => {
  try {
    console.log("This is the transactions/filters endpoint");
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // const rateLimits = rateLimit();

    // const { success, limit, remaining } = await rateLimits.limit(userId);

    // if (!success) {
    //   return res.status(429).json({
    //     error: "Rate Limit Exceeded",
    //     limit: limit,
    //     remaining: remaining,
    //     reset: new Date(Date.now() + 600000),
    //   });
    // }

    const { text, category, month, year } = req.query;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const textValue = text ? text : "";
    const categoryValue = category ? category : "";
    const finalMonth = month ? parseInt(month as string) : currentMonth;
    const finalYear = year ? parseInt(year as string) : currentYear;

    const filteredResults = await convex.query(
      api.transactionsFuncs.getTransactionPerParams,
      {
        AuthId: userId as Id<"transactions">,
        Category: categoryValue as string,
        InputValue: textValue as string,
        Month: finalMonth,
        Year: finalYear,
      }
    );

    return res.status(200).json({ data: filteredResults });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Data is invalid or it is empty" });
  }
});

export default router;
