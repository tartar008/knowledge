# 📂 Files (Upload & Download) — การจัดการไฟล์ใน Playwright

Playwright มีระบบจัดการไฟล์ในตัว ใช้ทดสอบการอัปโหลดและดาวน์โหลดไฟล์ได้โดยตรง  
โดยไม่ต้องใช้ external library เพิ่มเติม  

---

## 📤 1. การอัปโหลดไฟล์ (File Upload)

### ตัวอย่างพื้นฐาน
```ts
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('tests/files/sample.pdf');
```

📘 *คำอธิบาย:*
- คำสั่ง `.setInputFiles()` ใช้จำลองการเลือกไฟล์จากเครื่องจริง  
- ไฟล์ต้องมีอยู่ในโฟลเดอร์ที่รันทดสอบ (เช่น `tests/files/`)  
- Playwright จะจำลองการเลือกไฟล์โดยไม่ต้องเปิด dialog

---

### อัปโหลดหลายไฟล์พร้อมกัน
```ts
await fileInput.setInputFiles([
  'tests/files/a.pdf',
  'tests/files/b.pdf'
]);
```

---

### เคลียร์ไฟล์ที่เลือกไว้
```ts
await fileInput.setInputFiles([]);
```

---

### อัปโหลดไฟล์ในฟอร์มจริง (เว็บตัวอย่าง)
```ts
import { test, expect } from '@playwright/test';

test('upload example', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles('tests/files/sample.txt');
  await page.click('#file-submit');
  await expect(page.locator('h3')).toHaveText('File Uploaded!');
});
```

📘 *เว็บไซต์ทดสอบ:* [https://the-internet.herokuapp.com/upload](https://the-internet.herokuapp.com/upload)

---

## 📥 2. การดาวน์โหลดไฟล์ (File Download)

Playwright มีระบบ event `'download'` ใช้ดักการดาวน์โหลดไฟล์ระหว่าง test

```ts
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('text=Download File'),
]);
```

หลังจากนั้นสามารถใช้ method ต่าง ๆ ได้ดังนี้:

| Method | คำอธิบาย |
|---------|-----------|
| `download.suggestedFilename()` | คืนชื่อไฟล์ที่ browser เสนอให้ดาวน์โหลด |
| `download.path()` | คืน path ของไฟล์ที่โหลดมาในระบบ |
| `download.saveAs(path)` | บันทึกไฟล์ไปยัง path ที่ต้องการ |
| `download.failure()` | ตรวจสอบว่าเกิด error หรือไม่ |
| `download.delete()` | ลบไฟล์หลังการทดสอบ |

---

### ตัวอย่างจริง
```ts
test('download example', async ({ page }) => {
  await page.goto('https://file-examples.com/index.php/sample-documents-download/');
  
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a[href*=".docx"]')  // คลิกปุ่มดาวน์โหลด
  ]);

  const path = await download.path();
  console.log('✅ ไฟล์ถูกดาวน์โหลดที่:', path);
  await download.saveAs('downloads/sample.docx');
});
```

---

## 📁 3. การตรวจสอบไฟล์หลังดาวน์โหลด

สามารถใช้ Node.js `fs` ตรวจสอบไฟล์ได้ เช่น ขนาด หรือชื่อไฟล์

```ts
import fs from 'fs';

const filePath = await download.path();
const stats = fs.statSync(filePath);
console.log('ขนาดไฟล์ (bytes):', stats.size);
expect(stats.size).toBeGreaterThan(0);
```

---

## 🧩 4. การจำกัดโฟลเดอร์ดาวน์โหลด

ตั้งค่าที่ `browserContext`:
```ts
const context = await browser.newContext({
  acceptDownloads: true,
  downloadsPath: 'downloads/'
});
```

> ถ้าไม่ระบุ path, Playwright จะสร้าง temp directory อัตโนมัติ

---

## ⚙️ 5. การจัดการชื่อไฟล์อัตโนมัติ

```ts
const suggested = download.suggestedFilename();
await download.saveAs(`downloads/${Date.now()}_${suggested}`);
```

ช่วยป้องกันปัญหา “ไฟล์ชื่อซ้ำ” เมื่อรันทดสอบหลายครั้ง

---

## 🧠 6. เทคนิค Debug การดาวน์โหลด

| ปัญหา | วิธีแก้ |
|--------|---------|
| ไม่มี event download | ตรวจสอบว่า element ที่คลิกเป็น `<a href>` หรือใช้ JavaScript trigger |
| path เป็น null | ตรวจสอบว่า `acceptDownloads` ถูกตั้งค่าเป็น `true` |
| ไฟล์ไม่ดาวน์โหลดจริง | ลองใช้ `.waitForEvent('download', { timeout: ... })` |

---

## 🧾 7. การทดสอบอัปโหลด + ดาวน์โหลด รวมในเคสเดียว

```ts
test('upload and download flow', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');
  await page.setInputFiles('#file-upload', 'tests/files/sample.txt');
  await page.click('#file-submit');
  await expect(page.locator('h3')).toHaveText('File Uploaded!');

  // สมมติว่ามีลิงก์ดาวน์โหลด
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a#downloadLink'),
  ]);
  const filePath = await download.path();
  console.log('Downloaded to:', filePath);
});
```

---

## ✅ 8. สรุปคำสั่งหลัก

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| อัปโหลดไฟล์ | `.setInputFiles(path)` | ใส่ไฟล์ลงใน input |
| อัปโหลดหลายไฟล์ | `.setInputFiles([path1, path2])` | อัปโหลดหลายไฟล์ |
| เคลียร์ไฟล์ | `.setInputFiles([])` | ล้างไฟล์ |
| ดักดาวน์โหลด | `page.waitForEvent('download')` | รอ event download |
| ได้ชื่อไฟล์ | `download.suggestedFilename()` | คืนชื่อไฟล์ที่ browser เสนอ |
| ได้ path | `download.path()` | คืน path ที่ไฟล์อยู่ |
| บันทึกใหม่ | `download.saveAs(path)` | บันทึกไฟล์ด้วยชื่อใหม่ |
| ตั้งค่าที่ context | `acceptDownloads: true` | อนุญาตให้ดาวน์โหลดไฟล์ |

---

> 💬 **Tip มือโปร:**  
> - ใช้ `acceptDownloads: true` ใน `context` เพื่อให้ Playwright จัดการดาวน์โหลดได้อัตโนมัติ  
> - ใช้ `.saveAs()` พร้อม timestamp เพื่อป้องกันไฟล์ซ้ำชื่อ  
> - หากต้องการทดสอบว่าไฟล์ถูกดาวน์โหลดจริง ใช้ `fs.existsSync(path)`  
> - สำหรับเว็บที่ดาวน์โหลดผ่าน API (XHR/Fetch) ให้ intercept request แทน  

---
