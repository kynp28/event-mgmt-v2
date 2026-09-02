# 🎊 Event Management System

ระบบจัดสรรพื้นที่ขายของในงานกิจกรรมแบบครบวงจร (Event Sales Area Management System) พัฒนาขึ้นเพื่อช่วยให้ผู้จัดงาน (Organizer) สามารถบริหารจัดการพื้นที่เช่า, ผังบูธ, และการชำระเงินได้อย่างมีประสิทธิภาพ และช่วยให้ผู้ค้า (Vendor) สามารถจองบูธที่ต้องการได้อย่างสะดวกและรวดเร็ว

## ✨ ฟีเจอร์หลัก (Key Features)
- **Role-Based Access Control (RBAC):** ระบบจัดการสิทธิ์การใช้งาน แบ่งเป็น Admin, Organizer, Vendor และ Visitor
- **Interactive Event Calendar:** ปฏิทินแสดงตารางการจัดงานอีเวนต์ต่างๆ
- **Booth Booking System:** ระบบจองบูธ พร้อมดูแผนผังการจัดงาน (Zones & Landmarks) แบบเห็นภาพรวม
- **Payment & Verification:** ระบบอัปโหลดสลิปชำระเงิน และระบบตรวจสอบการชำระเงินสำหรับผู้จัดงาน
- **Dashboard & Analytics:** แดชบอร์ดสรุปยอดขาย สถานะการจอง และสถิติต่างๆ

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Swiper (สำหรับ Carousel)
- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL, Prisma ORM
- **Queue/Background Jobs:** Redis (สำหรับจัดการสถานะหมดเวลาจอง)
- **Infrastructure:** Docker & Docker Compose

---

## 🔑 บัญชีสำหรับทดสอบระบบ (Test Accounts)
ระบบได้ทำการจำลองข้อมูลผู้ใช้งานเบื้องต้น (Seed Data) ไว้เรียบร้อยแล้ว สามารถใช้บัญชีด้านล่างนี้ในการล็อกอินเข้าสู่ระบบได้เลย:
| Role | Email | Password |
|---|---|---|
| **Admin** (ผู้ดูแลระบบ) | `admin@test.com` | `123456` |
| **Organizer** (ผู้จัดงาน) | `organizer@test.com` | `123456` |
| **Vendor** (พ่อค้า/แม่ค้า) | `vendor@test.com` | `123456` |

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์

สามารถเลือกรันระบบได้ 2 วิธี คือ **รันด้วย Docker (แนะนำ)** หรึอ **รันแบบ Manual** 

### วิธีที่ 1: รันด้วย Docker (แนะนำ - ง่ายที่สุด)
**สิ่งที่ต้องมีในเครื่อง:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
1. เปิด Docker Desktop ทิ้งไว้
2. เปิด Command Prompt (CMD) หรือ Terminal แล้วเข้าไปที่โฟลเดอร์โปรเจกต์
3. รันคำสั่งนี้เพื่อเปิดระบบทั้งหมด (Frontend, Backend, DB, Redis)
   ```bash
   docker-compose up -d --build
   ```
4. รอจนกว่าระบบจะรันเสร็จ จากนั้นเปิดเบราว์เซอร์ไปที่:
   - **หน้าเว็บ (Frontend):** `http://localhost:5173`
   - **API (Backend):** `http://localhost:5000`
5. *หากต้องการปิดระบบ ให้ใช้คำสั่ง: `docker-compose down`*

---

### วิธีที่ 2: รันแบบ Manual (ไม่ได้ใช้ Docker)
**สิ่งที่ต้องมีในเครื่อง:** [Node.js](https://nodejs.org/) (แนะนำ v20 หรือ v22), MySQL, Redis

#### 1. การตั้งค่า Backend
1. เข้าไปที่โฟลเดอร์ `backend`
   ```bash
   cd backend
   ```
2. ติดตั้ง Dependencies
   ```bash
   npm install
   ```
3. คัดลอกไฟล์ `.env.example` เป็น `.env` และตั้งค่า `DATABASE_URL` และ `REDIS_URL` ให้ตรงกับฐานข้อมูลในเครื่องของคุณ
4. สร้างตารางฐานข้อมูลและใส่ข้อมูลจำลอง (Seed)
   ```bash
   npx prisma migrate dev
   npm run seed
   ```
5. รันเซิร์ฟเวอร์
   ```bash
   npm run dev
   ```

#### 2. การตั้งค่า Frontend
1. เปิด Terminal ใหม่ เข้าไปที่โฟลเดอร์ `frontend`
   ```bash
   cd frontend
   ```
2. ติดตั้ง Dependencies
   ```bash
   npm install
   ```
3. รันระบบ Frontend
   ```bash
   npm run dev
   ```
4. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

---

## 📝 โครงสร้างโปรเจกต์ (Project Structure)
- `/frontend` - โค้ดส่วนหน้าบ้านทั้งหมด (React)
- `/backend` - โค้ดส่วนระบบ API ทั้งหมด (Express)
- `docker-compose.yml` - ไฟล์ตั้งค่าสำหรับรันระบบด้วย Docker 
