import { integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "../schema/auth";

export const debtTypeEnum = pgEnum("debt_type", [
  "credit_card",
  "loan",
  "mortgage",
  "car_finance",
  "overdraft",
  "payday",
  "utility_arrears",
  "council_tax",
  "tax_arrears",
  "student_loan",
  "store_card",
  "hire_purchase",
  "ccj",
  "other",
]);

export const debtTable = pgTable("debts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: varchar({ length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar({ length: 255 }).notNull(),

  type: debtTypeEnum().notNull(),

  balance: integer().notNull(),

  interestRate: integer(),

  minimumPayment: integer().notNull(),

  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
