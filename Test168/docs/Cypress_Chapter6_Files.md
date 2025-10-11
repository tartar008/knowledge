# 📂 บทที่ 6: Files (Upload & Download)

Cypress รองรับการทดสอบการอัปโหลดและดาวน์โหลดไฟล์ได้อย่างสมบูรณ์  
บทนี้จะอธิบายเทคนิคการจัดการไฟล์, ตรวจสอบชื่อไฟล์, และตรวจสอบการดาวน์โหลดในระบบจริง

---

## 📤 1. การอัปโหลดไฟล์ (File Upload)

### 🧩 วิธีที่ 1: ใช้ Plugin `cypress-file-upload`

#### ติดตั้ง Plugin
```bash
npm install --save-dev cypress-file-upload
```

เพิ่มใน `cypress/support/commands.js`:
```js
import 'cypress-file-upload'
```

จากนั้นสามารถใช้ `.attachFile()` ได้ทันที

#### ตัวอย่าง:
```js
cy.visit('https://the-internet.herokuapp.com/upload')
cy.get('input[type="file"]').attachFile('example.txt')
cy.get('#file-submit').click()
cy.get('h3').should('contain', 'File Uploaded!')
```

> ✅ Cypress จะอ่านไฟล์จากโฟลเดอร์ `cypress/fixtures/` โดยอัตโนมัติ

---

### 🧩 วิธีที่ 2: อัปโหลดโดยไม่ใช้ Plugin

```js
const fileName = 'example.txt'

cy.fixture(fileName).then(fileContent => {
  cy.get('input[type="file"]').selectFile({
    contents: Cypress.Buffer.from(fileContent),
    fileName: fileName,
    mimeType: 'text/plain',
  })
})

cy.get('#file-submit').click()
cy.get('h3').should('contain', 'File Uploaded!')
```

---

### 🧩 วิธีที่ 3: Upload หลายไฟล์พร้อมกัน

```js
cy.get('input[type="file"]').attachFile(['file1.png', 'file2.pdf'])
```

หรือใช้ `selectFile()` แบบ native:
```js
cy.get('input[type="file"]').selectFile(
  ['cypress/fixtures/file1.png', 'cypress/fixtures/file2.pdf'],
  { action: 'select' }
)
```

---

## 🧠 2. ตรวจสอบชื่อไฟล์หลังอัปโหลด

```js
cy.get('.uploaded-files').should('contain.text', 'example.txt')
```

หรือใช้ `.invoke('text')`:
```js
cy.get('.uploaded-files').invoke('text').should('match', /example\.txt/)
```

---

## 🧾 3. ตรวจสอบประเภทและขนาดไฟล์

```js
cy.fixture('example.png', 'base64').then((file) => {
  const bytes = Cypress.Buffer.from(file, 'base64')
  expect(bytes.length).to.be.greaterThan(0)
})
```

---

## 📥 4. การดาวน์โหลดไฟล์ (File Download)

Cypress ไม่สามารถ “บังคับบันทึกไฟล์” ได้โดยตรง  
แต่สามารถตรวจสอบได้ว่ามีการ **trigger download** หรือไม่ และ **ตรวจสอบไฟล์ที่ดาวน์โหลดจริง** ได้

### ตัวอย่าง:
```js
cy.visit('https://the-internet.herokuapp.com/download')
cy.contains('some-file.txt').click()

const downloadsFolder = Cypress.config('downloadsFolder')
cy.readFile(`${downloadsFolder}/some-file.txt`).should('exist')
```

📘 ไฟล์ดาวน์โหลดจะถูกเก็บไว้ในโฟลเดอร์ `cypress/downloads`

---

## 🧩 5. ตรวจสอบเนื้อหาในไฟล์ที่ดาวน์โหลด

```js
cy.readFile('cypress/downloads/some-file.txt').should('contain', 'Hello World')
```

หรือใช้ regex ตรวจสอบบางส่วน:
```js
cy.readFile('cypress/downloads/data.json').its('user.name').should('eq', 'John Doe')
```

---

## ⚙️ 6. การดักจับการดาวน์โหลดผ่าน API (Intercept Download)

```js
cy.intercept('GET', '/files/**').as('downloadFile')
cy.contains('Download').click()
cy.wait('@downloadFile').its('response.statusCode').should('eq', 200)
```

📘 เหมาะกับระบบที่ส่งไฟล์ผ่าน API เช่น PDF, Excel, CSV

---

## 🧩 7. ตรวจสอบไฟล์ PDF หรือ Excel

### PDF (ใช้ plugin `pdf-parse`)
```bash
npm install pdf-parse
```

```js
import pdf from 'pdf-parse'

cy.readFile('cypress/downloads/report.pdf', 'base64').then(file => {
  const buffer = Buffer.from(file, 'base64')
  return pdf(buffer)
}).then(data => {
  expect(data.text).to.include('Report Summary')
})
```

### Excel (ใช้ plugin `xlsx`)
```bash
npm install xlsx
```

```js
import * as XLSX from 'xlsx'

cy.readFile('cypress/downloads/data.xlsx', 'binary').then((content) => {
  const workbook = XLSX.read(content, { type: 'binary' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet)
  expect(rows[0].name).to.eq('John')
})
```

---

## 🧠 8. ตรวจสอบการอัปโหลดแบบ Drag & Drop

```js
cy.get('#dropzone').selectFile('cypress/fixtures/example.png', {
  action: 'drag-drop'
})
cy.get('#message').should('contain', 'Upload successful')
```

---

## 🧾 9. ตัวอย่างครบ Flow (Upload + Verify + Download)

```js
describe('File Upload & Download Flow', () => {
  it('อัปโหลดและดาวน์โหลดไฟล์สำเร็จ', () => {
    cy.visit('https://the-internet.herokuapp.com/upload')
    cy.get('input[type=file]').attachFile('example.txt')
    cy.get('#file-submit').click()
    cy.get('h3').should('contain', 'File Uploaded!')

    cy.visit('https://the-internet.herokuapp.com/download')
    cy.contains('example.txt').click()

    cy.readFile('cypress/downloads/example.txt', { timeout: 10000 }).should('exist')
  })
})
```

---

## ✅ 10. สรุปคำสั่งสำคัญ

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `.attachFile()` | อัปโหลดไฟล์ (ใช้ plugin) |
| `.selectFile()` | อัปโหลดไฟล์แบบ native |
| `.readFile()` | อ่านเนื้อหาไฟล์ |
| `.writeFile()` | เขียนไฟล์ใหม่ |
| `.intercept()` | ดักจับ request เมื่อมีการดาวน์โหลด |
| `.should('exist')` | ตรวจสอบว่ามีไฟล์อยู่จริง |
| `.its('response.statusCode')` | ตรวจสอบสถานะการดาวน์โหลด |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `cypress-file-upload` สำหรับทุกเคส upload ง่ายที่สุด  
> - ตรวจสอบไฟล์ที่ดาวน์โหลดด้วย `cy.readFile()` เพื่อยืนยันเนื้อหา  
> - ใช้ `cy.intercept()` เพื่อจับไฟล์ API เช่น PDF หรือ CSV  
> - เก็บ fixture ของไฟล์ตัวอย่างไว้ใน `cypress/fixtures/` เพื่อให้จัดการง่าย  
> - ใช้ `action: 'drag-drop'` จำลอง drag & drop ได้ทุก input  

---
