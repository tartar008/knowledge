# 💡 Debug & Troubleshooting (การดีบั๊กและแก้ปัญหาใน Playwright)

Playwright มีเครื่องมือดีบั๊กที่ทรงพลังมาก ทั้ง UI inspector, trace viewer, log, และ video  
บทนี้จะรวบรวมเทคนิคทั้งหมดที่ใช้แก้ไข test ที่ล้มเหลวหรือทำงานไม่ถูกต้อง

---

## 🧭 1. การรันในโหมด Debug

เมื่อรัน Playwright ด้วย `--debug` จะเปิด **Inspector UI** ที่ให้คุณดูและควบคุมการทำงานทีละขั้นตอน

```bash
npx playwright test --debug
```

📘 *สิ่งที่ทำได้:*  
- หยุดทุก test ก่อนเริ่มรัน  
- คลิกปุ่ม “Step Over / Step Into” เพื่อรันทีละคำสั่ง  
- ดู locator ทั้งหมดในหน้า  
- สั่งให้จับ screenshot ได้ทันที

---

## 🧱 2. ใช้ `page.pause()` เพื่อหยุด test ชั่วคราว

```ts
await page.goto('https://example.com');
await page.pause(); // หยุดที่นี่เพื่อดูหน้าเว็บแบบสด
```

หลังจากเรียก `page.pause()` โปรแกรมจะเปิด **Playwright Inspector** โดยอัตโนมัติ  
สามารถตรวจ element หรือเรียกคำสั่ง live ได้ เช่นพิมพ์ใน console ของ inspector:  
```
page.locator('button').click()
```

---

## 🧩 3. เปิด UI Mode (Interactive Debug Mode)

```bash
npx playwright test --ui
```
จะเปิดหน้าต่าง UI Mode สำหรับรัน test แบบโต้ตอบ มีฟังก์ชัน:
- ดูผลลัพธ์แต่ละ test  
- เปิด/ปิด video, screenshot  
- rerun test เฉพาะบางตัว  
- debug test แบบ visual ได้ทันที  

---

## 🔍 4. ดู Console Log และ Network Log

คุณสามารถดักจับ log และ network ได้ระหว่างรันทดสอบ

### Console Log
```ts
page.on('console', msg => console.log('🧾 Console:', msg.text()));
```

### Network Request
```ts
page.on('request', req => console.log('➡️', req.method(), req.url()));
page.on('response', res => console.log('⬅️', res.status(), res.url()));
```

---

## 🧠 5. ตรวจ Stack Trace ตอน Error

เมื่อ test fail, Playwright จะแสดง stack trace ชัดเจนใน terminal เช่น:
```
Error: locator.click: Target closed
    at /tests/login.spec.ts:23:15
```
คุณสามารถเปิดไฟล์และบรรทัดที่เกี่ยวข้องได้โดยตรงใน VSCode (คลิกได้ใน terminal)

---

## ⚙️ 6. Debug ผ่าน VSCode

ติดตั้ง Extension: **Playwright Test for VSCode**  
จากนั้นเปิดเมนู **Testing → Playwright Tests → Run Debug**

