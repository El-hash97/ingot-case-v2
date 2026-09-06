import { test } from "node:test";
import assert from "node:assert/strict";
import { statusForTonnage, percentOf } from "./tonnage";

test("statusForTonnage: ACTIVE below warning threshold", () => {
  assert.equal(statusForTonnage(1000, 20000, 16000, "ACTIVE"), "ACTIVE");
});

test("statusForTonnage: WARNING at 80% (16.000kg)", () => {
  assert.equal(statusForTonnage(16000, 20000, 16000, "ACTIVE"), "WARNING");
});

test("statusForTonnage: NG at max (20.000kg)", () => {
  assert.equal(statusForTonnage(20000, 20000, 16000, "WARNING"), "NG");
});

test("statusForTonnage: NG stays NG past max", () => {
  assert.equal(statusForTonnage(20600, 20000, 16000, "NG"), "NG");
});

test("statusForTonnage: SCRAPPED is permanent regardless of tonnage", () => {
  assert.equal(statusForTonnage(0, 20000, 16000, "SCRAPPED"), "SCRAPPED");
});

test("percentOf: basic percentage, rounded to 1 decimal", () => {
  assert.equal(percentOf(14200, 20000), 71);
  assert.equal(percentOf(333, 1000), 33.3);
});

test("percentOf: clamps at 100 even past max", () => {
  assert.equal(percentOf(25000, 20000), 100);
});

test("percentOf: 0 when maxTonnageKg is non-positive", () => {
  assert.equal(percentOf(500, 0), 0);
});
