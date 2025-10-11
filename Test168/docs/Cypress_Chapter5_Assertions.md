# 🔍 บทที่ 5: Assertions (การตรวจสอบผลลัพธ์ใน Cypress)

การทดสอบด้วย Cypress จะไม่สมบูรณ์หากไม่มีการ **Assert**  
เพื่อตรวจสอบว่า “ผลลัพธ์เป็นไปตามที่คาดหรือไม่” เช่น หน้าเว็บโหลดถูก, ปุ่มแสดงผล, ข้อความตรงตามเงื่อนไข

---

## ✅ 1. ประเภทของ Assertions

Cypress รองรับ assertion หลายแบบ ได้แก่

| ประเภท | ตัวอย่าง | อธิบาย |
|---------|-----------|---------|
| **Implicit** | `cy.get('h1').should('contain', 'Welcome')` | Cypress จัดการรอ (auto-retry) ให้เอง |
| **Explicit** | `expect(value).to.equal(10)` | ใช้จาก Chai โดยตรง |

---

## 🧩 2. Implicit Assertions (ใช้ `should()` / `and()`)

### ตัวอย่างทั่วไป:
```js
cy.get('#message').should('contain', 'Login successful')
cy.get('#username').should('have.value', 'student')
cy.get('button').should('be.visible').and('be.enabled')
```

### การ chain หลายเงื่อนไข:
```js
cy.get('#alert')
  .should('be.visible')
  .and('have.class', 'alert-success')
  .and('contain', 'Completed')
```

📘 Cypress จะ “retry” การตรวจสอบอัตโนมัติจนกว่าจะครบ timeout (ค่าเริ่มต้น 4 วินาที)

---

## 🧠 3. Explicit Assertions (ใช้ Chai / jQuery / BDD Syntax)

```js
cy.get('#count').then(($el) => {
  const value = parseInt($el.text())
  expect(value).to.be.greaterThan(0)
  assert.isNumber(value, 'ค่าที่ได้ต้องเป็นตัวเลข')
})
```

### ตัวอย่างเพิ่มเติม:
```js
expect('Hello').to.equal('Hello')
expect([1, 2, 3]).to.have.length(3)
assert.deepEqual({a: 1}, {a: 1})
```

---

## 🎯 4. การตรวจสอบ URL และ Title

```js
cy.url().should('include', '/dashboard')
cy.title().should('eq', 'Dashboard | MyApp')
```

หรือใช้ Explicit style:
```js
cy.url().then(url => {
  expect(url).to.contain('/dashboard')
})
```

---

## 🧾 5. ตรวจสอบข้อความและเนื้อหา

```js
cy.get('h1').should('contain.text', 'Welcome')
cy.get('p').should('not.contain.text', 'Error')
cy.contains('Submit').should('exist')
```

---

## 🧱 6. ตรวจสอบ Attribute และ Class

```js
cy.get('input').should('have.attr', 'placeholder', 'Enter your name')
cy.get('button').should('have.class', 'btn-primary')
cy.get('img').should('have.attr', 'src').and('include', '.png')
```

---

## 🧮 7. ตรวจสอบจำนวน Elements

```js
cy.get('ul li').should('have.length', 5)
cy.get('table tr').should('have.length.greaterThan', 1)
```

---

## 🔘 8. ตรวจสอบ State ของ Element

| Assertion | ความหมาย |
|------------|-----------|
| `be.visible` | element ปรากฏอยู่ |
| `not.be.visible` | element ถูกซ่อน |
| `be.enabled` | ใช้งานได้ |
| `be.disabled` | ไม่สามารถกดได้ |
| `be.checked` | checkbox/radio ถูกเลือก |
| `not.be.checked` | ยังไม่ถูกเลือก |
| `exist` | มีอยู่ใน DOM |
| `not.exist` | ถูกลบออกจาก DOM แล้ว |

ตัวอย่าง:
```js
cy.get('#submit').should('be.enabled')
cy.get('#checkbox').should('be.checked')
cy.get('.modal').should('not.exist')
```

---

## 📊 9. ตรวจสอบค่าภายใน Input หรือ Form

