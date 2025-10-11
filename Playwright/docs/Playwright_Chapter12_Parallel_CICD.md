# 🧱 Parallel Execution & CI/CD Integration (การรันขนานและเชื่อมกับระบบ CI/CD)

Playwright ออกแบบมาให้สามารถรัน **หลาย test พร้อมกัน (parallel)**  
และผสานการทำงานกับระบบ **CI/CD** ได้ทุกแพลตฟอร์ม เช่น GitHub Actions, GitLab CI, Jenkins, หรือ GCP Cloud Build

---

## ⚙️ 1. การรันขนาน (Parallel Execution)

โดยค่าเริ่มต้น Playwright จะรันทดสอบแบบขนานอัตโนมัติผ่าน “workers”

### ตัวอย่าง
```bash
npx playwright test --workers=4
```
📘 หมายความว่ารันทดสอบ 4 ชุดพร้อมกัน (เหมือนเปิด 4 browser)

---

## 🧩 2. การตั้งค่าใน `playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

| ตัวเลือก | ความหมาย |
|-----------|------------|
| `fullyParallel` | รันทดสอบทุกไฟล์พร้อมกัน |
| `workers` | จำนวน instance ที่ใช้รันพร้อมกัน |
| `retries` | จำนวนครั้งที่ rerun เมื่อ fail |

---

## 🧭 3. การแยก Project (เช่น Browser / Device)

```ts
projects: [
  {
    name: 'Chromium',
    use: { browserName: 'chromium' },
  },
  {
    name: 'Firefox',
    use: { browserName: 'firefox' },
  },
  {
    name: 'Mobile Chrome',
    use: {
      browserName: 'chromium',
      ...devices['Pixel 5'],
    },
  },
],
```

📘 *ผลลัพธ์:* จะรัน test เดียวกันบนหลาย environment พร้อมกันได้

---

## 💡 4. การรันเฉพาะบาง Project

```bash
npx playwright test --project="Firefox"
```

---

## 🧱 5. การแบ่ง Test File เป็นกลุ่ม (Shard)

เมื่อ test มีจำนวนมาก สามารถแบ่งรันเป็นชุดย่อยได้ เช่น
```bash
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```
เหมาะกับ CI ที่มีหลาย runner เช่น GitHub Actions หลายเครื่อง

---

## 🧰 6. การรันใน GitHub Actions

สร้างไฟล์ `.github/workflows/playwright.yml`

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

📘 *คุณสมบัติ:*  
- รันทดสอบทุกครั้งเมื่อ push หรือ pull request  
- อัปโหลดรายงานผล (report) อัตโนมัติ

---

## 🚀 7. การสร้าง HTML Report

```bash
npx playwright test --reporter=html
```
หรือเปิดดูภายหลัง:
```bash
npx playwright show-report
```

สามารถใส่ใน config ได้ด้วย:
```ts
reporter: [['html', { open: 'never' }], ['list']],
```

---

## 🧩 8. การรันบน Jenkins / GitLab CI

**Jenkins (Pipeline Example):**
```groovy
pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps'
      }
    }
    stage('Test') {
      steps {
        sh 'npx playwright test --reporter=html'
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true
    }
  }
}
```

**GitLab CI Example:**
```yaml
stages:
  - test

playwright:
  image: mcr.microsoft.com/playwright:v1.44.0-focal
  script:
    - npm ci
    - npx playwright install --with-deps
    - npx playwright test --reporter=html
  artifacts:
    paths:
      - playwright-report/
```

---

## 🌐 9. การรันใน Docker

สร้างไฟล์ `Dockerfile`:

```Dockerfile
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
```

รันด้วย:
```bash
docker build -t playwright-tests .
docker run --rm playwright-tests
```

---

## ⚡ 10. การ Optimize ความเร็วใน CI

| เทคนิค | อธิบาย |
|---------|---------|
| ใช้ `fullyParallel: true` | ให้ Playwright จัดการ parallel อัตโนมัติ |
| จำกัดจำนวน workers | เช่น `workers: 4` สำหรับเครื่อง CI ที่ RAM น้อย |
| ใช้ `--shard` | แบ่ง test เป็นหลายชุดบนหลาย runner |
| Cache `node_modules` | ลดเวลา install package |
| `video: 'retain-on-failure'` | ลดขนาดไฟล์ report |

---

## 🧠 11. การเชื่อมกับ Slack / Discord

สามารถใช้ webhook เพื่อส่งสรุปผล test:
```yaml
- name: Send summary to Slack
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
    SLACK_MESSAGE: '✅ Playwright Tests Completed!'
```

---

## ✅ 12. สรุปคำสั่งสำคัญ

| หมวด | คำสั่ง | ความหมาย |
|-------|----------|-----------|
| รันขนาน | `--workers=N` | กำหนดจำนวน browser ที่รันพร้อมกัน |
| แยก project | `projects: []` | รันทดสอบบนหลาย browser/device |
| แบ่งชุด | `--shard=1/3` | รันเฉพาะส่วนของ test |
| สร้าง report | `--reporter=html` | ออกรายงานผล |
| เปิด report | `npx playwright show-report` | เปิด HTML Report |
| CI/CD | GitHub / GitLab / Jenkins | ใช้รันอัตโนมัติเมื่อ push |

---

> 💬 **Tips มือโปร:**  
> - ใช้ Docker image `mcr.microsoft.com/playwright` เพื่อให้รันได้ทุกเครื่องโดยไม่ต้องลง browser เพิ่ม  
> - ตั้งค่าให้ CI เก็บ artifacts เช่น `trace.zip`, `video`, `report` ทุกครั้งที่ fail เพื่อ debug ได้ง่าย  
> - ใช้ shard + matrix strategy เพื่อเร่งความเร็วใน repo ขนาดใหญ่  
> - เชื่อมต่อ Slack หรือ Email เพื่อแจ้งเตือนอัตโนมัติเมื่อ test fail  

---
