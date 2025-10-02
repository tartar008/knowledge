# 📘 Cypress Login Test – 4 Versions

เอกสารนี้สรุปการเขียน **Cypress test** สำหรับฟีเจอร์ **Login** โดยแบ่งออกเป็น 4 เวอร์ชันตามระดับการ Refactor

---

## 📑 สารบัญ
1. [v1 – แบบปกติ (Basic)](#v1--แบบปกติ-basic)
2. [v2 – ใช้ beforeEach](#v2--ใช้-beforeeach)
3. [v3 – ใช้ Custom Command](#v3--ใช้-custom-command)
4. [v4 – ใช้ Page Object Pattern](#v4--ใช้-page-object-pattern)
5. [📊 ตารางเปรียบเทียบ](#-ตารางเปรียบเทียบ)

---

## 🔹 v1 – แบบปกติ (Basic)

**แนวคิด**
- เขียน `cy.visit(...)` และการกรอกฟอร์มซ้ำทุก test
- เข้าใจง่าย เหมาะสำหรับผู้เริ่มต้น
- แต่โค้ดซ้ำเยอะ

---

## 🔹 v2 – ใช้ beforeEach

**แนวคิด**
- ใช้ `beforeEach()` สำหรับเปิดหน้าเว็บ login ก่อนทุก test case
- ลดการซ้ำของ `cy.visit()`
- โค้ดอ่านง่ายขึ้น

---

## 🔹 v3 – ใช้ Custom Command

**แนวคิด**
- สร้างฟังก์ชัน `cy.login(username, password)` ใน `cypress/support/commands.js`
- ลดการซ้ำของการกรอกฟอร์มและคลิกปุ่ม
- โค้ดสั้นและ reuse ได้

---

## 🔹 v4 – ใช้ Page Object Pattern

**แนวคิด**
- สร้าง **Class** แยก element และ action ของหน้า Login ไว้ในไฟล์ `pageObjects`
- Test case เรียกใช้เมธอดจาก page object
- โค้ดอ่านง่ายขึ้นและเหมาะกับทีมใหญ่

---

## 📊 ตารางเปรียบเทียบ

| Version | จุดเด่น | จุดด้อย | เหมาะกับ |
|---------|---------|---------|----------|
| **v1** (Basic) | เข้าใจง่าย, เขียนตรงไปตรงมา | โค้ดซ้ำเยอะ | มือใหม่ เริ่มเรียน Cypress |
| **v2** (beforeEach) | ลดซ้ำ `cy.visit()` | ยังซ้ำ login steps | โปรเจกต์เล็ก–กลาง |
| **v3** (Custom Command) | โค้ดสั้น, reuse ได้ | ต้องดูไฟล์ `commands.js` ควบคู่ | โปรเจกต์กลางขึ้นไป |
| **v4** (Page Object) | อ่านง่าย, โครงสร้างดี, maintain ง่าย | setup เยอะ (page object, import) | โปรเจกต์ใหญ่, ทีมหลายคน |

---
