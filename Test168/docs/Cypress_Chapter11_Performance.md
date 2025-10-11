# ⚙️ บทที่ 11: Performance & Trace (การตรวจสอบประสิทธิภาพและการบันทึกการทำงานใน Cypress)

การวัดประสิทธิภาพเว็บ (Performance Testing) ใน Cypress เป็นขั้นตอนสำคัญ  
สำหรับการตรวจสอบว่าเว็บของคุณโหลดเร็ว, ประมวลผลไว, และ API ตอบสนองได้ดีเพียงใด  
บทนี้รวมเทคนิคระดับมืออาชีพในการเก็บข้อมูลและวิเคราะห์ performance log

---

## ⏱ 1. การวัดเวลาโหลดหน้าเว็บ (Page Load Time)

สามารถใช้ Performance API ของ Browser ได้ผ่าน `cy.window()`

```js
cy.visit('https://example.com')
cy.window().then((win) => {
  const timing = win.performance.timing
  const loadTime = timing.loadEventEnd - timing.navigationStart
  cy.log(`⏱ Page load time: ${loadTime} ms`)
  expect(loadTime).to.be.lessThan(3000)
})
```

> 💡 ใช้สำหรับตรวจสอบว่าเว็บโหลดไม่เกินระยะเวลาที่กำหนด (เช่น 3 วินาที)

---

## 🧠 2. การตรวจสอบ Event Timing ของ DOM

```js
cy.window().then((win) => {
  const perf = win.performance.getEntriesByType('navigation')[0]
  cy.log(`DOMContentLoaded: ${perf.domContentLoadedEventEnd} ms`)
  cy.log(`First Paint: ${perf.responseStart - perf.requestStart} ms`)
  cy.log(`Total Load: ${perf.loadEventEnd - perf.startTime} ms`)
})
```

---

## 🧩 3. การวัด Response Time ของ API ด้วย `cy.intercept()`

```js
cy.intercept('GET', '/api/data').as('getData')
cy.visit('/dashboard')
cy.wait('@getData').then(({ response }) => {
  cy.log(`API Duration: ${response.duration} ms`)
  expect(response.statusCode).to.eq(200)
  expect(response.duration).to.be.lessThan(1000)
})
```

---

## 🧮 4. การเก็บค่า Performance Metrics เป็นไฟล์ JSON

```js
cy.window().then((win) => {
  const metrics = win.performance.getEntriesByType('resource')
  cy.writeFile('cypress/reports/performance.json', metrics)
})
```

> 🔎 เหมาะสำหรับเก็บข้อมูลทุก request เช่น JS, CSS, image, API เพื่อวิเคราะห์ภายหลัง

---

## 📡 5. การใช้ Chrome DevTools Protocol (CDP)

Cypress สามารถเชื่อมกับ DevTools API เพื่อเก็บ Metrics ลึกระดับ browser engine ได้

```js
Cypress.on('before:browser:launch', (browser, launchOptions) => {
  if (browser.family === 'chromium') {
    launchOptions.args.push('--enable-logging')
    launchOptions.args.push('--v=1')
  }
  return launchOptions
})
```

จากนั้นใช้ใน test:
```js
cy.task('log', 'Starting Chrome Performance Trace...')
cy.visit('https://example.com')
cy.window().then((win) => {
  const entries = win.performance.getEntries()
  cy.writeFile('cypress/reports/perf_trace.json', entries)
})
```

---

## 🧩 6. การใช้ Plugin Lighthouse (`cypress-audit`)

### ติดตั้ง Plugin:
```bash
npm install --save-dev cypress-audit lighthouse
```

### ตั้งค่าใน `cypress.config.js`:
```js
const { lighthouse, prepareAudit } = require('cypress-audit')

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        prepareAudit(launchOptions)
      })
      on('task', {
        lighthouse: lighthouse(),
      })
    },
  },
}
```

### ใช้งานใน Test:
```js
describe('Lighthouse Performance Audit', () => {
  it('ตรวจสอบ Performance และ Accessibility', () => {
    cy.visit('https://example.com')
    cy.lighthouse({
      performance: 80,
      accessibility: 90,
      'best-practices': 80,
      seo: 85,
    })
  })
})
```

