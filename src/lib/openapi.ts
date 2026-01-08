import {
  debtFrequencyEnum,
  debtTypeEnum,
  expenseCategoryEnum,
  expenseFrequencyEnum,
  expenseTypeEnum,
  incomeCategoryEnum,
  incomeTypeEnum,
  paymentDayRuleEnum,
  paymentFrequencyEnum,
} from "@/db/schema";

const incomeBasisValues = [
  "monthly_net",
  "weekly_net",
  "fortnightly_net",
  "four_weekly_net",
  "yearly_gross",
  "hourly",
  "uc",
];

const debtTypeValues = debtTypeEnum.enumValues;
const debtFrequencyValues = debtFrequencyEnum.enumValues;
const expenseTypeValues = expenseTypeEnum.enumValues;
const expenseCategoryValues = expenseCategoryEnum.enumValues;
const expenseFrequencyValues = expenseFrequencyEnum.enumValues;
const incomeTypeValues = incomeTypeEnum.enumValues;
const incomeCategoryValues = incomeCategoryEnum.enumValues;
const paymentFrequencyValues = paymentFrequencyEnum.enumValues;
const paymentDayRuleValues = paymentDayRuleEnum.enumValues;

const schemaRef = (ref: string) => ({ $ref: ref });
const json = (schema: Record<string, unknown>) => ({
  "application/json": { schema },
});

const errorResponseSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" },
  },
};

const successResponseSchema = {
  type: "object",
  required: ["success"],
  properties: {
    success: { type: "boolean" },
  },
};

const idResponseSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "integer" },
  },
};

