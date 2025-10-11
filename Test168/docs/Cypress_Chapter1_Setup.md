# 📦 บทที่ 1: Setup & Configuration (การติดตั้งและตั้งค่า Cypress)

Cypress เป็น framework สำหรับ **End-to-End Testing (E2E)** ที่เน้นการใช้งานง่ายและผลลัพธ์ชัดเจน  
บทนี้จะอธิบายวิธีติดตั้ง, ตั้งค่า, และเตรียมโครงสร้างโปรเจกต์สำหรับ Cypress ตั้งแต่ต้นจนพร้อมรันจริง

---

## 🚀 1. ติดตั้ง Cypress

### 🔹 วิธีที่ 1: ผ่าน npm (แนะนำ)

```bash
npm install cypress --save-dev
```

```bash
npm install cypress@15.2.0
```

### 🔹 วิธีที่ 2: ผ่าน yarn

```bash
yarn add cypress --dev
```

### 🔹 วิธีที่ 3: ติดตั้งแบบ global

```bash
npm install -g cypress
```

### ตรวจสอบเวอร์ชัน

```bash
npx cypress --version
```

---

## 🧱 2. โครงสร้างโปรเจกต์ Cypress

หลังจากติดตั้งเสร็จ ให้เปิด Cypress ครั้งแรก:

```bash
npx cypress open
```

Cypress จะสร้างโฟลเดอร์พื้นฐานให้โดยอัตโนมัติ เช่น

```
cypress/
├── e2e/                 # เก็บไฟล์ test หลัก (.cy.js / .cy.ts)
├── fixtures/             # ข้อมูล mock (เช่น JSON)
├── support/              # ฟังก์ชันเสริม เช่น custom commands
├── downloads/            # (สร้างอัตโนมัติเมื่อทดสอบดาวน์โหลดไฟล์)
└── cypress.config.js     # ไฟล์ตั้งค่า Cypress
```

---

## ⚙️ 3. ไฟล์ `cypress.config.js`

```js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://example.com",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    retries: 1,
    setupNodeEvents(on, config) {
      // ใช้เพิ่ม plugin หรือ event handler
      return config;
    },
  },
});
```

📘 *คำอธิบาย:*

| ตัวเลือก | ความหมาย |
|-----------|-----------|
| `baseUrl` | URL หลักของเว็บที่ต้องการทดสอบ |
| `viewportWidth/Height` | ขนาดหน้าจอ |
| `video` | บันทึกวิดีโอการรัน test |
| `screenshotOnRunFailure` | ถ่ายภาพเมื่อ test ล้มเหลว |
| `retries` | จำนวนครั้งที่ rerun เมื่อ fail |
| `setupNodeEvents()` | ใช้สำหรับเชื่อม plugin หรือ event |

---

## 🌐 4. การเปิด Cypress แบบ GUI (Interactive Mode)

```bash
npx cypress open
```

จะเปิด Cypress Test Runner แบบ GUI  
คุณสามารถเลือก test แล้วดู browser เปิดรันทันทีได้

### 🔹 GUI Mode (E2E)
- มี Preview Browser (Chrome, Edge, Firefox)  
- แสดงคำสั่งแบบเรียลไทม์ด้านซ้าย  
- สามารถ pause/step แต่ละคำสั่งได้  
- แสดง log ของ network / console ได้

---

## 💻 5. การรันแบบ CLI (Headless Mode)

ใช้ใน CI/CD หรือเมื่อไม่ต้องการเปิดหน้าต่าง GUI

```bash
npx cypress run
```

หรือรันเฉพาะ browser ใด browser หนึ่ง:

```bash
npx cypress run --browser chrome
```

📘 *ผลลัพธ์:* จะได้วิดีโอและสกรีนช็อตในโฟลเดอร์ `cypress/videos` และ `cypress/screenshots`

---

## 🧩 6. การใช้ TypeScript

Cypress รองรับ TypeScript โดยตรง

```bash
npm install --save-dev typescript @cypress/webpack-preprocessor
```

