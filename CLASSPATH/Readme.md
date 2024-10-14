# วิธีการตั้งค่า classpath แบบถาวรผ่าน Command Prompt:

## จัดการ classpath ผ่าน Command

####  1. เปิด Command Prompt ด้วยสิทธิ์ผู้ดูแลระบบ (Admin):

* กด Windows + R แล้วพิมพ์ cmd
* กด Ctrl + Shift + Enter เพื่อเปิดด้วยสิทธิ์ Admin
####  2. ใช้คำสั่ง setx เพื่อกำหนดค่า CLASSPATH: ตัวอย่าง:

```bash
setx CLASSPATH "C:\path\to\your\lib\*"
```
ในกรณีที่คุณต้องการเพิ่มค่าใหม่เข้าไปใน CLASSPATH ที่มีอยู่แล้ว (ไม่ลบทิ้งค่าเดิม):


```bash
setx CLASSPATH "%CLASSPATH%;C:\path\to\your\lib\*"
```
####  3. ตรวจสอบว่าค่า CLASSPATH ถูกตั้งค่าแล้ว: ปิด Command Prompt แล้วเปิดใหม่ จากนั้นใช้คำสั่งนี้เพื่อตรวจสอบ:

```bash
echo %CLASSPATH%
```

## วิธีการลบหรือแก้ไขค่า CLASSPATH หลังจากตั้งค่าแบบถาวร

1. ลบ CLASSPATH ถาวร: ถ้าคุณต้องการลบค่า CLASSPATH ที่ตั้งไว้ถาวร คุณสามารถใช้คำสั่งนี้:

```bash
setx CLASSPATH ""
```
คำสั่งนี้จะลบค่า CLASSPATH ที่มีอยู่ในระบบ

2. แก้ไข CLASSPATH: ถ้าคุณต้องการเพิ่มหรือแก้ไขค่า CLASSPATH ในภายหลัง:

```bash
setx CLASSPATH "C:\new\path\to\your\lib\*"
```
หรือถ้าต้องการเพิ่มเข้าไปจากที่มีอยู่แล้ว:

```bash
setx CLASSPATH "%CLASSPATH%;C:\new\path\to\your\lib\*"
```