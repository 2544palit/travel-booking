# 🚀 Travel Booking Platform: Full Stack Master Requirements & Vibe Coding Plan

**Project Type:** Full Stack Web Application
**Tech Stack Recommendation:**
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (หรือ Framework อย่าง React/Vue)
- **Backend (API & Logic):** Node.js + TypeScript (เพื่อให้รองรับ OOP ขั้นสูง) พร้อม Express.js
- **Database:** PostgreSQL หรือ MySQL (ทำ ORM mapping)
**Core Concepts:** OOP (≥ 10 Classes), SOLID Principles, Design Patterns, Exception Handling, Unit Testing

---

## 📌 1. System Architecture
ระบบใช้สถาปัตยกรรมแบบ Client-Server แยกส่วนชัดเจน:
1. **Client (Web HTML):** ส่ง Request ผ่าน HTTP/REST API
2. **Controller Layer (Backend API):** รับ HTTP Request, จัดการ Auth, เรียกใช้ Service
3. **Service & Domain Layer (OOP Logic):** ที่รวม Business Logic, Design Patterns และ Class ต่างๆ
4. **Data Access Layer / Database:** บันทึกข้อมูลแบบมี Transaction Management (ACID)

---

## 📌 2. Domain Model & Class Architecture (≥ 10 Classes)
AI ต้องยึดโครงสร้าง Class เหล่านี้ในการสร้าง Domain Layer (ฝั่ง Backend)

### 🧑‍🤝‍🧑 Group 1: Users (Inheritance)
1. `User` (Abstract Class): `id`, `name`, `email`, `passwordHash`
2. `Traveler` (Inherits `User`): `loyaltyPoints`, `savedCards`
3. `Admin` (Inherits `User`): `accessLevel`, `managePromotions()`

### 🧳 Group 2: Core Booking (Aggregate Roots)
4. `Trip` : `tripId`, `travelerId`, `tripName`, `List<Booking>` (Composition)
5. `Booking` : `bookingId`, `List<BookingItem>`, `totalPrice`, `BookingState` (State Pattern)

### 🛏️ Group 3: Booking Items (Polymorphism)
6. `BookingItem` (Abstract/Interface): `itemId`, `price`, `getDetails()`, `calculateTax()`
7. `Flight` (Implements `BookingItem`): `flightNo`, `airline`, `departure`, `seatNo`
8. `HotelRoom` (Implements `BookingItem`): `hotelName`, `roomType`, `checkIn`, `nights`

### 💳 Group 4: Payments & Services
9. `Payment` : `transactionId`, `amount`, `PaymentMethod` (Strategy Pattern)
10. `PromotionCode` : `code`, `discountRate`, `isValid()`
11. `Review` : `rating`, `comment`, `travelerId`, `itemId`
12. `Notification` : `message`, `recipientEmail`, `send()`

---

## 📌 3. OOP, SOLID & Design Patterns Application

*   **Polymorphism:** ฟังก์ชันคำนวณราคาสุทธิของ `Booking` จะลูปเรียก `item.calculateTax()` ซึ่งจะทำงานต่างกันระหว่าง `Flight` และ `HotelRoom`
*   **Strategy Pattern (Payment):** รองรับหลายช่องทางจ่ายเงิน (`CreditCardPayment`, `PromptPayPayment`) โดยเรียกผ่าน Interface `IPaymentStrategy`
*   **State Pattern (Booking Lifecycle):** ใช้ควบคุมสถานะจอง (`PendingState`, `ConfirmedState`, `CancelledState`)
*   **Factory Pattern (Item Creation):** รับ JSON payload จาก Frontend และสร้าง Object `Flight` หรือ `HotelRoom` กลับมา
*   **Observer Pattern (Events):** เมื่อ `Booking` กลายเป็น `Confirmed` ให้ทริกเกอร์ `NotificationService` ส่งอีเมล

---

## 📌 4. RESTful API Endpoints (Integration)
Frontend HTML จะเชื่อมต่อกับ Backend ผ่าน API ต่อไปนี้:
*   `GET /api/search?type=flight&dest=BKK` - ค้นหาเที่ยวบิน/โรงแรม
*   `POST /api/bookings` - สร้างใบจอง (ส่งข้อมูล Item กลับมาให้ Backend เข้า Factory Pattern)
*   `POST /api/bookings/:id/pay` - ชำระเงิน (ระบุ Strategy: CreditCard/PromptPay)
*   `PUT /api/bookings/:id/cancel` - ยกเลิกใบจอง (เปลี่ยน State)

---

## 📌 5. AI Vibe Coding Execution Plan (Step-by-Step)
*ก็อปปี้คำสั่ง (Prompts) ด้านล่างนี้ไปสั่ง AI ทีละสเต็ป เพื่อเริ่มเขียนโค้ด Full Stack ได้เลย*

*   **Step 1 (Core Domain & OOP):** "ช่วยเขียนคลาส Domain Models ทั้งหมด (User, Traveler, Booking, Flight, HotelRoom ฯลฯ) ด้วย TypeScript โดยใช้หลัก Inheritance, Encapsulation และ Polymorphism ตามเอกสาร Requirements.md"
*   **Step 2 (Design Patterns):** "ช่วยเติม Design Patterns เข้าไปในระบบ: 1. Strategy Pattern สำหรับ Payment 2. State Pattern สำหรับสถานะ Booking และ 3. Factory Pattern สำหรับสร้าง BookingItem"
*   **Step 3 (Services & Exception Handling):** "ช่วยเขียนชั้น Service (BookingService, PaymentService) พร้อมสร้าง Custom Exception (เช่น PaymentFailedException, ItemSoldOutException) และเขียน Unit Test พื้นฐานสำหรับตรวจเช็คการคิดราคา"
*   **Step 4 (Backend API / Express):** "ช่วยนำ Service ที่สร้างไว้มาทำเป็น RESTful API ด้วย Express.js (POST /bookings, POST /pay) พร้อมทำ Global Error Handler สำหรับแปลง Exception เป็น HTTP Status"
*   **Step 5 (Frontend HTML/JS Integration):** "ช่วยเขียนไฟล์ index.html และ app.js แบบคลีนๆ สำหรับแสดงผลหน้าค้นหา และดักเหตุการณ์กดปุ่ม Book/Pay เพื่อยิง Fetch API ไปเชื่อมต่อกับ Backend ที่เราเพิ่งเขียนไว้"
