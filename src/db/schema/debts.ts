import { integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const debtTypeEnum = pgEnum("debt_type", [
  "credit_card",
  "loan",
  "ccj",
]);

export const debtTable = pgTable("debts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  name: varchar({ length: 255 }).notNull(),

  type: debtTypeEnum().notNull(),

  balance: integer().notNull(),

  interestRate: integer(),

  minimumPayment: integer().notNull(),

  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
