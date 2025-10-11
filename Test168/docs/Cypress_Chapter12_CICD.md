# 🧱 บทที่ 12: Parallel & CI/CD Integration (การรันทดสอบแบบขนานและเชื่อมต่อระบบ CI/CD)

Cypress ออกแบบมาให้ทำงานร่วมกับระบบ CI/CD ได้อย่างสมบูรณ์ เช่น **GitHub Actions**, **GitLab CI**, **Jenkins**, หรือ **CircleCI**  
บทนี้จะอธิบายตั้งแต่การตั้งค่า parallel test ไปจนถึง pipeline ตัวอย่างจริง

---

## ⚙️ 1. การรัน Cypress แบบขนาน (Parallel Execution)

Cypress รองรับการรันทดสอบหลายเครื่องพร้อมกัน (Parallelization) เพื่อให้ทดสอบเสร็จเร็วขึ้น

### การเปิดใช้โหมด Parallel:

```bash
npx cypress run --record --parallel --group frontend
```

หรือกำหนดจำนวน threads:
```bash
npx cypress run --record --parallel --ci-build-id $BUILD_ID
```

> 💡 ต้องมีบัญชี Cypress Cloud (ฟรี) และตั้งค่า `projectId` ใน `cypress.config.js`

---

## 🧠 2. การตั้งค่า Cypress Cloud Dashboard

Cypress Dashboard ช่วยให้ดูผลการทดสอบ, video, screenshot, และ runtime ได้แบบเรียลไทม์

### ขั้นตอนเปิดใช้:

1. สมัครที่ [https://cloud.cypress.io](https://cloud.cypress.io)  
2. เพิ่ม `projectId` ใน `cypress.config.js`  
3. เชื่อม API Key กับ CI/CD

ตัวอย่าง config:
```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'abcd1234',
  e2e: {
    baseUrl: 'https://my-app.com',
  },
})
```

รันพร้อม record:
```bash
npx cypress run --record --key <your-api-key>
```

---

## 🧩 3. การเชื่อมต่อกับ GitHub Actions

สร้างไฟล์ `.github/workflows/cypress.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  cypress-run:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run Cypress tests
        run: npx cypress run --record --key ${{ secrets.CYPRESS_RECORD_KEY }}
```

📘 ใช้ `${{ secrets.CYPRESS_RECORD_KEY }}` เก็บ API Key อย่างปลอดภัย

---

## 🧮 4. การรัน Cypress แบบ Headless บน CI

```bash
npx cypress run --browser chrome --headless
```

หรือเลือก browser อื่น:
```bash
npx cypress run --browser edge
```

> 🔹 Cypress ใช้ Electron เป็นค่าเริ่มต้นหากไม่ระบุ browser

---

## 🧱 5. ตัวอย่าง GitLab CI/CD

ไฟล์ `.gitlab-ci.yml`

```yaml
stages:
  - test

cypress_e2e:
  stage: test
  image: cypress/browsers:node-18.16.0-chrome-113
  script:
    - npm ci
    - npx cypress run --record --key $CYPRESS_RECORD_KEY
  artifacts:
    when: always
    paths:
      - cypress/screenshots
      - cypress/videos
```

---

## 🔁 6. การใช้ Jenkins

ตัวอย่าง `Jenkinsfile`:

```groovy
pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Run Cypress') {
      steps {
        sh 'npx cypress run --headless --record --key $CYPRESS_RECORD_KEY'
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*', allowEmptyArchive: true
    }
  }
}
```

---

## 📦 7. การใช้ Environment Variables

ตั้งค่าผ่าน CLI:
```bash
CYPRESS_baseUrl=https://staging.myapp.com npx cypress run
```

หรือใน `cypress.env.json`:

```json
{
  "apiUrl": "https://api.myapp.com",
  "adminEmail": "admin@example.com",
  "adminPassword": "1234"
}
```

ในโค้ดใช้:
```js
cy.request(`${Cypress.env('apiUrl')}/users`)
cy.log(Cypress.env('adminEmail'))
```

---

## 🧩 8. การจัดการ Artifacts (Screenshots / Videos)

ตั้งค่าใน `cypress.config.js`:

```js
e2e: {
  video: true,
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  trashAssetsBeforeRuns: true,
}
```

สามารถเก็บใน pipeline artifacts ได้ทุกระบบ CI เช่น GitHub, GitLab, Jenkins

---

## ⚡ 9. การ Optimize Runtime

- ใช้ `npm ci` แทน `npm install` เพื่อเร่ง build
- ใช้ Cypress cache (`~/.cache/Cypress`) เพื่อไม่ต้องดาวน์โหลดซ้ำทุกครั้ง
- ใช้ `--parallel` เพื่อแบ่ง test หลายเครื่อง
- ตั้งค่า `--record` เพื่อให้ Cypress แบ่ง test อัตโนมัติผ่าน Dashboard

ตัวอย่าง:
```bash
npx cypress run --record --parallel --group "Chrome-tests"
```

---

## 🚀 10. ตัวอย่าง Workflow แบบเต็ม (Frontend + Backend)

```yaml
name: CI/CD Cypress Pipeline

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      db:
        image: postgres:14
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: user
          POSTGRES_PASSWORD: pass
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - run: npm ci
      - run: npm run start:dev &
      - run: npx wait-on http://localhost:3000

      - name: Run Cypress Tests
        run: npx cypress run --record --key ${{ secrets.CYPRESS_RECORD_KEY }}
```

---

## 🧠 11. การ Integrate กับ Cypress Dashboard (Split Runs)

เมื่อเปิด record mode Cypress จะทำการ “แบ่ง test” อัตโนมัติในแต่ละ CI agent

ตัวอย่าง:
```bash
npx cypress run --record --parallel --group "E2E Chrome" --ci-build-id $GITHUB_RUN_ID
```

ผลลัพธ์จะรวมใน Dashboard เดียว และแสดง graph แยกตามเครื่อง

---

## ✅ 12. สรุปคำสั่งสำคัญ

| คำสั่ง | ความหมาย |
|----------|-----------|
| `npx cypress run --record` | รันทดสอบและส่งผลไปยัง Dashboard |
| `--parallel` | รันทดสอบหลายเครื่องพร้อมกัน |
| `--ci-build-id` | ระบุรหัส build สำหรับ CI |
| `CYPRESS_baseUrl` | ตั้งค่า environment variable |
| `cypress.env.json` | เก็บ secret / config สำหรับ test |
| `trashAssetsBeforeRuns` | ลบไฟล์เก่าก่อน run ใหม่ |
| `artifacts` | เก็บไฟล์ผลลัพธ์ใน CI/CD |

---

> 💬 **Tips มือโปร:**  
> - ใช้ `--record` + `--parallel` เพื่อลดเวลา test ได้ 30–50%  
> - เก็บ artifacts ทุกครั้งที่ run เพื่อ debug ภายหลัง  
> - ใช้ Cypress Dashboard เพื่อตรวจสอบ test history และ runtime analytics  
> - ตั้งค่า `CYPRESS_baseUrl` ให้แตกต่างตาม environment (dev, staging, prod)  
> - ใช้ caching เพื่อลดเวลา setup ใน CI/CD อย่างมีนัยสำคัญ  

---
