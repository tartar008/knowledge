# 🔥 End-to-End Examples (ตัวอย่างทดสอบครบวงจร Playwright)

บทสุดท้ายนี้รวมตัวอย่างการทดสอบระบบจริงตั้งแต่ต้นจนจบ (E2E)  
ครอบคลุมทั้ง frontend, backend, การ mock API, การ upload/download, และ visual test

---

## 🧭 1. ตัวอย่าง Login Flow

```ts
import { test, expect } from '@playwright/test';

test('E2E Login Flow', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');

  // กรอกข้อมูลเข้าสู่ระบบ
  await page.getByLabel('Username').fill('student');
  await page.getByLabel('Password').fill('Password123');
  await page.getByRole('button', { name: 'Submit' }).click();

  // ตรวจสอบว่าเข้าสู่ระบบสำเร็จ
  await expect(page).toHaveURL(/logged-in-successfully/);
  await expect(page.getByText('Congratulations')).toBeVisible();
});
```

📘 *จุดสังเกต:*  
- ใช้ selector แบบ semantic (by label, by role) เพื่อความทนทาน  
- ใช้ `expect()` เพื่อรอเงื่อนไขแทน `waitForTimeout()`  

---

## 📄 2. CRUD Operations (Create, Read, Update, Delete)

ตัวอย่างเว็บทดสอบ: [https://reqres.in](https://reqres.in)

```ts
test('E2E CRUD Flow (mocked)', async ({ page }) => {
  await page.route('**/api/users', async route => {
    const method = route.request().method();
    if (method === 'POST')
      await route.fulfill({ status: 201, body: JSON.stringify({ id: 101, name: 'John Doe' }) });
    else if (method === 'GET')
      await route.fulfill({ body: JSON.stringify([{ id: 1, name: 'Alice' }]) });
    else if (method === 'PUT')
      await route.fulfill({ body: JSON.stringify({ id: 1, name: 'Updated User' }) });
    else if (method === 'DELETE')
      await route.fulfill({ status: 204 });
  });

  await page.goto('https://myapp.local/users');
  await page.click('button#create-user');
  await expect(page.locator('.toast')).toHaveText('User created!');
});
```

📘 *เทคนิค:* ใช้ `route.fulfill()` เพื่อ mock API ทั้งชุดได้แบบ end-to-end

---

## 🧾 3. Form Validation Example

```ts
test('E2E Form Validation', async ({ page }) => {
  await page.goto('https://www.w3schools.com/html/html_forms.asp');

  // กรอกข้อมูลไม่ครบ
  await page.fill('input[name=firstname]', '');
  await page.click('input[type=submit]');

  // ตรวจสอบ error message
  const alert = page.locator('.error-message');
  await expect(alert).toBeVisible();
});
```

📘 *แนะนำ:* ใช้ `expect(locator).toBeVisible()` แทนการตรวจด้วย text เดิม ๆ

---

## 📦 4. E-Commerce Checkout Flow

```ts
test('E2E Checkout Flow', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  // Login
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  // เพิ่มสินค้า
  await page.click('text=Add to cart');
  await page.click('.shopping_cart_link');

  // ดำเนินการ checkout
  await page.click('text=Checkout');
  await page.fill('#first-name', 'John');
  await page.fill('#last-name', 'Doe');
  await page.fill('#postal-code', '10110');
  await page.click('#continue');
  await page.click('#finish');

  // ตรวจสอบข้อความสำเร็จ
  await expect(page.getByText('Thank you for your order!')).toBeVisible();
});
```

📘 *เว็บไซต์ตัวอย่าง:* [https://www.saucedemo.com](https://www.saucedemo.com)

---

## 🌐 5. E2E Test + Mock API + Visual Check

```ts
test('E2E Dashboard with Mock & Screenshot', async ({ page }) => {
  await page.route('**/api/dashboard', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ stats: { sales: 1200, users: 88 } }),
    });
  });

  await page.goto('https://mydashboard.local/');
  await expect(page.locator('#sales')).toHaveText('1200');
  await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: true });
});
```

---

## 🧩 6. Upload + Download Flow

```ts
test('E2E Upload & Download', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles('tests/files/sample.txt');
  await page.click('#file-submit');
  await expect(page.locator('h3')).toHaveText('File Uploaded!');

  // Download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Download File'),
  ]);
  await download.saveAs('downloads/sample.txt');
});
```

---

## 🧠 7. การผสมผสาน Test หลายหน้า (Multi-page Flow)

```ts
test('E2E Multi-page Login & Dashboard', async ({ context }) => {
  const page1 = await context.newPage();
  await page1.goto('https://example.com/login');
  await page1.fill('#username', 'admin');
  await page1.fill('#password', '123456');
  await page1.click('#submit');

  const page2 = await context.newPage();
  await page2.goto('https://example.com/dashboard');
  await expect(page2.locator('h1')).toContainText('Welcome');
});
```

---

## 🧩 8. Combined E2E Flow + Trace + Report

```ts
test('E2E Trace Enabled', async ({ context, page }) => {
  await context.tracing.start({ screenshots: true, snapshots: true });
  await page.goto('https://saucedemo.com');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await page.waitForSelector('.inventory_item');
  await context.tracing.stop({ path: 'trace/checkout-trace.zip' });
});
```

📘 *แนะนำ:*  
เพิ่มใน `playwright.config.ts` → `trace: 'retain-on-failure'` เพื่อเก็บ trace ทุก test ที่ fail

---

## 📊 9. End-to-End Report Integration

ใน CI/CD ให้แนบ artifacts ทั้งหมด:
```yaml
- run: npx playwright test --reporter=html
- uses: actions/upload-artifact@v3
  with:
    name: e2e-results
    path: |
      playwright-report/
      screenshots/
      trace/
      videos/
```

---

## ✅ 10. แนวทางการออกแบบ E2E Test ที่ดี

| แนวทาง | รายละเอียด |
|---------|-------------|
| แยก test แต่ละ flow | เช่น login, checkout, form validation |
| ใช้ fixture เตรียม environment | เพื่อไม่ต้อง login ซ้ำทุก test |
| ใช้ mock API สำหรับ data ที่ไม่คงที่ | ลด flakiness |
| เพิ่ม screenshot / trace | เพื่อ debug test fail ได้ง่าย |
| สร้าง Page Object | แยก logic แต่ละหน้า |
| รันบนหลาย browser | เช่น Chromium + Firefox |
| ใช้ CI/CD | ให้ทดสอบอัตโนมัติทุกครั้งที่ deploy |

---

> 💬 **Tips มือโปร:**  
> - เริ่มจาก test flow หลักก่อน (login, dashboard, checkout) แล้วค่อยเพิ่ม test ย่อยภายหลัง  
> - เก็บ trace + video ทุกครั้งที่ fail เพื่อใช้ debug ย้อนหลัง  
> - ใช้ mock API เพื่อให้ทดสอบได้แม้ backend ยังไม่พร้อม  
> - ใช้ Visual Regression (`toHaveScreenshot`) เพื่อจับความเปลี่ยนแปลงของ UI อัตโนมัติ  
> - ใช้ POM + Fixtures เพื่อให้ test ควบคุมง่ายแม้ระบบใหญ่ขึ้น  

---
