# 🌐 บทที่ 2: Navigation & Commands (การควบคุมหน้าเว็บใน Cypress)

ในบทนี้ เราจะเรียนรู้วิธีสั่งให้ Cypress เปิดหน้าเว็บ, โหลดใหม่, เดินหน้า–ถอยหลัง, ตรวจสอบ URL, Title  
และวิธีใช้ “Command Chain” เพื่อเชื่อมคำสั่งหลายขั้นตอนอย่างต่อเนื่อง

---

## 🚀 1. เปิดหน้าเว็บด้วย `cy.visit()`

```js
cy.visit('https://example.com')
```

### ตัวอย่าง:
```js
describe('Navigation Example', () => {
  it('เปิดหน้าเว็บหลัก', () => {
    cy.visit('https://example.com')
    cy.title().should('include', 'Example Domain')
  })
})
```

📘 *คำอธิบาย:*  
`cy.visit()` จะเปิด URL ที่กำหนดใน browser และ Cypress จะรอจนกว่าหน้าที่โหลดเสร็จทั้งหมดโดยอัตโนมัติ

### ใช้ร่วมกับ `baseUrl`

หากตั้งค่าใน `cypress.config.js`:

```js
baseUrl: 'https://example.com'
```

สามารถเรียกได้แบบสั้น:
```js
cy.visit('/login')
```

---

## 🔄 2. โหลดหน้าใหม่ด้วย `cy.reload()`

```js
cy.reload()                // โหลดใหม่แบบปกติ
cy.reload(true)            // โหลดใหม่แบบไม่ใช้ cache
```

ตัวอย่าง:
```js
cy.get('#refresh').click()
cy.reload()
cy.get('#status').should('contain', 'Updated')
```

---

## ⏮️⏭️ 3. เดินหน้า–ถอยหลังด้วย `cy.go()`

```js
cy.go('back')    // ถอยกลับ 1 หน้า
cy.go('forward') // ไปข้างหน้า 1 หน้า
cy.go(-1)        // ถอยกลับ 1 หน้า
cy.go(1)         // ไปข้างหน้า 1 หน้า
```

ตัวอย่าง:
```js
cy.visit('/home')
cy.visit('/about')
cy.go('back')
cy.url().should('include', '/home')
cy.go('forward')
cy.url().should('include', '/about')
```

---

## 🔍 4. ตรวจสอบ URL และ Title

```js
cy.url().should('include', '/dashboard')
cy.title().should('eq', 'Dashboard | MyApp')
```

หรือใช้ chain ต่อเนื่อง:
```js
cy.visit('/dashboard')
  .url().should('include', '/dashboard')
  .title().should('contain', 'Dashboard')
```

---

## 📍 5. การใช้ `cy.location()`

`cy.location()` ใช้ตรวจค่าต่าง ๆ ของ URL เช่น `pathname`, `host`, `protocol`, `search`

```js
cy.location('pathname').should('eq', '/login')
cy.location('protocol').should('eq', 'https:')
cy.location().should((loc) => {
  expect(loc.href).to.include('example.com')
})
```

---

## 🧭 6. การอ่านค่าหลังเครื่องหมาย Hash (#)

```js
cy.hash().should('eq', '#section1')
```

ตัวอย่าง:
```js
cy.visit('/home#features')
cy.hash().should('contain', 'features')
```

---

## ⚙️ 7. Command Chain (ลักษณะเฉพาะของ Cypress)

ทุกคำสั่งใน Cypress จะ “chain” ต่อกันได้ เพราะ Cypress เป็น asynchronous แต่จัดการ queue ให้เอง

```js
cy.visit('/login')
  .get('#username').type('student')
  .get('#password').type('Password123')
  .get('button[type=submit]').click()
  .url().should('include', '/dashboard')
```

📘 *ข้อดี:* ไม่ต้องใช้ `await` — Cypress จะรอคำสั่งก่อนหน้าจบอัตโนมัติ

---

## 🕓 8. การหน่วงรอเมื่อเปลี่ยนหน้า

Cypress จะรอให้โหลดหน้าเสร็จโดยอัตโนมัติ แต่สามารถควบคุมเพิ่มเติมได้ด้วย:

```js
cy.visit('/home', { timeout: 10000 })
```

หรือใช้รอ page load state:
```js
cy.window().should('have.property', 'document')
```

---

## 🧩 9. การตรวจจับ Event Navigation

```js
cy.on('url:changed', (newUrl) => {
  cy.log('Navigated to:', newUrl)
})
```

ตัวอย่าง:
```js
cy.visit('/home')
cy.get('a[href="/about"]').click()
cy.on('url:changed', (url) => {
  expect(url).to.include('/about')
})
```

---

## 🪶 10. การ Debug Navigation

ใช้ `.debug()` เพื่อหยุดที่คำสั่งนั้นใน GUI

```js
cy.visit('/login').debug()
```

หรือใช้ `.then()` เพื่อดูค่าที่ Cypress จัดเก็บระหว่าง chain

```js
cy.url().then((url) => {
  cy.log('Current URL:', url)
})
```

---

## 🧠 11. การจัดการ Redirect

สามารถตรวจสอบ redirect ได้ เช่น หลัง login

```js
cy.visit('/login')
cy.get('#username').type('admin')
cy.get('#password').type('1234')
cy.get('button[type=submit]').click()
cy.url().should('include', '/dashboard')
```

หรือใช้ `cy.location('pathname')` ตรวจเส้นทางปลายทาง

---

## 🔍 12. ตรวจสอบ Navigation Timing

```js
cy.window().then((win) => {
  const perf = win.performance.timing
  cy.log(`Page Load Time: ${perf.loadEventEnd - perf.navigationStart} ms`)
})
```

---

## ✅ 13. สรุปคำสั่งสำคัญ

| คำสั่ง | ความหมาย | ตัวอย่าง |
|----------|------------|-----------|
| `cy.visit(url)` | เปิดหน้าเว็บ | `cy.visit('https://example.com')` |
| `cy.reload()` | โหลดหน้าใหม่ | `cy.reload(true)` |
| `cy.go('back')` | ย้อนกลับหน้า | `cy.go('back')` |
| `cy.go('forward')` | เดินหน้า | `cy.go(1)` |
| `cy.url()` | อ่าน URL ปัจจุบัน | `cy.url().should('include', '/home')` |
| `cy.title()` | อ่าน Title | `cy.title().should('contain', 'Dashboard')` |
| `cy.location()` | อ่านข้อมูล URL | `cy.location('pathname')` |
| `cy.hash()` | อ่าน hash ใน URL | `cy.hash().should('contain', 'section1')` |
| `.debug()` | หยุด test เพื่อดู state | `cy.get('#btn').debug()` |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `cy.visit()` ร่วมกับ `baseUrl` เพื่อลดการพิมพ์ URL เต็ม  
> - ใช้ `.then()` หรือ `.debug()` เพื่อดูค่าระหว่าง chain  
> - Cypress จะ “auto-wait” ทุกคำสั่ง ไม่จำเป็นต้องใช้ `wait()` หากไม่จำเป็น  
> - ใช้ `cy.location()` เพื่อตรวจสอบ redirect และ parameter ใน URL  
> - อย่าใช้ `wait(2000)` โดยไม่จำเป็น — ใช้ `should()` ตรวจสภาวะจริงแทน  

---
