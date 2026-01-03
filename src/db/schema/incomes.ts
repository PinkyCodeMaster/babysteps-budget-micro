import { integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const incomeTypeEnum = pgEnum("income_type", [
  "hourly",
  "monthly_net",
  "yearly_gross",
  "uc",
]);

export const incomeTable = pgTable("incomes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: varchar({ length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar({ length: 255 }).notNull(),

  type: incomeTypeEnum().notNull(),

  amount: integer().notNull(),

  hoursPerWeek: integer(),

  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
