# 🎯 บทที่ 3: Locators & DOM Interaction (การหากับโต้ตอบ Element)

ในบทนี้ เราจะเรียนรู้ทุกคำสั่งที่ใช้ในการ “หา” และ “โต้ตอบ” กับองค์ประกอบบนหน้าเว็บ (DOM elements)  
ซึ่งเป็นหัวใจสำคัญของ Cypress test ทุกประเภท

---

## 🔍 1. คำสั่งหลักในการค้นหา Element

### `cy.get()` – ค้นหา element ด้วย **CSS Selector**

```js
cy.get('#username')        // หา element ที่มี id = username
cy.get('.btn-primary')     // หา element ที่มี class = btn-primary
cy.get('input[name="email"]') // หา input ตาม attribute
```

Cypress ใช้ **jQuery selector engine** ทำให้ใช้ syntax เดียวกับ CSS selector ได้ทุกแบบ

---

### `cy.contains()` – หา element ที่มีข้อความ

```js
cy.contains('Login')            // หา element ที่มีข้อความ Login
cy.contains('button', 'Submit') // หาเฉพาะใน <button>
```

📘 เหมาะกับการคลิกปุ่มหรือข้อความบน UI โดยไม่ต้องรู้ selector ที่แน่นอน

---

### `cy.find()` – หา element ย่อยภายใน element อื่น

```js
cy.get('.form').find('input[type="password"]').type('123456')
```

---

### `cy.within()` – จำกัดขอบเขตการค้นหาใน element เดียว

```js
cy.get('.login-form').within(() => {
  cy.get('input[name="username"]').type('student')
  cy.get('input[name="password"]').type('Password123')
})
```

📘 ใช้เมื่อมีหลาย form บนหน้าเดียวกัน ป้องกัน selector ซ้ำ

---

## 🧱 2. การระบุตำแหน่งของ Element

### `.first()`, `.last()`, `.eq()`

```js
cy.get('ul li').first().click() // ตัวแรก
cy.get('ul li').last().click()  // ตัวสุดท้าย
cy.get('ul li').eq(2).click()   // ตัวที่ 3 (index เริ่มที่ 0)
```

---

## 🎨 3. การใช้ Attribute Selector

```js
cy.get('[data-testid="submit"]').click()
cy.get('input[placeholder="Search"]').type('Cypress')
cy.get('a[href*="about"]').click() // * = contains
```

📘 แนะนำให้ใช้ `data-testid` หรือ `data-cy` สำหรับการ test โดยเฉพาะ เพื่อความเสถียร

---

## 🧩 4. การโต้ตอบกับ Element (Actions)

### `.click()`
```js
cy.get('button').click()
cy.contains('Submit').click()
```

### `.dblclick()`
```js
cy.get('#icon').dblclick()
```

### `.rightclick()`
```js
cy.get('#file').rightclick()
```

### `.type()` – พิมพ์ข้อความลงใน input
```js
cy.get('#username').type('student')
cy.get('#password').type('Password123{enter}') // ใช้ {enter}
```

### `.clear()` – ลบข้อความใน input
```js
cy.get('input').clear().type('New Value')
```

### `.focus()` และ `.blur()`
```js
cy.get('#email').focus().blur()
```

### `.check()` / `.uncheck()` (สำหรับ checkbox/radio)
```js
cy.get('input[type="checkbox"]').check()
cy.get('input[type="checkbox"]').uncheck()
cy.get('input[type="radio"][value="male"]').check()
```

### `.select()` (dropdown/select box)
```js
cy.get('select').select('Thailand')       // ตาม text
cy.get('select').select('TH')             // ตาม value
cy.get('select').select(['TH', 'JP'])     // หลายค่า
```

### `.trigger()` (จำลอง event)
```js
cy.get('#drag').trigger('mousedown', { which: 1 })
cy.get('#drop').trigger('mousemove').trigger('mouseup')
```

---

## 🧠 5. การจัดการ Element ซับซ้อน

### การโต้ตอบกับ element ที่ซ่อนอยู่

```js
cy.get('.hidden-btn').click({ force: true })
```

