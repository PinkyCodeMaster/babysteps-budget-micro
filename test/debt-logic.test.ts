import assert from "node:assert";
import test from "node:test";
import { calculateProgress, sortDebts } from "@/lib/debt-logic";

const sample = [
  { id: 1, remainingBalance: 500, balance: 1000 },
  { id: 2, remainingBalance: 200, balance: 300 },
  { id: 3, remainingBalance: 800, balance: 900 },
];

function ids(arr: { id: number }[]) {
  return arr.map((d) => d.id);
}

test("sortDebts snowball orders by remaining ascending", () => {
  const sorted = sortDebts(sample, "snowball");
  assert.deepStrictEqual(ids(sorted), [2, 1, 3]);
});

test("sortDebts low-high matches snowball", () => {
  const sorted = sortDebts(sample, "low-high");
  assert.deepStrictEqual(ids(sorted), [2, 1, 3]);
});

test("sortDebts high-low orders descending", () => {
  const sorted = sortDebts(sample, "high-low");
  assert.deepStrictEqual(ids(sorted), [3, 1, 2]);
});

test("calculateProgress handles non-zero total", () => {
  assert.strictEqual(calculateProgress(1000, 250), 25);
});

test("calculateProgress handles zero total", () => {
  assert.strictEqual(calculateProgress(0, 100), 0);
});
