import assert from "node:assert";
import test from "node:test";
import { calculateProgress, sortDebts } from "@/lib/debt-logic";

const sample = [
  { id: 1, remainingBalance: 500, balance: 1000, type: "credit_card", dueDay: 12 },
  { id: 2, remainingBalance: 200, balance: 300, type: "ccj", dueDay: 20 },
  { id: 3, remainingBalance: 800, balance: 900, type: "loan" },
  { id: 4, remainingBalance: 1500, balance: 1500, type: "ccj", dueDay: 5 },
];

function ids(arr: { id: number }[]) {
  return arr.map((d) => d.id);
}

test("sortDebts snowball orders by remaining ascending", () => {
  const sorted = sortDebts(sample, "snowball");
  assert.deepStrictEqual(ids(sorted), [2, 4, 1, 3]);
});

test("sortDebts low-high matches snowball", () => {
  const sorted = sortDebts(sample, "low-high");
  assert.deepStrictEqual(ids(sorted), [2, 4, 1, 3]);
});

test("sortDebts high-low orders descending", () => {
  const sorted = sortDebts(sample, "high-low");
  assert.deepStrictEqual(ids(sorted), [4, 2, 3, 1]);
});

test("calculateProgress handles non-zero total", () => {
  assert.strictEqual(calculateProgress(1000, 250), 25);
});

test("calculateProgress handles zero total", () => {
  assert.strictEqual(calculateProgress(0, 100), 0);
});
