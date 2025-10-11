# 🕓 Waiting & Sync (การรอและการซิงโครไนซ์ใน Playwright)

Playwright มีระบบ **Auto-Waiting** ที่ชาญฉลาด ทำให้การทดสอบมีความเสถียรสูงโดยไม่ต้องใช้ `sleep()`  
ทุก action เช่น `.click()` หรือ `.fill()` จะรอให้ element ปรากฏ, พร้อมใช้งาน, และไม่ถูกบังอยู่ก่อนจึงทำงานได้

---

## ⚙️ 1. ระบบ Auto-Wait ทำงานอย่างไร

Playwright จะรอโดยอัตโนมัติเมื่อพบเงื่อนไขเหล่านี้:
- Element ยังไม่อยู่ใน DOM
- Element มองไม่เห็น (hidden)
- Element ถูก disable
- Animation ยังไม่จบ
- Network ยังไม่ idle

ตัวอย่าง:
```ts
await page.click('#submit');  // จะรอจนปุ่มปรากฏและพร้อมคลิกจริง
```

📘 *หมายเหตุ:*  
Auto-wait ทำงานกับ action ทุกประเภท เช่น `.click()`, `.fill()`, `.check()`, `.hover()`, `.selectOption()`

---

## ⏱️ 2. Explicit Wait (การรอแบบกำหนดเอง)

### รอ Element ปรากฏ
```ts
await page.waitForSelector('#username');
await page.fill('#username', 'student');
```

### รอ Element หายไป
```ts
await page.waitForSelector('.loading', { state: 'detached' });
```

ค่าที่ `state` รองรับ:
| state | ความหมาย |
|--------|------------|
| `'attached'` | Element ถูกเพิ่มเข้ามาใน DOM |
| `'detached'` | Element ถูกลบออกจาก DOM |
| `'visible'` | Element ปรากฏให้เห็น |
| `'hidden'` | Element ซ่อนอยู่หรือไม่อยู่ใน DOM |

---

## 🌐 3. การรอการโหลดหน้าเว็บ

```ts
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle'); // ใช้กับเว็บที่มีโหลดข้อมูล async
```

| State | รายละเอียด |
|--------|-------------|
| `load` | โหลดทุก resource เสร็จ |
| `domcontentloaded` | DOM พร้อมใช้งาน |
| `networkidle` | ไม่มี request ใด ๆ วิ่งเกิน 500 ms |

---

## 📡 4. การรอ Network Request / Response

### รอ Request ที่ตรง URL pattern
```ts
await page.waitForRequest('**/api/login');
```

### รอ Response ที่ตรง URL pattern
```ts
await page.waitForResponse('**/api/user', response => response.status() === 200);
```

---

## 🧩 5. การรอเงื่อนไขเฉพาะ (Custom Wait)

```ts
await page.waitForFunction(() => window.appReady === true);
```

📘 *คำอธิบาย:*  
`waitForFunction()` จะรัน JavaScript ซ้ำ ๆ จนกว่าฟังก์ชันนั้น return ค่า truthy

---

## 🧠 6. การรอหลายเหตุการณ์พร้อมกัน

ใช้ `Promise.all()` เพื่อรอ event หลายอย่างในเวลาเดียวกัน:

```ts
const [response] = await Promise.all([
  page.waitForResponse('**/api/login'),
  page.click('#submit'),
]);
```

Playwright จะคลิกปุ่มและรอ response กลับมาพร้อมกัน

---

## 🧩 7. การรอโดยใช้ Expect Assertion

```ts
await expect(page.locator('#success')).toBeVisible();
```

📘 *หมายเหตุ:*  
`expect()` มี built-in wait อยู่แล้ว (default timeout 5 วินาที)  
จึงไม่จำเป็นต้องใช้ `waitForSelector()` ก่อนหน้าเสมอไป

---

## 🧾 8. การตั้งค่า Timeout เอง

```ts
await page.waitForSelector('#data', { timeout: 10000 });
await expect(page.locator('#done')).toBeVisible({ timeout: 15000 });
```

หรือใน `playwright.config.ts`:
```ts
export default defineConfig({
  timeout: 30 * 1000,
  expect: { timeout: 5000 }
});
```

---

## 🕹️ 9. การหน่วงเวลาแบบเจาะจง (Manual Delay)

หลีกเลี่ยงการใช้ `.waitForTimeout()` เว้นแต่จำเป็นจริง ๆ

```ts
await page.waitForTimeout(2000); // รอ 2 วินาที
```

📘 *คำแนะนำ:*  
ควรใช้เฉพาะกรณี animation หรือ loading ที่คาดเดาได้ยากเท่านั้น

---

## 📊 10. การตรวจสอบการ Sync ของ UI

บางครั้งหลังจากคลิกหรือพิมพ์ อาจต้องรอให้ UI อัปเดต:  
```ts
await page.fill('#search', 'Playwright');
await page.waitForSelector('.results-loaded');
```

---

## 🧩 11. การรอภายใน Locator เอง

Locator มีคำสั่ง `.waitFor()` เพื่อรอเฉพาะ element นั้น ๆ

```ts
const btn = page.locator('#submit');
await btn.waitFor({ state: 'visible' });
await btn.click();
```

---

## ⚡ 12. รอจน element หายไปก่อนเริ่มขั้นต่อไป

```ts
await page.waitForSelector('.loading', { state: 'hidden' });
await page.click('#next-step');
```

---

## 💡 13. การรอพร้อมเงื่อนไขซับซ้อน

```ts
await page.waitForFunction(() => {
  const el = document.querySelector('.status');
  return el && el.textContent.includes('Complete');
});
```

---

## ✅ 14. สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| รอ element | `page.waitForSelector()` | รอจน element ปรากฏ |
| รอหายไป | `{ state: 'hidden' }` | รอจน element หาย |
| รอโหลดหน้า | `page.waitForLoadState()` | รอ DOM หรือ Network |
| รอ API | `page.waitForResponse()` | รอ response จาก API |
| รอเงื่อนไข | `page.waitForFunction()` | รอให้ JS return true |
| Auto-wait | Built-in ทุก action | ไม่ต้องเขียน wait เอง |
| Manual wait | `page.waitForTimeout(ms)` | ใช้เฉพาะกรณีจำเป็น |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `expect()` แทน manual wait ให้ได้มากที่สุด  
> - ถ้ามี loading overlay ใช้ `.waitForSelector('.loading', { state: 'hidden' })` ก่อนคลิกปุ่มถัดไป  
> - เมื่อ test ชอบ fail แบบ random ให้ตรวจสอบว่ามี element dynamic ที่ต้องรอหรือไม่  
> - ถ้า API call ยาว ใช้ `page.waitForResponse()` เพื่อ sync test กับ backend จริง  

---
