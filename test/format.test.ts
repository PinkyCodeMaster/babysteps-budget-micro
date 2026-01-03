import { formatCurrency } from "@/lib/format";
import assert from "node:assert";
import test from "node:test";

test("formatCurrency formats GBP whole numbers", () => {
  assert.strictEqual(formatCurrency(1234), "£1,234");
});

test("formatCurrency handles zero", () => {
  assert.strictEqual(formatCurrency(0), "£0");
});