📘 Cypress จะรัน Lighthouse ใน background และให้คะแนน performance โดยอัตโนมัติ

---

## ⚡ 7. การตรวจสอบ Network Request Time ทั้งหมด

```js
cy.window().then((win) => {
  const resources = win.performance.getEntriesByType('resource')
  const totalTime = resources.reduce((sum, res) => sum + res.duration, 0)
  cy.log(`🌐 Total Resource Load Time: ${totalTime.toFixed(2)} ms`)
})
```

---

## 🧠 8. การเก็บ FPS / Rendering Performance

```js
cy.window().then((win) => {
  const frames = win.performance.getEntriesByType('frame')
  if (frames.length) {
    const avgFrameTime = frames.reduce((sum, f) => sum + f.duration, 0) / frames.length
    cy.log(`🎞 Avg Frame Duration: ${avgFrameTime.toFixed(2)} ms`)
  }
})
```

> ⚙️ ใช้ได้กับเว็บที่มี animation หรือ canvas-based rendering

---

## 🧾 9. สร้าง Report สรุป Performance

บันทึกข้อมูลลงไฟล์ CSV:
```js
cy.window().then((win) => {
  const resources = win.performance.getEntriesByType('resource')
  const csv = resources.map(r => `${r.name},${r.duration},${r.initiatorType}`).join('\n')
  cy.writeFile('cypress/reports/performance.csv', 'URL,Duration(ms),Type\n' + csv)
})
```

---

## 🔍 10. การ Debug การโหลดหน้า (Network Idle / DOM Ready)

```js
cy.document().should((doc) => {
  expect(doc.readyState).to.eq('complete')
})

cy.window().then((win) => {
  const loadTime = win.performance.now()
  cy.log(`✅ DOM Loaded at: ${Math.round(loadTime)} ms`)
})
```

---

## 🧩 11. รวมทุกเทคนิคใน Flow เดียว

```js
describe('Full Performance Trace', () => {
  it('เก็บข้อมูล Performance, Network, และ API Timing', () => {
    cy.intercept('GET', '/api/data').as('apiCall')
    cy.visit('/dashboard')
    cy.wait('@apiCall').then(({ response }) => {
      cy.log(`API took ${response.duration} ms`)
    })

    cy.window().then((win) => {
      const perf = win.performance.timing
      const load = perf.loadEventEnd - perf.navigationStart
      cy.log(`Page Load Time: ${load} ms`)

      const resources = win.performance.getEntriesByType('resource')
      cy.writeFile('cypress/reports/perf_summary.json', resources)
    })
  })
})
```

---

## ✅ 12. สรุปคำสั่งสำคัญ

| คำสั่ง | หมายเหตุ |
|----------|-----------|
| `win.performance.timing` | วัดเวลาโหลดหน้าเว็บ |
| `win.performance.getEntriesByType('resource')` | รายละเอียด resource ทั้งหมด |
| `cy.intercept()` | ตรวจสอบเวลา response ของ API |
| `cy.writeFile()` | บันทึกข้อมูล performance |
| `cy.lighthouse()` | รัน Lighthouse ผ่าน Cypress |
| `cy.document().should('have.property', 'readyState', 'complete')` | ตรวจการโหลดหน้า |
| `cy.viewport()` | ใช้ร่วมกับ test performance responsive |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `cy.intercept()` เพื่อวัด response time ที่แม่นยำกว่าการคำนวณใน frontend  
> - ใช้ `cy.window().then(win => win.performance)` เพื่อวิเคราะห์ข้อมูลโหลดจริง  
> - ตั้งค่าให้ Cypress สร้างไฟล์ `.json` หรือ `.csv` อัตโนมัติหลังแต่ละ run  
> - รวมกับ plugin Lighthouse เพื่อวัด SEO / Accessibility พร้อมกัน  
> - ตรวจสอบ FPS สำหรับเว็บที่ใช้ animation หรือ heavy rendering  

---
