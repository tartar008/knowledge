# 🔍 Assertions (การตรวจสอบผลลัพธ์)

Playwright มีระบบตรวจสอบผล (Assertion) ในตัว ซึ่งพัฒนาอยู่ในแพ็กเกจ `@playwright/test`  
ทำให้สามารถเขียนการตรวจสอบที่ “รอจนกว่าจะเป็นจริง” โดยไม่ต้องใส่ delay หรือ wait เอง  

---

## ✅ 1. พื้นฐานการใช้งาน Assertion

```ts
import { test, expect } from '@playwright/test';

test('basic assertions', async ({ page }) => {
  await page.goto('https://example.com');

  // ตรวจสอบ Title
  await expect(page).toHaveTitle(/Example Domain/);

  // ตรวจสอบ URL
  await expect(page).toHaveURL('https://example.com/');

  // ตรวจสอบข้อความในหน้า
  await expect(page.locator('h1')).toHaveText('Example Domain');
});
```

📘 *หมายเหตุ:*  
ทุกคำสั่ง `expect()` จะมีระบบ auto-wait รอให้เงื่อนไขสำเร็จก่อน timeout (ค่าเริ่มต้น 5 วินาที)

---

## 🧩 2. การตรวจสอบกับ Locator

```ts
const header = page.locator('h1');
await expect(header).toBeVisible();
await expect(header).toHaveText('Example Domain');
```

| Assertion | คำอธิบาย |
|------------|-----------|
| `.toBeVisible()` | ตรวจสอบว่า element มองเห็นได้ |
| `.toBeHidden()` | ตรวจสอบว่า element ถูกซ่อน |
| `.toBeEnabled()` | element เปิดให้ใช้งาน |
| `.toBeDisabled()` | element ถูกปิดใช้งาน |
| `.toHaveText(value)` | มีข้อความตรงกับ value |
| `.toContainText(value)` | มีข้อความบางส่วนตรงกับ value |
| `.toHaveAttribute(name, value)` | มี attribute และค่าตรงกับ value |
| `.toHaveValue(value)` | ตรวจสอบค่าของ input |
| `.toHaveCount(n)` | จำนวน element ตรงกับที่กำหนด |

---

## 🔠 3. การตรวจสอบข้อความ (Text Assertions)

```ts
await expect(page.locator('.alert')).toHaveText('Invalid credentials');
await expect(page.locator('.alert')).toContainText('Invalid');
await expect(page.locator('.message')).toHaveText(/success/i);
```

📘 *เทคนิค:*  
ใช้ regex `/pattern/i` เพื่อตรวจแบบไม่สนตัวพิมพ์เล็ก/ใหญ่

---

## 📋 4. การตรวจสอบ URL / Title

```ts
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle('Dashboard - Admin Portal');
```

หรือใช้แบบ regex:
```ts
await expect(page).toHaveTitle(/dashboard/i);
```

---

## 🧱 5. ตรวจสอบ Attribute / Property

```ts
await expect(page.locator('button')).toHaveAttribute('type', 'submit');
await expect(page.locator('input')).toHaveValue('student');
await expect(page.locator('.card')).toHaveClass(/active/);
```

---

## 🧮 6. การตรวจสอบจำนวน Element

```ts
const items = page.locator('.list-item');
await expect(items).toHaveCount(5);
```

---

## ⚖️ 7. Soft Assertion (ไม่หยุดเมื่อ Fail)

ในบางกรณีต้องการให้ test ทำต่อแม้ assertion ล้มเหลว → ใช้ `expect.soft()`

```ts
await expect.soft(page.locator('.warning')).toBeVisible();
await page.click('#continue');
```

📘 *เคล็ดลับ:*  
ใช้กับ UI ที่ไม่ critical เช่น banner หรือ hint message

---

## 🔁 8. Negation (ตรวจสอบค่าตรงข้าม)

```ts
await expect(page.locator('#error')).not.toBeVisible();
await expect(page.locator('button')).not.toBeDisabled();
await expect(page.locator('.alert')).not.toHaveText('Error');
```

---

## 🧠 9. Custom Assertions

สามารถเขียน assert เพิ่มเองได้โดยใช้ JavaScript ปกติ:
```ts
const text = await page.locator('.price').textContent();
expect(parseFloat(text)).toBeGreaterThan(0);
```

หรือใช้ร่วมกับ API ของ Playwright:
```ts
const count = await page.locator('.user-row').count();
expect(count).toBeGreaterThan(3);
```

---

## 🧩 10. การ Assert กับหลาย Element

```ts
const buttons = page.locator('button');
for (const btn of await buttons.all()) {
  await expect(btn).toBeVisible();
}
```

---

## 🕒 11. การตั้งค่า Timeout เฉพาะ Assertion

```ts
await expect(page.locator('#success')).toBeVisible({ timeout: 10000 });
```

---

## 🔍 12. การตรวจสอบ Snapshot (ภาพหน้าจอหรือ Text)

```ts
await expect(page.locator('.content')).toHaveScreenshot('content.png');
await expect(await page.screenshot()).toMatchSnapshot('home.png');
```

📘 *ใช้สำหรับ:* Visual Regression Testing — ตรวจว่าหน้าเว็บเปลี่ยนไปหรือไม่

---

## ⚙️ 13. การตรวจสอบฟังก์ชันหรือค่าใน JS

```ts
const result = await page.evaluate(() => window.myApp.isLoggedIn);
expect(result).toBe(true);
```

---

## 📊 14. ตัวอย่างรวม Assertions

```ts
test('assertion demo', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');

  await page.fill('#username', 'student');
  await page.fill('#password', 'Password123');
  await page.click('#submit');

  await expect(page).toHaveURL(/logged-in-successfully/);
  await expect(page.locator('h1')).toHaveText('Logged In Successfully');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## ✅ 15. สรุปคำสั่ง Assertions สำคัญ

| หมวด | คำสั่ง | คำอธิบาย |
|-------|----------|-----------|
| ตรวจการแสดงผล | `.toBeVisible()` / `.toBeHidden()` | ตรวจว่า element แสดงหรือไม่ |
| ตรวจการใช้งาน | `.toBeEnabled()` / `.toBeDisabled()` | ตรวจว่า element ใช้งานได้หรือไม่ |
| ตรวจค่า | `.toHaveText()` / `.toContainText()` | ตรวจข้อความ |
| ตรวจจำนวน | `.toHaveCount(n)` | ตรวจจำนวน element |
| ตรวจค่าฟอร์ม | `.toHaveValue()` | ตรวจค่า input |
| ตรวจ attribute | `.toHaveAttribute(name, value)` | ตรวจค่า attribute |
| ตรวจ URL | `.toHaveURL()` | ตรวจ URL ปัจจุบัน |
| ตรวจ Title | `.toHaveTitle()` | ตรวจชื่อหน้าเว็บ |
| Soft | `expect.soft()` | ไม่หยุดการรันทดสอบ |
| Negation | `.not` | ตรวจค่าตรงข้าม |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `await expect()` แทน `waitForTimeout()` เพื่อให้ test เสถียร  
> - ใช้ regex กับ `.toHaveText()` เพื่อรองรับหลายภาษา / รูปแบบข้อความ  
> - ใช้ `expect.soft()` กับ UI ที่ไม่ critical เพื่อให้ test รันต่อได้  
> - ใช้ `.toMatchSnapshot()` สำหรับตรวจ visual diff ระหว่าง commit  

---
