import assert from "node:assert";
import test from "node:test";
import { estimateNetMonthly, calculateUcPayment } from "@/lib/income-logic";

test("estimateNetMonthly passes through net monthly", () => {
  const net = estimateNetMonthly({ type: "monthly_net", amount: 1200 });
  assert.strictEqual(net, 1200);
});

test("estimateNetMonthly handles hourly below allowance", () => {
  const net = estimateNetMonthly({
    type: "hourly",
    amount: 10,
    hoursPerWeek: 10,
  });
  assert.ok(Math.abs(net - 433.33) < 1);
});

test("estimateNetMonthly handles yearly gross with tax/NI", () => {
  const net = estimateNetMonthly({
    type: "yearly_gross",
    amount: 24000,
  });
  assert.ok(Math.abs(net - 1695) < 5);
});

test("calculateUcPayment applies disregard and taper using declared UC base", () => {
  const uc = calculateUcPayment({
    incomes: [
      { type: "uc", netMonthly: 2060 },
      { type: "monthly_net", netMonthly: 2600 },
    ],
    base: 0,
    taperIgnore: 411,
    taperRate: 0.55,
  });
  assert.ok(Math.abs(uc - 856.05) < 1);
});

test("calculateUcPayment uses fallback base when UC entry is absent", () => {
  const uc = calculateUcPayment({
    incomes: [{ type: "monthly_net", netMonthly: 1800 }],
    base: 1000,
    taperIgnore: 411,
    taperRate: 0.55,
  });
  // Earnings above disregard: 1800 - 411 = 1389; deduction = 764.0; UC = 236.0
  assert.ok(Math.abs(uc - 236) < 1);
});

test("calculateUcPayment ignores UC entries in take-home while tapering", () => {
  const uc = calculateUcPayment({
    incomes: [
      { type: "uc", netMonthly: 1500 },
      { type: "monthly_net", netMonthly: 411 },
      { type: "monthly_net", netMonthly: 0 },
    ],
    base: 0,
    taperIgnore: 411,
    taperRate: 0.55,
  });
  // Over disregard is zero, so UC should remain at base (1500)
  assert.ok(Math.abs(uc - 1500) < 1);
});
