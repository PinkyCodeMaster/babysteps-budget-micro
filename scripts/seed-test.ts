import "dotenv/config";

import { db } from "@/db";
import { debtTable, incomeTable, paymentTable, user, expenseTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const TEST_USER_ID = "4rNHsKycZK427ADfjozyfnSOFNxzomxt";
const TEST_EMAIL = "test.user@example.com";

async function seed() {
  // Optional: ensure the user exists so foreign keys don’t fail.
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, TEST_USER_ID),
  });

  if (!existingUser) {
    await db.insert(user).values({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Test User",
      emailVerified: true,
      notifyEmails: true,
      onboardingStep: "done",
      image: null,
    });

    // No password/account wiring here; assume auth already created the real user.
  }

  // Clean previous seeded data for this user.
  const userDebtIds = (
    await db.query.debtTable.findMany({
      where: eq(debtTable.userId, TEST_USER_ID),
      columns: { id: true },
    })
  ).map((d) => d.id);

  if (userDebtIds.length > 0) {
    await db.delete(paymentTable).where(inArray(paymentTable.debtId, userDebtIds));
    await db.delete(debtTable).where(eq(debtTable.userId, TEST_USER_ID));
  }

  await db.delete(incomeTable).where(eq(incomeTable.userId, TEST_USER_ID));
  await db.delete(expenseTable).where(eq(expenseTable.userId, TEST_USER_ID));

  // Seed incomes.
  await db.insert(incomeTable).values([
    {
      userId: TEST_USER_ID,
      name: "Full-time Salary",
      type: "yearly_gross",
      amount: 42000, // gross per year
      category: "wage",
      frequency: "monthly",
      paymentDay: 25,
    },
    {
      userId: TEST_USER_ID,
      name: "Side Gig (Hourly)",
      type: "hourly",
      amount: 20, // hourly rate
      hoursPerWeek: 10,
      category: "side_gig",
      frequency: "weekly",
      paymentDay: 5,
    },
    {
      userId: TEST_USER_ID,
      name: "Universal Credit",
      type: "uc",
      amount: 400, // monthly net base before taper adjustments
      category: "uc",
      frequency: "monthly",
      paymentDay: 7,
    },
  ]);

  await db.insert(expenseTable).values([
    {
      userId: TEST_USER_ID,
      name: "Rent",
      type: "rent",
      category: "rent",
      amount: 950,
      frequency: "monthly",
      paymentDay: 1,
      paidByUc: true,
    },
    {
      userId: TEST_USER_ID,
      name: "Service Charge",
      type: "service_charge",
      category: "service_charge",
      amount: 50,
      frequency: "monthly",
      paymentDay: 1,
      paidByUc: true,
    },
    {
      userId: TEST_USER_ID,
      name: "Council Tax",
      type: "council_tax",
      category: "council_tax",
      amount: 140,
      frequency: "monthly",
      paymentDay: 2,
      paidByUc: false,
    },
    {
      userId: TEST_USER_ID,
      name: "Gas",
      type: "gas",
      category: "gas",
      amount: 90,
      frequency: "monthly",
      paymentDay: 10,
      paidByUc: false,
    },
    {
      userId: TEST_USER_ID,
      name: "Electric",
      type: "electric",
      category: "electric",
      amount: 95,
      frequency: "monthly",
      paymentDay: 10,
      paidByUc: false,
    },
    {
      userId: TEST_USER_ID,
      name: "Water",
      type: "water",
      category: "water",
      amount: 45,
      frequency: "monthly",
      paymentDay: 15,
      paidByUc: false,
    },
    {
      userId: TEST_USER_ID,
      name: "Groceries",
      type: "groceries",
      category: "groceries",
      amount: 320,
      frequency: "weekly",
      paymentDay: 6,
      paidByUc: false,
    },
    {
      userId: TEST_USER_ID,
      name: "Phone",
      type: "phone",
      category: "phone",
      amount: 35,
      frequency: "monthly",
      paymentDay: 18,
      paidByUc: false,
    },
    {
      userId: TEST_USER_ID,
      name: "Internet",
      type: "internet",
      category: "internet",
      amount: 45,
      frequency: "monthly",
      paymentDay: 20,
      paidByUc: false,
    },
  ]);

  // Seed debts.
  const debtsInserted = await db
    .insert(debtTable)
    .values([
      {
        userId: TEST_USER_ID,
        name: "Visa Card",
        type: "credit_card",
        balance: 2500,
        interestRate: 24,
        minimumPayment: 75,
        frequency: "monthly",
        dueDay: 12,
      },
      {
        userId: TEST_USER_ID,
        name: "Old Phone Bill",
        type: "old_phone_bill",
        balance: 450,
        interestRate: null,
        minimumPayment: 50,
        frequency: "monthly",
        dueDay: 5,
      },
      {
        userId: TEST_USER_ID,
        name: "Car Finance",
        type: "car_finance",
        balance: 6500,
        interestRate: 9,
        minimumPayment: 210,
        frequency: "monthly",
        dueDay: 28,
      },
    ])
    .returning({ id: debtTable.id });

  if (debtsInserted.length > 0) {
    const [visa, car] = debtsInserted;
    await db.insert(paymentTable).values([
      {
        debtId: visa.id,
        amount: 200,
        paymentDate: new Date().toISOString().split("T")[0],
      },
      {
        debtId: car.id,
        amount: 210,
        paymentDate: new Date().toISOString().split("T")[0],
      },
    ]);
  }

  console.log("Seeded test data for user:", TEST_USER_ID);
}

seed().then(
  () => {
    console.log("Done");
    process.exit(0);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
