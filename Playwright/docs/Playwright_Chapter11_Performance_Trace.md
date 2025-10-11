# ⚙️ Performance & Trace (การวัดประสิทธิภาพและการบันทึก Trace)

Playwright มีเครื่องมือระดับมืออาชีพสำหรับวิเคราะห์การทำงานของเว็บ เช่น  
การเก็บ **trace**, การบันทึก **HAR (HTTP Archive)**, และการดู performance ของหน้าเว็บ  
ทั้งหมดนี้ช่วยให้คุณตรวจสอบสาเหตุของ test ที่ fail หรือช้าได้อย่างละเอียด

---

## 🎯 1. Trace คืออะไร

**Trace** คือไฟล์บันทึกเหตุการณ์ระหว่างการรันทดสอบ  
ซึ่งเก็บข้อมูลครบทุกการกระทำ เช่น:
- การคลิก / พิมพ์ / เลื่อนหน้า
- DOM Snapshot แต่ละจุด
- Console log / Network request / Response
- Screenshot ทุกขั้นตอน

---

## 🧰 2. เปิดใช้งาน Trace

### เปิด Trace สำหรับทุก test
เพิ่มใน `playwright.config.ts`:

```ts
use: {
  trace: 'on',  // บันทึก trace ทุก test
}
```

หรือแบบเก็บเฉพาะตอน fail:
```ts
use: {
  trace: 'retain-on-failure',
}
```

📘 *ค่า trace mode ที่ใช้ได้:*
| ค่า | ความหมาย |
|------|------------|
| `'on'` | เก็บ trace ทุก test |
| `'off'` | ไม่เก็บ trace |
| `'retain-on-failure'` | เก็บเฉพาะตอน test ล้มเหลว |
| `'on-first-retry'` | เก็บเฉพาะตอน rerun ครั้งแรก |

---

## 🧩 3. การเปิดดู Trace

หลังจากรัน test เสร็จ จะได้ไฟล์ `.zip` อยู่ในโฟลเดอร์ `test-results/`

เปิด trace viewer ด้วยคำสั่ง:
```bash
npx playwright show-trace trace.zip
```

Playwright จะเปิดหน้าเว็บ (local UI) เพื่อดูรายละเอียดแบบ interactive ได้ เช่น timeline, log, DOM snapshot, network ฯลฯ

---

## 🧭 4. เปิดใช้งาน Trace เฉพาะ test

```ts
test('trace one test', async ({ page, context }) => {
  await context.tracing.start({ screenshots: true, snapshots: true });
  await page.goto('https://example.com');
  await page.click('text=More information');
  await context.tracing.stop({ path: 'trace-one.zip' });
});
```

📘 *เหมาะกับ:* Debug test เฉพาะบางตัวโดยไม่เปิด trace ทั้งหมด

---

## 📈 5. การบันทึก HAR (HTTP Archive)

HAR เป็นไฟล์เก็บข้อมูลการโหลด resource เช่น API, CSS, JS, image

```ts
const context = await browser.newContext({
  recordHar: { path: 'network.har' }
});
const page = await context.newPage();
await page.goto('https://example.com');
await context.close();
```

สามารถเปิดดูไฟล์ HAR ได้ด้วยเครื่องมือเช่น Chrome DevTools หรือ [harviewer.dev](https://toolbox.googleapps.com/apps/har_analyzer/)

---

## 🧠 6. การวัดเวลาโหลดหน้าเว็บ

```ts
const start = Date.now();
await page.goto('https://example.com');
const loadTime = Date.now() - start;
console.log(`Page loaded in ${loadTime} ms`);
```

หรือใช้ Performance API ใน browser context:
```ts
const timing = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart);
console.log('Load time:', timing, 'ms');
```

---

## 🔍 7. การวัด FPS / Rendering Performance

```ts
const fps = await page.evaluate(() => {
  let lastTime = performance.now();
  let frameCount = 0;
  const measure = (resolve) => {
    const now = performance.now();
    frameCount++;
    if (now - lastTime >= 1000) resolve(frameCount);
    else requestAnimationFrame(() => measure(resolve));
  };
  return new Promise(measure);
});
console.log('FPS:', fps);
```

---

## ⚡ 8. การตรวจสอบ Memory และ CPU

```ts
const usage = await page.evaluate(() => performance.memory.usedJSHeapSize);
console.log('Memory used (bytes):', usage);
```

หรือดู CPU/Network ผ่าน trace viewer จะเห็นกราฟแบบ timeline

---

## 🧾 9. ตัวอย่าง Trace + HAR รวมกัน

```ts
const context = await browser.newContext({
  recordVideo: { dir: 'videos/' },
  recordHar: { path: 'har/session.har' },
});
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();
await page.goto('https://example.com');
await page.click('text=Learn more');
await context.tracing.stop({ path: 'trace.zip' });
await context.close();
```

---

## 🧩 10. การเปิด Trace ผ่าน Web UI

```bash
npx playwright show-trace trace.zip
```
หรือเปิดใน browser ผ่าน URL:
```
https://trace.playwright.dev/
```
แล้วลากไฟล์ trace.zip ใส่ได้เลย

---

## 🧱 11. การวิเคราะห์ Performance ใน CI/CD

ตัวอย่างใน GitHub Actions:
```yaml
- name: Run Playwright tests with trace
  run: npx playwright test --trace on

- name: Upload trace
  uses: actions/upload-artifact@v3
  with:
    name: trace-files
    path: test-results/
```

---

## ✅ 12. สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| บันทึก Trace | `use: { trace: 'on' }` | เก็บ trace ทุก test |
| เปิดดู Trace | `npx playwright show-trace trace.zip` | เปิด UI Viewer |
| บันทึก HAR | `recordHar: { path: 'network.har' }` | เก็บข้อมูล network |
| วัดเวลาโหลด | `Date.now()` หรือ `performance.timing` | ตรวจความเร็วโหลด |
| วัด Memory | `performance.memory.usedJSHeapSize` | ตรวจหน่วยความจำ |
| Start/Stop Trace | `context.tracing.start()` / `.stop()` | เริ่ม/หยุดการเก็บ trace |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `retain-on-failure` เพื่อเก็บ trace เฉพาะตอน fail ลดขนาดไฟล์  
> - เปิด trace viewer เพื่อตรวจ log และ DOM ย้อนหลังได้ละเอียดระดับ click-by-click  
> - ใช้ HAR สำหรับตรวจ performance API หรือ caching behavior  
> - รวม trace + video + HAR เข้าด้วยกันใน CI/CD เพื่อตรวจหาปัญหาช้าใน production test  

---
