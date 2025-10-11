# 🕓 บทที่ 7: Waiting & Synchronization (การจัดการเวลาและการรอใน Cypress)

Cypress มีระบบ **Auto-Wait** ที่ชาญฉลาดมาก  
ทุกคำสั่ง (`get`, `click`, `type`, `should`) จะ “รอให้เงื่อนไขพร้อม” โดยอัตโนมัติ  
แต่บางครั้งเราต้องจัดการเวลาเอง เช่น เมื่อรอ API, animation, หรือ transition

---

## ⚙️ 1. Cypress Auto-Wait คืออะไร

Cypress จะ “retry” คำสั่งจนกว่าจะเจอเงื่อนไขที่ถูกต้อง หรือจนกว่า timeout จะหมด (ค่าเริ่มต้น 4 วินาที)

ตัวอย่าง:
```js
cy.get('#success-message').should('be.visible')
```

> ❗ Cypress จะวนตรวจซ้ำจนกว่า element จะปรากฏ — ไม่ต้องใช้ `cy.wait()`

---

## ⏱ 2. การใช้ `cy.wait(time)` (Manual Wait)

```js
cy.wait(2000) // รอ 2 วินาที
```

ไม่แนะนำให้ใช้ในทุกกรณี — ใช้เฉพาะตอน debug หรือจำเป็นจริง ๆ

---

## 🕹 3. การรอด้วย `cy.wait('@alias')` (รอ API หรือ Request)

เมื่อใช้ `cy.intercept()` สามารถตั้งชื่อ alias แล้วรอให้ request นั้นเสร็จ

```js
cy.intercept('GET', '/api/users').as('getUsers')
cy.visit('/users')
cy.wait('@getUsers')
cy.get('.user').should('have.length.greaterThan', 0)
```

หรือรอหลาย request พร้อมกัน:
```js
cy.wait(['@getUsers', '@getPosts'])
```

---

## 🧩 4. การรอ Element ปรากฏ / หายไป

```js
cy.get('.loading-spinner').should('be.visible')
cy.get('.loading-spinner').should('not.exist')
```

Cypress จะตรวจซ้ำอัตโนมัติจนกว่า element จะหายไปจาก DOM

---

## 🔍 5. การรอจน element เปลี่ยน state

```js
cy.get('#status').should('contain', 'Processing')
cy.get('#status').should('contain', 'Completed')
```

Cypress จะรอจนข้อความเปลี่ยนเป็น “Completed” โดยไม่ต้องใช้ `wait()`

---

## 🧠 6. การใช้ `should()` แทน wait manual

```js
cy.get('#result').should('have.text', 'Success')
```

เทียบกับ:
```js
cy.wait(3000)
cy.get('#result').then(($el) => {
  expect($el.text()).to.eq('Success')
})
```

✅ แบบแรกดีกว่า — Cypress จะรออัตโนมัติจนกว่าค่าจะตรง

---

## ⏳ 7. การรอ animation หรือ transition

```js
cy.get('.modal').should('have.css', 'opacity', '1')
cy.get('.modal').should('be.visible')
```

หรือใช้ `cy.wait()` สั้น ๆ หลัง trigger animation:
```js
cy.get('.modal').click()
cy.wait(500)
cy.get('.modal-content').should('be.visible')
```

---

## ⚡ 8. การตั้งค่า Timeout สำหรับแต่ละคำสั่ง

```js
cy.get('#item', { timeout: 10000 }).should('be.visible')
```

หรือใน config (`cypress.config.js`):

```js
e2e: {
  defaultCommandTimeout: 8000,   // timeout คำสั่งทั่วไป
  pageLoadTimeout: 60000,        // timeout การโหลดหน้า
  requestTimeout: 5000,          // timeout request API
}
```

---

## 🔄 9. การรอหน้าเว็บโหลดเสร็จ (Page Load Wait)

```js
cy.visit('/dashboard', { timeout: 20000 })
cy.document().should('have.property', 'readyState', 'complete')
```

---

## 🧮 10. การรอจนค่าจาก DOM หรือ API พร้อมใช้งาน

```js
cy.intercept('GET', '/api/status', { statusCode: 200, body: { ready: true } }).as('status')
cy.visit('/')
cy.wait('@status')
cy.get('#ready').should('contain', 'true')
```

---

## 🧩 11. การรอ Promise หรือ Function ที่กำหนดเอง

```js
function waitForData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('done'), 2000)
  })
}

cy.wrap(waitForData()).should('eq', 'done')
```

Cypress จะรอจนกว่า Promise จะ resolve

---

## 🕵️ 12. การตรวจสอบ Timing ด้วย `cy.clock()` และ `cy.tick()`

### จำลองเวลาใน test (เช่น count down)
```js
cy.clock()
cy.visit('/countdown')
cy.tick(5000) // เดินเวลาไป 5 วินาที
cy.get('#timer').should('contain', '5')
```

---

## 🧠 13. การรอ Custom Condition (เช่น ค่าเปลี่ยนใน localStorage)

```js
cy.waitUntil(() => 
  cy.window().then(win => win.localStorage.getItem('authToken') !== null)
)
```

> ต้องติดตั้ง plugin `cypress-wait-until` ก่อน  
> ```bash
> npm install --save-dev cypress-wait-until
> ```

---

## 🧰 14. การใช้ Retry Logic เอง

```js
cy.get('.alert', { timeout: 10000 }).should(($el) => {
  expect($el.text()).to.match(/success|completed/i)
})
```

Cypress จะลองซ้ำทุก 200ms จนกว่าจะเจอข้อความที่ตรง

---

## 🧩 15. ตัวอย่าง Flow รวม (รอโหลด + รอ API + ตรวจผล)

```js
describe('Waiting Example', () => {
  it('รอโหลดและรอข้อมูลจาก API ก่อนตรวจสอบ', () => {
    cy.intercept('GET', '/api/profile').as('getProfile')
    cy.visit('/dashboard')
    cy.wait('@getProfile')
    cy.get('.username').should('contain', 'Student')
  })
})
```

---

## ✅ 16. สรุปคำสั่งสำคัญ

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `cy.wait(time)` | รอแบบ manual |
| `cy.wait('@alias')` | รอ request หรือ intercept |
| `.should('be.visible')` | รอจน element แสดง |
| `.should('not.exist')` | รอจน element หายไป |
| `cy.get(selector, { timeout })` | ตั้งค่า timeout เฉพาะคำสั่ง |
| `cy.clock()` / `cy.tick()` | จำลองเวลาใน test |
| `cy.document().should('have.property', 'readyState', 'complete')` | ตรวจว่าโหลดหน้าเสร็จ |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `.should()` แทน `cy.wait()` เมื่อเป็นไปได้  
> - ใช้ `cy.wait('@alias')` แทนการเดาเวลา  
> - ปรับ `defaultCommandTimeout` สำหรับ test ช้า (แต่ไม่ควรสูงเกินไป)  
> - ใช้ `cy.clock()` เพื่อจำลองเวลาสำหรับ test ที่มี timer หรือ animation  
> - อย่าใช้ `wait(5000)` โดยไม่มีเหตุผล — ทำให้ test ช้าลงและไม่เสถียร  

---
