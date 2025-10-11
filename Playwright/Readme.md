# 🎭 Playwright Test Guide (TH Edition)

โครงการนี้ใช้ **[Playwright](https://playwright.dev/)** สำหรับการทดสอบอัตโนมัติ (End-to-End Testing)  
รองรับ **Chromium, Firefox, WebKit** และสามารถใช้ได้กับ **TypeScript / JavaScript**

---

## ⚙️ Installation

ติดตั้ง Playwright และ browser ด้วยคำสั่ง:

```bash
npm init playwright@latest
```

จากนั้นเลือก Browser และ Framework ที่ต้องการใช้

รันทดสอบได้สองแบบ:
```bash
# รันทดสอบทั้งหมดใน CLI
npx playwright test

# เปิด UI Mode เพื่อดู test แบบ interactive
npx playwright test --ui
```

---

## 📂 Project Structure (โดยทั่วไป)

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

## 🔹 การจัดการหน้าเว็บ (Page Navigation)

```ts
await page.goto('https://example.com');   // เปิดเว็บ
await page.reload();                      // โหลดหน้าใหม่
await page.goBack();                      // กลับไปหน้าก่อน
await page.goForward();                   // ไปหน้าถัดไป
await page.waitForLoadState('domcontentloaded');
await page.waitForURL(/dashboard/);
await page.screenshot({ path: 'screenshot.png' });
```

---

## 🔹 การหากับ Element (Locators & Actions)

### ✅ By Label / Role / Text
```ts
await page.getByLabel('Username').fill('student');
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByText('Hello world').click();
```

### ✅ By CSS / XPath / Test ID
```ts
await page.locator('#username').fill('student');
await page.locator('.error-message');
await page.locator('//h1[text()="Welcome"]');
await page.getByTestId('login-form');
```

### ✅ การจัดการ Element หลายตัว
```ts
const items = page.locator('.menu-item');
await expect(items).toHaveCount(5);
await items.nth(2).click();
```

---

## 🔹 การกรอกข้อมูล (Forms & Inputs)

```ts
await page.fill('#username', 'student');
await page.fill('#password', 'Password123');
await page.press('#password', 'Enter');

await page.selectOption('#country', 'TH');    // เลือกจาก select box
await page.check('#remember');                // ติ๊ก checkbox
await page.uncheck('#remember');              // เอาติ๊กออก
await page.click('text=Submit');              // คลิกปุ่มด้วย text
await page.keyboard.type('Hello World');      // พิมพ์ด้วย keyboard
await page.keyboard.press('Tab');             // กด Tab
```

---

## 🔹 การ Assert (ตรวจสอบผล)

ใช้ `await expect(locator)` เสมอ เพื่อรอจนเงื่อนไขเป็นจริง:

```ts
await expect(page).toHaveURL('https://example.com/dashboard');
await expect(page).toHaveTitle('Dashboard Page');
await expect(page.getByRole('heading', { name: 'Logged In Successfully' })).toBeVisible();
await expect(page.locator('#error')).toHaveText('Your password is invalid!');
await expect(page.locator('#submit')).toHaveAttribute('type', 'submit');
await expect(page.locator('.price')).toContainText('$');
await expect(page.locator('input')).toBeEnabled();
```

---

## 🔹 การอัปโหลด / ดาวน์โหลดไฟล์ (Files)

```ts
// Upload
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('tests/files/sample.pdf');

// Download
const [ download ] = await Promise.all([
  page.waitForEvent('download'),
  page.click('text=Download')
]);
const path = await download.path();
console.log('Downloaded to', path);
```

---

## 🔹 การรอ (Waiting Strategies)

```ts
await page.waitForSelector('#username');
await page.waitForResponse('**/api/login');
await page.waitForLoadState('networkidle');
await expect(page.locator('#success')).toBeVisible();

// (ไม่แนะนำ) รอแบบตายตัว
await page.waitForTimeout(2000);
```

---

## 🔹 การ Debug และ Visual Trace

```ts
await page.pause();   // เปิด Debug UI
```

ดู Trace ภายหลัง:
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

---

## 🔹 การใช้งานร่วมกับ Test Hooks

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
});

test('login success', async ({ page }) => {
  await page.fill('#username', 'student');
  await page.fill('#password', 'Password123');
  await page.click('#submit');
  await expect(page).toHaveURL(/logged-in-successfully/);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
```

---

## 🔹 ตัวอย่างจริง: Login Test (เว็บทดลองจริง)

🧪 ทดสอบเว็บ:  
[https://practicetestautomation.com/practice-test-login/](https://practicetestautomation.com/practice-test-login/)

```ts
import { test, expect } from '@playwright/test';

test('🔐 Login Success', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  
  await page.getByLabel('Username').fill('student');
  await page.getByLabel('Password').fill('Password123');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Logged In Successfully')).toBeVisible();
  await expect(page).toHaveURL(/logged-in-successfully/);
});

test('🚫 Login Fail', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  
  await page.getByLabel('Username').fill('wronguser');
  await page.getByLabel('Password').fill('wrongpass');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Your username is invalid!')).toBeVisible();
});
```

---

## 🔹 ตัวอย่างจริง: Upload File + Assert (Herokuapp)

🧪 เว็บ: [https://the-internet.herokuapp.com/upload](https://the-internet.herokuapp.com/upload)

```ts
import { test, expect } from '@playwright/test';

test('📂 Upload file successfully', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles('tests/files/sample.txt');
  await page.click('#file-submit');
  await expect(page.locator('h3')).toHaveText('File Uploaded!');
});
```

---

## 💡 Tips มือโปร

| ฟังก์ชัน | ใช้เมื่อ | ตัวอย่าง |
|-----------|-----------|-----------|
| `page.pause()` | Debug แบบ Step-by-Step | ดู DOM และ Actions สดๆ |
| `page.locator().nth()` | จัดการ element ซ้ำ | `await page.locator('li').nth(2).click()` |
| `page.route()` | ดักและจำลอง API | Mock response ได้ |
| `page.context().storageState()` | เก็บ session | ใช้ login shared ระหว่าง test |
| `test.skip()` / `test.only()` | ควบคุมการรัน | ข้ามหรือรันเฉพาะ test |

---

## 📚 เพิ่มเติมที่ควรเรียนรู้
- 🔗 Mock API & Network interception  
- 🔗 การทดสอบ Multi-tab / Popup  
- 🔗 Session Reuse (login ครั้งเดียวใช้หลาย test)  
- 🔗 Visual Comparison Test (เปรียบเทียบภาพหน้าจอ)

---

> 💬 Tip:  
> ใช้ `await expect()` แทน `waitForTimeout()` เพื่อให้ test เสถียร  
> ใช้ `page.pause()` เพื่อ debug ผ่าน UI Mode ได้ง่าย  
> เขียน test เป็นกลุ่มๆ (`describe`) เพื่อจัดระเบียบโครงสร้าง test ได้ดีขึ้น

---

**Playwright — The Modern Testing Framework for Modern Web**
