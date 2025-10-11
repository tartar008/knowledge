# 🌐 Network Mock / Interception (การจำลองและดัก Network Request)

Playwright รองรับการดักจับและจำลอง (mock) request / response ของ network  
ช่วยให้สามารถทดสอบ frontend โดยไม่ต้องพึ่ง backend จริง เช่น การปลอม API, แก้ header, หรือจำกัดความเร็ว network  

---

## ⚙️ 1. พื้นฐานการดัก Network Request

ใช้ `page.route()` เพื่อดัก request ที่ตรงกับ pattern (เช่น URL หรือ path)

```ts
await page.route('**/api/user', route => {
  console.log('Intercepted:', route.request().url());
  route.continue();
});
```

📘 *หมายเหตุ:*  
- `**` หมายถึง wildcard pattern เช่น `**/api/*`  
- `route.continue()` คือการปล่อย request ไปต่อเหมือนปกติ

---

## 🧩 2. การ Mock Response แบบง่าย

```ts
await page.route('**/api/data', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Mocked Data' })
  });
});
```

📘 *เคล็ดลับ:*  
ใช้ `route.fulfill()` เพื่อแทนที่ response จริงทั้งหมด — เหมาะกับการทดสอบ frontend โดยไม่ต้องต่อ backend

---

## 🌐 3. ตัวอย่าง Mock API จริง

```ts
import { test, expect } from '@playwright/test';

test('mock api example', async ({ page }) => {
  await page.route('**/api/products', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Laptop', price: 35000 },
        { id: 2, name: 'Phone', price: 15000 },
      ]),
    });
  });

  await page.goto('https://myfrontend.com/products');
  await expect(page.locator('.product')).toHaveCount(2);
});
```

---

## 🧠 4. การแก้ไข Request ก่อนส่ง (Modify Request)

```ts
await page.route('**/api/login', route => {
  const headers = {
    ...route.request().headers(),
    'x-debug-mode': 'true'
  };
  route.continue({ headers });
});
```

📘 *กรณีใช้งาน:*  
เพิ่ม header เพื่อ debug หรือจำลอง token

---

## 🧪 5. การจำลอง Error / Delay Network

```ts
await page.route('**/api/order', async route => {
  await page.waitForTimeout(2000); // จำลอง delay
  await route.fulfill({ status: 500, body: 'Internal Server Error' });
});
```

📘 *ใช้ประโยชน์:*  
จำลองกรณี API ล่ม หรือโหลดช้า เพื่อตรวจสอบการจัดการ error ของ UI

---

## 🧭 6. การดัก Response

ใช้ `page.on('response')` เพื่อตรวจทุก response ที่โหลดเข้ามาในหน้า

```ts
page.on('response', response => {
  console.log('Response:', response.url(), response.status());
});
```

หรือรอ response เฉพาะ URL:
```ts
const response = await page.waitForResponse('**/api/login');
console.log(await response.json());
```

---

## 🧩 7. การบันทึก Request / Response Log

```ts
page.on('request', request => console.log('➡️', request.method(), request.url()));
page.on('response', response => console.log('⬅️', response.status(), response.url()));
```

📘 *เคล็ดลับ:*  
ใช้สำหรับวิเคราะห์พฤติกรรม network ของเว็บ เช่น ตรวจ caching, call ซ้ำ, หรือ response code

---

## 🧱 8. การจำกัดความเร็วเน็ต (Network Throttling)

จำลอง slow 3G หรือ network delay:

```ts
const context = await browser.newContext();
await context.route('**/*', route =>
  setTimeout(() => route.continue(), 2000) // delay ทุก request 2 วิ
);
```

---

## 📦 9. การดัก Request และตอบกลับจากไฟล์ JSON

```ts
import fs from 'fs';

const mockData = fs.readFileSync('tests/mocks/products.json', 'utf-8');

await page.route('**/api/products', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: mockData,
  });
});
```

📘 *ใช้ในงานจริง:*  
เก็บ mock data แยกเป็นไฟล์ JSON เพื่อ reuse ได้หลาย test case

---

## 🧩 10. การ Block Resource บางประเภท

```ts
await page.route('**/*.{png,jpg,jpeg,svg}', route => route.abort());
```

📘 *ใช้เพื่อลดเวลาโหลด* — ตัดรูป/asset ออกตอนรันทดสอบ

---

## 🔍 11. ตรวจสอบ Response Content

```ts
const response = await page.waitForResponse('**/api/data');
const data = await response.json();
expect(data).toHaveProperty('message');
```

---

## 🧠 12. Combine Route หลาย Pattern

```ts
await page.route('**/api/users', route => route.abort()); // Block API 1
await page.route('**/api/products', route => route.continue()); // Allow API 2
```

---

## 📊 13. ตรวจสอบ Headers ของ Response

```ts
const response = await page.waitForResponse('**/api/user');
const headers = response.headers();
console.log('Response Headers:', headers);
```

---

## 🧩 14. ใช้งานร่วมกับ Context-level Route

ตั้ง route ที่ระดับ context (ใช้ได้กับทุกหน้าใน session):
```ts
await context.route('**/api/**', route => {
  route.fulfill({ status: 403, body: 'Access Denied' });
});
```

---

## ✅ 15. สรุปคำสั่งหลัก

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| ดัก request | `page.route()` | ดักทุก request ที่ match pattern |
| ตอบกลับปลอม | `route.fulfill()` | ส่ง response ปลอมกลับ |
| ปล่อยผ่าน | `route.continue()` | ให้ request วิ่งต่อปกติ |
| แก้ header | `route.continue({ headers })` | เพิ่ม header |
| จำลอง error | `route.fulfill({ status: 500 })` | จำลอง server error |
| ดัก response | `page.waitForResponse()` | รอ response กลับ |
| log network | `page.on('request')` / `page.on('response')` | บันทึก network call |
| block resource | `route.abort()` | ยกเลิกการโหลด asset |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `route.fulfill()` เพื่อ isolate frontend test จาก backend จริง  
> - ใช้ `page.on('response')` เพื่อ log เฉพาะ status code ผิดปกติ เช่น 400+, 500  
> - สามารถผสม pattern หลายระดับได้ เช่น `**/api/**`, `**/*.json`  
> - ใช้ `context.route()` เมื่ออยากให้ทุกหน้าใน test ใช้ mock เดียวกัน  

---
