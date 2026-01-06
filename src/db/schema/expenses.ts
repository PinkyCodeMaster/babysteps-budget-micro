import { boolean, integer, numeric, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
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
  "rent",
  "service_charge",
  "council_tax",
  "gas",
  "electric",
  "water",
  "car_fuel",
  "groceries",
  "phone",
  "internet",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "rent",
  "service_charge",
  "council_tax",
  "gas",
  "electric",
  "water",
  "car_fuel",
  "groceries",
  "phone",
  "internet",
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

export const expenseFrequencyEnum = pgEnum("expense_frequency", [
  "weekly",
  "fortnightly",
  "four_weekly",
  "monthly",
  "quarterly",
  "yearly",
]);

export const expenseTable = pgTable("expenses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: varchar({ length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar({ length: 255 }).notNull(),

  type: expenseTypeEnum().notNull(),

  // Stored as the amount paid each period; normalized monthly amounts are derived in code.
  amount: numeric({ precision: 14, scale: 2 }).notNull().$type<number>(),

  category: expenseCategoryEnum().default("other").notNull(),

  frequency: expenseFrequencyEnum().default("monthly").notNull(),

  paymentDay: integer(),

  paidByUc: boolean().default(false).notNull(),

  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