จากนั้นเพิ่มไฟล์ `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "strict": true,
    "types": ["cypress"]
  },
  "include": ["**/*.cy.ts"]
}
```

---

## 🧠 7. Fixtures (ข้อมูลจำลอง)

ไฟล์ใน `cypress/fixtures/` ใช้เก็บข้อมูล mock เช่น JSON สำหรับทดสอบ API หรือฟอร์ม

```json
// cypress/fixtures/user.json
{
  "username": "student",
  "password": "Password123"
}
```

ใช้ใน test ได้ดังนี้:

```js
cy.fixture("user").then((user) => {
  cy.get("#username").type(user.username);
  cy.get("#password").type(user.password);
});
```

---

## 🔧 8. Custom Commands

สามารถเพิ่มคำสั่งของเราเองใน `cypress/support/commands.js`

```js
Cypress.Commands.add("login", (username, password) => {
  cy.get("#username").type(username);
  cy.get("#password").type(password);
  cy.get("button[type=submit]").click();
});
```

ใช้ใน test:
```js
cy.login("student", "Password123");
```

---

## 🧱 9. Environment Variables

ตั้งค่า environment variable ได้หลายวิธี

### ใน `cypress.config.js`:

```js
env: {
  username: "student",
  password: "Password123"
}
```

### หรือผ่าน CLI:

```bash
npx cypress run --env username=student,password=Password123
```

อ่านค่าใน test:

```js
cy.log(Cypress.env("username"));
```

---

## 🌐 10. ตั้งค่า Base URL

เมื่อมี `baseUrl` แล้ว สามารถเรียกหน้าเว็บโดยใช้ path ได้เลย:

```js
cy.visit("/login"); // จะเข้า https://example.com/login
```

---

## ⚡ 11. การเชื่อม Plugin เพิ่มเติม

ตัวอย่างการใช้ plugin เช่น **cypress-file-upload**:

```bash
npm install --save-dev cypress-file-upload
```

และเพิ่มใน `commands.js`:
```js
import 'cypress-file-upload';
```

---

## 🧩 12. การรันบนหลาย Browser

รองรับ browser หลักทั้งหมด: `chrome`, `edge`, `firefox`, `electron`

```bash
npx cypress run --browser firefox
```

---

## 🧾 13. การดูรายงานผล (Reports)

หลังจากรันเสร็จ จะได้ไฟล์ report HTML อัตโนมัติ  
หรือสามารถใช้ plugin เพิ่มเช่น `mochawesome`:

```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

แล้วเพิ่ม reporter ใน config:
```js
reporter: 'mochawesome',
reporterOptions: {
  reportDir: 'cypress/reports',
  overwrite: false,
  html: true,
  json: true
}
```

---

## ✅ 14. สรุปคำสั่งหลัก

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| ติดตั้ง Cypress | `npm install cypress --save-dev` | ติดตั้ง Cypress |
| เปิด GUI | `npx cypress open` | เปิด Test Runner |
| รัน CLI | `npx cypress run` | รันแบบ headless |
| เปิดด้วย browser เฉพาะ | `--browser chrome` | เลือก browser |
| กำหนด env | `--env key=value` | ตั้งค่าตัวแปร |
| ตั้งค่า baseUrl | `baseUrl: "https://example.com"` | URL หลัก |
| ใช้ fixture | `cy.fixture('user')` | โหลด mock data |
| ใช้ command | `Cypress.Commands.add()` | เพิ่มคำสั่ง custom |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `npx cypress open` ในช่วงพัฒนา เพื่อดู test แบบ visual  
> - เก็บ config ไว้ในไฟล์เดียว เช่น `cypress.config.js` เพื่อจัดการง่ายใน CI/CD  
> - ใช้ `fixtures/` เพื่อแยก mock data ออกจาก test logic  
> - ใช้ `custom commands` เพื่อ reuse action เช่น login หรือ upload file  
> - ตั้ง `baseUrl` เพื่อไม่ต้องพิมพ์ URL เต็มในทุก test  

---