> ⚠️ ใช้ `{ force: true }` เมื่อ Cypress มองว่า element ยังไม่ visible แต่เราต้องการคลิกจริง ๆ

---

### การตรวจสอบค่าใน Element

```js
cy.get('#username').should('have.value', 'student')
cy.get('h1').should('contain.text', 'Welcome')
cy.get('button').should('be.visible')
cy.get('button').should('have.class', 'btn-primary')
```

---

## 🧩 6. การใช้ Alias (ตั้งชื่อ element)

```js
cy.get('input[name="email"]').as('emailField')
cy.get('@emailField').type('example@gmail.com')
cy.get('@emailField').should('have.value', 'example@gmail.com')
```

📘 Alias จะช่วยให้โค้ดอ่านง่ายขึ้น และลดการ query DOM ซ้ำ ๆ

---

## 🪶 7. การ Chain คำสั่งต่อเนื่อง

```js
cy.get('.list-item')
  .should('have.length', 3)
  .eq(1)
  .should('contain', 'Item 2')
  .click()
```

Cypress จะจัดลำดับการรันคำสั่งเองโดยอัตโนมัติ (Command Queue)

---

## 🌈 8. Shadow DOM

สำหรับ element ที่อยู่ใน **Shadow DOM** (เช่น web component)

```js
cy.get('custom-element').shadow().find('#inner-btn').click()
```

📘 ต้องใช้ `.shadow()` ก่อน `.find()` เพื่อเข้าถึง element ด้านใน

---

## 🧰 9. การสร้าง Custom Locator

```js
Cypress.Commands.add('getByTestId', (id) => {
  return cy.get(`[data-testid="${id}"]`)
})

// ใช้ใน test
cy.getByTestId('login-button').click()
```

---

## 🧾 10. การตรวจสอบ State ของ Element

| Assertion | ความหมาย |
|------------|-----------|
| `should('be.visible')` | แสดงผลอยู่ |
| `should('not.be.visible')` | ซ่อนอยู่ |
| `should('be.enabled')` | ใช้งานได้ |
| `should('be.disabled')` | ปิดการใช้งาน |
| `should('be.checked')` | ถูกเลือกแล้ว |
| `should('not.be.checked')` | ยังไม่ถูกเลือก |
| `should('have.class', 'btn')` | มี class = btn |
| `should('have.value', 'abc')` | มีค่าใน input = abc |

---

## 🧠 11. ตัวอย่างเต็ม (Login Form)

```js
describe('Login Form Test', () => {
  it('กรอกฟอร์มและกด Login', () => {
    cy.visit('https://practicetestautomation.com/practice-test-login/')
    cy.get('#username').type('student')
    cy.get('#password').type('Password123')
    cy.get('#submit').click()
    cy.url().should('include', '/logged-in-successfully')
    cy.get('h1').should('contain', 'Logged In Successfully')
  })
})
```

---

## ✅ 12. สรุปคำสั่งหลัก

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `cy.get(selector)` | หา element ตาม CSS |
| `cy.contains(text)` | หา element จากข้อความ |
| `cy.find(selector)` | หา element ย่อยภายใน element อื่น |
| `cy.within()` | จำกัดขอบเขตการค้นหา |
| `.first() / .last() / .eq()` | เข้าถึง element ตามตำแหน่ง |
| `.click() / .type() / .select()` | โต้ตอบกับ element |
| `.should()` | ตรวจสอบ state หรือค่า |
| `.as()` | ตั้งชื่อ alias |
| `.shadow()` | เข้าถึง shadow DOM |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `data-testid` สำหรับ element ที่ใช้ใน test เพื่อให้ selector เสถียร  
> - ใช้ `.within()` เมื่อมีหลาย form ในหน้าเดียว  
> - ใช้ `.as()` ตั้ง alias เพื่อลด DOM lookup  
> - ใช้ `.trigger()` สำหรับ event ที่ Cypress ไม่มี built-in เช่น drag/drop  
> - หลีกเลี่ยงการใช้ XPath — Cypress สนับสนุน CSS เป็นหลัก  

---
