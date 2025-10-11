# 🧩 บทที่ 8: Frames & Popups (การจัดการ Iframe และ Popup ใน Cypress)

Cypress ไม่สามารถ “สลับหน้าต่าง (window)” ได้โดยตรงเหมือน Selenium  
แต่สามารถ **เข้าถึง iframe, modal, alert, และ popup** ได้หลายวิธีที่มีประสิทธิภาพ

---

## 🪞 1. การจัดการ Iframe

Cypress ไม่รองรับคำสั่ง `.switchToFrame()` โดยตรง  
แต่เราสามารถเข้าถึงเนื้อหาภายใน iframe ด้วย DOM API

### วิธีที่ 1: ใช้ `.its('0.contentDocument')`

```js
cy.get('iframe')
  .its('0.contentDocument.body')
  .should('not.be.empty')
  .then(cy.wrap)
  .find('h1')
  .should('contain', 'Welcome')
```

### วิธีที่ 2: ใช้ Plugin `cypress-iframe`

#### ติดตั้ง:
```bash
npm install --save-dev cypress-iframe
```

เพิ่มใน `cypress/support/commands.js`:
```js
import 'cypress-iframe'
```

จากนั้นใช้คำสั่งง่าย ๆ:
```js
cy.frameLoaded('#my-iframe')
cy.iframe().find('button#submit').click()
```

📘 ใช้ได้กับเว็บที่มี iframe เช่น Google Maps Embed, YouTube Player, Stripe Payment Frame

---

## 🧠 2. ตรวจสอบเนื้อหาภายใน Iframe

```js
cy.get('iframe')
  .its('0.contentDocument')
  .should('exist')
  .then((doc) => {
    cy.wrap(doc.body).find('p').should('contain', 'Inside frame')
  })
```

หรือใช้ plugin แบบสั้นกว่า:
```js
cy.frameLoaded('#formFrame')
cy.iframe().find('input[name="email"]').type('example@gmail.com')
```

---

## 🧩 3. การจัดการ Popup / Modal

Cypress สามารถจัดการ popup ที่อยู่ใน DOM ได้โดยตรง (ไม่ใช่ browser alert)

```js
cy.get('#openModal').click()
cy.get('.modal').should('be.visible')
cy.get('.modal button.close').click()
cy.get('.modal').should('not.exist')
```

### ตรวจสอบข้อความใน Modal
```js
cy.get('.modal-content').should('contain.text', 'Do you want to continue?')
```

---

## ⚠️ 4. การจัดการ Alert, Confirm, และ Prompt

Cypress สามารถ “ดัก event” ของ `window.alert()` และ `window.confirm()` ได้

### Alert
```js
cy.on('window:alert', (text) => {
  expect(text).to.contains('Form submitted successfully!')
})
cy.get('#submit').click()
```

### Confirm
```js
cy.on('window:confirm', (text) => {
  expect(text).to.eq('Are you sure you want to delete?')
  return true   // กดยืนยัน
})
cy.get('#delete').click()
```

หรือ return `false` เพื่อจำลองการกดยกเลิก:
```js
cy.on('window:confirm', () => false)
cy.get('#delete').click()
```

---

## 🧠 5. การ Stub Popup (window.open)

บางเว็บไซต์จะเปิดแท็บใหม่ด้วย `window.open()`  
เราสามารถ stub มันให้ Cypress ควบคุมแทนได้

```js
cy.window().then((win) => {
  cy.stub(win, 'open').as('popup')
})
cy.get('#openTab').click()
cy.get('@popup').should('be.calledWith', 'https://example.com/newtab')
```

📘 ใช้ตรวจสอบได้ว่า “popup ถูกเรียกด้วย URL ที่ถูกต้อง” โดยไม่ต้องเปิดแท็บใหม่จริง ๆ

---

## 🪟 6. การจัดการหลายแท็บ (Multiple Windows)

Cypress ไม่สามารถควบคุมหลายแท็บจริงได้  
แต่สามารถจำลองหรือเปิด URL ในแท็บเดิมแทน

```js
cy.get('a[target="_blank"]').invoke('removeAttr', 'target').click()
cy.url().should('include', 'newpage')
```

> 💡 เทคนิค: การลบ `target="_blank"` จะทำให้ลิงก์เปิดในแท็บเดียวกัน และ Cypress สามารถควบคุมได้

---

## 🧩 7. การดัก event window.open และตรวจ URL

```js
cy.window().then((win) => {
  cy.stub(win, 'open').as('open')
})
cy.get('#newTabButton').click()
cy.get('@open').should('have.been.calledOnce')
cy.get('@open').should('have.been.calledWith', 'https://google.com')
```

---

## 🔄 8. การทดสอบ Iframe ที่โหลดช้า

```js
cy.get('iframe', { timeout: 10000 })
  .its('0.contentDocument.body')
  .should('not.be.empty')
  .then(cy.wrap)
  .find('button')
  .should('contain', 'Continue')
```

> ⚙️ ใช้ `{ timeout: 10000 }` เพื่อรอ iframe โหลดครบก่อน

---

## 🧮 9. การตรวจสอบ iframe ที่ซ้อนหลายชั้น

```js
cy.get('#outer-frame').its('0.contentDocument').then((outerDoc) => {
  cy.wrap(outerDoc.body)
    .find('#inner-frame')
    .its('0.contentDocument')
    .then((innerDoc) => {
      cy.wrap(innerDoc.body).find('h1').should('contain', 'Nested Frame')
    })
})
```

---

## 🧠 10. ตัวอย่างครบชุด (Iframe + Popup + Alert)

```js
describe('Iframe & Popup Example', () => {
  it('จัดการ iframe และ popup ได้ครบ', () => {
    // ===== Iframe =====
    cy.visit('https://the-internet.herokuapp.com/iframe')
    cy.get('iframe')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .find('p')
      .type('Hello from Cypress!')

    // ===== Popup =====
    cy.visit('https://the-internet.herokuapp.com/javascript_alerts')
    cy.on('window:alert', (msg) => {
      expect(msg).to.eq('I am a JS Alert')
    })
    cy.contains('Click for JS Alert').click()

    // ===== Confirm =====
    cy.on('window:confirm', () => true)
    cy.contains('Click for JS Confirm').click()
    cy.get('#result').should('contain', 'You clicked: Ok')
  })
})
```

---

## ✅ 11. สรุปคำสั่งสำคัญ

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `.its('0.contentDocument')` | เข้าถึง DOM ของ iframe |
| `.then(cy.wrap)` | ใช้เข้าถึง element ภายใน iframe |
| `cy.frameLoaded()` / `cy.iframe()` | ใช้กับ plugin cypress-iframe |
| `cy.on('window:alert')` | ดักข้อความ alert |
| `cy.on('window:confirm')` | จำลองการกดยืนยัน/ยกเลิก |
| `cy.stub(win, 'open')` | ดักการเปิด popup |
| `.invoke('removeAttr', 'target')` | ป้องกันการเปิดแท็บใหม่ |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `cy.iframe()` สำหรับการเข้าถึงเนื้อหา iframe ได้ง่ายขึ้น  
> - ใช้ `cy.stub(win, 'open')` เพื่อตรวจสอบ popup โดยไม่ต้องเปิดแท็บใหม่  
> - ใช้ `.invoke('removeAttr', 'target')` เพื่อควบคุมลิงก์หลายแท็บ  
> - อย่าลืมเพิ่ม timeout ใน iframe ที่โหลดช้า  
> - Cypress ไม่รองรับ multi-window จริง แต่สามารถจำลองการตรวจสอบได้ครบทุกเคส  

---
