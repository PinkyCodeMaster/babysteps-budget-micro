import assert from "node:assert";
import test from "node:test";
import { getNextPaymentDate } from "@/lib/payment-schedule";

test("shifts weekend to next Monday", () => {
  // Saturday 2025-03-15 -> Monday 2025-03-17
  const from = new Date("2025-03-10T00:00:00Z");
  const result = getNextPaymentDate({ dueDay: 15, frequency: "monthly", from });
  assert.strictEqual(result.adjusted, "2025-03-17");
});

test("shifts bank holiday to next working day", () => {
  // Christmas Day 2025-12-25 (holiday) -> 2025-12-29 (Monday, after weekend and Boxing Day substitute)
  const from = new Date("2025-12-01T00:00:00Z");
  const result = getNextPaymentDate({ dueDay: 25, frequency: "monthly", from });
  assert.strictEqual(result.adjusted, "2025-12-29");
});

test("rolls to next month when due day already passed", () => {
  const from = new Date("2025-02-20T00:00:00Z");
  const result = getNextPaymentDate({ dueDay: 10, frequency: "monthly", from });
  assert.strictEqual(result.base, "2025-03-10");
});