const debtSchema = {
  type: "object",
  required: ["id", "userId", "name", "type", "balance", "frequency", "created_at"],
  properties: {
    id: { type: "integer" },
    userId: { type: "string" },
    name: { type: "string" },
    type: { type: "string", enum: debtTypeValues },
    balance: { type: "number" },
    interestRate: { type: "number", nullable: true },
    minimumPayment: { type: "number", nullable: true },
    frequency: { type: "string", enum: debtFrequencyValues },
    dueDay: { type: "integer", nullable: true },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const paymentSchema = {
  type: "object",
  required: ["id", "debtId", "amount", "paymentDate", "created_at"],
  properties: {
    id: { type: "integer" },
    debtId: { type: "integer" },
    amount: { type: "number" },
    paymentDate: { type: "string", format: "date" },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const debtWithTotalsSchema = {
  allOf: [
    schemaRef("#/components/schemas/Debt"),
    {
      type: "object",
      required: ["payments", "totalPaid", "remainingBalance"],
      properties: {
        payments: {
          type: "array",
          items: schemaRef("#/components/schemas/Payment"),
        },
        totalPaid: { type: "number" },
        remainingBalance: { type: "number" },
      },
    },
  ],
};

const debtCreateInputSchema = {
  type: "object",
  required: ["name", "type", "balance"],
  properties: {
    name: { type: "string" },
    type: { type: "string", enum: debtTypeValues },
    balance: { type: "number" },
    interestRate: { type: "number", nullable: true },
    minimumPayment: { type: "number", nullable: true },
    frequency: { type: "string", enum: debtFrequencyValues },
    dueDay: { type: "integer", nullable: true },
  },
};

const debtUpdateInputSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    type: { type: "string", enum: debtTypeValues },
    balance: { type: "number" },
    interestRate: { type: "number", nullable: true },
    minimumPayment: { type: "number", nullable: true },
    frequency: { type: "string", enum: debtFrequencyValues },
    dueDay: { type: "integer", nullable: true },
  },
};

const paymentCreateInputSchema = {
  type: "object",
  required: ["amount"],
  properties: {
    amount: { type: "number" },
    paymentDate: { type: "string", format: "date", nullable: true },
  },
};

const debtPaymentsResponseSchema = {
  type: "object",
  required: ["payments", "totalPaid", "remainingBalance"],
  properties: {
    payments: {
      type: "array",
      items: schemaRef("#/components/schemas/Payment"),
    },
    totalPaid: { type: "number" },
    remainingBalance: { type: "number" },
  },
};

const debtPaymentCreateResponseSchema = {
  type: "object",
  required: ["payment", "totalPaid", "remainingBalance"],
  properties: {
    payment: schemaRef("#/components/schemas/Payment"),
    totalPaid: { type: "number" },
    remainingBalance: { type: "number" },
  },
};

const debtImportDuplicateSchema = {
  type: "object",
  required: ["line", "name", "balance", "type", "reason"],
  properties: {
    line: { type: "integer" },
    name: { type: "string" },
    balance: { type: "number" },
    interestRate: { type: "number", nullable: true },
    minimumPayment: { type: "number", nullable: true },
    dueDay: { type: "integer", nullable: true },
    type: { type: "string", enum: debtTypeValues },
    reason: { type: "string" },
  },
};

const debtImportConflictSchema = {
  type: "object",
  required: ["error", "duplicates", "readyToImport", "failures"],
  properties: {
    error: { type: "string" },
    duplicates: {
      type: "array",
      items: schemaRef("#/components/schemas/DebtImportDuplicate"),
    },
    readyToImport: { type: "integer" },
    failures: {
      type: "array",
      items: { type: "string" },
    },
  },
};

const debtImportResultSchema = {
  type: "object",
  required: ["imported", "failures", "skippedDuplicates"],
  properties: {
    imported: { type: "integer" },
    failures: {
      type: "array",
      items: { type: "string" },
    },
    skippedDuplicates: {
      type: "array",
      items: schemaRef("#/components/schemas/DebtImportDuplicate"),
    },
  },
};

const expenseSchema = {
  type: "object",
  required: ["id", "userId", "name", "type", "amount", "category", "frequency", "paidByUc", "created_at"],
  properties: {
    id: { type: "integer" },
    userId: { type: "string" },
    name: { type: "string" },
    type: { type: "string", enum: expenseTypeValues },
    amount: { type: "number" },
    category: { type: "string", enum: expenseCategoryValues },
    frequency: { type: "string", enum: expenseFrequencyValues },
    paymentDay: { type: "integer", nullable: true },
    paidByUc: { type: "boolean" },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const expenseWithMonthlySchema = {
  allOf: [
    schemaRef("#/components/schemas/Expense"),
    {
      type: "object",
      required: ["monthlyAmount", "monthlyOutOfPocket"],
      properties: {
        monthlyAmount: { type: "number" },
        monthlyOutOfPocket: { type: "number" },
      },
    },
  ],
};

const expenseInputSchema = {
  type: "object",
  required: ["name", "type", "amount"],
  properties: {
    name: { type: "string" },
    type: { type: "string", enum: expenseTypeValues },
    amount: { type: "number" },
    category: { type: "string", enum: expenseCategoryValues },
    frequency: { type: "string", enum: expenseFrequencyValues },
    paymentDay: { type: "integer", nullable: true },
    paidByUc: { type: "boolean" },
  },
};

const expenseSummaryResponseSchema = {
  type: "object",
  required: ["summary", "expenses"],
  properties: {
    summary: {
      type: "object",
      required: ["totalMonthly", "ucCoveredMonthly"],
      properties: {
        totalMonthly: { type: "number" },
        ucCoveredMonthly: { type: "number" },
      },
    },
    expenses: {
      type: "array",
      items: schemaRef("#/components/schemas/ExpenseWithMonthly"),
    },
  },
};

const incomeSchema = {
  type: "object",
  required: ["id", "userId", "name", "type", "amount", "category", "frequency", "paymentDayRule", "created_at"],
  properties: {
    id: { type: "integer" },
    userId: { type: "string" },
    name: { type: "string" },
    type: { type: "string", enum: incomeTypeValues },
    amount: { type: "number" },
    hoursPerWeek: { type: "number", nullable: true },
    category: { type: "string", enum: incomeCategoryValues },
    frequency: { type: "string", enum: paymentFrequencyValues },
    paymentDayRule: { type: "string", enum: paymentDayRuleValues },
    paymentDay: { type: "integer", nullable: true },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const incomeWithNetSchema = {
  allOf: [
    schemaRef("#/components/schemas/Income"),
    {
      type: "object",
      required: ["netMonthly"],
      properties: {
        netMonthly: { type: "number" },
      },
    },
  ],
};

const incomeInputSchema = {
  type: "object",
  required: ["name", "amount"],
  properties: {
    name: { type: "string" },
    type: { type: "string", enum: incomeTypeValues },
    amount: { type: "number" },
    hoursPerWeek: { type: "number", nullable: true },
    category: { type: "string", enum: incomeCategoryValues },
    frequency: { type: "string", enum: paymentFrequencyValues },
    paymentDay: { type: "integer", nullable: true },
    paymentDayRule: { type: "string", enum: paymentDayRuleValues },
    amountBasis: { type: "string", enum: incomeBasisValues, nullable: true },
  },
};

const incomeSummaryResponseSchema = {
  type: "object",
  required: ["summary", "incomes"],
  properties: {
    summary: {
      type: "object",
      required: ["totalNetMonthly", "ucPayment"],
      properties: {
        totalNetMonthly: { type: "number" },
        ucPayment: { type: "number" },
      },
    },
    incomes: {
      type: "array",
      items: schemaRef("#/components/schemas/IncomeWithNet"),
    },
  },
};

const onboardingProgressSchema = {
  type: "object",
  required: ["step", "nextPath"],
  properties: {
    step: { type: "string", enum: ["incomes", "expenses", "debts", "done"] },
    nextPath: { type: "string" },
  },
};

const cronCheckResponseSchema = {
  type: "object",
  required: ["ok"],
  properties: {
    ok: { type: "boolean" },
  },
};

const cronNotifyResponseSchema = {
  type: "object",
  required: ["success", "emailsSent"],
  properties: {
    success: { type: "boolean" },
    emailsSent: { type: "integer" },
  },
};

export function buildOpenApiSpec(serverUrl?: string) {
  const servers = serverUrl ? [{ url: serverUrl }] : [];
  const errorContent = json(schemaRef("#/components/schemas/ErrorResponse"));
  const successContent = json(schemaRef("#/components/schemas/SuccessResponse"));
  const idContent = json(schemaRef("#/components/schemas/IdResponse"));

  return {
    openapi: "3.0.3",
    info: {
      title: "Budget API",
      version: "1.0.0",
      description: "App router endpoints for the Budget app.",
    },
    servers,
    tags: [
      { name: "debts" },
      { name: "expenses" },
      { name: "incomes" },
      { name: "onboarding" },
      { name: "cron" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "token",
          description: "Better Auth session token (Expo uses bearer tokens).",
        },
      },
      schemas: {
        ErrorResponse: errorResponseSchema,
        SuccessResponse: successResponseSchema,
        IdResponse: idResponseSchema,
        Debt: debtSchema,
        Payment: paymentSchema,
        DebtWithTotals: debtWithTotalsSchema,
        DebtCreateInput: debtCreateInputSchema,
        DebtUpdateInput: debtUpdateInputSchema,
        PaymentCreateInput: paymentCreateInputSchema,
        DebtPaymentsResponse: debtPaymentsResponseSchema,
        DebtPaymentCreateResponse: debtPaymentCreateResponseSchema,
        DebtImportDuplicate: debtImportDuplicateSchema,
        DebtImportConflict: debtImportConflictSchema,
        DebtImportResult: debtImportResultSchema,
        Expense: expenseSchema,
        ExpenseWithMonthly: expenseWithMonthlySchema,
        ExpenseInput: expenseInputSchema,
        ExpenseSummaryResponse: expenseSummaryResponseSchema,
        Income: incomeSchema,
        IncomeWithNet: incomeWithNetSchema,
        IncomeInput: incomeInputSchema,
        IncomeSummaryResponse: incomeSummaryResponseSchema,
        OnboardingProgress: onboardingProgressSchema,
        CronCheckResponse: cronCheckResponseSchema,
        CronNotifyResponse: cronNotifyResponseSchema,
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/api/debts": {
        post: {
          tags: ["debts"],
          summary: "Create a debt",
          operationId: "createDebt",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/DebtCreateInput")),
          },
          responses: {
            "201": { description: "Created", content: idContent },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/debts/{id}": {
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        get: {
          tags: ["debts"],
          summary: "Get a debt",
          operationId: "getDebt",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/DebtWithTotals")),
            },
            "400": { description: "Invalid id", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        patch: {
          tags: ["debts"],
          summary: "Update a debt",
          operationId: "updateDebt",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/DebtUpdateInput")),
          },
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/DebtWithTotals")),
            },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        put: {
          tags: ["debts"],
          summary: "Update a debt",
          operationId: "replaceDebt",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/DebtUpdateInput")),
          },
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/DebtWithTotals")),
            },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        delete: {
          tags: ["debts"],
          summary: "Delete a debt",
          operationId: "deleteDebt",
          responses: {
            "200": { description: "OK", content: successContent },
            "400": { description: "Invalid id", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/debts/{id}/payments": {
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        get: {
          tags: ["debts"],
          summary: "List debt payments",
          operationId: "listDebtPayments",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/DebtPaymentsResponse")),
            },
            "400": { description: "Invalid id", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        post: {
          tags: ["debts"],
          summary: "Create a payment",
          operationId: "createDebtPayment",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/PaymentCreateInput")),
          },
          responses: {
            "201": {
              description: "Created",
              content: json(schemaRef("#/components/schemas/DebtPaymentCreateResponse")),
            },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/debts/import": {
        post: {
          tags: ["debts"],
          summary: "Import debts from CSV",
          operationId: "importDebts",
          parameters: [
            {
              name: "skipDuplicates",
              in: "query",
              required: false,
              schema: { type: "boolean" },
              description: "Skip duplicate rows when true.",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file"],
                  properties: {
                    file: { type: "string", format: "binary" },
                  },
                },
              },
              "text/csv": {
                schema: { type: "string" },
              },
            },
          },
          responses: {
            "200": {
              description: "Imported",
              content: json(schemaRef("#/components/schemas/DebtImportResult")),
            },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "409": {
              description: "Duplicates found",
              content: json(schemaRef("#/components/schemas/DebtImportConflict")),
            },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/debts/export": {
        get: {
          tags: ["debts"],
          summary: "Export debts as CSV",
          operationId: "exportDebts",
          responses: {
            "200": {
              description: "CSV export",
              content: {
                "text/csv": {
                  schema: { type: "string" },
                },
              },
            },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/expenses": {
        get: {
          tags: ["expenses"],
          summary: "List expenses with monthly totals",
          operationId: "listExpenses",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/ExpenseSummaryResponse")),
            },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        post: {
          tags: ["expenses"],
          summary: "Create an expense",
          operationId: "createExpense",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/ExpenseInput")),
          },
          responses: {
            "201": { description: "Created", content: successContent },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/expenses/{id}": {
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        get: {
          tags: ["expenses"],
          summary: "Get an expense",
          operationId: "getExpense",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/ExpenseWithMonthly")),
            },
            "400": { description: "Invalid id", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        put: {
          tags: ["expenses"],
          summary: "Update an expense",
          operationId: "updateExpense",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/ExpenseInput")),
          },
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/Expense")),
            },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        delete: {
          tags: ["expenses"],
          summary: "Delete an expense",
          operationId: "deleteExpense",
          responses: {
            "200": { description: "OK", content: successContent },
            "400": { description: "Invalid id", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/incomes": {
        get: {
          tags: ["incomes"],
          summary: "List incomes with UC calculation",
          operationId: "listIncomes",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/IncomeSummaryResponse")),
            },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        post: {
          tags: ["incomes"],
          summary: "Create an income",
          operationId: "createIncome",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/IncomeInput")),
          },
          responses: {
            "201": { description: "Created", content: successContent },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/incomes/{id}": {
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        get: {
          tags: ["incomes"],
          summary: "Get an income",
          operationId: "getIncome",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/IncomeWithNet")),
            },
            "400": { description: "Invalid id", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        put: {
          tags: ["incomes"],
          summary: "Update an income",
          operationId: "updateIncome",
          requestBody: {
            required: true,
            content: json(schemaRef("#/components/schemas/IncomeInput")),
          },
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/IncomeWithNet")),
            },
            "400": { description: "Validation error", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        delete: {
          tags: ["incomes"],
          summary: "Delete an income",
          operationId: "deleteIncome",
          responses: {
            "200": { description: "OK", content: successContent },
            "400": { description: "Invalid id", content: errorContent },
            "401": { description: "Unauthorized", content: errorContent },
            "404": { description: "Not found", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
      "/api/onboarding/progress": {
        get: {
          tags: ["onboarding"],
          summary: "Get onboarding progress",
          operationId: "getOnboardingProgress",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/OnboardingProgress")),
            },
            "401": { description: "Unauthorized", content: errorContent },
          },
        },
      },
      "/api/cron/notify": {
        get: {
          tags: ["cron"],
          summary: "Cron health check",
          operationId: "cronNotifyCheck",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/CronCheckResponse")),
            },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
        post: {
          tags: ["cron"],
          summary: "Send payment reminder emails",
          operationId: "cronNotifyRun",
          responses: {
            "200": {
              description: "OK",
              content: json(schemaRef("#/components/schemas/CronNotifyResponse")),
            },
            "401": { description: "Unauthorized", content: errorContent },
            "500": { description: "Server error", content: errorContent },
          },
        },
      },
    },
  };
}
