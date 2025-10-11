# 🌐 บทที่ 9: Network Mock & Interception (การดักจับและจำลอง API Request/Response)

Cypress มีฟีเจอร์ `cy.intercept()` ที่ทรงพลังมากสำหรับการทดสอบระบบที่มี **API**  
สามารถใช้เพื่อ **ดักจับ**, **ตรวจสอบ**, **จำลอง (mock)** และ **ควบคุม** การตอบสนองจาก backend ได้โดยตรง

---

## 🧩 1. พื้นฐานของ `cy.intercept()`

โครงสร้างทั่วไป:
```js
cy.intercept(method, url, routeHandler)
```

ตัวอย่าง:
```js
cy.intercept('GET', '/api/users').as('getUsers')
cy.visit('/users')
cy.wait('@getUsers')
```

---

## 🔄 2. ตั้งชื่อ Alias และรอด้วย `cy.wait('@alias')`

```js
cy.intercept('GET', '/api/profile').as('getProfile')
cy.visit('/dashboard')
cy.wait('@getProfile')
cy.get('@getProfile').its('response.statusCode').should('eq', 200)
```

📘 ใช้ Alias (`as('getProfile')`) เพื่อรอ request และตรวจสอบข้อมูลได้

---

## 🧱 3. Mock (จำลอง) Response เอง

```js
cy.intercept('GET', '/api/users', {
  statusCode: 200,
  body: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
}).as('getUsers')

cy.visit('/users')
cy.wait('@getUsers')
cy.get('.user').should('have.length', 2)
```

> 💡 ใช้เพื่อจำลอง response โดยไม่ต้องพึ่ง backend จริง

---

## 🧾 4. ใช้ Fixture แทน Response จากไฟล์

```js
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers')
cy.visit('/users')
cy.wait('@getUsers')
```

📘 ไฟล์ `users.json` ต้องอยู่ใน `cypress/fixtures/users.json`

ตัวอย่างไฟล์:
```json
[
  { "id": 1, "name": "Student" },
  { "id": 2, "name": "Teacher" }
]
```

---

## 📡 5. ตรวจสอบ Header และ Body ของ Request

```js
cy.intercept('POST', '/api/login').as('loginRequest')

cy.get('#username').type('admin')
cy.get('#password').type('123456')
cy.get('button[type=submit]').click()

cy.wait('@loginRequest').then((interception) => {
  expect(interception.request.body.username).to.eq('admin')
  expect(interception.response.statusCode).to.eq(200)
})
```

---

## ⚙️ 6. จำลอง Error Response (500 / 404)

```js
cy.intercept('GET', '/api/users', {
  statusCode: 500,
  body: { message: 'Internal Server Error' },
}).as('getUsers')

cy.visit('/users')
cy.wait('@getUsers')
cy.get('.error').should('contain', 'Internal Server Error')
```

---

## 🧠 7. ดักจับเฉพาะบาง Request

```js
cy.intercept('GET', '/api/users*', (req) => {
  if (req.url.includes('admin')) {
    req.reply({ id: 99, name: 'Mock Admin' })
  }
})
```

หรือใช้ Regex:
```js
cy.intercept('GET', /\/api\/users\/\d+/).as('getUserById')
```

---

## 🧩 8. แก้ไข Request ก่อนส่ง (Modify Request)

```js
cy.intercept('POST', '/api/order', (req) => {
  req.body.productId = 9999
  req.continue()
}).as('createOrder')

cy.get('#buy').click()
cy.wait('@createOrder')
cy.get('@createOrder').its('request.body.productId').should('eq', 9999)
```

---

## 🧾 9. ตรวจสอบจำนวนครั้งที่เรียก API

```js
cy.intercept('GET', '/api/notifications').as('getNotifications')
cy.visit('/dashboard')
cy.wait('@getNotifications')
cy.wait('@getNotifications')
cy.get('@getNotifications.all').should('have.length', 2)
```

---

## 📊 10. ตรวจสอบ Performance / Response Time

```js
cy.intercept('GET', '/api/data').as('fetchData')
cy.visit('/report')
cy.wait('@fetchData').then(({ response }) => {
  expect(response.duration).to.be.lessThan(1000)
})
```

---

## 🧩 11. ใช้ `req.reply()` เพื่อควบคุม response แบบ dynamic

```js
cy.intercept('GET', '/api/user', (req) => {
  req.reply((res) => {
    res.body.name = 'Cypress Tester'
    res.send(res)
  })
})
```

หรือ delay การตอบสนอง:
```js
cy.intercept('GET', '/api/user', (req) => {
  req.reply((res) => {
    res.delay = 2000
    res.send({ id: 1, name: 'Slow User' })
  })
})
```

---

## ⚡ 12. ตรวจสอบ Network Request หลายรายการพร้อมกัน

```js
cy.intercept('GET', '/api/users').as('getUsers')
cy.intercept('GET', '/api/posts').as('getPosts')
cy.visit('/dashboard')
cy.wait(['@getUsers', '@getPosts'])
```

---

## 🧩 13. Stub Request และ Response พร้อมกัน

```js
cy.intercept(
  { method: 'POST', url: '/api/auth' },
  (req) => {
    expect(req.body.username).to.eq('student')
    req.reply({ statusCode: 200, body: { token: 'abc123' } })
  }
).as('auth')
```

---

## 🧠 14. การ Intercept กับ External APIs (เช่น Google Maps, Stripe)

```js
cy.intercept('GET', 'https://maps.googleapis.com/**', { statusCode: 200 }).as('mockMaps')
cy.intercept('POST', 'https://api.stripe.com/**', { statusCode: 200 }).as('mockStripe')
```

> ใช้จำลอง external service เพื่อไม่ให้ระบบจริงถูกเรียกซ้ำระหว่างทดสอบ

---

## 🧮 15. ตัวอย่างครบชุด (Login Flow + Mock API)

```js
describe('Login Flow Mock API', () => {
  it('จำลอง API และตรวจสอบ response', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: { token: 'mockToken123', user: { name: 'Student' } },
    }).as('loginRequest')

    cy.visit('/login')
    cy.get('#username').type('student')
    cy.get('#password').type('Password123')
    cy.get('button[type=submit]').click()

    cy.wait('@loginRequest')
    cy.url().should('include', '/dashboard')
    cy.get('.welcome').should('contain', 'Student')
  })
})
```

---

## ✅ 16. สรุปคำสั่งสำคัญ

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `cy.intercept(method, url)` | ดักจับ Request |
| `req.reply()` | ตอบกลับด้วยข้อมูล mock |
| `cy.wait('@alias')` | รอ request ที่ตั้งชื่อไว้ |
| `cy.fixture('file.json')` | โหลดข้อมูลจากไฟล์ |
| `req.continue()` | ส่ง request ต่อไปยัง backend |
| `cy.get('@alias').its('response.statusCode')` | ตรวจสอบสถานะ response |
| `.all` | ดูจำนวนครั้งที่ request ถูกเรียก |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `cy.intercept()` แทน `cy.server()` (deprecated)  
> - ใช้ fixture สำหรับ mock data ที่ซับซ้อนและซ้ำบ่อย  
> - ใช้ `.as()` ตั้ง alias เพื่อรอและตรวจสอบ API อย่างเป็นระบบ  
> - ใช้ `req.reply()` เพื่อแก้ไขหรือ delay response ได้ทุกขั้นตอน  
> - การ intercept จะทำให้ test เสถียรแม้ backend ยังไม่พร้อมใช้งาน  

---
