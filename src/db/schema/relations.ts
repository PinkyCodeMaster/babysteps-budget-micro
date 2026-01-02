import { relations } from "drizzle-orm";
import { debtTable } from "./debts";
import { paymentTable } from "./payments";

export const debtRelations = relations(debtTable, ({ many }) => ({
  payments: many(paymentTable),
}));

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  debt: one(debtTable, {
    fields: [paymentTable.debtId],
    references: [debtTable.id],
  }),
}));
