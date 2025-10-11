# 📦 Setup & Configuration (การติดตั้งและตั้งค่า)

Playwright เป็นเฟรมเวิร์กสำหรับการทดสอบแบบ End-to-End (E2E Testing)  
ที่พัฒนาโดย Microsoft รองรับทั้ง Chromium, Firefox และ WebKit  

---

## ⚙️ 1. การติดตั้งเบื้องต้น

### 🔹 ติดตั้งผ่าน npm
```bash
npm init playwright@latest
```
- คำสั่งนี้จะสร้างโครงสร้างโฟลเดอร์ทดสอบให้พร้อม
- พร้อมติดตั้ง Browser ที่รองรับโดยอัตโนมัติ
- ถ้าอยากติดตั้งเฉพาะ Browser ที่ต้องการ:
  ```bash
  npx playwright install chromium
  ```

---

## 📁 2. โครงสร้างโปรเจกต์มาตรฐาน

หลังติดตั้งสำเร็จ จะได้โครงสร้างไฟล์แบบนี้:
```
.
├── tests/
│   ├── example.spec.ts
│   └── login.spec.ts
├── playwright.config.ts
├── package.json
└── README.md
```

**อธิบายแต่ละส่วน:**
| ไฟล์ | หน้าที่ |
|------|----------|
| `tests/` | เก็บชุด test ทั้งหมด |
| `playwright.config.ts` | ไฟล์ตั้งค่า (เช่น browser, timeout, reporter) |
| `package.json` | ใช้เก็บ dependencies |
| `README.md` | เอกสารประกอบ |

---

## 🧠 3. การรันทดสอบ

```bash
npx playwright test
```

รันด้วย UI (Interactive Mode):
```bash
npx playwright test --ui
```

รันเฉพาะ Browser ที่ต้องการ:
```bash
npx playwright test --project=chromium
```

รันเฉพาะ test ที่มีชื่อ:
```bash
npx playwright test -g "login"
```

---

## ⚙️ 4. ตัวอย่าง `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: 'https://example.com',
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
  ],
  reporter: [['html', { outputFolder: 'playwright-report' }]],
});
```

📘 *คำอธิบายสำคัญ:*
- `timeout` = เวลารอสูงสุดต่อ test
- `use` = ตั้งค่าพื้นฐาน เช่น headless, screenshot, video
- `projects` = รันบนหลาย browser พร้อมกัน
- `reporter` = รูปแบบรายงานผล เช่น HTML, JSON, List

---

## 🧩 5. การรันแบบโหมด Debug

ใช้โหมด debug เพื่อหยุดและตรวจสอบทีละขั้นตอน:
```bash
npx playwright test --debug
```

หรือเพิ่มในโค้ด:
```ts
await page.pause();
```

---

## 💡 6. การติดตั้งเสริมสำหรับ VSCode

ติดตั้ง Extension:
- ✅ **Playwright Test for VSCode**  
  - เปิดไฟล์ `.spec.ts` แล้วกด ▶️ เพื่อรันเฉพาะ test  
  - มี UI แสดง browser และ trace  
- ✅ **ESLint + Prettier**  
  เพื่อจัดรูปแบบโค้ดให้อ่านง่ายและได้มาตรฐาน

---

## 🚀 7. การเพิ่ม Script ใน package.json

```json
{
  "scripts": {
    "test": "npx playwright test",
    "test:ui": "npx playwright test --ui",
    "test:debug": "npx playwright test --debug"
  }
}
```

---

## ✅ สรุป

| หมวด | คำสั่งหลัก | หมายเหตุ |
|-------|--------------|-----------|
| ติดตั้ง | `npm init playwright@latest` | ตั้งค่าอัตโนมัติ |
| รันทั้งหมด | `npx playwright test` | รันทุก test ในโฟลเดอร์ |
| เปิดโหมด UI | `npx playwright test --ui` | ดูสถานะ test แบบ visual |
| Debug | `npx playwright test --debug` | เปิด DevTools ของ Playwright |
| รันเฉพาะ Browser | `--project=firefox` | เลือก browser ได้ |

---

> 💬 **Tip:**  
> - ใช้ `npx playwright install --with-deps` หากเจอ error ตอนติดตั้งใน Linux  
> - ใช้ `playwright codegen <url>` เพื่อให้ระบบ generate test อัตโนมัติจากการคลิกจริงใน browser  

---
