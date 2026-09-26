# 🧳 Litrip — Travel Booking Platform
### Project Walkthrough & Technical Documentation

---

## 📋 สารบัญ (Table of Contents)

1. [ภาพรวมโครงการ (Project Overview)](#1-ภาพรวมโครงการ)
2. [โครงสร้างโปรเจกต์ (Project Structure)](#2-โครงสร้างโปรเจกต์)
3. [OOP Concepts ที่ใช้](#3-oop-concepts-ที่ใช้)
4. [Design Patterns ที่ใช้](#4-design-patterns-ที่ใช้)
5. [การทำงานของฟีเจอร์ต่างๆ](#5-การทำงานของฟีเจอร์ต่างๆ)
6. [เทคโนโลยี Frontend](#6-เทคโนโลยี-frontend)
7. [เทคโนโลยี Backend](#7-เทคโนโลยี-backend)
8. [ฐานข้อมูลและ Cloud Services](#8-ฐานข้อมูลและ-cloud-services)
9. [สรุปภาพรวม (Summary)](#9-สรุปภาพรวม)

---

## 1. ภาพรวมโครงการ

**Litrip** คือแพลตฟอร์มจองตั๋วเดินทางออนไลน์ (Travel Booking Platform) ที่พัฒนาขึ้นด้วยแนวคิด Object-Oriented Programming (OOP) อย่างครบถ้วน ผู้ใช้งานสามารถ:

- 🔍 **ค้นหา** เที่ยวบิน โรงแรม และแพ็กเกจดีล (เที่ยวบิน + ที่พัก ลด 15%)
- 🛒 **เพิ่มรายการ** ลงตะกร้าและตรวจสอบสรุปการจอง
- 💳 **ชำระเงิน** ด้วยบัตรเครดิตหรือ PromptPay
- 🎁 **ใช้โปรโมชันโค้ด** และ **LitPoints** (คะแนนสะสม) เพื่อรับส่วนลด
- 📊 **ติดตามประวัติ** การจอง ยกเลิกการจอง และดูคะแนนสะสม
- ⭐ **เขียนรีวิว** ประเมินโรงแรมและเที่ยวบิน

---

## 2. โครงสร้างโปรเจกต์

```
project-travel-booking-platform/
├── api/
│   └── index.ts              ← Vercel Serverless Entry Point
├── public/                   ← Static Frontend Files
│   ├── index.html            ← หน้าแรก (Landing Page)
│   ├── js/
│   │   └── api.js            ← Shared JS helpers (formatPrice, auth)
│   └── pages/
│       ├── search.html       ← ค้นหาเที่ยวบิน/โรงแรม/แพ็กเกจ
│       ├── trip-details.html ← ตะกร้าสินค้า / สรุปการจอง
│       ├── checkout.html     ← หน้าชำระเงิน
│       ├── dashboard.html    ← Dashboard ผู้ใช้ (คะแนน, ประวัติ)
│       └── login.html        ← Login / Register
├── src/                      ← TypeScript Backend Source
│   ├── server.ts             ← Express App Entry Point
│   ├── config/
│   │   └── supabase.ts       ← Supabase Client Setup
│   ├── models/               ← OOP Domain Models
│   │   ├── User.ts           ← Abstract Base Class (User)
│   │   ├── Traveler.ts       ← Extends User (Inheritance)
│   │   ├── Admin.ts          ← Extends User (Inheritance)
│   │   ├── BookingItem.ts    ← Abstract Base Class (BookingItem)
│   │   ├── Flight.ts         ← Extends BookingItem (Polymorphism)
│   │   ├── HotelRoom.ts      ← Extends BookingItem (Polymorphism)
│   │   ├── Booking.ts        ← Aggregate Root (Core Class)
│   │   ├── Payment.ts        ← Payment Record Model
│   │   ├── Trip.ts           ← Trip Model
│   │   ├── PromotionCode.ts  ← Promo Code Logic
│   │   ├── Review.ts         ← Review Model
│   │   └── Notification.ts   ← Notification Model
│   ├── patterns/             ← Design Pattern Implementations
│   │   ├── BookingItemFactory.ts ← Factory Pattern
│   │   ├── IBookingState.ts      ← State Pattern
│   │   ├── BookingObserver.ts    ← Observer Pattern
│   │   └── IPaymentStrategy.ts   ← Strategy Pattern
│   ├── services/             ← Business Logic Services
│   │   ├── AuthService.ts    ← Authentication (Login/Register)
│   │   ├── BookingService.ts ← Booking DB Operations
│   │   └── PaymentService.ts ← Payment Processing
│   ├── data/
│   │   └── seedData.ts       ← In-Memory Mock Data Generator
│   ├── middleware/
│   │   └── errorHandler.ts   ← Global Error Handler
│   ├── exceptions/
│   │   └── DomainException.ts ← Custom Exception Classes
│   └── routes/
│       └── index.ts          ← All API Routes (Express Router)
├── tests/                    ← Unit Tests (Jest)
├── vercel.json               ← Vercel Deployment Config
├── package.json
└── tsconfig.json
```

---

## 3. OOP Concepts ที่ใช้

### 3.1 Abstraction (นามธรรม)

ระบบมี **Abstract Class** 2 ชั้นหลักที่บังคับให้ Subclass ต้องนำไปใช้งาน:

#### `User` (Abstract)
```
User (abstract)
├── getRole(): string  ← abstract method
├── toJSON(): object
├── Traveler           ← ผู้ใช้ทั่วไป (getRole → 'traveler')
└── Admin              ← ผู้ดูแลระบบ (getRole → 'admin')
```

#### `BookingItem` (Abstract)
```
BookingItem (abstract)
├── calculatePrice(): number  ← abstract
├── calculateTax(): number    ← abstract
├── getDetails(): object      ← abstract
├── getType(): string         ← abstract
├── Flight    ← คำนวณราคาตาม SeatType (economy/business/first)
└── HotelRoom ← คำนวณราคาตาม จำนวนคืน × ราคาต่อคืน
```

---

### 3.2 Encapsulation (การห่อหุ้มข้อมูล)

ทุก Class ใช้ `private` fields และเปิดเผยข้อมูลผ่าน `getter` เท่านั้น:

- **`Booking`** — `_items`, `_state`, `_totalPrice` เป็น private ทั้งหมด ป้องกันการแก้ไขจากภายนอกโดยตรง
- **`Traveler`** — `_loyaltyPoints`, `_tier` ป้องกันการลดคะแนนโดยตรง ต้องผ่าน `redeemPoints()` เท่านั้น
- **`User`** — Setter มี Validation ก่อนทุกครั้ง เช่น email ต้องมี `@` ถึงจะเปลี่ยนได้

---

### 3.3 Inheritance (การสืบทอด)

```
User
├── Traveler  →  มีคุณสมบัติเพิ่มเติม: loyaltyPoints, tier, savedCards, pointHistory
└── Admin     →  getRole() → 'admin'

BookingItem
├── Flight    →  เพิ่ม: flightNo, airline, seatType, TAX_RATES, SEAT_MULTIPLIERS
└── HotelRoom →  เพิ่ม: hotelName, roomType, checkIn, checkOut, pricePerNight
```

`Traveler.toJSON()` เรียก `super.toJSON()` จาก `User` และ spread ออกมาก่อน แล้วค่อยเพิ่ม fields ของตัวเอง ทำให้ไม่ต้องเขียนโค้ดซ้ำ

---

### 3.4 Polymorphism (พหุสัณฐาน)

เมื่อ `Booking` คำนวณราคารวม จะเรียก `item.calculatePrice()` บน **ทุก item** โดยไม่รู้ว่าเป็น `Flight` หรือ `HotelRoom`:

| Class      | `calculatePrice()` Logic |
|------------|--------------------------|
| `Flight`   | `basePrice × SEAT_MULTIPLIER + airport_tax + fuel_surcharge` |
| `HotelRoom`| `pricePerNight × nights + room service fees` |

```typescript
// Booking.ts - ทำงานได้กับ Flight และ HotelRoom เหมือนกัน
getSubtotal(): number {
  return this._items.reduce((sum, item) => sum + item.calculatePrice(), 0);
}
```

---

## 4. Design Patterns ที่ใช้

### 4.1 Factory Pattern — `BookingItemFactory`

**ไฟล์:** `src/patterns/BookingItemFactory.ts`

**จุดประสงค์:** สร้าง `Flight` หรือ `HotelRoom` จาก JSON payload โดยที่ผู้เรียกไม่ต้องรู้ว่าจะ `new Flight(...)` หรือ `new HotelRoom(...)`

```typescript
// ตัวอย่างการใช้งาน
const item = BookingItemFactory.createItem({ type: 'flight', ... });
// ระบบจะ return Flight หรือ HotelRoom ให้อัตโนมัติ
```

**ประโยชน์:** ถ้าเพิ่ม type ใหม่ (เช่น `tour`) ก็แค่เพิ่ม case เดียวใน Factory โดยไม่ต้องแก้โค้ดที่เรียกใช้ (Open/Closed Principle)

---

### 4.2 State Pattern — `IBookingState`

**ไฟล์:** `src/patterns/IBookingState.ts`

**จุดประสงค์:** ควบคุม lifecycle ของการจอง ป้องกันการเปลี่ยนสถานะที่ไม่ถูกต้อง

```
Pending ──confirm()──▶ Confirmed ──cancel()──▶ Cancelled
   │                                                 ▲
   └──────────────cancel()──────────────────────────┘
```

| State       | confirm() | cancel() | canModify() |
|-------------|-----------|----------|-------------|
| `Pending`   | ✅ → Confirmed | ✅ → Cancelled | `true` |
| `Confirmed` | ❌ throws | ✅ → Cancelled | `false` |
| `Cancelled` | ❌ throws | ❌ throws | `false` |

---

### 4.3 Observer Pattern — `BookingObserver`

**ไฟล์:** `src/patterns/BookingObserver.ts`

**จุดประสงค์:** เมื่อสถานะการจองเปลี่ยน (`confirm` / `cancel`) จะ **แจ้งเตือน Observer ทุกตัว** โดยอัตโนมัติ

```
Booking.confirm()
   └── BookingEventManager.notify(event)
           ├── NotificationObserver.update()  → บันทึก Notification (แจ้งเตือนทาง email)
           └── LoyaltyPointObserver.update()  → เพิ่ม LitPoints (1 คะแนน ต่อ ฿100)
```

**ประโยชน์:** ระบบ Notification และ Loyalty Points ทำงานแยกอิสระ ถ้าจะเพิ่ม Observer ใหม่ (เช่น SMS) ก็ไม่ต้องแก้ `Booking.ts` เลย

---

### 4.4 Strategy Pattern — `IPaymentStrategy`

**ไฟล์:** `src/patterns/IPaymentStrategy.ts`

**จุดประสงค์:** รองรับวิธีชำระเงินหลายแบบ โดยใช้ Interface เดียวกัน

| Strategy          | `processPayment()` |
|-------------------|--------------------|
| `CreditCardPayment` | ตรวจสอบเลขบัตร, CVV, วันหมดอายุ → สร้าง Transaction ID `CC-XXXXXXXX` |
| `PromptPayPayment`  | ตรวจสอบเบอร์โทร 10 หลัก → สร้าง Transaction ID `PP-XXXXXXXX` |

**ประโยชน์:** ถ้าต้องการเพิ่ม PayPal หรือ TrueMoney ก็แค่สร้าง Class ใหม่ที่ implement `IPaymentStrategy` โดยไม่กระทบโค้ดส่วนอื่น

---

## 5. การทำงานของฟีเจอร์ต่างๆ

### 5.1 🔍 ระบบค้นหา (Search)

**หน้า:** `public/pages/search.html` → **API:** `GET /api/search`

**Flow:**
1. ผู้ใช้กรอก ต้นทาง / ปลายทาง / วันที่ / จำนวนผู้โดยสาร
2. Frontend ส่ง Query Parameters ไปยัง Backend
3. Backend กรองข้อมูลจาก Seed Data (In-Memory) แล้วส่งกลับ 3 กลุ่ม:
   - **Flights** — เที่ยวบินตรง + เที่ยวบินต่อเครื่องผ่าน BKK (Hub)
   - **Hotels** — โรงแรมที่ Location ตรงกัน
   - **Packages** — จับคู่เที่ยวบินหลายสายการบินกับโรงแรมแต่ละแห่ง (ลด 15%)
4. Frontend แสดงผลพร้อมตัวกรอง (ราคา, สายการบิน, ระดับดาว)

**เที่ยวบินที่รองรับ:**
- เส้นทาง **BKK → 7 ปลายทาง** (Tokyo, Singapore, London, Seoul, Paris, Sydney, New Delhi)
- เส้นทาง **Non-BKK ↔ Non-BKK** (Direct International Routes แบบ Full-Mesh)
- เส้นทาง **Connecting Flight** via BKK Hub (Layover 0.5–24 ชั่วโมง)

---

### 5.2 🛒 ตะกร้าและสรุปการจอง (Trip Details)

**หน้า:** `public/pages/trip-details.html` → **API:** `POST /api/bookings` (Batch)

**Flow:**
1. รายการที่เพิ่มลงตะกร้าจะถูกเก็บใน `localStorage`
2. กด "ดำเนินการต่อ" → Frontend ส่ง **Batch Request เดียว** พร้อม `items[]` และ `promoCode` ทั้งหมด
3. Backend สร้าง `Booking` Object → เพิ่ม `BookingItem` ผ่าน `BookingItemFactory` → คำนวณราคารวม (VAT 7%) → บันทึกลง Supabase ครั้งเดียว
4. ผู้ใช้ถูก redirect ไปหน้า checkout พร้อม `bookingId`

**การคำนวณราคา:**
```
Subtotal = ผลรวม calculatePrice() ของทุก item
VAT (7%) = Subtotal × 0.07
ส่วนลดโปรโมชัน = ตามเงื่อนไขของโค้ด
ส่วนลด LitPoints = จำนวนพอยต์ที่ใช้ × 0.10 บาท
Total = Subtotal + VAT - ส่วนลด
```

---

### 5.3 💳 ระบบชำระเงิน (Checkout)

**หน้า:** `public/pages/checkout.html` → **API:** `POST /api/bookings/:id/pay`

**Flow:**
1. ผู้ใช้เลือกวิธีชำระเงิน (บัตรเครดิต / PromptPay)
2. Backend สร้าง `IPaymentStrategy` ที่เหมาะสม → `validate()` → `processPayment()`
3. หาก Payment สำเร็จ → `booking.confirm(transactionId)`:
   - `PendingState` → `ConfirmedState` (State Pattern)
   - `BookingEventManager.notify()` (Observer Pattern):
     - `NotificationObserver` → บันทึก Notification
     - `LoyaltyPointObserver` → เพิ่ม LitPoints ใน Supabase
4. อัปเดตสถานะการจองใน Supabase

---

### 5.4 🎁 ระบบโปรโมชันโค้ด

**API:** `POST /api/bookings/:id/promo`

| โค้ด       | ส่วนลด                  |
"GOLD50"      ลด50%

---

### 5.5 🎯 ระบบ LitPoints (คะแนนสะสม)

**อัตราการสะสม:** ทุกการจองที่ชำระเงินสำเร็จ → **1 คะแนน ต่อ ฿100**

**ระดับสมาชิกและ Multiplier:**

| ระดับ     | คะแนนที่ต้องมี | Multiplier |
|-----------|---------------|------------|
| Member    | 0–1,999       | ×1.0       |
| Silver    | 2,000–4,999   | ×1.2       |
| Gold      | 5,000–9,999   | ×1.5       |
| Platinum  | 10,000+       | ×2.0       |

**การแลกคะแนน:** ใช้คะแนนก่อนชำระเงิน ทุก **100 คะแนน = ฿10 ส่วนลด**

---

### 5.6 📊 Dashboard ผู้ใช้

**หน้า:** `public/pages/dashboard.html`

- แสดง **LitPoints** พร้อม Progress Bar ไปยัง Tier ถัดไป
- แสดง **ประวัติการจอง** (สถานะ: Pending / Confirmed / Cancelled)
- ฟังก์ชัน **ยกเลิกการจอง** — เปลี่ยน State เป็น `Cancelled` ผ่าน `booking.cancel()`
- แสดง **ประวัติคะแนน** (ได้รับ/ใช้ไป)
- เขียน **รีวิว** ประเมินโรงแรมและเที่ยวบิน

---

### 5.7 🔐 ระบบยืนยันตัวตน (Authentication)

**API:** `POST /api/auth/register`, `POST /api/auth/login`

**Flow:**
1. สมัครสมาชิก → `bcryptjs` แฮช Password → บันทึกใน Supabase (`travelers` table)
2. เข้าสู่ระบบ → เปรียบเทียบแฮช → ส่งข้อมูลผู้ใช้กลับ (ไม่มี password)
3. Session ถูกเก็บใน `localStorage` ฝั่ง Frontend
4. ทุก API ที่ต้องการสิทธิ์ตรวจสอบ `userId` จาก Request body

---

## 6. เทคโนโลยี Frontend

| เทคโนโลยี | บทบาท |
|-----------|--------|
| **HTML5** | โครงสร้างหน้าเว็บทั้งหมด (5 หน้าหลัก) |
| **Tailwind CSS** (CDN) | Utility-first CSS Framework — จัด Layout, สี, Responsive |
| **Vanilla JavaScript** | Logic ทั้งหมดฝั่ง Frontend (ไม่ใช้ Framework) |
| **Fetch API** | เรียก REST API ไปยัง Backend แบบ Async/Await |
| **localStorage** | เก็บข้อมูล Session (userId, email, name, tier, points) และ ตะกร้าสินค้า |
| **Google Fonts** | Font Prompt (ภาษาไทย) + Material Symbols Icons |
| **URL Parameters** | ส่งข้อมูลค้นหาระหว่างหน้า (origin, dest, dateFrom, dateTo, guests) |

**สถาปัตยกรรม Frontend:**
- ไม่ใช้ Framework — ทุกหน้าเป็น Standalone HTML ที่มี `<script>` ฝัง
- ใช้ Pattern `async function init()` สำหรับ DOMContentLoaded
- `public/js/api.js` เก็บ Helper functions ที่ใช้ร่วมกันทุกหน้า (formatPrice, checkAuth, etc.)

---

## 7. เทคโนโลยี Backend

| เทคโนโลยี | บทบาท |
|-----------|--------|
| **Node.js** | JavaScript Runtime Environment |
| **TypeScript** | Static Typing — ป้องกัน Type Error ตั้งแต่ Compile Time |
| **Express.js** | Web Framework สำหรับ REST API |
| **@supabase/supabase-js** | Supabase Client SDK สำหรับ CRUD บนฐานข้อมูล |
| **bcryptjs** | แฮช Password อย่างปลอดภัย (bcrypt algorithm) |
| **uuid** | สร้าง Unique ID สำหรับ Booking, Transaction |
| **dotenv** | โหลด Environment Variables จาก `apikey.env` |
| **cors** | อนุญาต Cross-Origin Requests จาก Frontend |
| **ts-node** | รัน TypeScript โดยตรง (ไม่ต้อง Compile ตอน Dev) |
| **Jest + ts-jest** | Unit Testing Framework |

**API Endpoints หลัก:**

| Method | Endpoint | หน้าที่ |
|--------|----------|--------|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| GET | `/api/search` | ค้นหาเที่ยวบิน/โรงแรม/แพ็กเกจ |
| POST | `/api/bookings` | สร้าง Booking ใหม่ (Batch) |
| GET | `/api/bookings` | ดึง Booking ทั้งหมดของผู้ใช้ |
| GET | `/api/bookings/:id` | ดึง Booking เดียว |
| POST | `/api/bookings/:id/promo` | ใส่โปรโมชันโค้ด |
| POST | `/api/bookings/:id/pay` | ชำระเงิน |
| PUT | `/api/bookings/:id/cancel` | ยกเลิกการจอง |
| POST | `/api/reviews` | เขียนรีวิว |
| GET | `/api/me` | ดึงข้อมูลผู้ใช้ปัจจุบัน |

---

## 8. ฐานข้อมูลและ Cloud Services

### Supabase (PostgreSQL)

**Tables ที่ใช้งาน:**

| Table | เก็บข้อมูล |
|-------|-----------|
| `travelers` | id, name, email, password_hash, loyalty_points, tier |
| `bookings` | booking_id, traveler_id, state, total_price, items (JSONB), promo_code, payment_transaction_id |

**สถาปัตยกรรม:**
- `Booking.items` ถูกเก็บเป็น **JSONB** ใน Supabase (Serialized JSON Array)
- เมื่อโหลดกลับมา Backend จะ hydrate ผ่าน `booking.loadRawData()` โดยไม่ต้องสร้าง Object ใหม่ทั้งหมด
- `BookingService.ts` ทำหน้าที่ Bridge ระหว่าง Supabase กับ Domain Objects

### Vercel (Deployment)

- **`vercel.json`** — Rewrite ทุก `/api/*` ไปยัง Serverless Function `api/index.ts`
- **`api/index.ts`** — Export `app` จาก `src/server.ts` สำหรับ Vercel
- **Environment Variables** — `SUPABASE_URL` และ `SUPABASE_KEY` ตั้งค่าใน Vercel Dashboard

---

## 9. สรุปภาพรวม

### 🏆 จุดเด่นของโปรเจกต์นี้

| ด้าน | รายละเอียด |
|------|-----------|
| **OOP Completeness** | ใช้ครบทั้ง 4 หลัก: Abstraction, Encapsulation, Inheritance, Polymorphism |
| **Design Patterns** | ใช้ 4 Patterns: Factory, State, Observer, Strategy — ทุกตัวมีจุดประสงค์ชัดเจน |
| **Separation of Concerns** | Models / Patterns / Services / Routes แยกชั้นชัดเจน |
| **Type Safety** | TypeScript ทุกไฟล์ — ป้องกัน Runtime Error จาก Type Mismatch |
| **Performance** | Batch API สำหรับ Checkout (แทนที่จะส่ง 7-9 Requests แยก) |
| **Real Database** | Supabase (PostgreSQL) ไม่ใช่ In-Memory ล้วน |
| **Extensibility** | เพิ่ม Payment Method, Item Type, Observer ใหม่ได้โดยไม่แก้โค้ดเดิม (OCP) |

---

### 📐 Diagram: Class Hierarchy

```
User (abstract)
├── Traveler          → loyaltyPoints, tier, savedCards
└── Admin             → getRole(): 'admin'

BookingItem (abstract)
├── Flight            → calculatePrice() = basePrice × seatMultiplier + tax
└── HotelRoom         → calculatePrice() = pricePerNight × nights

Booking               → implements BookingStateContext
├── _items: BookingItem[]       (Composition)
├── _state: IBookingState       (State Pattern)
└── _eventManager: BookingEventManager (Observer Pattern)
```

---

### 🔄 Diagram: Booking Lifecycle Flow

```
[ผู้ใช้ค้นหา] → search.html → GET /api/search
      ↓
[เพิ่มลงตะกร้า] → localStorage
      ↓
[ตรวจสอบสรุป] → trip-details.html → POST /api/bookings (Batch)
      ↓
[ชำระเงิน] → checkout.html → POST /api/bookings/:id/pay
      ↓
[State: Pending → Confirmed]
      ↓
[Observer Triggered]
  ├── NotificationObserver → Notification บันทึก
  └── LoyaltyPointObserver → LitPoints เพิ่มใน Supabase
      ↓
[ดูประวัติ] → dashboard.html → GET /api/bookings
```

---

*เอกสารนี้สร้างโดยระบบ Antigravity AI — อัปเดตล่าสุด: กันยายน 2026*
