# 🌐 Navigation & Browser Control (การควบคุมการนำทางและเบราว์เซอร์)

บทนี้ครอบคลุมคำสั่งสำคัญในการควบคุมการเปิด ปิด การเปลี่ยนหน้าเว็บ และการจัดการเบราว์เซอร์หลายแท็บ (multi-tab)  
รวมถึงเทคนิคการควบคุม context, session, และการตั้งค่าการจำลองผู้ใช้ (emulation)

---

## 🧭 1. การเปิดหน้าเว็บ (Navigation)

```ts
await page.goto('https://example.com');
```
🔹 ใช้สำหรับเปิดหน้าเว็บใหม่  
🔹 Playwright จะรอจนโหลดครบ (ค่าเริ่มต้นคือ `load` event)

สามารถกำหนดระดับการรอได้ 3 แบบ:
```ts
await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
await page.goto('https://example.com', { waitUntil: 'load' });
await page.goto('https://example.com', { waitUntil: 'networkidle' });
```

| Mode | รายละเอียด |
|------|-------------|
| `domcontentloaded` | โหลดโครงสร้าง DOM เสร็จแล้ว (เร็วสุด) |
| `load` | โหลดทั้ง DOM และ resource (CSS, JS) |
| `networkidle` | ไม่มี request วิ่งเกิน 500ms (เหมาะกับเว็บที่โหลด async เยอะ) |

---

## 🔁 2. การเปลี่ยนหน้าเว็บ

```ts
await page.reload();             // โหลดหน้าใหม่
await page.goBack();             // กลับไปหน้าก่อนหน้า
await page.goForward();          // ไปหน้าถัดไป
```

📘 *Tip:* ใช้คู่กับ `waitForLoadState()` เพื่อให้แน่ใจว่าหน้าใหม่โหลดเสร็จจริง

```ts
await page.goBack();
await page.waitForLoadState('networkidle');
```

---

## 📑 3. การจัดการหลายแท็บ (Multi-Page / Popup)

### 🔹 เปิดแท็บใหม่
```ts
const newPage = await context.newPage();
await newPage.goto('https://google.com');
```

### 🔹 รอการเปิดแท็บจากลิงก์
```ts
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('a[target="_blank"]'),
]);
await newPage.waitForLoadState();
await newPage.bringToFront();
```

📘 *เทคนิค:* ใช้ `context.waitForEvent('page')` เพื่อดักแท็บใหม่โดยไม่ต้องรู้ลิงก์ล่วงหน้า

---

## 🧩 4. การจัดการ Context (Session)

Context คือ session browser หนึ่งชุด — เก็บ cookie, localStorage, และสถานะผู้ใช้แยกจากกัน

```ts
const context = await browser.newContext();
const page = await context.newPage();
```

หากต้องการจำลองผู้ใช้หลายคน:
```ts
const userA = await browser.newContext();
const userB = await browser.newContext();

await userA.newPage().goto('https://example.com');
await userB.newPage().goto('https://example.com');
```

---

## 🧠 5. การจำลอง Device / Viewport

Playwright มี device profiles ให้ใช้ เช่น iPhone, iPad, Galaxy ฯลฯ

```ts
import { devices } from '@playwright/test';

const iphone = devices['iPhone 12'];
const context = await browser.newContext({
  ...iphone,
  locale: 'th-TH',
  geolocation: { longitude: 100.5018, latitude: 13.7563 },
  permissions: ['geolocation'],
});
const page = await context.newPage();
await page.goto('https://maps.google.com');
```

---

## 🕹️ 6. การตั้งค่า Browser

### 🔹 เปิด Browser แบบเห็นหน้าจอ
```ts
const browser = await chromium.launch({ headless: false });
```

### 🔹 เปิดด้วย slow motion (หน่วงเวลาเพื่อดูการทำงาน)
```ts
const browser = await chromium.launch({ headless: false, slowMo: 250 });
```

### 🔹 ปิด Browser
```ts
await browser.close();
```

---

## 📍 7. Base URL

ตั้งค่า `baseURL` ใน `playwright.config.ts` เพื่อไม่ต้องพิมพ์ URL เต็มในทุก test:
```ts
use: { baseURL: 'https://example.com' }
```

จากนั้นในโค้ด test:
```ts
await page.goto('/login');
```

---

## 🧩 8. การจัดการ Cookies และ LocalStorage

### Cookies
```ts
await context.addCookies([{ name: 'session', value: 'abc123', domain: 'example.com', path: '/' }]);
const cookies = await context.cookies();
console.log(cookies);
```

### LocalStorage
```ts
await page.evaluate(() => localStorage.setItem('theme', 'dark'));
const theme = await page.evaluate(() => localStorage.getItem('theme'));
console.log(theme);
```

---

## ⚙️ 9. การตั้งค่าพร็อกซี / User Agent

```ts
const context = await browser.newContext({
  userAgent: 'MyCustomAgent/1.0',
  proxy: { server: 'http://myproxy.local:3128' },
});
```

---

## ✅ สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| เปิดเว็บ | `page.goto(url)` | เปิดหน้าใหม่ |
| โหลดใหม่ | `page.reload()` | โหลดหน้าอีกครั้ง |
| กลับหน้า | `page.goBack()` | กลับไปหน้าก่อน |
| แท็บใหม่ | `context.newPage()` | เปิดแท็บใหม่ |
| เปิด Browser | `chromium.launch()` | เปิดเบราว์เซอร์ |
| ปิด Browser | `browser.close()` | ปิดเบราว์เซอร์ |
| จำลอง Device | `devices['iPhone 12']` | จำลองขนาดจอมือถือ |
| ตั้งค่า Proxy | `proxy: { server: '...' }` | ใช้พร็อกซี |
| ตั้ง Base URL | `use: { baseURL: '...' }` | ไม่ต้องพิมพ์ URL เต็ม |

---

> 💡 **Tip:**  
> - ใช้ `page.waitForLoadState('networkidle')` ทุกครั้งหลังการเปลี่ยนหน้าเพื่อป้องกัน error “element not found”  
> - ใช้ `context.storageState({ path: 'state.json' })` เพื่อบันทึก session login แล้วใช้ซ้ำใน test อื่น ๆ  

---
