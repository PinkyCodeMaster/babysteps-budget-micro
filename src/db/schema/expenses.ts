import { integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const expenseTypeEnum = pgEnum("expense_type", [
  "housing",
  "utilities",
  "transport",
  "food",
  "childcare",
  "insurance",
  "subscriptions",
  "medical",
  "education",
  "entertainment",
  "savings",
  "other",
]);

export const expenseTable = pgTable("expenses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: varchar({ length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar({ length: 255 }).notNull(),

  type: expenseTypeEnum().notNull(),

  // Stored as monthly net cost
  amount: integer().notNull(),

  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
