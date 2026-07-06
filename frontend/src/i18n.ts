import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "EventSpace.",
      "sign_in": "Sign In",
      "sign_out": "Sign Out",
      "home": "Home",
      "dashboard": "Dashboard",
      "active_events": "Active Events",
      "no_active_events": "No active events found.",
      "view_details": "View Details",
      "email": "Email",
      "password": "Password",
      "login": "Login",
      "login_failed": "Login failed",
      "create_account": "Create Account",
      "username": "Username",
      "register_as": "I want to register as",
      "role_vendor": "Vendor (Book booths)",
      "role_organizer": "Organizer (Create events)",
      "already_have_account": "Already have an account?",
      
      // Admin Dashboard
      "admin_dashboard": "Admin Dashboard",
      "verify_payments": "Verify Payments",
      "total_events": "Total Events",
      "organizers": "Organizers",
      "vendors": "Vendors",
      "revenue": "Revenue",
      
      // Organizer Dashboard
      "organizer_dashboard": "Organizer Dashboard",
      "overview": "Overview",
      "create_new_event": "+ Create New Event",
      "my_events": "My Events",
      "total_booths": "Total Booths",
      "bookings": "Bookings",
      "manage_booths": "Booth Map Editor (Drag & Drop)",
      "select_event_map": "Select Event to Edit Map",
      "interactive_map": "Interactive Map",
      "add_booth": "+ Add Booth",
      "add_new_booth": "Add New Booth",
      "booth_no_placeholder": "Booth No (e.g., A-01)",
      "booth_price": "Price (฿)",
      "saving": "Saving...",
      "no_booths_found": "No booths found. Click '+ Add Booth' to get started.",
      
      // Vendor Dashboard
      "my_bookings": "My Bookings",
      "no_bookings_yet": "You haven't booked any booths yet.",
      "booth": "Booth",
      "upload_payment": "Upload Payment",
      
      // Buttons & Labels
      "cancel": "Cancel",
      "create_event": "Create Event",
      "event_name": "Event Name",
      "start_date": "Start Date",
      "end_date": "End Date",
      "location": "Location",
      "event_id": "Event ID",
      "search": "Search",
      "available_booths": "Available Booths",
      "confirm_booking": "Confirm Booking",
      "processing": "Processing..."
    }
  },
  th: {
    translation: {
      "app_name": "EventSpace.",
      "sign_in": "เข้าสู่ระบบ",
      "sign_out": "ออกจากระบบ",
      "home": "หน้าแรก",
      "dashboard": "แดชบอร์ด",
      "active_events": "อีเวนต์ที่กำลังจัดขึ้น",
      "no_active_events": "ไม่พบอีเวนต์ในขณะนี้",
      "view_details": "ดูรายละเอียด",
      "email": "อีเมล",
      "password": "รหัสผ่าน",
      "login": "เข้าสู่ระบบ",
      "login_failed": "เข้าสู่ระบบล้มเหลว",
      "create_account": "สร้างบัญชีใหม่",
      "username": "ชื่อผู้ใช้",
      "register_as": "ฉันต้องการลงทะเบียนเป็น",
      "role_vendor": "ผู้เช่าบูธ (Vendor)",
      "role_organizer": "ผู้จัดงาน (Organizer)",
      "already_have_account": "มีบัญชีอยู่แล้วใช่ไหม?",
      
      // Admin Dashboard
      "admin_dashboard": "แอดมินแดชบอร์ด",
      "verify_payments": "ตรวจสอบสลิป",
      "total_events": "อีเวนต์ทั้งหมด",
      "organizers": "ผู้จัดงาน",
      "vendors": "ผู้เช่าบูธ",
      "revenue": "รายได้รวม",
      
      // Organizer Dashboard
      "organizer_dashboard": "ออแกไนเซอร์แดชบอร์ด",
      "overview": "ภาพรวม",
      "create_new_event": "+ สร้างอีเวนต์ใหม่",
      "my_events": "อีเวนต์ของฉัน",
      "total_booths": "จำนวนบูธทั้งหมด",
      "bookings": "ยอดจองบูธ",
      "manage_booths": "จัดการผังบูธ (Drag & Drop)",
      "select_event_map": "เลือกอีเวนต์ที่ต้องการจัดการผัง",
      "interactive_map": "แผนที่ 2 มิติ (ลากวางได้)",
      "add_booth": "+ เพิ่มบูธ",
      "add_new_booth": "เพิ่มบูธใหม่",
      "booth_no_placeholder": "รหัสบูธ (เช่น A-01)",
      "booth_price": "ราคา (฿)",
      "saving": "กำลังบันทึก...",
      "no_booths_found": "ยังไม่มีบูธในระบบ คลิก '+ เพิ่มบูธ' เพื่อเริ่มต้น",
      
      // Vendor Dashboard
      "my_bookings": "การจองของฉัน",
      "no_bookings_yet": "คุณยังไม่ได้จองบูธเลย",
      "booth": "บูธ",
      "upload_payment": "อัปโหลดสลิป",
      
      // Buttons & Labels
      "cancel": "ยกเลิก",
      "create_event": "สร้างอีเวนต์",
      "event_name": "ชื่องาน",
      "start_date": "วันเริ่มงาน",
      "end_date": "วันสิ้นสุดงาน",
      "location": "สถานที่",
      "event_id": "รหัสอีเวนต์",
      "search": "ค้นหา",
      "available_booths": "บูธที่ว่าง",
      "confirm_booking": "ยืนยันการจอง",
      "processing": "กำลังดำเนินการ..."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
