# 🧠 บทที่ 13: Advanced Patterns (เทคนิคขั้นสูงใน Cypress)

บทนี้รวมแนวทางและเทคนิคการเขียน Test Cypress ระดับมืออาชีพ  
ที่ช่วยให้โค้ดมีความ “อ่านง่าย”, “ดูแลได้ง่าย”, “ปรับใช้ซ้ำได้”, และ “เสถียรแม้ในระบบใหญ่”

---

## 🧩 1. Custom Commands (เพิ่มคำสั่ง Cypress เอง)

สามารถสร้างคำสั่งใหม่ที่ใช้ซ้ำได้ทั่วทั้งโปรเจ็กต์ในไฟล์  
`cypress/support/commands.js`

```js
Cypress.Commands.add('login', (email, password) => {
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('button[type=submit]').click()
})
```

ใช้งานได้ทุกที่:
```js
cy.login('user@example.com', '123456')
```

> 💡 Custom commands ลดความซ้ำซ้อนของโค้ดในหลายไฟล์ test

---

## 🧱 2. Page Object Pattern (POP)

ออกแบบ test ให้แต่ละหน้าเว็บมีคลาสหรือโมดูลของตัวเอง  
ช่วยลดการเปลี่ยนโค้ดหลายที่เมื่อ UI เปลี่ยน

ตัวอย่าง: `cypress/pages/LoginPage.js`

```js
class LoginPage {
  visit() {
    cy.visit('/login')
  }

  fillEmail(email) {
    cy.get('#email').type(email)
  }

  fillPassword(password) {
    cy.get('#password').type(password)
  }

  submit() {
    cy.get('button[type=submit]').click()
  }
}

export default new LoginPage()
```

ใช้งานใน test:

```js
import LoginPage from '../pages/LoginPage'

describe('Login Flow', () => {
  it('ควรเข้าสู่ระบบสำเร็จ', () => {
    LoginPage.visit()
    LoginPage.fillEmail('user@example.com')
    LoginPage.fillPassword('123456')
    LoginPage.submit()
    cy.url().should('include', '/dashboard')
  })
})
```

---

## 🧠 3. ใช้ Fixtures สำหรับข้อมูลจำลอง (Mock Data)

สร้างไฟล์ `cypress/fixtures/users.json`

```json
{
  "admin": { "email": "admin@test.com", "password": "admin123" },
  "student": { "email": "student@test.com", "password": "stu456" }
}
```

ใช้งานใน test:
```js
cy.fixture('users').then((data) => {
  cy.login(data.admin.email, data.admin.password)
})
```

---

## 🔄 4. Mock API หลายแบบในไฟล์เดียว

```js
cy.intercept('GET', '/api/products', { fixture: 'products.json' }).as('getProducts')
cy.intercept('POST', '/api/order', { statusCode: 201, body: { success: true } }).as('createOrder')
cy.intercept('DELETE', '/api/cart/*', { statusCode: 204 }).as('deleteItem')
```

> ใช้ Fixtures เพื่อให้แต่ละ API มีข้อมูลจำลองที่อ่านง่ายและเปลี่ยนได้อิสระ

---

## 📦 5. Utility Functions (Helper Code)

ไฟล์: `cypress/support/utils.js`

```js
export const generateRandomEmail = () => `user_${Date.now()}@test.com`
export const generateId = () => Math.floor(Math.random() * 1000000)
```

ใช้งานใน test:
```js
import { generateRandomEmail } from '../support/utils'

cy.get('#email').type(generateRandomEmail())
```

---

## 💬 6. เขียน Test แบบ BDD (Behavior-Driven Development)

เพิ่มความชัดเจนด้วยรูปแบบ `Given–When–Then`

