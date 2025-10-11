# 🎯 Locators & Actions (การระบุและโต้ตอบกับ Element)

Playwright มีระบบ **Locator API** ที่ทรงพลังมาก ใช้ในการค้นหา element และสั่ง action ได้อย่างแม่นยำ  
จุดเด่นคือ Locator จะ *รอจนกว่่า element จะพร้อมใช้งาน* โดยอัตโนมัติ (auto-waiting)  

---

## 🔍 1. Locator คืออะไร

> Locator คือ object ที่ใช้ระบุตำแหน่งของ element หนึ่ง ๆ ในหน้าเว็บ  
> มัน “ยังไม่ค้นหา” จนกว่าจะมีการเรียกใช้ action เช่น `.click()` หรือ `.fill()`

```ts
const username = page.locator('#username');
await username.fill('student');
```

📘 *ข้อดีของ Locator:*
- ไม่ต้องรอ element เอง → Playwright จะ auto-wait
- ใช้ซ้ำได้ → Locator มีสถานะคงที่
- ใช้ chain ได้ เช่น `.locator('div').nth(2).getByText('Edit')`

---

## 🧭 2. วิธีการระบุ Element

| ประเภท | ตัวอย่าง | คำอธิบาย |
|----------|-----------|-----------|
| **By Text** | `page.getByText('Login')` | ค้นหา element ที่มีข้อความตรงกับ 'Login' |
| **By Role** | `page.getByRole('button', { name: 'Submit' })` | ใช้ aria-role เช่น button, link, heading |
| **By Label** | `page.getByLabel('Username')` | สำหรับ input ที่มี label |
| **By Placeholder** | `page.getByPlaceholder('Enter your name')` | สำหรับ input ที่มี placeholder |
| **By Test ID** | `page.getByTestId('login-form')` | ใช้ data-testid attribute |
| **CSS Selector** | `page.locator('.nav-item.active')` | ใช้ CSS ปกติ |
| **XPath Selector** | `page.locator('//h1[text()="Welcome"]')` | ใช้ XPath |

---

## ⚙️ 3. ตัวอย่าง Locator พื้นฐาน

```ts
await page.locator('#username').fill('student');
await page.locator('#password').fill('Password123');
await page.locator('button[type="submit"]').click();
```

หรือใช้แบบย่อ:
```ts
await page.fill('#username', 'student');
await page.fill('#password', 'Password123');
await page.click('text=Submit');
```

---

## 🧩 4. การ Chain Locator (Nested Search)

สามารถ chain ได้หลายระดับ:
```ts
const menu = page.locator('.menu');
await menu.locator('li').nth(2).click();
```

หรือแบบเจาะจง text ภายใน:
```ts
await page.locator('.card').filter({ hasText: 'Delete' }).click();
```

📘 *คำอธิบาย:*  
`filter({ hasText })` ใช้คัดกรอง element ที่มีข้อความเฉพาะภายใน

---

## 🧠 5. Locator Action ที่พบบ่อย

| คำสั่ง | การทำงาน |
|----------|------------|
| `.click()` | คลิก element |
| `.dblclick()` | ดับเบิ้ลคลิก |
| `.fill(value)` | กรอกข้อความลงใน input |
| `.type(value, options)` | พิมพ์แบบจำลองการพิมพ์จริง |
| `.press(key)` | กดปุ่ม keyboard เช่น Enter, Tab |
| `.hover()` | เลื่อนเมาส์ไปเหนือ element |
| `.check()` / `.uncheck()` | ติ๊ก / เอาติ๊ก checkbox |
| `.selectOption()` | เลือก option ใน select |
| `.clear()` | ล้างค่าใน input |

ตัวอย่าง:
```ts
await page.locator('#rememberMe').check();
await page.locator('#country').selectOption('TH');
await page.locator('#username').press('Enter');
```

---

## 🧱 6. การตรวจสอบสถานะ Element

```ts
await expect(page.locator('#submit')).toBeVisible();
await expect(page.locator('#submit')).toBeEnabled();
await expect(page.locator('#submit')).toBeDisabled();
await expect(page.locator('#checkbox')).toBeChecked();
await expect(page.locator('#username')).toHaveValue('student');
await expect(page.locator('.alert')).toHaveText(/Invalid/);
```

---

## 🧩 7. การจัดการ Element หลายตัว

### นับจำนวน
```ts
const items = page.locator('.list-item');
await expect(items).toHaveCount(5);
```

### คลิกตัวที่ n
```ts
await page.locator('button').nth(2).click();
```

### Loop ผ่าน element
```ts
const elements = await page.locator('.item').all();
for (const el of elements) {
  console.log(await el.textContent());
}
```

---

## 🧠 8. เทคนิค Locator ขั้นสูง

### 🔹 ใช้ has / hasText
```ts
await page.locator('div', { hasText: 'Important' }).click();
await page.locator('.list', { has: page.locator('text=Delete') }).click();
```

### 🔹 Combine Locator
```ts
await page.locator('section').locator('button', { hasText: 'Save' }).click();
```

### 🔹 Locator Assertions แบบ Soft
```ts
await expect.soft(page.locator('.warning')).toBeVisible();
```

---

## ⚡ 9. การ Drag & Drop

```ts
await page.dragAndDrop('#source', '#target');
```

หรือแบบละเอียด:
```ts
const source = page.locator('#source');
const target = page.locator('#target');
await source.hover();
await page.mouse.down();
await target.hover();
await page.mouse.up();
```

---

## 📷 10. การ Scroll ให้ element มองเห็น

```ts
await page.locator('#footer').scrollIntoViewIfNeeded();
```

---

## 🔒 11. รอ Element พร้อมก่อนทำ Action

ถึงแม้ Playwright จะรอให้อัตโนมัติ แต่สามารถเพิ่มการตรวจสอบได้:
```ts
const button = page.locator('#submit');
await button.waitFor({ state: 'visible' });
await button.click();
```

ค่าที่รองรับ: `'attached'`, `'detached'`, `'visible'`, `'hidden'`

---

## ✅ 12. สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | คำอธิบาย |
|-------|----------|-----------|
| กรอกข้อมูล | `.fill(value)` | กรอกข้อความลง input |
| คลิก | `.click()` | คลิก element |
| รอ element | `.waitFor()` | รอจนกว่าจะปรากฏ |
| ตรวจสอบ | `expect(locator)` | ใช้ assert element |
| chain locator | `.locator(selector)` | ค้นหา nested element |
| filter | `.filter({ hasText })` | คัดกรอง element |
| นับจำนวน | `.toHaveCount(n)` | ตรวจสอบจำนวน element |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `.getByRole()` และ `.getByLabel()` เป็นหลักเพื่อให้ test ทนต่อการเปลี่ยน layout  
> - หลีกเลี่ยง XPath ถ้าไม่จำเป็น — ใช้ Role/Text ดีกว่าเพราะอ่านง่ายและเร็วกว่า  
> - ใช้ `.pause()` ก่อน action เพื่อ debug DOM ได้จาก UI Mode  

---
