# 💡 บทที่ 14: Debug & Troubleshooting (การแก้ปัญหาและดีบักใน Cypress)

เมื่อ test เริ่มซับซ้อน การ debug จึงเป็นหัวใจสำคัญของการพัฒนา Cypress อย่างมีประสิทธิภาพ  
บทนี้รวมทุกเทคนิคในการวิเคราะห์, หยุด test, ตรวจ log และจัดการ error ที่พบบ่อยที่สุด

---

## 🧭 1. การใช้ `cy.pause()` และ `cy.debug()`

ใช้ `cy.pause()` เพื่อ “หยุดการทำงานของ test” และดูสถานะปัจจุบันใน Test Runner

```js
cy.get('#username').type('student')
cy.pause()
cy.get('#password').type('1234')
cy.get('button[type=submit]').click()
```

> 💡 เมื่อ test หยุด คุณสามารถคลิก Step-by-step ใน Test Runner ได้

`cy.debug()` ใช้เมื่ออยากให้ Cypress หยุดและเปิด Console ที่จุดนั้น

```js
cy.get('.user-card').debug().should('contain', 'John')
```

---

## 📋 2. การดู Console Logs และ Network ใน Test Runner

เปิด Cypress GUI (`npx cypress open`) แล้วรัน test จะเห็น panel ข้างขวาแสดงทุก action  
คลิกแต่ละ step เพื่อดูรายละเอียด เช่น DOM snapshot, log, request, และ response.

> 🧠 ใช้ DevTools (F12) พร้อมกับ Cypress Runner เพื่อดู Network/Console Log เพิ่มเติม

---

## 🧠 3. การใช้ Cypress Studio (บันทึก Action อัตโนมัติ)

Cypress Studio ช่วย “บันทึกการคลิก / พิมพ์ / ตรวจสอบ” โดยไม่ต้องเขียนโค้ดเอง

เปิดใช้ใน `cypress.config.js`:

```js
e2e: {
  experimentalStudio: true
}
```

เมื่อเปิด Test Runner แล้วคลิกปุ่ม “Add Commands to Test”  
คุณสามารถคลิกบนหน้าเว็บเพื่อให้ Cypress เพิ่มคำสั่งให้อัตโนมัติใน test code

---

## 🧱 4. การใช้ `cy.task()` และ `cy.log()` เพื่อ debug ฝั่ง Node.js

ใช้ `cy.log()` เพื่อแสดงข้อความใน Cypress UI และ CLI console.

```js
cy.log('เริ่มต้นการทดสอบ Login')
cy.get('#email').type('test@example.com')
```

หากต้องการ log ฝั่ง Node (server-side) ใช้ `cy.task()`

ใน `cypress.config.js`:

```js
setupNodeEvents(on, config) {
  on('task', {
    log(message) {
      console.log(message)
      return null
    },
  })
}
```

ใน test:

```js
cy.task('log', '📡 เริ่มทดสอบ API Login')
cy.request('/api/login').then((res) => cy.task('log', res.status))
```

---

## 🔍 5. การจับ Error ด้วย `Cypress.on('fail')`

```js
Cypress.on('fail', (error, runnable) => {
  cy.screenshot('failed_test')
  console.error('❌ พบข้อผิดพลาด:', error.message)
  return false // ป้องกันไม่ให้ test ล้มทั้งหมด
})
```

> 💡 เหมาะสำหรับเก็บข้อมูลเมื่อเกิด error และถ่ายภาพอัตโนมัติ

---

## 🧩 6. ดู Request / Response จาก `cy.intercept()`

```js
cy.intercept('POST', '/api/login').as('login')
cy.get('form').submit()
cy.wait('@login').then((interception) => {
  console.log('📡 Request:', interception.request.body)
  console.log('✅ Response:', interception.response.body)
})
```

> ใช้ได้ทั้งใน Test Runner UI และ Console (Inspect → Console)

---

## 📸 7. การใช้ Screenshot และ Video สำหรับตรวจสอบย้อนหลัง

ตั้งค่าใน `cypress.config.js`:

```js
e2e: {
  video: true,
  screenshotOnRunFailure: true,
  videoCompression: 32,
}
```

- Cypress จะบันทึก **video ของทุก test run**  
- และจับภาพ (screenshot) เมื่อ test ล้มเหลวอัตโนมัติ

