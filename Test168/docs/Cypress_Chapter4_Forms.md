# 🧾 บทที่ 4: Forms & Inputs (การกรอกและจัดการฟอร์มใน Cypress)

การกรอกฟอร์มเป็นส่วนสำคัญของการทดสอบระบบจริง เช่น login, สมัครสมาชิก, ค้นหา, หรือ checkout  
บทนี้รวมทุกคำสั่งที่ใช้กรอก ตรวจสอบ และส่งข้อมูลในฟอร์มด้วย Cypress

---

## ✏️ 1. กรอกข้อมูลใน input ด้วย `.type()`

```js
cy.get('#username').type('student')
cy.get('#password').type('Password123')
```

Cypress จะจำลองการพิมพ์จริงทีละตัวอักษร  
สามารถใส่ปุ่มพิเศษเช่น `{enter}`, `{tab}`, `{esc}` ได้

```js
cy.get('#username').type('student{tab}Password123{enter}')
```

---

## 🔄 2. ลบข้อความใน input ด้วย `.clear()`

```js
cy.get('#email').clear().type('newmail@example.com')
```

ใช้เมื่อฟิลด์มีค่ามาก่อนแล้วต้องการกรอกใหม่

---

## 👀 3. โฟกัสและออกจากช่อง (focus / blur)

```js
cy.get('#email').focus()
cy.get('#email').blur()
```

ใช้ร่วมกับการตรวจสอบ validation ได้ เช่น:

```js
cy.get('#email').focus().blur()
cy.get('.error').should('contain', 'Email is required')
```

---

## ☑️ 4. Checkbox และ Radio Button

### `.check()` และ `.uncheck()`

```js
cy.get('input[type="checkbox"]').check()
cy.get('input[type="checkbox"]').uncheck()
```

สามารถเลือกหลายค่าได้ในครั้งเดียว:

```js
cy.get('input[type="checkbox"]').check(['email', 'sms'])
```

### Radio Button

```js
cy.get('input[type="radio"][value="female"]').check()
cy.get('input[type="radio"][value="male"]').should('be.checked')
```

---

## 🔽 5. Dropdown (Select box)

```js
cy.get('select').select('Thailand')      // ตามข้อความ
cy.get('select').select('TH')            // ตาม value
cy.get('select').should('have.value', 'TH')
```

สามารถเลือกหลายค่าได้:

```js
cy.get('select[multiple]').select(['JP', 'KR'])
```

---

## 💾 6. การส่งฟอร์ม (Form Submit)

Cypress ไม่มีคำสั่ง `submit()` โดยตรง แต่สามารถคลิกปุ่มหรือใช้ `.submit()` ได้

```js
cy.get('form').submit()
```

หรือแบบกดปุ่ม:
```js
cy.get('button[type=submit]').click()
```

หลังจากนั้นตรวจสอบผลลัพธ์:
```js
cy.url().should('include', '/dashboard')
cy.get('h1').should('contain', 'Welcome')
```

---

## 🧠 7. การตรวจสอบค่าในช่องกรอก

```js
cy.get('#username').should('have.value', 'student')
cy.get('#email').invoke('val').should('match', /@example\.com$/)
```

---

## 🧩 8. การจำลอง Keyboard Event

```js
cy.get('#search').type('Playwright{enter}')
cy.get('#search').type('{selectall}{backspace}')
cy.get('#input').type('Hello{rightarrow}{rightarrow}World')
```

รายการ key ที่ใช้ได้ เช่น:  
`{enter}`, `{tab}`, `{esc}`, `{del}`, `{backspace}`, `{ctrl}`, `{alt}`, `{meta}`, `{shift}`

---

## 📂 9. Upload ไฟล์

Cypress ต้องใช้ plugin **cypress-file-upload**

### ติดตั้ง:
```bash
npm install --save-dev cypress-file-upload
```

เพิ่มใน `cypress/support/commands.js`:
```js
import 'cypress-file-upload'
```

### ตัวอย่างการใช้งาน:
```js
cy.get('input[type="file"]').attachFile('example.json')
```

หรือแนบหลายไฟล์:
```js
cy.get('input[type="file"]').attachFile(['file1.pdf', 'file2.png'])
```

ตรวจสอบชื่อไฟล์:
```js
cy.get('.file-name').should('contain', 'example.json')
```

---

## 🔍 10. Validation Message

Cypress สามารถตรวจสอบข้อความแจ้งเตือนได้หลายวิธี

### ตัวอย่าง:
```js
cy.get('#email').focus().blur()
cy.get('.error').should('contain', 'Email is required')
```

หรือใช้ attribute `validationMessage`:

```js
cy.get('#email').then(($el) => {
  expect($el[0].validationMessage).to.eq('Please fill out this field.')
})
```

---

## 🧱 11. ฟอร์มที่ปิดการใช้งาน (Disabled)

```js
cy.get('input[disabled]').should('be.disabled')
cy.get('button[type=submit]').should('not.be.disabled')
```

---

## 🔄 12. Intercept Form Submission (จำลอง response จาก API)

```js
cy.intercept('POST', '/api/login', {
  statusCode: 200,
  body: { success: true, token: 'abc123' },
}).as('loginRequest')

cy.get('#username').type('admin')
cy.get('#password').type('123456')
cy.get('button[type=submit]').click()

cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
```

📘 ใช้เพื่อทดสอบ frontend โดยไม่ต้องพึ่ง backend จริง

---

## 🧮 13. ตัวอย่างแบบครบ flow (Login Form)

```js
describe('Login Form E2E', () => {
  it('กรอกข้อมูลและเข้าสู่ระบบสำเร็จ', () => {
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

## ✅ 14. สรุปคำสั่งหลัก

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `.type('text')` | พิมพ์ข้อความลง input |
| `.clear()` | ลบข้อความในช่อง |
| `.focus()` / `.blur()` | จำลองการ focus/blur |
| `.check()` / `.uncheck()` | เลือก checkbox หรือ radio |
| `.select()` | เลือกค่าใน dropdown |
| `.submit()` | ส่งฟอร์ม |
| `.attachFile()` | อัปโหลดไฟล์ (ใช้ plugin) |
| `.should('have.value')` | ตรวจสอบค่าที่กรอก |
| `.invoke('val')` | ดึงค่าจาก input |
| `.intercept()` | ดักจับการส่งข้อมูล API |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `{enter}` หลังการกรอกเพื่อจำลองการกด Enter จริง  
> - ใช้ `.focus().blur()` เพื่อทดสอบ validation message  
> - ใช้ `cy.intercept()` ดักจับ response แทนการรอ backend จริง  
> - ใช้ `cypress-file-upload` สำหรับ test upload ทุกประเภท  
> - หลีกเลี่ยงการใช้ `cy.wait(2000)` — ใช้ `cy.wait('@alias')` แทนเพื่อให้เสถียรกว่า  

---
