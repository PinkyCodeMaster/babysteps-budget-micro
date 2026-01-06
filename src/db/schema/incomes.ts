import { integer, numeric, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const incomeTypeEnum = pgEnum("income_type", [
  "hourly",
  "monthly_net",
  "yearly_gross",
  "uc",
]);

export const incomeCategoryEnum = pgEnum("income_category", [
  "wage",
  "benefit",
  "uc",
  "disability_pension",
  "side_gig",
  "second_job",
  "other",
]);

export const paymentFrequencyEnum = pgEnum("payment_frequency", [
  "weekly",
  "fortnightly",
  "four_weekly",
  "monthly",
  "quarterly",
  "yearly",
]);

export const paymentDayRuleEnum = pgEnum("payment_day_rule", [
  "specific_day",
  "last_working_day",
  "last_friday",
  "last_thursday",
]);

export const incomeTable = pgTable("incomes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: varchar({ length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar({ length: 255 }).notNull(),

  type: incomeTypeEnum().notNull(),

  amount: numeric({ precision: 14, scale: 2 }).notNull().$type<number>(),

  hoursPerWeek: numeric({ precision: 8, scale: 2 }).$type<number | null>(),

  category: incomeCategoryEnum().default("wage").notNull(),

  frequency: paymentFrequencyEnum().default("monthly").notNull(),

  paymentDayRule: paymentDayRuleEnum().default("specific_day").notNull(),

  paymentDay: integer(),

  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