ตำแหน่งเก็บไฟล์:
```
cypress/videos/
cypress/screenshots/
```

---

## 🧩 8. การ Debug Test ใน CI/CD (Headless Mode)

ใช้คำสั่ง `--headed` เพื่อเปิด GUI mode ใน CI:

```bash
npx cypress run --headed --browser chrome
```

หรือเพิ่ม log verbose:

```bash
DEBUG=cypress:* npx cypress run
```

บันทึก log ลงไฟล์:
```bash
DEBUG=cypress:* npx cypress run > debug.log 2>&1
```

---

## ⚙️ 9. การตั้งค่าเพื่อให้ Debug เสถียร

```js
e2e: {
  defaultCommandTimeout: 8000,   // เพิ่มเวลารอ element
  retries: 2,                     // retry test ที่ล้มเหลว
  trashAssetsBeforeRuns: true,    // ลบไฟล์ก่อน run ใหม่
  screenshotOnRunFailure: true,   // ถ่ายภาพเมื่อ fail
  video: true,                    // บันทึก video ทุกครั้ง
}
```

---

## 💬 10. รวมปัญหายอดนิยมและแนวทางแก้ไข

| ปัญหา | สาเหตุ | แนวทางแก้ |
|--------|---------|------------|
| ❌ `element not found` | element โหลดช้า | ใช้ `.should('be.visible')` หรือเพิ่ม timeout |
| ⚠️ `detached from DOM` | element ถูก render ซ้ำ | ใช้ `.should()` แทน `.then()` เพื่อ auto-retry |
| 🕓 `timeout` | API หรือ animation ช้า | เพิ่ม `{ timeout: 10000 }` |
| 📦 `cy.visit()` fail | CORS หรือ network | ใช้ `chromeWebSecurity: false` |
| 💥 `Cannot read property ...` | response ไม่มี field | ตรวจสอบ response body ก่อนใช้ |
| 🔁 `flaky tests` | animation / reload page | ปิด animation หรือใช้ `cy.intercept()` เพื่อ stub response |

---

## 🧠 11. เทคนิค Debug เชิงลึก

### ดู State ของทุก Command
```js
cy.state()
```

### ดูค่า Command ล่าสุด
```js
cy.state('current')
```

### ใช้ Console ใน Test Runner
พิมพ์ `Cypress.$('selector')` เพื่อค้น element ใน runtime

### ใช้ Debugger ฝั่ง Browser
```js
cy.get('#submit').click()
debugger  // หยุดที่บรรทัดนี้ใน DevTools
```

---

## 🧩 12. ตัวอย่าง Flow Debug ครบชุด

```js
describe('Debug Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('ดีบักการเข้าสู่ระบบ', () => {
    cy.log('เริ่มทดสอบหน้า Login')
    cy.get('#email').type('student@test.com').debug()
    cy.get('#password').type('1234')
    cy.pause()
    cy.get('button[type=submit]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

> เมื่อใช้ `cy.pause()` และ `cy.debug()` จะสามารถดู DOM, ค่า input และ network request ได้แบบเรียลไทม์

---

## ✅ 13. สรุปคำสั่งสำคัญ

| คำสั่ง | ความหมาย |
|----------|-----------|
| `cy.pause()` | หยุดการทำงานของ test |
| `cy.debug()` | หยุดและเปิด inspect ใน console |
| `cy.task('log', message)` | ส่ง log ไปฝั่ง Node |
| `Cypress.on('fail', callback)` | ดักจับ error |
| `cy.log()` | แสดงข้อความใน UI log |
| `debugger` | หยุด test ใน browser DevTools |
| `DEBUG=cypress:*` | เปิด verbose log ใน CI |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `cy.pause()` ตอนเขียน test เพื่อดูการทำงาน step-by-step  
> - ใช้ `cy.task('log')` เพื่อ debug ข้อมูลฝั่ง backend  
> - เก็บ screenshot + video ทุกครั้ง เพื่อวิเคราะห์ test ที่ล้มเหลวใน CI  
> - อย่าลืมใช้ `retries` สำหรับ test ที่ไม่เสถียร  
> - ใช้ `debugger` และ DevTools เพื่อดู variable ระหว่างรันจริง  

---