หรือใช้ `launch.json` แบบนี้:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Playwright Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
      "args": ["test", "--project=Chromium", "--headed", "--timeout=0"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

📘 *ผลลัพธ์:*  
สามารถวาง breakpoints ในโค้ด แล้วรัน/หยุดทีละขั้นตอนใน VSCode ได้

---

## 🪶 7. เปิด Browser แบบ Headed (ดู browser จริง)

```bash
npx playwright test --headed
```
จะเปิด browser จริงขึ้นมาระหว่างรัน test เหมาะกับการดูพฤติกรรมจริงของหน้าเว็บ

---

## 🧩 8. ใช้ Slow Motion Mode

ชะลอความเร็วการรันทดสอบเพื่อดูพฤติกรรมทีละขั้นตอน

```bash
npx playwright test --slow-mo 500
```
(หน่วง 500 มิลลิวินาทีต่อ action)

---

## 🧠 9. Debug Flaky Test (Test ล้มเหลวบ้างไม่ล้มบ้าง)

| ปัญหา | วิธีแก้ |
|--------|----------|
| Element หาไม่เจอ | ใช้ `await expect(locator).toBeVisible()` ก่อนคลิก |
| Animation ยังไม่จบ | เพิ่ม `waitForSelector()` หรือใช้ `page.waitForLoadState()` |
| Network delay | ใช้ `waitForResponse()` เพื่อ sync กับ API |
| Random data | ทำให้ deterministic เช่น ใช้ seed คงที่ |

เพิ่ม retry อัตโนมัติ:
```ts
retries: 2
```

---

## 🧾 10. ตรวจสอบ Trace หลังการรัน

เปิด trace ที่บันทึกไว้:
```bash
npx playwright show-trace trace.zip
```

จะเห็น timeline, action log, DOM snapshot, และ console log ทั้งหมดในแต่ละ step

---

## 🧩 11. Debug ใน CI/CD

เมื่อรันบน CI เช่น GitHub Actions หรือ Jenkins  
สามารถเปิด debug mode ด้วย environment variable:

```yaml
env:
  DEBUG: pw:api
```

หรือบันทึก trace/video ไว้เพื่อ debug ย้อนหลัง:

```yaml
use:
  video: 'retain-on-failure'
  trace: 'retain-on-failure'
```

---

## 🧠 12. Debug Selector ที่หา element ไม่เจอ

ใช้คำสั่ง `locator.highlight()` เพื่อไฮไลต์ element ใน browser ขณะ debug

```ts
await page.locator('#submit').highlight();
```

หรือใช้ CLI Command:
```bash
npx playwright codegen https://example.com
```
แล้วกด element ที่ต้องการ → จะได้ selector ที่แม่นยำ

---

## 🧩 13. ดู Log ละเอียดของ Playwright

เปิด log mode แบบ verbose:
```bash
DEBUG=pw:api npx playwright test
```
จะเห็น log ของทุก action เช่น click, fill, wait, navigation

---

## 💡 14. Debug ผ่าน Remote (SSH หรือ Docker)

สามารถเปิด browser บนเซิร์ฟเวอร์แล้วดูผ่าน trace viewer ที่เครื่อง local ได้  
โดย copy ไฟล์ trace.zip มาดูภายหลัง:
```bash
scp user@server:/app/test-results/trace.zip ./trace.zip
npx playwright show-trace trace.zip
```

---

## ✅ 15. สรุปเครื่องมือ Debug สำคัญ

| เครื่องมือ | คำสั่ง | การใช้งาน |
|-------------|----------|------------|
| Pause test | `page.pause()` | หยุดการรันทันที |
| Inspector | `--debug` | เปิดหน้าต่างดีบั๊ก |
| UI Mode | `--ui` | รัน test แบบ interactive |
| Headed mode | `--headed` | เปิด browser จริง |
| Slow motion | `--slow-mo 500` | ชะลอการรันเพื่อสังเกต |
| Trace Viewer | `show-trace trace.zip` | ดู log + DOM + screenshot |
| VSCode Debugger | Playwright Extension | รันและดู breakpoint |
| Verbose log | `DEBUG=pw:api` | แสดง log ละเอียด |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `page.pause()` + `--headed` เพื่อ debug แบบเห็นหน้าเว็บจริง  
> - ใช้ `--debug` สำหรับ run test แบบ step-by-step พร้อม DOM inspector  
> - เก็บ `trace.zip` และ `video` ทุกครั้งที่ fail เพื่อวิเคราะห์ย้อนหลัง  
> - ใช้ `npx playwright codegen` เพื่อสร้าง selector ที่แม่นยำและลด error “element not found”  

---
