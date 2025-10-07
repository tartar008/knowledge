🌿 **Cypress E2E Test Setup**

โครงการนี้ใช้ **Cypress** สำหรับการทดสอบอัตโนมัติแบบ End-to-End (E2E Testing) เพื่อจำลองการทำงานของผู้ใช้จริงบนหน้าเว็บ เช่น การล็อกอิน การกรอกฟอร์ม หรือการตรวจสอบผลลัพธ์

---

## 📚 Official Documentation

🔗 [Cypress Docs – Install Cypress](https://docs.cypress.io/app/get-started/install-cypress)

---

## 🌐 Web Test Examples

### 🧪 Test Site 1: Login Page
[https://practicetestautomation.com/practice-test-login/](https://practicetestautomation.com/practice-test-login/)

### 🧮 Test Site 2: Tracalorie App
[https://practice.expandtesting.com/tracalorie/](https://practice.expandtesting.com/tracalorie/)

---

## ⚙️ Installation

ติดตั้ง Cypress ด้วยคำสั่ง:

```bash
npm install cypress --save-dev
```

เปิด Cypress ครั้งแรก:

```bash
npx cypress open
```

ระบบจะสร้างโฟลเดอร์ `cypress/` พร้อมตัวอย่างไฟล์อัตโนมัติให้คุณ เช่น

```
cypress/
├── e2e/
│   ├── 1-getting-started/
│   ├── 2-advanced-examples/
│   └── todo.cy.js
├── fixtures/
├── support/
│   ├── commands.js
│   └── e2e.js
└── cypress.config.js
```

---

## 🗂️ สร้างโครงสร้างใหม่สำหรับ Test

### 1. สร้างโฟลเดอร์ใหม่
ไปที่ `cypress > e2e` และสร้างโฟลเดอร์:

```
Folder: 3-login
File:   login.cy.js
```

📁 โครงสร้างที่ได้:
```
cypress/
└── e2e/
    ├── 1-getting-started/
    ├── 2-advanced-examples/
    └── 3-login/
        └── login.cy.js
```

---

### 2. คัดลอกโค้ดจากไฟล์ตัวอย่าง
เปิดไฟล์ `todo.cy.js` แล้วคัดลอกโค้ดทั้งหมดมาวางใน `login.cy.js`

จากนั้น **ล้างโครงสร้างเก่าออก** เพื่อให้ได้โครงเริ่มต้นสะอาด ๆ ดังนี้:

```js
describe('Login Page Test', () => {
  beforeEach(() => {
    cy.visit('https://practicetestautomation.com/practice-test-login/');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('#username').type('student');
    cy.get('#password').type('Password123');
    cy.get('#submit').click();

    cy.url().should('include', '/logged-in-successfully');
    cy.get('h1').should('contain.text', 'Logged In Successfully');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('#username').type('wrongUser');
    cy.get('#password').type('wrongPass');
    cy.get('#submit').click();

    cy.get('#error').should('contain.text', 'Your username is invalid!');
  });
});
```

---

## 🧩 เพิ่มคำสั่งใน Support > commands.js

หากต้องการสร้างคำสั่ง custom เช่น `cy.login()` ให้เพิ่มในไฟล์ `cypress/support/commands.js`

```js
Cypress.Commands.add('login', (username, password) => {
  cy.visit('https://practicetestautomation.com/practice-test-login/');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('#submit').click();
});
```

จากนั้นสามารถเรียกใช้ใน test ได้ง่าย ๆ:

```js
it('should login using custom command', () => {
  cy.login('student', 'Password123');
  cy.url().should('include', '/logged-in-successfully');
});
```

---

## ▶️ Run Tests

### เปิด Cypress GUI
```bash
npx cypress open
```
เลือกไฟล์ `3-login/login.cy.js` เพื่อรันทดสอบผ่าน GUI

### หรือรันทดสอบผ่าน CLI
```bash
npx cypress run --spec "cypress/e2e/3-login/login.cy.js"
```

---

## 💡 Tips

- ใช้ `cy.get(selector).should('be.visible')` เพื่อรอ element อย่างปลอดภัย
- ใช้ `cy.intercept()` สำหรับ mock API หรือควบคุม response
- จัดโครงสร้างโฟลเดอร์ test ตามหมวด เช่น `auth/`, `dashboard/`, `orders/`
- หากทดสอบหลาย browser สามารถตั้งค่าได้ใน `cypress.config.js`

---

## 🔗 Resources
- 🧭 [Cypress Official Docs](https://docs.cypress.io)
- 🎯 [Practice Test Automation Login](https://practicetestautomation.com/practice-test-login/)
- 🧮 [Expand Testing – Tracalorie App](https://practice.expandtesting.com/tracalorie/)

---

✅ **พร้อมใช้งานแล้ว!**  
เปิด Cypress ขึ้นมา แล้วรัน test ของคุณเพื่อดูการทำงานจริงได้ทันที 🚀

