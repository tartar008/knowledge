# 🔥 บทที่ 15: End-to-End Examples (รวมตัวอย่างการทดสอบครบชุด)

บทนี้รวบรวมตัวอย่าง **E2E Test (End-to-End)** ที่ใช้งานได้จริง  
เพื่อให้เห็นภาพรวมของ Cypress ตั้งแต่เริ่มต้นจนถึงขั้นตอนการทดสอบระบบทั้งหมด

---

## 🧭 1. ตัวอย่าง Login + Dashboard + Logout Flow

```js
describe('User Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('เข้าสู่ระบบสำเร็จและออกจากระบบได้', () => {
    // --- Login ---
    cy.get('#email').type('student@example.com')
    cy.get('#password').type('password123')
    cy.get('button[type=submit]').click()

    // --- Dashboard ---
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Student').should('be.visible')

    // --- Logout ---
    cy.get('#logout').click()
    cy.url().should('include', '/login')
  })
})
```

> 💡 ตัวอย่างนี้ครอบคลุมการกรอกฟอร์ม, การตรวจสอบ URL, และการยืนยันข้อความบนหน้าจอ

---

## 🛒 2. ตัวอย่าง E-Commerce (Search + Add to Cart + Checkout)

```js
describe('E-Commerce Flow', () => {
  beforeEach(() => {
    cy.visit('/shop')
  })

  it('ค้นหาสินค้า เพิ่มลงตะกร้า และ Checkout', () => {
    // --- ค้นหา ---
    cy.get('#search').type('Laptop{enter}')
    cy.get('.product-card').should('have.length.greaterThan', 0)

    // --- เพิ่มลงตะกร้า ---
    cy.get('.product-card').first().within(() => {
      cy.contains('Add to Cart').click()
    })

    // --- เปิดตะกร้า ---
    cy.get('#cart-icon').click()
    cy.url().should('include', '/cart')
    cy.get('.cart-item').should('have.length', 1)

    // --- Checkout ---
    cy.get('button#checkout').click()
    cy.url().should('include', '/checkout')
    cy.get('#confirm').click()
    cy.get('.success-message').should('contain', 'Order placed successfully!')
  })
})
```

> 🧩 ใช้คำสั่งพื้นฐานหลายอย่าง เช่น `.within()`, `.first()`, และการตรวจสอบจำนวน element

---

## 🧠 3. ตัวอย่าง CRUD Application (API Integration)

```js
describe('CRUD API Test', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/users').as('getUsers')
    cy.visit('/users')
    cy.wait('@getUsers')
  })

  it('สร้าง แก้ไข และลบข้อมูลผู้ใช้', () => {
    // --- Create ---
    cy.get('#createUser').click()
    cy.get('#name').type('John Doe')
    cy.get('#email').type('john@example.com')
    cy.get('button[type=submit]').click()
    cy.contains('User created successfully').should('be.visible')

    // --- Update ---
    cy.get('.user-row').first().within(() => {
      cy.contains('Edit').click()
    })
    cy.get('#name').clear().type('John Updated')
    cy.get('button[type=submit]').click()
    cy.contains('User updated successfully').should('be.visible')

    // --- Delete ---
    cy.get('.user-row').first().within(() => {
      cy.contains('Delete').click()
    })
    cy.on('window:confirm', () => true)
    cy.contains('User deleted').should('be.visible')
  })
})
```

> 💡 ตัวอย่างนี้จำลอง API จริงด้วย `cy.intercept()` และจัดการทุกขั้นตอนของ CRUD

---

## 📂 4. ตัวอย่าง Upload / Download ไฟล์

```js
import 'cypress-file-upload'

describe('File Upload/Download', () => {
  it('อัปโหลดและดาวน์โหลดไฟล์ได้สำเร็จ', () => {
    // --- Upload ---
    cy.visit('/upload')
    cy.get('input[type=file]').attachFile('sample.pdf')
    cy.contains('Upload successful').should('be.visible')

    // --- Download ---
    cy.visit('/download')
    cy.get('a#downloadLink').click()
    cy.readFile('cypress/downloads/sample.pdf').should('exist')
  })
})
```

> ใช้ Plugin `cypress-file-upload` และ `cy.readFile()` เพื่อตรวจสอบไฟล์ในเครื่อง

---

## 🌐 5. ตัวอย่าง Network Mock + Error Handling

