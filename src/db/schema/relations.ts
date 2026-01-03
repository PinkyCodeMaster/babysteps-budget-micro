import { relations } from "drizzle-orm";
import { debtTable } from "./debts";
import { paymentTable } from "./payments";
import { user } from "../schema/auth";
import { incomeTable } from "./incomes";
import { expenseTable } from "./expenses";

export const debtRelations = relations(debtTable, ({ many }) => ({
  payments: many(paymentTable),
}));

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  debt: one(debtTable, {
    fields: [paymentTable.debtId],
    references: [debtTable.id],
  }),
}));

export const userDebtRelations = relations(user, ({ many }) => ({
  debts: many(debtTable),
}));

export const userIncomeRelations = relations(user, ({ many }) => ({
  incomes: many(incomeTable),
}));

export const userExpenseRelations = relations(user, ({ many }) => ({
  expenses: many(expenseTable),
}));