```js
describe('User Login Flow', () => {
  it('ควรเข้าสู่ระบบสำเร็จเมื่อกรอกข้อมูลถูกต้อง', () => {
    // Given
    cy.visit('/login')

    // When
    cy.get('#email').type('user@example.com')
    cy.get('#password').type('123456')
    cy.get('button[type=submit]').click()

    // Then
    cy.url().should('include', '/dashboard')
    cy.get('h1').should('contain', 'Welcome')
  })
})
```

> อ่านเข้าใจง่าย และใช้กับทีม non-technical ได้

---

## ⚙️ 7. Hooks (`before`, `after`, `beforeEach`, `afterEach`)

ใช้สำหรับตั้งค่าเริ่มต้นและเคลียร์ state ระหว่าง test

```js
before(() => {
  cy.log('เริ่มชุดทดสอบ')
})

beforeEach(() => {
  cy.visit('/login')
})

afterEach(() => {
  cy.clearCookies()
})

after(() => {
  cy.log('จบการทดสอบทั้งหมด')
})
```

---

## 📁 8. การแยก Environment หลายชุด

สร้างไฟล์:

```
cypress.env.dev.json
cypress.env.staging.json
cypress.env.prod.json
```

รันด้วย:
```bash
npx cypress run --env configFile=staging
```

ในไฟล์ `cypress.config.js`:

```js
const fs = require('fs')
const path = require('path')

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('cypress', 'env', `${file}.json`)
  return fs.existsSync(pathToConfigFile) ? require(pathToConfigFile) : {}
}

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      const file = config.env.configFile || 'dev'
      return getConfigurationByFile(file)
    },
  },
}
```

---

## 🔍 9. จัดการ Flaky Test (Test ไม่เสถียร)

### ใช้ Retry

เพิ่มใน `cypress.config.js`:
```js
e2e: {
  retries: 2  // retry 2 ครั้งเมื่อ test ล้มเหลว
}
```

### ใช้ Wait เฉพาะจำเป็น
```js
cy.get('.loader', { timeout: 10000 }).should('not.exist')
```

### ใช้ `.should()` แทน `.then()` เพื่อ auto-retry

```js
cy.get('.result').should('contain', 'Success')
```

---

## 🧠 10. ตัวอย่าง Project โครงสร้างขั้นสูง

```
cypress/
├── e2e/
│   ├── login.cy.js
│   ├── product.cy.js
│   └── checkout.cy.js
├── pages/
│   ├── LoginPage.js
│   ├── ProductPage.js
│   └── CheckoutPage.js
├── fixtures/
│   ├── users.json
│   └── products.json
├── support/
│   ├── commands.js
│   ├── utils.js
│   └── e2e.js
└── env/
    ├── dev.json
    ├── staging.json
    └── prod.json
```

---

## ✅ 11. สรุปแนวทาง Best Practice

| แนวทาง | ประโยชน์ |
|----------|-----------|
| ใช้ Page Object Pattern | ลดการซ้ำซ้อนของโค้ด |
| ใช้ Custom Commands | สร้างคำสั่งใช้ซ้ำในหลายไฟล์ |
| แยก Environment | รองรับ dev/staging/prod |
| ใช้ Fixture | จำลองข้อมูลที่สม่ำเสมอ |
| ใช้ Retry | ลดความไม่เสถียรของ test |
| เขียน Test แบบ BDD | อ่านเข้าใจง่ายโดยทีม non-dev |
| ใช้ Utility functions | สร้างข้อมูลจำลองอัตโนมัติ |

---

> 💬 **Tips มือโปร:**  
> - แยก logic ของแต่ละหน้าออกจากกันด้วย Page Object  
> - ใช้ `cy.fixture()` สำหรับข้อมูล mock ที่เปลี่ยนบ่อย  
> - ใช้ retry กับ test ที่มี animation หรือ loading delay  
> - ใช้ Cypress commands แทนการคัดลอกโค้ดซ้ำ ๆ  
> - เพิ่ม “debug logs” หรือ `cy.screenshot()` เมื่อเกิด error เพื่อตรวจสอบย้อนหลัง  

---
