🎭 **Playwright Test Setup**

โครงการนี้ใช้ **Playwright** สำหรับการทดสอบอัตโนมัติแบบ End-to-End (E2E Testing)

---

## ⚙️ Installation

ติดตั้ง Playwright ด้วยคำสั่ง:

```bash
npm init playwright@latest
```

ระหว่างติดตั้ง ระบบจะถามให้เลือก:
- **Browser** ที่ต้องการใช้ (เช่น Chromium, Firefox, WebKit)
- **Framework** (เช่น Test Runner)
- การสร้างโครงสร้างไฟล์พื้นฐานสำหรับการทดสอบ

---

## ▶️ Run Tests

เมื่อพร้อมแล้ว ให้รันการทดสอบด้วย **UI Mode**:

```bash
npx playwright test --ui
```

หรือหากต้องการรันทดสอบทั้งหมดในโหมด CLI ปกติ:

```bash
npx playwright test
```

---

## 📂 Project Structure (ทั่วไป)

```
.
├── tests/
│   ├── example.spec.ts
│   └── ...
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 🔑 คำสั่งหลักใน Playwright

### 1. การจัดการหน้าเว็บ
```js
await page.goto('https://example.com');   // เปิดเว็บ
await page.reload();                      // โหลดหน้าใหม่
await page.goBack();                      // กลับไปหน้าก่อน
await page.goForward();                   // ไปหน้าถัดไป
```

### 2. การหากับ Element
```js
// By label (input ที่มี label ตรงกัน)
await page.getByLabel('Username').fill('student');

// By role (ตาม aria-role เช่น button, heading, link)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('heading', { name: 'Welcome' });

// By text
await page.getByText('Hello world').click();

// By CSS selector
await page.locator('#username').fill('student');
await page.locator('.error-message');

// By XPath
await page.locator('//h1[text()="Welcome"]');
```

### 3. การกรอกข้อมูล
```js
await page.fill('#username', 'student');   // ใส่ค่า
await page.type('#username', 'student');   // พิมพ์ทีละตัว
await page.press('#username', 'Enter');    // กดปุ่ม
```

### 4. การ Assert (ตรวจสอบผล)
> ✅ ใช้ `await expect(locator)` เสมอ เพื่อรอจนเงื่อนไขเป็นจริง

```js
// ตรวจสอบ URL
await expect(page).toHaveURL('https://example.com/dashboard');

// ตรวจสอบ Title
await expect(page).toHaveTitle('Dashboard Page');

// ตรวจสอบว่า element แสดงอยู่
await expect(page.getByRole('heading', { name: 'Logged In Successfully' })).toBeVisible();

// ตรวจสอบว่า element มีข้อความ
await expect(page.locator('#error')).toHaveText('Your password is invalid!');

// ตรวจสอบ attribute
await expect(page.locator('#submit')).toHaveAttribute('type', 'submit');
```

### 5. การรอ (Wait)
```js
await page.waitForTimeout(2000);         // รอ 2 วินาที (ไม่แนะนำ)
await page.waitForSelector('#username'); // รอจน element ปรากฏ
```

### 6. Utility สำหรับ Test
```js
test.beforeEach(async ({ page }) => {
  await page.goto('https://example.com/login');
});

test.afterEach(async ({ page }) => {
  await page.close();
});

test.skip('ข้าม test นี้', async ({ page }) => {
  // ...
});

test.only('รันเฉพาะ test นี้', async ({ page }) => {
  // ...
});
```

---

## 💡 Tip
- ใช้ `await expect()` แทนการรอด้วย `waitForTimeout` เพื่อให้ test เสถียรกว่า
- ใช้ `page.pause()` เพื่อ debug test ผ่าน UI Mode ได้ง่ายขึ้น

---

📘 เอกสารเพิ่มเติม: [https://playwright.dev/docs](https://playwright.dev/docs)

