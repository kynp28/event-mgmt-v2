# 🎨 Event Management System - Frontend

ส่วนนี้คือซอร์สโค้ดฝั่งหน้าบ้าน (Frontend) ของระบบจัดสรรพื้นที่ขายของในงานกิจกรรม ซึ่งถูกออกแบบมาให้ทำงานได้รวดเร็ว รองรับการใช้งานทุกอุปกรณ์ (Responsive Design) และมี User Experience (UX) ที่ทันสมัย

## 🚀 เทคโนโลยีหลักที่ใช้ (Tech Stack)

- **Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (เพื่อการจัดหน้าเว็บที่รวดเร็วและสวยงาม)
- **Routing:** React Router v6 (สำหรับการเปลี่ยนหน้าเว็บแบบ Single Page Application)
- **Icons:** Lucide React (ไอคอนน้ำหนักเบาและดูสะอาดตา)
- **Components:** 
  - `Swiper`: ใช้สำหรับทำระบบป้ายแบนเนอร์ (Carousel) ที่ลื่นไหล
  - `react-big-calendar`: ใช้สำหรับระบบปฏิทินแสดงตารางงานอีเวนต์
- **HTTP Client:** Axios (สำหรับยิง API คุยกับ Backend)
- **i18n:** `i18next` และ `react-i18next` สำหรับรองรับการเปลี่ยนภาษา (Localization)

---

## 📂 โครงสร้างโฟลเดอร์ (Folder Structure)

เพื่อให้ง่ายต่อการดูแลรักษา โค้ดในโฟลเดอร์ `src/` จะถูกแบ่งออกเป็นหมวดหมู่ดังนี้:

```text
frontend/src/
├── assets/        # รูปภาพ, โลโก้ และไฟล์ Static ต่างๆ
├── components/    # UI Components ที่ถูกเรียกใช้ซ้ำๆ (เช่น Navbar, ปฏิทิน, ปุ่ม)
├── context/       # React Context API (เช่น AuthContext จัดการสถานะการล็อกอิน)
├── pages/         # หน้าเว็บหลักแต่ละหน้า (เช่น Home, Login, Register)
│   ├── admin/     # หน้าเว็บเฉพาะสิทธิ์ Admin
│   ├── organizer/ # หน้าเว็บเฉพาะสิทธิ์ Organizer (ผู้จัดงาน)
│   └── vendor/    # หน้าเว็บเฉพาะสิทธิ์ Vendor (ผู้เช่าบูธ)
├── services/      # ไฟล์รวบรวมฟังก์ชันสำหรับยิง API (ติดต่อ Backend)
├── utils/         # ฟังก์ชันช่วยเหลือ (Helper functions) ตัวเล็กๆ
├── App.tsx        # จุดรวมการตั้งค่า Routing และ Layout หลัก
├── main.tsx       # จุดเริ่มต้นการทำงานของ React
└── index.css      # ไฟล์ CSS หลัก และการตั้งค่า Tailwind
```

---

## 🔌 การเชื่อมต่อ API (API Integration)

Frontend จะเชื่อมต่อกับ Backend ผ่านทาง Base URL ซึ่งถูกกำหนดไว้ในไฟล์ตั้งค่า (Environment Variables):

- **Development:** หากรันผ่าน Docker จะชี้ไปที่ `http://localhost:5000/api` 
- การเรียก API จะทำผ่าน `api.ts` ในโฟลเดอร์ `services/` ซึ่งมีการดักจับ Error เบื้องต้นไว้ให้แล้ว

---

## 💻 คำสั่งสำหรับนักพัฒนา (Available Scripts)

คำสั่งด้านล่างนี้ใช้สำหรับกรณีที่คุณต้องการพัฒนาระบบฝั่งหน้าบ้านแยกต่างหาก (ไม่ได้ใช้ Docker):

### รันระบบสำหรับพัฒนา (Development)
```bash
npm install
npm run dev
```
ระบบจะเปิดหน้าเว็บขึ้นมาที่ [http://localhost:5173](http://localhost:5173) (หน้าเว็บจะรีเฟรชอัตโนมัติเมื่อแก้โค้ด)

### บิลด์ระบบสำหรับนำไปใช้จริง (Production)
```bash
npm run build
```
ระบบจะทำการรวมไฟล์ (Bundle) และบีบอัดโค้ดทั้งหมด ไปเก็บไว้ที่โฟลเดอร์ `dist/` เพื่อเตรียมนำไปวางบนเซิร์ฟเวอร์จริง
