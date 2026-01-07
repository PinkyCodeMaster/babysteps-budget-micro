export const expenseFrequencies = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"] as const;
export type ExpenseFrequency = (typeof expenseFrequencies)[number];

const baseCategoryOptions = [
  { id: "housing", label: "Housing", description: "Rent, service charge, council tax" },
  { id: "utilities", label: "Utilities", description: "Gas, electric, water, phone, internet" },
  { id: "transport", label: "Transport", description: "Fuel, passes, travel" },
  { id: "food", label: "Food", description: "Groceries and basics" },
  { id: "childcare", label: "Childcare", description: "Nursery, wraparound care" },
  { id: "insurance", label: "Insurance", description: "Car, home, health" },
  { id: "subscriptions", label: "Subscriptions", description: "TV, apps, streaming" },
  { id: "medical", label: "Medical", description: "Prescriptions, health costs" },
  { id: "education", label: "Education", description: "Courses, school costs" },
  { id: "entertainment", label: "Entertainment", description: "Outings and leisure" },
  { id: "savings", label: "Savings", description: "Regular saving pots" },
  { id: "other", label: "Other", description: "Anything else" },
] as const;

export const categoryOptions = baseCategoryOptions;
type BaseCategory = (typeof categoryOptions)[number]["id"];

const subcategoryOptionsByCategory = {
  housing: [
    { id: "rent", label: "Rent / mortgage", description: "Rent, mortgage, ground rent" },
    { id: "service_charge", label: "Service charge", description: "Block fees, ground rent, factor" },
    { id: "council_tax", label: "Council tax", description: "Council tax payments" },
  ],
  utilities: [
    { id: "gas_electric", label: "Gas + electric (combined)", description: "Single supplier for gas and electric" },
    { id: "gas", label: "Gas", description: "Gas or LPG supply" },
    { id: "electric", label: "Electric", description: "Electricity supply" },
    { id: "water", label: "Water", description: "Water or sewerage" },
    { id: "phone", label: "Phone", description: "Mobile or landline" },
    { id: "internet", label: "Internet", description: "Broadband" },
  ],
  transport: [{ id: "car_fuel", label: "Fuel / travel", description: "Fuel, passes, tickets" }],
  food: [{ id: "groceries", label: "Groceries", description: "Food and essentials" }],
  childcare: [{ id: "childcare", label: "Childcare", description: "Nursery, clubs, wraparound" }],
  insurance: [{ id: "insurance", label: "Insurance", description: "Car, home, health insurance" }],
  subscriptions: [{ id: "subscriptions", label: "Subscriptions", description: "TV, apps, memberships" }],
  medical: [{ id: "medical", label: "Medical", description: "Prescriptions, health costs" }],
  education: [{ id: "education", label: "Education", description: "Courses, uniforms, school costs" }],
  entertainment: [{ id: "entertainment", label: "Entertainment", description: "Days out, hobbies" }],
  savings: [{ id: "savings", label: "Savings", description: "Regular saving pots" }],
  other: [{ id: "other", label: "Other", description: "Anything else" }],
} as const;

type Subcategory = (typeof subcategoryOptionsByCategory)[BaseCategory][number]["id"];
type SubcategoryOption = { id: Subcategory; label: string; description: string };

export type ExpenseType = Subcategory | BaseCategory;
export type ExpenseCategory = BaseCategory | Subcategory;

export const subcategoryOptions: Record<ExpenseCategory, ReadonlyArray<SubcategoryOption>> = {
  ...subcategoryOptionsByCategory,
  rent: [{ id: "rent", label: "Rent / mortgage", description: "Rent, mortgage, ground rent" }],
  service_charge: [
    { id: "service_charge", label: "Service charge", description: "Block fees, ground rent, factor" },
  ],
  council_tax: [{ id: "council_tax", label: "Council tax", description: "Council tax payments" }],
  gas_electric: [
    { id: "gas_electric", label: "Gas + electric (combined)", description: "Single supplier for gas and electric" },
  ],
  gas: [{ id: "gas", label: "Gas", description: "Gas or LPG supply" }],
  electric: [{ id: "electric", label: "Electric", description: "Electricity supply" }],
  water: [{ id: "water", label: "Water", description: "Water or sewerage" }],
  car_fuel: [{ id: "car_fuel", label: "Fuel / travel", description: "Fuel, passes, tickets" }],
  groceries: [{ id: "groceries", label: "Groceries", description: "Food and essentials" }],
  phone: [{ id: "phone", label: "Phone", description: "Mobile or landline" }],
  internet: [{ id: "internet", label: "Internet", description: "Broadband" }],
};

const baseCategoryIds: BaseCategory[] = categoryOptions.map((c) => c.id);

export const ucEligibleSubcategories: ExpenseType[] = [
  "rent",
  "service_charge",
  "council_tax",
  "gas_electric",
  "gas",
  "electric",
  "water",
];

export function isExpenseType(value: unknown): value is ExpenseType {
  if (baseCategoryIds.includes(value as BaseCategory)) return true;
  return Object.values(subcategoryOptions).some((options) => options.some((opt) => opt.id === value));
}

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return Boolean(value) && (value as string) in subcategoryOptions;
}

export function categoryForType(type: ExpenseType): ExpenseCategory {
  if (baseCategoryIds.includes(type as BaseCategory)) {
    return type as ExpenseCategory;
  }
  const match = Object.entries(subcategoryOptionsByCategory).find(([, options]) =>
    options.some((opt) => opt.id === type)
  );
  return (match?.[0] as ExpenseCategory) ?? "other";
}

export function normalizeExpenseToMonthly(amount: number, frequency: ExpenseFrequency) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  switch (frequency) {
    case "weekly":
      return (safeAmount * 52) / 12;
    case "fortnightly":
      return (safeAmount * 26) / 12;
    case "four_weekly":
      return (safeAmount * 13) / 12;
    case "quarterly":
      return safeAmount / 3;
    case "yearly":
      return safeAmount / 12;
    default:
      return safeAmount;
  }
}

export function formatExpenseAmounts({
  amount,
  frequency,
  paidByUc,
}: {
  amount: number;
  frequency: ExpenseFrequency;
  paidByUc?: boolean | null;
}) {
  const monthlyAmount = normalizeExpenseToMonthly(amount, frequency);
  const monthlyOutOfPocket = paidByUc ? 0 : monthlyAmount;
  return { monthlyAmount, monthlyOutOfPocket };
}

export function normalizeCurrency(value: unknown) {
  const safe = Math.round(Number(value) * 100) / 100;
  return Number.isFinite(safe) ? safe : 0;
}

export function deriveCategory(category: ExpenseCategory | null | undefined, type: ExpenseType): ExpenseCategory {
  if (category && isExpenseCategory(category)) {
    const subs = subcategoryOptions[category] ?? [];
    if (subs.some((opt) => opt.id === type)) {
      return category;
    }
  }
  return categoryForType(type);
}
