import test from "node:test";
import assert from "node:assert/strict";
import {
  initialClinic,
  stock,
  allocate,
  today,
  dateAfter,
  roleOf,
  homeFor,
  clinicDate,
} from "../src/services/clinicStore.js";
test("FEFO splits usage across batches and records each allocation", () => {
  const db = initialClinic();
  const rows = allocate(db, "s1", 150, "USAGE", "APT-TEST");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].batchId, "b1");
  assert.equal(rows[0].quantity, -100);
  assert.equal(rows[1].batchId, "b2");
  assert.equal(rows[1].quantity, -50);
  assert.equal(stock(db, "s1"), 150);
  assert.equal(db.batches.find((b) => b.id === "b1").status, "depleted");
});
test("expired and same-day expiration batches cannot be allocated", () => {
  const db = initialClinic();
  assert.equal(stock(db, "s3"), 0);
  db.batches.find((b) => b.id === "b1").expirationDate = today();
  assert.equal(stock(db, "s1"), 200);
  assert.throws(
    () => allocate(db, "s1", 201, "EXPORT_ROOM", "P.201"),
    /INSUFFICIENT_STOCK/,
  );
  assert.equal(db.transactions.length, 0);
});
test("insufficient stock leaves batch balances unchanged", () => {
  const db = initialClinic();
  const before = structuredClone(db.batches);
  assert.throws(
    () => allocate(db, "s1", 301, "USAGE", "APT-TEST"),
    /INSUFFICIENT_STOCK/,
  );
  assert.deepEqual(db.batches, before);
  assert.equal(db.transactions.length, 0);
});
test("invalid quantities are rejected", () => {
  const db = initialClinic();
  for (const qty of [0, -1, NaN])
    assert.throws(() => allocate(db, "s1", qty, "USAGE", "APT-TEST"));
});
test("roles never default to ADMIN and normalize Spring role names", () => {
  assert.equal(roleOf({}), "PATIENT");
  assert.equal(roleOf({ roles: [{ authority: "ROLE_DOCTOR" }] }), "DOCTOR");
  assert.equal(homeFor({ role: "STAFF" }), "/appointments");
  assert.ok(dateAfter(1) > today());
});
test("report dates use Vietnam midnight rather than UTC midnight", () => {
  assert.equal(clinicDate("2026-11-15T18:00:00Z"), "2026-11-16");
});
