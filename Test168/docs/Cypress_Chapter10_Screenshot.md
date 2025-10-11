# 📸 บทที่ 10: Screenshot & Visual Regression (การจับภาพและตรวจสอบความเปลี่ยนแปลงของ UI)

Cypress รองรับการจับภาพหน้าจอได้ทั้งแบบ **manual** และ **อัตโนมัติเมื่อ test ล้มเหลว**  
รวมถึงสามารถใช้ plugin ภายนอก เช่น `cypress-image-snapshot` เพื่อเปรียบเทียบ UI ก่อน–หลัง ได้ด้วย

---

## 📷 1. การจับภาพหน้าจอทั้งหน้าเว็บ

```js
cy.visit('https://example.com')
cy.screenshot('homepage')
```

Cypress จะบันทึกไฟล์ไว้ที่:
```
cypress/screenshots/<spec-name>/<test-name> (run number).png
```

สามารถตั้งชื่อเองได้ เช่น:
```js
cy.screenshot('custom_name', { capture: 'fullPage' })
```

---

## 🧩 2. การจับภาพเฉพาะองค์ประกอบ (Element Screenshot)

```js
cy.get('.product-card').screenshot('product_card')
```

หรือระบุหลาย element:
```js
cy.get('.item').each(($el, index) => {
  cy.wrap($el).screenshot(`item-${index}`)
})
```

---

## ⚙️ 3. การตั้งค่า Screenshot ใน `cypress.config.js`

```js
e2e: {
  screenshotOnRunFailure: true,  // ถ่ายภาพเมื่อ test ล้มเหลว
  video: false,                  // ปิดการอัดวิดีโอ
  screenshotsFolder: 'cypress/screenshots', // โฟลเดอร์เก็บภาพ
}
```

> 💡 ค่าเริ่มต้นคือเปิดถ่ายภาพอัตโนมัติเมื่อ test fail อยู่แล้ว

---

## 🧠 4. การจับภาพเมื่อ Test ล้มเหลว

Cypress จะจับภาพหน้าจอโดยอัตโนมัติในกรณีที่ test ไม่ผ่าน เช่น:

```js
cy.get('#nonexistent-element').should('be.visible')
```
เมื่อ element ไม่พบ → Cypress จะสร้าง screenshot ชื่อประมาณ:
```
login.cy.js/Login Page -- should be visible (failed).png
```

---

## 🖼 5. การจับภาพเฉพาะส่วนของหน้า (Viewport Screenshot)

```js
cy.screenshot({ capture: 'viewport' })  // เฉพาะส่วนที่มองเห็น
cy.screenshot({ capture: 'runner' })    // รวม Cypress Test Runner
cy.screenshot({ capture: 'fullPage' })  // ทั้งหน้าเว็บ
```

---

## 🧩 6. เปลี่ยนขนาดจอ (Responsive Test) ก่อนจับภาพ

```js
cy.viewport(1280, 720)
cy.screenshot('desktop')

cy.viewport('iphone-x')
cy.screenshot('mobile')
```

รองรับค่า pre-defined เช่น `'macbook-16'`, `'ipad-2'`, `'iphone-6'`, `'samsung-s10'`

---

## 🔄 7. การเปรียบเทียบภาพ (Visual Regression Testing)

Cypress เองไม่มีระบบเปรียบเทียบภาพในตัว  
แต่สามารถใช้ **plugin** อย่าง `cypress-image-snapshot` เพื่อทำได้

### ติดตั้ง:
```bash
npm install --save-dev cypress-image-snapshot
```

เพิ่มใน `cypress/support/e2e.js`:
```js
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command'
addMatchImageSnapshotCommand()
```

และใน `cypress.config.js`:
```js
const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin')
module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on, config)
}
```

### ใช้งาน:
```js
cy.visit('/dashboard')
cy.matchImageSnapshot('dashboard_snapshot')
```

> 🔁 Cypress จะเปรียบเทียบภาพปัจจุบันกับ snapshot เดิมที่อยู่ใน `cypress/snapshots/`

