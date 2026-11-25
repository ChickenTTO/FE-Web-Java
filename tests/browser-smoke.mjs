import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const root = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5173";
async function open(path) {
  console.log("route", path);
  await page.goto(root + path, { waitUntil: "domcontentloaded" });
  await page.locator(".clinic-page,.card-body").first().waitFor();
}
async function role(name) {
  await page.goto(root + "/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name, exact: true }).click();
  await page.locator(".clinic-page").waitFor();
}
async function check(path) {
  await open(path);
  assert.equal(new URL(page.url()).pathname, path);
  assert.ok(await page.locator("h1").textContent());
}
try {
  await role("Quản trị viên");
  for (const path of [
    "/admin",
    "/appointments",
    "/patients",
    "/schedules",
    "/payments",
    "/reports",
    "/catalog/specialties",
    "/catalog/rooms",
    "/catalog/doctors",
    "/catalog/services",
    "/catalog/timeSlots",
    "/inventory",
    "/inventory/batches",
    "/inventory/transactions",
    "/inventory/supplies",
    "/inventory/categories",
    "/inventory/suppliers",
    "/inventory/norms",
    "/users",
    "/audit-logs",
    "/sessions",
    "/settings",
    "/help",
  ])
    await check(path);
  await open("/catalog/specialties");
  await page.getByRole("button", { name: "Thêm mới", exact: true }).click();
  await page.getByLabel("Tên chuyên khoa").fill("Da liễu");
  await page.getByRole("button", { name: "Lưu thông tin" }).click();
  await page.getByRole("cell", { name: "Da liễu", exact: true }).waitFor();
  await open("/inventory");
  await page.getByRole("button", { name: "Nhập kho", exact: true }).click();
  await page.getByLabel("Vật tư", { exact: true }).selectOption("s2");
  await page.getByLabel("Số lượng", { exact: true }).fill("30");
  await page.getByLabel("Nhà cung cấp", { exact: true }).selectOption("sup1");
  await page.getByLabel("Số lô", { exact: true }).fill("BROWSER-TEST");
  await page.getByLabel("Hạn sử dụng", { exact: true }).fill("2028-01-01");
  await page.getByLabel("Giá nhập / đơn vị", { exact: true }).fill("10000");
  await page.getByRole("button", { name: "Lưu phiếu" }).click();
  assert.equal(await page.locator("[role=dialog]").count(), 0);
  await role("Bệnh nhân");
  await check("/profiles");
  await check("/my-appointments");
  await check("/payments");
  await page.goto(root + "/admin");
  await page.waitForURL("**/my-appointments");
  await open("/booking");
  const form = page.locator("form");
  const selects = form.getByRole("combobox");
  await selects.nth(0).selectOption("p1");
  await selects.nth(1).selectOption("sv1");
  await selects.nth(2).selectOption("d1");
  const { dateAfter } = await import("../src/services/clinicStore.js");
  await form.locator("input[type=date]").fill(dateAfter(1));
  await form.locator(".bk-chip").first().click();
  await page.getByRole("button", { name: "Xác nhận đặt lịch" }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("heading", { name: "Đặt lịch thành công" }).waitFor();
  await page.getByRole("link", { name: "Xem lịch hẹn" }).click();
  await open("/payments");
  await page
    .getByRole("button", { name: "Tạo thanh toán", exact: true })
    .click();
  await page.getByLabel("Lịch hẹn", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Phương thức", { exact: true }).selectOption("VNPAY");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page.getByRole("button", { name: "Mô phỏng đã thanh toán" }).click();
  await page
    .getByRole("cell", { name: "Đã thanh toán", exact: true })
    .waitFor();
  await role("Lễ tân / Kho");
  await open("/appointments");
  await page
    .locator("tbody tr")
    .filter({ has: page.getByText("Chờ xác nhận", { exact: true }) })
    .last()
    .getByRole("button", { name: "Chi tiết" })
    .click();
  await page
    .getByRole("button", { name: "Xác nhận lịch", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByText("Đã xác nhận", { exact: true })
    .first()
    .waitFor();
  await page.keyboard.press("Escape");
  await role("Bác sĩ");
  await open("/consultations");
  await page
    .locator("tbody tr")
    .filter({ has: page.getByText("Đã xác nhận", { exact: true }) })
    .first()
    .getByRole("button")
    .click();
  await page
    .getByRole("button", { name: "Hoàn tất khám & trừ vật tư" })
    .waitFor();
  await page.getByLabel("Vật tư phát sinh", { exact: true }).selectOption("s3");
  await page
    .getByRole("button", { name: "Hoàn tất khám & trừ vật tư" })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "INSUFFICIENT_STOCK" })
    .waitFor();
  await page
    .getByRole("dialog")
    .getByText("Đã xác nhận", { exact: true })
    .first()
    .waitFor();
  await page.getByLabel("Vật tư phát sinh", { exact: true }).selectOption("");
  await page
    .getByRole("button", { name: "Hoàn tất khám & trừ vật tư" })
    .click();
  await page
    .getByRole("dialog")
    .getByText("Đã hoàn tất", { exact: true })
    .first()
    .waitFor();
  await page.keyboard.press("Escape");
  await check("/schedules");
  await check("/inventory");
  await check("/settings");
  await role("Quản trị viên");
  await open("/payments");
  await page.getByRole("button", { name: "Hoàn tiền", exact: true }).click();
  await page
    .getByLabel("Lý do hoàn tiền", { exact: true })
    .fill("Kiểm tra hoàn tiền bản xem thử");
  await page
    .getByRole("button", { name: "Xác nhận hoàn tiền", exact: true })
    .click();
  await page.getByRole("cell", { name: "Đã hoàn tiền", exact: true }).waitFor();
  await open("/admin");
  await page.waitForTimeout(650);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/clinic-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page.locator(".app-sidebar.open").waitFor();
  await page
    .getByRole("link", { name: "Lô hàng & Hạn dùng", exact: true })
    .click();
  await page.locator(".app-sidebar.open").waitFor({ state: "detached" });
  await page.waitForTimeout(650);
  await page.screenshot({
    path: "artifacts/clinic-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "Mobile has horizontal page overflow",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of ["/specialties", "/doctors", "/services", "/booking"])
    await check(path);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: route/role checks, catalog create, inventory import, booking, online payment simulation/refund, confirmation, stock failure rollback, doctor completion/FEFO, mobile navigation, no runtime errors.",
  );
} finally {
  await browser.close();
}
