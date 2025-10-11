# 🧩 Frames & Popups (จัดการ Iframe และ Popup Window)

ในเว็บสมัยใหม่ มักมีองค์ประกอบซับซ้อน เช่น `iframe` (ฝังเว็บอื่นในหน้าเดียวกัน)  
หรือ popup ที่เปิดหน้าต่างใหม่ (เช่น หน้า login ของ Google)  
Playwright รองรับการจัดการทั้งสองแบบอย่างยืดหยุ่นและแม่นยำ

---

## 🪟 1. พื้นฐานของ Iframe

iframe คือหน้าเว็บย่อยที่อยู่ในหน้าเว็บหลัก  
เราสามารถเข้าถึงได้ผ่าน `page.frame()` หรือ `page.frames()`

```ts
const frame = page.frame({ name: 'my-frame' });
await frame.fill('#username', 'student');
await frame.click('#submit');
```

### 🔹 ค้นหา frame ตาม selector
```ts
const frame = page.frameLocator('#login-frame');
await frame.locator('#email').fill('user@example.com');
await frame.locator('button[type="submit"]').click();
```

📘 *หมายเหตุ:*  
`frameLocator()` คือวิธีใหม่ที่ง่ายและเสถียรกว่า `page.frame()` เพราะไม่ต้องรอ frame ด้วยตัวเอง

---

## 🔍 2. ตัวอย่างเว็บทดสอบ Iframe

```ts
import { test, expect } from '@playwright/test';

test('iframe example', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe');

  const frame = page.frameLocator('#mce_0_ifr');
  await frame.locator('#tinymce').fill('Hello from Playwright!');

  const text = await frame.locator('#tinymce').textContent();
  expect(text).toContain('Playwright');
});
```

📘 เว็บตัวอย่าง: [https://the-internet.herokuapp.com/iframe](https://the-internet.herokuapp.com/iframe)

---

## 🧭 3. คำสั่งที่ใช้บ่อยกับ Frame

| คำสั่ง | คำอธิบาย |
|----------|-----------|
| `page.frame(nameOrUrl)` | เข้าถึง frame ตามชื่อหรือ URL |
| `page.frames()` | คืนค่าทุก frame ในหน้า |
| `page.frameLocator(selector)` | ระบุ iframe โดยใช้ selector (วิธีแนะนำ) |
| `frame.locator(selector)` | ใช้ค้นหา element ภายใน frame |
| `frame.evaluate(fn)` | รัน JavaScript ใน context ของ frame |

ตัวอย่าง:
```ts
const frames = page.frames();
console.log('จำนวน frame:', frames.length);
```

---

## 🧠 4. การสื่อสารระหว่าง Frame

เราสามารถใช้ `evaluate()` เพื่อส่งข้อมูลข้าม frame ได้ เช่น:

```ts
const loginFrame = page.frame({ name: 'login-frame' });
await loginFrame.evaluate(() => localStorage.setItem('auth', '1'));
```

หรือดึงข้อมูลกลับมา:
```ts
const auth = await loginFrame.evaluate(() => localStorage.getItem('auth'));
console.log('Auth status:', auth);
```

---

## 🪟 5. การจัดการ Popup Window

บางเว็บจะเปิด popup เมื่อกดลิงก์ — เราสามารถดักได้ด้วย event `'popup'`:

```ts
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.click('text=Open Window'),
]);
await popup.waitForLoadState();
await expect(popup).toHaveTitle(/New Window/);
```

📘 *หมายเหตุ:*  
Playwright จะรอ popup เปิดจริงก่อนคืนค่า object popup กลับมา

---

## 🧩 6. การควบคุมหลายแท็บ (Multi-Page Context)

Context (session) เดียวสามารถเปิดหลายแท็บได้ เช่นจำลองผู้ใช้หลายคนในระบบเดียวกัน

```ts
const context = await browser.newContext();
const page1 = await context.newPage();
const page2 = await context.newPage();

await page1.goto('https://example.com');
await page2.goto('https://example.com/dashboard');
```

---

## 🔄 7. ดัก Popup Login (OAuth Example)

ตัวอย่างจำลอง popup login เช่น Google OAuth

```ts
test('google login popup', async ({ page, context }) => {
  await page.goto('https://example.com/login');

  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('button.google-login')
  ]);

  await popup.waitForLoadState();
  await popup.fill('input[type=email]', 'user@gmail.com');
  await popup.click('text=Next');
  await popup.close();
});
```

---

## 🧱 8. การตรวจสอบ Popup ปิดแล้วหรือยัง

```ts
await popup.waitForEvent('close');
console.log('✅ Popup ปิดเรียบร้อยแล้ว');
```

---

## 🧩 9. ใช้งาน Frame หลายชั้น (Nested Frames)

```ts
const outerFrame = page.frameLocator('#outer');
const innerFrame = outerFrame.frameLocator('#inner');
await innerFrame.locator('#btn').click();
```

📘 *เคล็ดลับ:* ใช้ `.frameLocator()` ต่อกันได้เรื่อย ๆ ตามลำดับการซ้อนของ iframe

---

## ⚙️ 10. ตรวจสอบจำนวน Frame และ Popup ทั้งหมด

```ts
console.log('Frames:', page.frames().length);
console.log('Popups:', context.pages().length);
```

---

## 💡 11. Debug Frame/Popup

| ปัญหา | วิธีแก้ |
|--------|---------|
| หา element ใน frame ไม่เจอ | ใช้ `frameLocator()` แทน `frame()` |
| Popup ปิดเร็วเกินไป | เพิ่ม `await popup.waitForLoadState()` ก่อนเข้าถึง |
| คลิกแล้วไม่เปิด popup | ตรวจสอบว่า popup ไม่ถูกบล็อกโดย browser headless |

---

## ✅ 12. สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| เข้าถึง frame | `page.frame(name)` | เข้าถึง frame ตามชื่อ |
| ระบุ frame | `page.frameLocator(selector)` | ใช้ selector ระบุ iframe |
| popup | `page.waitForEvent('popup')` | รอการเปิด popup |
| multi-tab | `context.newPage()` | เปิดแท็บใหม่ใน context เดิม |
| nested frame | `frameLocator().frameLocator()` | เข้าถึง frame ซ้อน |
| ปิด popup | `popup.close()` | ปิดหน้าต่าง popup |
| ตรวจ popup ปิด | `popup.waitForEvent('close')` | รอจน popup ปิด |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `frameLocator()` เสมอเมื่อทดสอบเว็บที่ฝัง iframe (เสถียรกว่าและ auto-wait ได้)  
> - ในการจำลอง OAuth popup login ใช้ `context.waitForEvent('page')` เพื่อดัก popup แทน `page.waitForEvent()`  
> - ใช้ `context.pages()` เพื่อตรวจสอบว่ามี popup เปิดอยู่กี่แท็บใน session เดียวกัน  
> - เมื่อ popup ถูก redirect หลายครั้ง ให้ใช้ `await popup.waitForURL(/callback/)` เพื่อรอให้ redirect เสร็จจริงก่อน assert  

---
