import { date, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { debtTable } from "./debts";

export const paymentTable = pgTable("payments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    debtId: integer()
        .notNull()
        .references(() => debtTable.id, {
            onDelete: "cascade",
        }),

    amount: integer().notNull(),

    paymentDate: date().notNull(),

    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp(),
});
