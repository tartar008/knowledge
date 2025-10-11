# 📸 Screenshot & Visual Regression (จับภาพหน้าจอและทดสอบภาพแตกต่าง)

Playwright สามารถจับภาพ (screenshot) และเปรียบเทียบภาพ (visual regression) ได้ในตัว  
ช่วยให้สามารถตรวจสอบความเปลี่ยนแปลงของ UI ระหว่าง commit ได้อย่างอัตโนมัติ

---

## 🖼️ 1. การจับภาพหน้าจอ (Screenshot)

### 🔹 จับภาพทั้งหน้า
```ts
await page.screenshot({ path: 'screenshots/home.png', fullPage: true });
```

### 🔹 จับเฉพาะ element
```ts
await page.locator('#profile-card').screenshot({ path: 'screenshots/card.png' });
```

### 🔹 ตั้งชื่อไฟล์อัตโนมัติ
```ts
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
await page.screenshot({ path: `screenshots/home-${timestamp}.png` });
```

📘 *หมายเหตุ:*  
`fullPage: true` จะスクอลล์ทั้งหน้าแล้วถ่ายภาพรวมทั้งหมด

---

## 🎥 2. การบันทึกวิดีโอระหว่างทดสอบ

สามารถตั้งค่าใน `playwright.config.ts`:

```ts
use: {
  video: 'on',
}
```

หรือแบบเฉพาะ test:

```ts
const context = await browser.newContext({ recordVideo: { dir: 'videos/' } });
const page = await context.newPage();
await page.goto('https://example.com');
await page.close();
await context.close();
```

📘 *โหมด video:*  
| โหมด | ความหมาย |
|-------|------------|
| `'on'` | บันทึกทุก test |
| `'retain-on-failure'` | เก็บเฉพาะตอน test fail |
| `'off'` | ปิดการบันทึก |

---

## 🧩 3. การใช้ `expect().toHaveScreenshot()`

ใช้สำหรับเปรียบเทียบภาพ snapshot อัตโนมัติ

```ts
await expect(page).toHaveScreenshot('homepage.png');
```

หรือระบุ element:
```ts
await expect(page.locator('#navbar')).toHaveScreenshot('navbar.png');
```

📘 *เคล็ดลับ:*  
- ครั้งแรกจะสร้าง snapshot เก็บไว้ในโฟลเดอร์ `__screenshots__`  
- ครั้งต่อไปจะเปรียบเทียบกับ snapshot เดิมโดยอัตโนมัติ  
- ถ้าภาพต่างเกิน threshold → test จะ fail

---

## ⚙️ 4. การตั้งค่า Visual Regression ใน Config

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05, // ยอมให้ต่างได้ 5%
    },
  },
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

---

## 🧠 5. เปรียบเทียบ Snapshot หลายสถานะ

```ts
await page.goto('https://example.com');
await expect(page).toHaveScreenshot('home-default.png');

await page.click('#open-menu');
await expect(page).toHaveScreenshot('home-menu-open.png');
```

---

## 🧾 6. การจัดการ Snapshot ที่ต่างกัน

หากต้องการอัปเดต snapshot ให้เป็นเวอร์ชันใหม่:  
```bash
npx playwright test --update-snapshots
```

หรือเฉพาะไฟล์หนึ่ง:
```bash
npx playwright test tests/ui/home.spec.ts --update-snapshots
```

📘 *เหมาะกับ:* กรณี UI เปลี่ยนโดยตั้งใจ (เช่น redesign)

---

## 🧩 7. การถ่าย Screenshot หลังจากการทดสอบ (Post-Test Hook)

```ts
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ path: `errors/${testInfo.title}.png`, fullPage: true });
  }
});
```

ช่วยให้จับภาพอัตโนมัติเมื่อ test ล้มเหลว

---

## 🧠 8. การตั้งชื่อไฟล์ Screenshot ตาม Test

```ts
import { test, expect } from '@playwright/test';

test('dashboard page', async ({ page }, testInfo) => {
  await page.goto('https://example.com/dashboard');
  const screenshotName = testInfo.title.replace(/\s+/g, '_');
  await page.screenshot({ path: `screenshots/${screenshotName}.png` });
});
```

---

## 🎞️ 9. รวมวิดีโอและภาพเข้าด้วยกัน

ใน CI/CD สามารถแนบวิดีโอและภาพตอน fail เข้ากับ report ได้โดยอัตโนมัติ  
ตัวอย่างใน GitHub Actions:

```yaml
- run: npx playwright test
- name: Upload artifacts
  uses: actions/upload-artifact@v3
  with:
    name: test-artifacts
    path: |
      playwright-report/
      videos/
      screenshots/
```

---

## 🔍 10. ตรวจสอบภาพต่างด้วย Diff Viewer

หลังการรัน จะมีไฟล์ diff ใน `test-results/` เช่น
```
home.png
home-expected.png
home-diff.png
```
`home-diff.png` จะแสดงเฉพาะส่วนที่ต่างด้วยสี (เช่น แดง/น้ำเงิน)

---

## 🧱 11. การใช้ Visual Test กับ Element เฉพาะส่วน

```ts
await expect(page.locator('#product-card')).toHaveScreenshot('product-card.png', {
  mask: [page.locator('.dynamic-price')], // ซ่อนบาง element เช่น ราคาที่เปลี่ยนทุกครั้ง
});
```

---

## 💡 12. เคล็ดลับการใช้งานจริง

| ปัญหา | วิธีแก้ |
|--------|----------|
| UI มี Animation | ใช้ `page.evaluate(() => stopAnimations())` หรือ `waitForTimeout()` สั้น ๆ |
| Font / Rendering ต่างกัน | ใช้ container เดียวกัน (Docker / CI) |
| ขนาดจอไม่เท่ากัน | ใช้ config `viewport: { width, height }` คงที่ |
| Snapshot เปลี่ยนแต่ UI เหมือนเดิม | ปรับ `maxDiffPixelRatio` เพิ่มเล็กน้อย |

---

## ✅ 13. สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| จับภาพทั้งหน้า | `page.screenshot({ fullPage: true })` | บันทึกภาพทั้งหน้า |
| จับเฉพาะ element | `locator.screenshot()` | ถ่ายเฉพาะส่วน |
| บันทึกวิดีโอ | `use: { video: 'on' }` | ตั้งค่าบันทึกวิดีโอ |
| เปรียบเทียบภาพ | `expect().toHaveScreenshot()` | ตรวจ visual diff |
| อัปเดต snapshot | `--update-snapshots` | สร้าง snapshot ใหม่ |
| ซ่อน element | `{ mask: [locator] }` | ปิดบางส่วนตอนจับภาพ |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `mask` เพื่อซ่อน element ที่เปลี่ยนบ่อย เช่น เวลา, ราคา, animation  
> - ตั้ง `viewport` ให้คงที่ใน config เพื่อให้ภาพเปรียบเทียบได้เท่ากันทุกเครื่อง  
> - ใช้ `retain-on-failure` เพื่อเก็บวิดีโอเฉพาะตอน test fail ลดขนาดไฟล์  
> - ใช้ Visual Regression Testing ใน CI/CD เพื่อตรวจ UI ที่เปลี่ยนโดยไม่ตั้งใจ  

---
