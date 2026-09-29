# BJ3 Academic Submission & Progress Tracking System
**ระบบส่งแผนการจัดการเรียนรู้และงานวิจัยออนไลน์ (โรงเรียนบึงกาฬ)**  
*ปีการศึกษา 2569 • รองรับระบบ ว PA, วิจัยในชั้นเรียน, PLC, SAR, ID Plan*

ระบบศูนย์กลางการส่งและติดตามเอกสารวิชาการออนไลน์ โดยไม่ต้องอัปโหลดไฟล์ขนาดใหญ่เข้าเซิร์ฟเวอร์ แต่ใช้วิธีแนบ **Google Drive Link หรือ QR Code** พร้อมระบบตรวจสอบสิทธิ์การแชร์, แดชบอร์ดติดตามสถานะแบบ Real-time, ตาราง Submission Matrix, เครื่องมือสร้างข้อความแจ้งเตือนทาง LINE และโหมดนำเสนอสำหรับจอประชาสัมพันธ์ / ห้องผู้บริหาร (TV Presentation Mode)

---

## 🏗️ สถาปัตยกรรมระบบ (Cloudflare + GitHub)

```
[ ครู / ผู้บริหาร / ฝ่ายวิชาการ ]
              │ (HTTPS)
              ▼
[ Cloudflare Global Edge Network (CDN + SSL ฟรี) ]
              │
      ┌───────┴────────────────────────┐
      ▼                                ▼
[ Cloudflare Pages ]         [ Cloudflare Pages Functions ]
 (React + Vite + Tailwind)          (Hono Edge API)
                                       │ (SQL)
                                       ▼
                             [ Cloudflare D1 ]
                       (Serverless SQLite at the Edge)
                                       ▲
                                       │ (CI/CD Auto-Deploy)
                                [ GitHub Repository ]
```

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + Chart.js + HTML5-QRCode + SheetJS (`xlsx`)
- **Backend API**: Hono บน **Cloudflare Pages Functions** (`/functions/api/[[route]].ts`)
- **Database**: **Cloudflare D1** (Serverless SQL Database ข้อมูล 7 ตาราง)
- **CI/CD & Source Control**: **GitHub** พร้อม GitHub Actions Workflow (`.github/workflows/deploy.yml`)

---

## 👥 5 บทบาทผู้ใช้งาน และบัญชีทดสอบ (Demo Accounts)

ระบบมีปุ่ม **1-Click Demo Login** ที่หน้าเข้าสู่ระบบ สามารถกดสลับบทบาทเพื่อทดสอบได้ทันที:

| บทบาท | Username | Password | ตัวอย่างผู้ใช้งาน | หน้าที่หลัก |
|---|---|---|---|---|
| **ครูผู้สอน (Teacher)** | `teacher_somchai` | `teacher123` | นายสมชาย ขยันสอน (วิทย์) | ส่งเอกสารใน 1 นาที, วาง Drive Link, สแกน QR, ดู Feedback |
| **หัวหน้ากลุ่มสาระฯ (Head)** | `head_sci` | `head123` | นายเดชา วิทยากร (หน.วิทย์) | ตรวจเอกสารในกลุ่มสาระ, อนุมัติ (ผ่าน), ส่งกลับแก้ไข |
| **ฝ่ายวิชาการ (Academic)** | `academic` | `acad123` | นางนภาพร วิชาการเลิศ | จัดการรอบ Campaign, ดู Matrix, Copy รายชื่อส่ง LINE, Export Excel |
| **ผู้บริหาร (Executive)** | `director` | `exec123` | ดร.วิชาญ บริหารการศึกษา (ผอ.) | ดู KPI ภาพรวมทั้งโรงเรียน, 3 ชาร์ตวิเคราะห์, เปิด Live TV Mode |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin123` | นายสมศักดิ์ พัฒนาระบบ | จัดการผู้ใช้, กลุ่มสาระ, รอบการส่ง, ตรวจสอบสถานะเซิร์ฟเวอร์ |

---

## 🚀 การติดตั้งและทดสอบในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Migration เพื่อสร้างฐานข้อมูลและข้อมูลตัวอย่าง (D1 Local)
```bash
npm run d1:migrate:local
```
*(จะรันไฟล์ `0000_init_schema.sql` และ `0001_seed_data.sql` ลงใน D1 จำลองในเครื่อง)*

### 3. สร้าง Build ไฟล์ Frontend
```bash
npm run build
```

### 4. รันเซิร์ฟเวอร์ทดสอบระบบ Cloudflare Pages + D1 ในเครื่อง
```bash
npm run pages:dev
```
เปิดเว็บเบราว์เซอร์ที่: **`http://127.0.0.1:8788`**

---

