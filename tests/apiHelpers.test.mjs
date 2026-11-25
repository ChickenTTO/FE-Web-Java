import test from "node:test";
import assert from "node:assert/strict";
import { unwrap, collectPages, toPayload, normalize } from "../src/services/apiHelpers.js";

test("API envelope preserves null and rejects business errors", () => {
  assert.equal(unwrap({ data: { code: 200, data: null } }), null);
  assert.throws(() => unwrap({ data: { code: 409, message: "Đã tồn tại" } }), /Đã tồn tại/);
});
test("reads every server page with both 0-based and 1-based pagination", async () => {
  for (const first of [0, 1]) {
    const seen = [];
    const data = await collectPages(async (page) => {
      seen.push(page);
      return { items: [{ id: page }], pageNumber: page, totalPages: 3, last: page === first + 2 };
    }, first);
    assert.deepEqual(seen, [first, first + 1, first + 2]);
    assert.equal(data.length, 3);
  }
  await assert.rejects(() => collectPages(async () => ({ items: [{}], pageNumber: 0 })), /phân trang/);
});
test("maps nested numeric BE IDs to stable UI relations", () => {
  const doctor = normalize("doctors", { id: 12, user: { id: 40, fullName: "Nguyễn An" }, specialty: { id: 3 },
    title: "ThS", experienceYears: 8, biography: "Tiểu sử", consultationFee: 200000, isAvailable: false });
  assert.equal(doctor.id, "12"); assert.equal(doctor.userId, "40"); assert.equal(doctor.specialtyId, "3");
  assert.equal(doctor.name, "Nguyễn An"); assert.equal(doctor.isActive, false);
  assert.equal(normalize("users", { id: 1, fullName: "Admin", role: { code: "ADMIN", name: "Quản trị" } }).role, "ADMIN");
});
test("sends exact create/update DTOs instead of mock field names", () => {
  assert.deepEqual(toPayload("rooms", { name: "201", location: "Khu A", specialtyId: "x", isActive: true }),
    { roomNumber: "201", building: "Khu A", isActive: true });
  const doctor = toPayload("doctors", { userId: "4", specialtyId: "2", qualification: "ThS", experience: "8", consultationFee: "100000" }, true);
  assert.equal(doctor.userId, 4); assert.equal(doctor.consultationFee, 100000);
  assert.equal(toPayload("doctors", { userId: "4", specialtyId: "2" }).userId, undefined);
  const user = toPayload("users", { name: "Admin", role: "ADMIN", phone: "0901234567", password: "secret" }, true);
  assert.equal(user.roleId, 1); assert.equal(user.fullName, "Admin");
  assert.equal(toPayload("users", { name: "Admin", role: "ADMIN", phone: "0901234567" }).phone, undefined);
  assert.equal(toPayload("services", { name: "Khám", price: "200000", specialtyId: "" }).specialtyId, null);
  assert.throws(() => toPayload("patients", {}), /Swagger/);
});
