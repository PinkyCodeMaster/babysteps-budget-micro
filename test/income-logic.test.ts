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

test("calculateUcPayment applies disregard and taper", () => {
  const uc = calculateUcPayment({
    incomes: [{ type: "monthly_net", netMonthly: 1000 }],
    base: 800,
    taperIgnore: 411,
    taperRate: 0.55,
  });
  assert.ok(Math.abs(uc - 476.05) < 1);
});
