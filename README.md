## Command git 💥

### คำสั่ง Git สำหรับการเริ่มต้นโปรเจกต์

```bash
git init

git add .

git commit -m "commit"

git branch -M main

git remote add origin git@github.com:tartar008/ProjectWebservice.git

git push -u origin main
```

### 2. เปลี่ยนชื่อสาขาเป็น main (หรือ master) และเชื่อมต่อกับ remote
```bash
git branch -M main

git remote add origin git@github.com:tartar008/ProjectWebservice.git
```

### 3. Push โค้ดไปที่ remote repository
```bash
 git push -u origin main
```

### 4. ในบางกรณีที่ต้องการบังคับ Push
```bash
git push -u origin main --force
```

### 5. Clone โปรเจกต์จาก repository
```bash
git clone git@github.com:tartar008/Project-OOP2.git
```

### 6. สร้างสาขาใหม่และสลับไปยังสาขาใหม่
```bash
git checkout -b Demo
```

### 7. ลบ remote origin
```bash
git remote remove origin
```

### 8. Clone โปรเจกต์เฉพาะสาขาที่ต้องการ
```bash
git clone --branch Demo git@github.com:tartar008/Project-OOP2.git .
```

## ต้องการลบ branch 
ดึง branch Demo ลงมาที่เครื่อง: ก่อนอื่น คุณต้องสร้าง branch Demo ใน local จาก remote:

```bash
git checkout -b Demo origin/Demo
```

ลบ branch Demo ใน local: เมื่อคุณดึง branch Demo ลงมาแล้ว คุณสามารถลบ branch นี้ใน local ด้วยคำสั่ง:

```bash
git branch -d Demo
```

ลบ branch Demo บน remote: หากคุณต้องการลบ branch Demo ที่อยู่บน remote (เช่น origin), ใช้คำสั่ง:

```bash
git push origin --delete Demo
```

หลังจากนี้ branch Demo จะถูกลบออกจากทั้ง local และ remote
