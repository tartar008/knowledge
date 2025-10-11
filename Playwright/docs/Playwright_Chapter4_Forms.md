# 🧾 Forms & Inputs (การกรอกข้อมูลและจัดการฟอร์ม)

Playwright มีคำสั่งที่หลากหลายสำหรับการโต้ตอบกับแบบฟอร์ม เช่น input, select, checkbox, radio, และ keyboard event  
พร้อมระบบ auto-wait และ assertion สำหรับตรวจสอบค่าที่กรอกได้อย่างแม่นยำ

---

## ✏️ 1. กรอกข้อมูลลงใน Input

```ts
await page.fill('#username', 'student');
await page.fill('#password', 'Password123');
```

📘 *คำอธิบาย:*  
- `.fill(selector, value)` จะล้างค่าปัจจุบันและใส่ค่าใหม่ทันที  
- ถ้า element ไม่พร้อมใช้งาน (เช่นยังโหลดไม่เสร็จ) — Playwright จะรออัตโนมัติ

---

## ⌨️ 2. จำลองการพิมพ์จริงด้วย `.type()`

```ts
await page.type('#username', 'student', { delay: 150 });
```

- `.type()` พิมพ์ทีละตัวพร้อม delay (มิลลิวินาที)  
- เหมาะกับการจำลองพฤติกรรมผู้ใช้จริง เช่น input ที่ต้องการ trigger onKeyPress

---

## 🔘 3. Checkbox และ Radio Button

```ts
await page.check('#rememberMe');
await page.uncheck('#rememberMe');
await page.locator('#genderMale').check();
await expect(page.locator('#rememberMe')).toBeChecked();
```

📘 *หมายเหตุ:*  
- `.check()` จะรอจน element ปรากฏและ enabled ก่อนติ๊กให้  
- ถ้า checkbox ถูกติ๊กอยู่แล้ว Playwright จะไม่ทำซ้ำ (ปลอดภัยต่อการรันซ้ำ)

---

## 📑 4. Dropdown / Select Options

```ts
await page.selectOption('#country', 'TH');
await page.selectOption('#language', { label: 'English' });
await page.selectOption('#version', { index: 2 });
```

📘 *เคล็ดลับ:*  
`value`, `label`, `index` สามารถเลือกใช้ได้ตามต้องการ  
Playwright จะรอจน select พร้อมก่อนสั่งเลือกเสมอ

---

## 🔢 5. การตรวจสอบค่าที่กรอก

```ts
await expect(page.locator('#username')).toHaveValue('student');
await expect(page.locator('#country')).toHaveValue('TH');
```

---

## 🧠 6. การล้างค่าใน input

```ts
await page.locator('#username').clear();
await expect(page.locator('#username')).toHaveValue('');
```

> *หมายเหตุ:* `.clear()` ทำงานเหมือน `Ctrl+A + Backspace`

---

## 🧩 7. Keyboard Events

Playwright รองรับ event การพิมพ์และการกดปุ่มแบบละเอียดมาก เช่น Tab, Enter, Ctrl+C

```ts
await page.keyboard.press('Tab');
await page.keyboard.type('Playwright');
await page.keyboard.press('Control+A');
await page.keyboard.press('Backspace');
```

📘 *เทคนิค:*  
สามารถผสม key หลายปุ่มได้ เช่น:
```ts
await page.keyboard.press('Control+Shift+I');  // เปิด DevTools
```

---

## 📋 8. Clipboard API (จำลอง Copy / Paste)

```ts
// คัดลอกข้อความ
await page.evaluate(() => navigator.clipboard.writeText('copied text'));

// วางข้อความ
const pasted = await page.evaluate(() => navigator.clipboard.readText());
console.log(pasted); // "copied text"
```

---

## 📂 9. การอัปโหลดไฟล์ในฟอร์ม

```ts
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('tests/files/sample.pdf');
```

สามารถอัปโหลดหลายไฟล์พร้อมกันได้:
```ts
await fileInput.setInputFiles(['tests/files/a.pdf', 'tests/files/b.pdf']);
```

หรือเคลียร์ไฟล์ที่เลือกไว้:
```ts
await fileInput.setInputFiles([]);
```

---

## 🧩 10. การกดปุ่ม Submit

```ts
await page.click('button[type="submit"]');
await page.press('#password', 'Enter');
```

---

## 🕹️ 11. การโต้ตอบกับ Input แบบพิเศษ

### Input ที่มี autocomplete
```ts
await page.fill('#search', 'Playwright');
await page.waitForSelector('.suggestion-item');
await page.click('.suggestion-item >> text=Playwright Testing');
```

### Input แบบ hidden (ใช้ JS)
```ts
await page.evaluate(() => {
  const input = document.querySelector('#hiddenInput');
  input.value = 'Injected by script';
});
```

---

## 🧪 12. ฟอร์มตัวอย่าง (Login Form)

```ts
import { test, expect } from '@playwright/test';

test('login form example', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  await page.fill('#username', 'student');
  await page.fill('#password', 'Password123');
  await page.check('#remember');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/logged-in-successfully/);
});
```

---

## 🧱 13. การ Assert ค่าหลัง Submit

```ts
await expect(page.locator('.alert-success')).toHaveText('Form submitted successfully!');
await expect(page.locator('#username')).toHaveValue('student');
```

---

## 💡 14. เคล็ดลับสำหรับฟอร์มขนาดใหญ่

| ปัญหา | แนวทางแก้ |
|--------|------------|
| Input โหลดช้า | ใช้ `waitForSelector()` ก่อน fill |
| Input ถูก disable | ใช้ `.evaluate()` เปลี่ยน state ก่อน |
| มีหลาย input ชื่อคล้ายกัน | ใช้ `.getByLabel()` หรือ `.filter({ hasText })` |
| ต้องทดสอบ UI แบบพิมพ์เร็ว | ใช้ `.type()` แทน `.fill()` |

---

## ✅ สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | คำอธิบาย |
|-------|----------|-----------|
| กรอกข้อความ | `.fill(value)` | ล้างและใส่ข้อความใหม่ |
| จำลองพิมพ์ | `.type(value, { delay })` | พิมพ์ทีละตัว |
| ติ๊ก checkbox | `.check()` / `.uncheck()` | ติ๊ก / เอาติ๊กออก |
| เลือก dropdown | `.selectOption(value)` | เลือก option |
| เคลียร์ input | `.clear()` | ลบค่าที่กรอก |
| ตรวจสอบค่า | `expect(...).toHaveValue()` | ตรวจสอบผล |
| อัปโหลดไฟล์ | `.setInputFiles()` | ใส่ไฟล์ลงใน input[type=file] |
| Keyboard | `.keyboard.press()` | จำลองการกดปุ่ม |

---

> 💬 **Tip มือโปร:**  
> - ใช้ `.getByLabel()` เมื่อ input มี label จะเสถียรกว่า CSS selector  
> - ถ้าต้องกรอกหลายฟิลด์ ใช้ loop + `await Promise.all()` เพื่อเร่งความเร็ว  
> - เมื่อมี autocomplete ใช้ `.press('ArrowDown')` + `.press('Enter')` แทน click ได้  
> - ใช้ `page.pause()` เพื่อ debug ขั้นตอนการกรอกข้อมูลใน UI Mode  

---
