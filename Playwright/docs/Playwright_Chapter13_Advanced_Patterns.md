# 🧠 Advanced Patterns (เทคนิคขั้นสูงในการเขียน Test ด้วย Playwright)

บทนี้จะรวมแนวทางและเทคนิคระดับมืออาชีพ ที่ช่วยให้การเขียนและดูแล Playwright Test ง่ายขึ้นเมื่อโปรเจกต์ใหญ่ขึ้น

---

## 🧩 1. Page Object Model (POM)

POM คือแนวคิดที่แยก “การทำงานของหน้าเว็บ” ออกจาก “การทดสอบ”  
เพื่อให้โค้ดสะอาด, reuse ได้ และบำรุงรักษาง่าย

### 🔹 โครงสร้างโฟลเดอร์แนะนำ
```
tests/
├── pages/
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── base.page.ts
├── specs/
│   ├── login.spec.ts
│   └── dashboard.spec.ts
└── utils/
    └── helpers.ts
```

---

### 🔹 ตัวอย่าง base.page.ts
```ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(url: string) {
    await this.page.goto(url);
  }

  async getTitle() {
    return this.page.title();
  }
}
```

---

### 🔹 ตัวอย่าง login.page.ts
```ts
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private username = this.page.locator('#username');
  private password = this.page.locator('#password');
  private submitBtn = this.page.locator('#submit');

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submitBtn.click();
  }
}
```

---

### 🔹 ตัวอย่าง login.spec.ts
```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('login success', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate('https://example.com/login');
  await loginPage.login('student', 'Password123');
  await expect(page).toHaveURL(/dashboard/);
});
```

📘 *ประโยชน์ของ POM:*  
- แก้ไข selector ครั้งเดียวทุกที่ในไฟล์เดียว  
- ทำให้ test script อ่านง่ายขึ้น  
- สนับสนุน reuse ได้หลาย scenario

---

## 🧱 2. Fixtures (การจัดการข้อมูลก่อนและหลังการทดสอบ)

Fixtures ใช้สร้าง “สภาพแวดล้อม” ก่อนรันทดสอบ เช่น login, mock data, หรือเปิดหน้าเว็บล่วงหน้า

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('https://example.com/login');
    await use(loginPage);
  },
});
```

แล้วใช้ใน test:
```ts
test('use fixture', async ({ loginPage }) => {
  await loginPage.login('admin', '123456');
});
```

---

## 🧠 3. Reusable Utilities

เก็บโค้ดช่วยเหลือ เช่น date formatter, API caller, หรือ random data generator

```ts
// utils/helpers.ts
export const randomEmail = () => `user_${Date.now()}@example.com`;
export const delay = ms => new Promise(res => setTimeout(res, ms));
```

ใช้ใน test:
```ts
import { randomEmail } from '../utils/helpers';
await page.fill('#email', randomEmail());
```

---

## 🧩 4. Dynamic Mocking (จำลอง API ตามเงื่อนไข)

```ts
await page.route('**/api/user', route => {
  const url = route.request().url();
  if (url.includes('admin')) {
    route.fulfill({ body: JSON.stringify({ role: 'admin' }) });
  } else {
    route.fulfill({ body: JSON.stringify({ role: 'guest' }) });
  }
});
```

---

## 🧭 5. การจัดการ Test Data (Data-driven Test)

สามารถใช้ JSON หรือ CSV เพื่อขับเคลื่อนการทดสอบหลายชุดข้อมูล

```ts
import users from '../data/users.json';

for (const user of users) {
  test(`login with ${user.role}`, async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.fill('#username', user.username);
    await page.fill('#password', user.password);
    await page.click('#submit');
    await expect(page.locator('h1')).toContainText('Welcome');
  });
}
```

📘 *ข้อดี:* ลดการซ้ำโค้ดและขยาย test ได้ง่าย

---

## 🧾 6. Parallel Fixture Composition

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('https://example.com');
});
test.afterEach(async ({ page }) => {
  await page.close();
});
```

ใช้ร่วมกับ POM และ Fixture เพื่อสร้างโครง test ที่สะอาดและสั้นลง

---

## 💡 7. เทคนิคจัดการ Environment หลายแบบ

ตั้งค่า base URL ใน `playwright.config.ts`:
```ts
use: {
  baseURL: process.env.BASE_URL || 'https://staging.example.com',
}
```
จากนั้นใน test:
```ts
await page.goto('/login'); // จะเติม baseURL อัตโนมัติ
```

---

## 🧩 8. การเขียน Custom Command

สร้าง wrapper function ที่ใช้บ่อย

```ts
export async function login(page, username, password) {
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#submit');
}
```
ใช้ใน test:
```ts
import { login } from '../utils/customCommands';
await login(page, 'admin', 'password123');
```

---

## 🧠 9. การแยก Config ตาม Environment

```bash
playwright.config.dev.ts
playwright.config.prod.ts
```

```ts
// playwright.config.dev.ts
export default defineConfig({
  use: { baseURL: 'https://dev.example.com' }
});
```

รันด้วย:
```bash
npx playwright test -c playwright.config.prod.ts
```

---

## 🧩 10. การใช้ Global Setup/Teardown

ใช้สำหรับเตรียม environment ก่อนรันทั้งหมด

```ts
// global-setup.ts
export default async config => {
  console.log('🚀 Setting up environment...');
};

// global-teardown.ts
export default async config => {
  console.log('🧹 Cleaning up environment...');
};
```

และเพิ่มใน config:
```ts
globalSetup: './global-setup',
globalTeardown: './global-teardown',
```

---

## ✅ 11. สรุปเทคนิคที่แนะนำ

| เทคนิค | ประโยชน์ |
|----------|-----------|
| Page Object Model | โค้ด test สะอาดและ reuse ได้ |
| Fixtures | สร้าง environment ล่วงหน้า |
| Utility Functions | ลดโค้ดซ้ำ |
| Dynamic Mock | ทดสอบเงื่อนไข API หลากหลาย |
| Data-driven | รันทดสอบหลายชุดข้อมูล |
| Env Config | แยก dev/staging/prod ได้สะดวก |
| Global Setup | เตรียมสภาพแวดล้อมก่อนรัน |

---

> 💬 **Tips มือโปร:**  
> - ใช้ POM + Fixture รวมกัน จะช่วยลดความซับซ้อนของ test ขนาดใหญ่ได้มาก  
> - สร้าง “Test Helper” กลางไว้สำหรับ logic ที่ใช้ซ้ำบ่อย เช่น login หรือ upload file  
> - ใช้ data-driven test เมื่อมีเงื่อนไขหลายแบบ เช่น user roles หรือ input validation  
> - ใช้ global setup เพื่อเตรียม mock server หรือ seed data ใน database ก่อนรันทั้งหมด  

---