---

## 🧮 8. การตั้งค่า threshold สำหรับ Visual Diff

```js
cy.matchImageSnapshot('dashboard', { failureThreshold: 0.05, failureThresholdType: 'percent' })
```

📘 หมายถึงยอมให้ภาพต่างได้ไม่เกิน 5%

---

## ⚙️ 9. ตั้งค่าการเก็บภาพหลาย viewport

```js
const viewports = ['macbook-16', 'ipad-2', 'iphone-x']

viewports.forEach((size) => {
  it(`ตรวจสอบ layout ที่ขนาด ${size}`, () => {
    cy.viewport(size)
    cy.visit('/')
    cy.matchImageSnapshot(`homepage-${size}`)
  })
})
```

---

## 📊 10. ตัวอย่างการใช้งานจริง (Homepage Snapshot Test)

```js
describe('Visual Snapshot', () => {
  it('ตรวจสอบว่า Homepage ไม่มีเปลี่ยนแปลง', () => {
    cy.visit('https://example.com')
    cy.matchImageSnapshot('homepage')
  })
})
```

ถ้าภาพต่างจาก snapshot เดิม Cypress จะสร้างไฟล์เทียบให้ 3 ไฟล์:
```
homepage.png                (ภาพอ้างอิงเดิม)
homepage.diff.png           (ภาพแสดงส่วนที่ต่าง)
homepage.actual.png         (ภาพที่เพิ่งถ่ายใหม่)
```

---

## 🧠 11. การ Debug ความแตกต่างของภาพ

```js
cy.matchImageSnapshot('component', {
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
  customDiffConfig: { threshold: 0.2 },
  capture: 'viewport',
})
```

- `failureThreshold`: ความต่างที่ยอมรับได้ (0.01 = 1%)  
- `customDiffConfig`: ปรับค่าความไวของ pixel diff  
- `capture`: กำหนดส่วนที่จะจับภาพ (`viewport`, `fullPage`, `runner`)

---

## 🧩 12. บันทึก Screenshot ในแต่ละขั้นตอนของ Flow

```js
describe('Checkout Flow', () => {
  it('จับภาพในแต่ละขั้นตอน', () => {
    cy.visit('/checkout')
    cy.screenshot('step1-cart')
    cy.get('#next').click()
    cy.screenshot('step2-payment')
    cy.get('#confirm').click()
    cy.screenshot('step3-success')
  })
})
```

---

## 📁 13. โครงสร้างโฟลเดอร์ที่แนะนำ

```
cypress/
├── e2e/
│   ├── visual/
│   │   └── homepage.cy.js
├── snapshots/
│   └── visual/
│       └── homepage.spec.js/
│           ├── homepage.png
│           ├── homepage.diff.png
│           └── homepage.actual.png
├── screenshots/
│   └── failed/
│       └── ... (auto screenshots)
```

---

## ✅ 14. สรุปคำสั่งสำคัญ

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `cy.screenshot()` | จับภาพทั้งหน้าเว็บ |
| `cy.get(...).screenshot()` | จับเฉพาะ element |
| `cy.matchImageSnapshot()` | เปรียบเทียบกับ snapshot เดิม |
| `cy.viewport()` | เปลี่ยนขนาดหน้าจอ |
| `screenshotOnRunFailure` | จับภาพอัตโนมัติเมื่อ test fail |
| `failureThreshold` | กำหนดระดับความต่างที่ยอมรับได้ |

---

> 💬 **Tips มือโปร:**  
> - ใช้ชื่อ snapshot ตาม flow (`login-success`, `checkout-step1`) เพื่อค้นหาได้ง่าย  
> - อย่าเปิด animation ตอนถ่าย snapshot (ภาพจะต่างทุกครั้ง)  
> - ใช้ `cy.viewport()` เพื่อเทสหลายขนาดหน้าจอในการจับภาพเดียวกัน  
> - รวม visual test เข้ากับ CI/CD เพื่อป้องกัน UI เปลี่ยนโดยไม่ตั้งใจ  

---