```js
cy.get('#email').should('have.value', 'user@example.com')
cy.get('#password').invoke('val').should('have.length.greaterThan', 5)
```

---

## 🧩 10. ตรวจสอบ DOM Structure

```js
cy.get('.nav').children().should('have.length', 3)
cy.get('.nav').find('li').eq(1).should('contain', 'About')
```

---

## 🧠 11. การใช้ `should()` กับฟังก์ชัน custom

```js
cy.get('.price').should(($el) => {
  const price = parseFloat($el.text().replace('$', ''))
  expect(price).to.be.lessThan(1000)
})
```

Cypress จะ retry คำสั่งใน `should()` จนกว่าผลในฟังก์ชันจะไม่ throw error

---

## 🧩 12. Custom Assertions (Reusable)

สร้างไฟล์ `cypress/support/assertions.js`:

```js
Cypress.Commands.add('shouldHaveText', { prevSubject: true }, (subject, text) => {
  cy.wrap(subject).should('contain.text', text)
})
```

ใช้ใน test:
```js
cy.get('h1').shouldHaveText('Welcome')
```

---

## ⚙️ 13. ตรวจสอบ Response จาก API

```js
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers')
cy.visit('/users')
cy.wait('@getUsers').its('response.statusCode').should('eq', 200)
```

หรือใช้ explicit ตรวจ body:
```js
cy.wait('@getUsers').then(({ response }) => {
  expect(response.body).to.have.length(5)
  expect(response.statusCode).to.eq(200)
})
```

---

## 🔎 14. Debug Assertion ที่ล้มเหลว

ใช้ `.debug()` หรือ `.log()` เพื่อดูค่าก่อน assert

```js
cy.get('#price').debug().should('contain', '$')
cy.get('#status').then(($el) => {
  cy.log('Status:', $el.text())
})
```

Cypress จะแสดง error อย่างละเอียด พร้อมแสดงค่า “Expected” และ “Actual” ใน Test Runner

---

## 🧠 15. การ Assert หลายค่าพร้อมกัน (Multiple Assertion)

```js
cy.get('.product').should(($items) => {
  expect($items).to.have.length(3)
  expect($items.eq(0)).to.contain('Apple')
  expect($items.eq(1)).to.contain('Banana')
  expect($items.eq(2)).to.contain('Cherry')
})
```

---

## 🧩 16. ตัวอย่างครบชุด (Login Assertion)

```js
describe('Login Assertion', () => {
  it('ตรวจสอบว่าล็อกอินสำเร็จและมีชื่อผู้ใช้แสดงผล', () => {
    cy.visit('https://practicetestautomation.com/practice-test-login/')
    cy.get('#username').type('student')
    cy.get('#password').type('Password123')
    cy.get('#submit').click()

    cy.url().should('include', '/logged-in-successfully')
    cy.get('h1').should('contain', 'Logged In Successfully')
    cy.get('.post-content').should('contain.text', 'Congratulations')
  })
})
```

---

## ✅ 17. สรุปคำสั่งสำคัญ

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `should()` | ใช้ตรวจค่าแบบ implicit พร้อม auto-retry |
| `and()` | เชื่อม assert หลายตัว |
| `expect()` | ตรวจค่าแบบ explicit (Chai) |
| `assert.equal()` | ตรวจค่าตรง ๆ แบบ hard check |
| `.should('have.value', val)` | ตรวจค่าที่กรอกใน input |
| `.should('be.visible')` | ตรวจ element ที่มองเห็นได้ |
| `.should('have.class', cls)` | ตรวจ class |
| `.should(callback)` | เขียนเงื่อนไขแบบ custom |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `should()` เมื่อ assertion ผูกกับ element (auto-retry ได้)  
> - ใช้ `expect()` เมื่อ assertion ผูกกับค่าหรือ object (ไม่ auto-retry)  
> - ใช้ `.debug()` หรือ `.then()` เพื่อดูค่าจริงก่อน assert  
> - หลีกเลี่ยงการใช้ `wait()` โดยไม่จำเป็น — ให้ Cypress รอเองผ่าน auto-retry  
> - รวม assertion หลายตัวใน `should()` เพื่อโค้ดที่อ่านง่ายและรันเร็วขึ้น  

---
