// Run against `npm run dev` (live mode). All writes are intercepted in an isolated browser context.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const root = process.env.API_TEST_BASE_URL || "http://127.0.0.1:5173";
const errors = [];
try {
  // Read-only check against the real BE through the development proxy.
  const live = await browser.newContext();
  const livePage = await live.newPage();
  const realResponse = livePage.waitForResponse((r) => r.url().includes("/api/v1/doctor-profiles"));
  await livePage.goto(root + "/doctors");
  assert.equal((await realResponse).status(), 200);
  await livePage.getByRole("heading", { name: "Đội ngũ bác sĩ", exact: true }).waitFor();
  assert.equal(await livePage.locator(".clinic-demo-banner").count(), 0);
  await live.close();
  console.log("PASS: real BE public directory through Vite proxy");

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  let refreshes = 0;
  let expireRefresh = false;
  let failSpecialties = false;
  let role = "ADMIN";
  const writes = [];
  const user = () => ({ id: 41, fullName: "Tài khoản kiểm thử", phone: "0901234567", email: "test@example.com", role });
  const specialties = [{ id: 1, name: "Nội tổng quát", description: "Khám nội", isActive: true },
    { id: 2, name: "Chuyên khoa trang hai", isActive: true }];
  await context.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");
    const method = request.method();
    const body = request.postDataJSON();
    const reply = (data, status = 200, message = "OK") => route.fulfill({ status, json: { code: status, data, message } });
    if (path === "/auth/login") {
      if (body.password === "wrong") return reply(null, 401, "Sai tài khoản hoặc mật khẩu");
      assert.ok(body.deviceId); assert.ok(body.deviceName);
      return reply({ accessToken: "old-token", user: user() });
    }
    if (path === "/auth/refresh-token") {
      refreshes += 1;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return expireRefresh ? reply(null, 401, "Hết phiên") : reply({ accessToken: "new-token" });
    }
    if (path === "/auth/logout") return reply(null);
    if (request.headers().authorization !== "Bearer new-token") return reply(null, 401, "Token hết hạn");
    if (method !== "GET") writes.push({ path, method, body });
    if (path === "/users/profile") return reply({ ...user(), role: { code: role, name: "Tên hiển thị vai trò" }, ...body });
    if (path === "/users/change-password") return reply(null);
    if (path === "/specialties" && method === "POST") {
      const row = { id: 3, ...body }; specialties.push(row); return reply(row);
    }
    if (path === "/specialties/3/status") {
      Object.assign(specialties[2], body); return reply(specialties[2]);
    }
    if (path === "/specialties" && failSpecialties) return reply(null, 500, "Lỗi BE kiểm thử");
    if (path === "/specialties") {
      const second = url.searchParams.get("page") === "2";
      return reply({ items: second ? specialties.slice(1) : specialties.slice(0, 1), pageNumber: second ? 2 : 1,
        totalPages: 2, last: second });
    }
    if (path === "/specialties/active") return reply(specialties);
    if (path === "/time-slots") return reply([{ id: 1, startTime: "08:00:00", endTime: "08:30:00", session: "morning" }]);
    if (path === "/patient-profile/me") return reply([{ id: 5, userId: 41, fullName: "Bệnh nhân từ BE", gender: "male" }]);
    if (path === "/users") return reply({ items: [{ ...user(), role: { code: role } }], pageNumber: 1, last: true });
    if (["/doctor-profiles", "/medical-services", "/examination-rooms"].includes(path))
      return reply({ items: [], pageNumber: path === "/medical-services" ? 0 : 1, last: true });
    throw new Error(`Unexpected API: ${method} ${path}`);
  });

  await page.goto(root + "/login");
  assert.equal(await page.locator(".clinic-demo-login").count(), 0);
  await page.locator('input[type="text"]').fill("0901234567");
  await page.locator('input[type="password"]').fill("wrong");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.getByText("Sai tài khoản hoặc mật khẩu", { exact: true }).waitFor();
  assert.equal(refreshes, 0);
  await page.locator('input[type="password"]').fill("local-test-password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.getByRole("heading", { name: "Tổng quan phòng khám", exact: true }).waitFor();
  assert.equal(refreshes, 1, "concurrent 401s must share one refresh");
  const stored = await page.evaluate(() => ({ ...localStorage }));
  assert.ok(!JSON.stringify(stored).includes("old-token") && !JSON.stringify(stored).includes("new-token"));
  assert.equal(stored.medicare_clinic_demo_v1, undefined);
  console.log("PASS: login errors, Bearer auth, concurrent refresh, no stored tokens/mock data");

  await page.goto(root + "/catalog/specialties");
  await page.getByRole("cell", { name: "Chuyên khoa trang hai", exact: true }).waitFor();
  await page.getByRole("button", { name: "Thêm mới", exact: true }).click();
  await page.getByLabel("Tên chuyên khoa").fill("Chuyên khoa mới");
  await page.getByLabel("Mô tả", { exact: true }).fill("Nội dung từ form");
  await page.getByRole("button", { name: "Lưu thông tin", exact: true }).click();
  const created = page.getByRole("row").filter({ hasText: "Chuyên khoa mới" });
  await created.waitFor();
  assert.deepEqual(writes.find((w) => w.method === "POST").body,
    { isActive: true, name: "Chuyên khoa mới", description: "Nội dung từ form" });
  await created.getByRole("button", { name: "Ngừng hoạt động" }).click();
  await created.getByText("Nghỉ", { exact: true }).waitFor();
  console.log("PASS: all server pages, create DTO, server status update");

  await page.goto(root + "/settings");
  await page.getByLabel("Họ và tên", { exact: true }).fill("Tên cập nhật");
  await page.getByRole("button", { name: "Cập nhật thông tin", exact: true }).click();
  await page.getByText("Đã cập nhật hồ sơ trên máy chủ.", { exact: false }).waitFor();
  await page.getByLabel("Mật khẩu hiện tại", { exact: true }).fill("old-password");
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill("new-password");
  await page.getByLabel("Xác nhận mật khẩu mới", { exact: true }).fill("new-password");
  await page.getByRole("button", { name: "Đổi mật khẩu", exact: true }).click();
  await page.getByText("Đã đổi mật khẩu.", { exact: false }).waitFor();
  assert.equal(writes.find((w) => w.path === "/users/change-password").body.confirmPassword, "new-password");
  console.log("PASS: profile update and password change");

  failSpecialties = true;
  await page.goto(root + "/catalog/specialties");
  await page.getByRole("alert").filter({ hasText: "Lỗi BE kiểm thử" }).waitFor();
  failSpecialties = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await page.getByRole("cell", { name: "Chuyên khoa mới", exact: true }).waitFor();
  const beforeReload = refreshes;
  await page.reload();
  await page.getByRole("cell", { name: "Chuyên khoa mới", exact: true }).waitFor();
  assert.equal(refreshes, beforeReload + 1);
  await page.goto(root + "/booking");
  await page.getByRole("heading", { name: "Chức năng chưa khả dụng" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Xác nhận đặt lịch" }).count(), 0);
  console.log("PASS: API failure/retry, session restoration and unavailable features");

  // Verify patient ownership and a read-only profile with no speculative API calls.
  role = "PATIENT";
  await page.reload();
  await page.goto(root + "/profiles");
  await page.getByRole("cell", { name: "Bệnh nhân từ BE", exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Thêm mới", exact: true }).count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector(".app-sidebar").getBoundingClientRect().right <= 1);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/api-patient-mobile.png", fullPage: true });
  expireRefresh = true;
  await page.reload();
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).waitFor();
  assert.equal(new URL(page.url()).pathname, "/login");
  assert.equal(await page.evaluate(() => localStorage.getItem("medicare_auth_user")), null);
  assert.deepEqual(errors, []);
  console.log("PASS: patient read-only profile, mobile layout, expired session clears auth");
  await context.close();
} finally { await browser.close(); }