## ☁️ ขั้นตอนการเชื่อมต่อ GitHub และ Deploy ขึ้น Cloudflare Pages

### 1. Push โค้ดขึ้น GitHub Repository
สร้าง Repository ใหม่บน [GitHub](https://github.com/new) จากนั้นรันคำสั่งในโฟลเดอร์นี้:
```bash
git add .
git commit -m "feat: complete BJ3 Academic Submission System on Cloudflare Pages and D1"
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git branch -M main
git push -u origin main
```

### 2. สร้างฐานข้อมูล Cloudflare D1 บน Cloudflare
ล็อกอินเข้า [Cloudflare Dashboard](https://dash.cloudflare.com/) หรือใช้คำสั่ง Wrangler:
```bash
# 1. ล็อกอิน Wrangler กับ Cloudflare (ทำเพียงครั้งแรก)
npx wrangler login

# 2. สร้างฐานข้อมูล D1 ชื่อ academic-db
npx wrangler d1 create academic-db
```
นำ `database_id` ที่ได้ไปอัปเดตในไฟล์ `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "academic-db"
database_id = "<DATABASE_ID_FROM_CLOUDFLARE>"
```

### 3. รัน Migration ขึ้น Cloudflare D1 ตัวจริง
```bash
npm run d1:migrate:remote
```

### 4. เชื่อมต่อ Cloudflare Pages เข้ากับ GitHub
1. ในหน้า [Cloudflare Dashboard](https://dash.cloudflare.com/) ไปที่เมนู **Workers & Pages** -> **Create application** -> แท็บ **Pages** -> **Connect to Git**
2. เลือก GitHub Repository ของโครงการนี้
3. ตั้งค่าการ Build:
   - **Framework preset**: `None` หรือ `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. ผูกฐานข้อมูล D1:
   - หลังสร้างโปรเจกต์เสร็จ ไปที่แท็บ **Settings** -> **Functions** -> **D1 database bindings**
   - กด **Add binding**:
     - Variable name: `DB`
     - D1 database: เลือก `academic-db`
5. กด **Save and Deploy**
   - ระบบจะ Build และ Deploy เว็บแอปให้ทันที พร้อมได้ URL เช่น `https://academic-submission-system.pages.dev`
   - หลังจากนี้ ทุกครั้งที่มีการ `git push` โค้ดใหม่ขึ้น GitHub ระบบ Cloudflare Pages จะอัปเดตให้อัตโนมัติทันที 🚀

---

## 🌟 จุดเด่นและฟังก์ชันสำคัญ (Key Features)

### 1. Smart URL Checker & Google Drive Sharing Guide
- ตรวจจับลิงก์ Google Drive อัตโนมัติ (โฟลเดอร์, ไฟล์, Docs, Sheets)
- แสดงป้ายแจ้งเตือนให้ครูตั้งค่าการแชร์เป็น *"ทุกคนที่มีลิงก์สามารถดูได้"* เพื่อป้องกันปัญหาฝ่ายวิชาการเปิดไฟล์ไม่ได้

### 2. QR Code Integration (Client-Side Decoding)
- รองรับการลากวาง / อัปโหลดภาพ QR Code (PNG, JPG) และถอดรหัส URL ทันทีในเบราว์เซอร์
- รองรับการเปิดกล้องโทรศัพท์มือถือสแกน QR Code แบบ Live Camera

### 3. Submission Matrix & Missing Teacher Tracker
- ตาราง Matrix เชื่อมโยงครูทุกคนกับทุก Campaign แสดงสัญลักษณ์สถานะชัดเจน (✅ ผ่าน, ⏳ รอตรวจ, ⚠️ แก้ไข, ❌ ยังไม่ส่ง)
- เมนู "ผู้ยังไม่ส่ง" คำนวณวันคงเหลือ พร้อมปุ่ม **Copy รายชื่อส่ง LINE** ที่จัดรูปแบบข้อความสวยงามพร้อมวางในกลุ่มไลน์ครูได้ทันที

### 4. Live TV & Presentation Mode (สำหรับจอประชาสัมพันธ์ / ห้อง ผอ.)
- โหมดแสดงผลจอใหญ่ความคมชัดสูง Fullscreen
- อัปเดตข้อมูลอัตโนมัติทุก 30 วินาที
- **Privacy Mode**: สลับซ่อนชื่อครูเพื่อความเป็นส่วนตัวเมื่อนำไปขึ้นจอประชาสัมพันธ์ส่วนกลาง

### 5. Excel Report Export (.xlsx)
- ส่งออกรายงานการส่งเอกสารของทั้งโรงเรียนหรือรายกลุ่มสาระฯ เป็นไฟล์ `.xlsx` จัดฟอร์แมตหัวตาราง วันเวลา และผลการตรวจเรียบร้อย