```js
describe('Mock API Error Handling', () => {
  it('ตรวจสอบการแสดงข้อความ error เมื่อ API ล้มเหลว', () => {
    cy.intercept('GET', '/api/data', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('getData')

    cy.visit('/data')
    cy.wait('@getData')
    cy.get('.error-message').should('contain', 'Internal Server Error')
  })
})
```

> 🧠 ใช้ `cy.intercept()` เพื่อจำลอง error และทดสอบการแสดงข้อความในหน้าเว็บ

---

## 🧩 6. ตัวอย่าง Visual Regression + Responsive

```js
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command'
addMatchImageSnapshotCommand()

describe('Visual Snapshot', () => {
  const viewports = ['macbook-15', 'ipad-2', 'iphone-x']

  viewports.forEach((size) => {
    it(`ตรวจสอบหน้า Homepage ที่ขนาด ${size}`, () => {
      cy.viewport(size)
      cy.visit('/')
      cy.matchImageSnapshot(`homepage-${size}`)
    })
  })
})
```

> 💡 ทดสอบความสวยงามของหน้าเว็บในหลายขนาดจอ พร้อมตรวจ visual diff

---

## ⚙️ 7. ตัวอย่างรวมทุกอย่างใน Flow เดียว

```js
describe('Full E2E Test', () => {
  before(() => {
    cy.task('log', '🚀 เริ่มชุดทดสอบระบบทั้งหมด')
  })

  it('Login + Fetch Data + Update + Logout', () => {
    // --- Login ---
    cy.visit('/login')
    cy.get('#email').type('admin@example.com')
    cy.get('#password').type('Admin123')
    cy.get('button[type=submit]').click()
    cy.url().should('include', '/dashboard')

    // --- Fetch Data ---
    cy.intercept('GET', '/api/dashboard', { fixture: 'dashboard.json' }).as('getDashboard')
    cy.wait('@getDashboard')
    cy.get('.card').should('have.length', 3)

    // --- Update Setting ---
    cy.get('#settings').click()
    cy.get('#toggle-theme').click()
    cy.contains('Settings saved').should('be.visible')

    // --- Logout ---
    cy.get('#logout').click()
    cy.url().should('include', '/login')
  })

  after(() => {
    cy.task('log', '✅ ทดสอบทั้งหมดสำเร็จ')
  })
})
```

> 🔥 นี่คือตัวอย่าง E2E ครบวงจร (login → data → update → logout) พร้อม intercept, assertion และ logging ครบชุด

---

## 📊 8. ตัวอย่างการ Run บน CI/CD

ไฟล์ `.github/workflows/e2e.yml`

```yaml
name: Cypress E2E

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - run: npm ci
      - name: Run Cypress Headless
        run: npx cypress run --browser chrome --record --key ${{ secrets.CYPRESS_RECORD_KEY }}
```

> ⚙️ สามารถเชื่อมกับ Cypress Dashboard เพื่อตรวจสอบผลลัพธ์แบบเรียลไทม์

---

## ✅ 9. สรุปคำสั่งที่ใช้บ่อยใน E2E Test

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `cy.visit(url)` | เปิดหน้าเว็บ |
| `cy.get(selector)` | ค้นหา element |
| `cy.intercept()` | ดักจับ API |
| `cy.fixture()` | ใช้ข้อมูล mock |
| `cy.should()` | ตรวจสอบเงื่อนไข |
| `cy.url()` | ตรวจสอบ URL ปัจจุบัน |
| `cy.viewport()` | เปลี่ยนขนาดหน้าจอ |
| `cy.matchImageSnapshot()` | ตรวจสอบความต่างของภาพ |
| `cy.readFile()` | ตรวจสอบไฟล์ที่ดาวน์โหลด |
| `cy.task()` | เขียน log ฝั่ง Node.js |

---

> 💬 **Tips มือโปร:**  
> - เขียน flow ให้เหมือนผู้ใช้จริงที่สุด (User Journey)  
> - ใช้ `cy.intercept()` แทนการรอแบบ timeout เพื่อให้ test เสถียร  
> - รวม fixture, intercept, และ visual test เพื่อครอบคลุมทุกมิติของคุณภาพระบบ  
> - รัน test ใน CI/CD ทุกครั้งก่อน deploy เพื่อมั่นใจว่าเว็บพร้อมใช้งานจริง  

---
