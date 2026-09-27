import { hashSync } from 'bcryptjs';
import { Traveler } from '../models/Traveler';
import { Admin } from '../models/Admin';
import { Flight } from '../models/Flight';
import { HotelRoom } from '../models/HotelRoom';
import { PromotionCode } from '../models/PromotionCode';
import { Booking } from '../models/Booking';
import { Trip } from '../models/Trip';
import { Review } from '../models/Review';
import { BookingEventManager, NotificationObserver, LoyaltyPointObserver } from '../patterns/BookingObserver';

// --- Password hash for seed users ---
const passwordHash = hashSync('password123', 10);

// --- Event Manager (Observer Pattern) ---
export const eventManager = new BookingEventManager();
eventManager.subscribe(new NotificationObserver());

const loyaltyObserver = new LoyaltyPointObserver();
loyaltyObserver.setCallback(async (travelerId: string, points: number, bookingId: string) => {
  const traveler = findTravelerById(travelerId);
  if (traveler) {
    const desc = bookingId ? `α╕¬α╕░α╕¬α╕íα╕äα╕░α╣üα╕Öα╕Öα╕êα╕▓α╕üα╕üα╕▓α╕úα╕êα╕¡α╕ç #${bookingId.substring(0, 8).toUpperCase()}` : 'α╣äα╕öα╣ëα╕úα╕▒α╕Üα╕äα╕░α╣üα╕Öα╕Öα╕¬α╕░α╕¬α╕í';
    traveler.addPoints(points, desc, true); // true = apply tier multiplier
    console.log(`[Loyalty] Added LitPoints to ${traveler.name}`);
    return;
  }
  
  // For Supabase users
  try {
     const { supabase } = require('../config/supabase'); // Dynamic import to avoid circular dependency
     const { data: tb, error: getErr } = await supabase.from('travelers').select('points, name, tier').eq('id', travelerId).single();
     if (getErr || !tb) return;
     
     // Apply tier multiplier if any
     let multiplier = 1;
     if (tb.tier === 'Gold') multiplier = 2;
     else if (tb.tier === 'Platinum') multiplier = 3;
     
     const earnedPoints = Math.floor(points * multiplier);
     const newPoints = (tb.points || 0) + earnedPoints;
     
     const { error: upErr } = await supabase.from('travelers').update({ points: newPoints }).eq('id', travelerId);
     if (!upErr) {
        console.log(`[Loyalty] Added ${earnedPoints} LitPoints to ${tb.name} via Supabase`);
     }
  } catch (err) {
     console.error('[Loyalty] Error updating points in Supabase:', err);
  }
});
eventManager.subscribe(loyaltyObserver);

// ===== USERS =====
export const travelers: Traveler[] = [
  new Traveler('Alex Chen', 'alex@example.com', passwordHash, 'traveler-1', 2450),
  new Traveler('Somchai Jaidee', 'somchai@example.com', passwordHash, 'traveler-2', 800),
  new Traveler('Maria Santos', 'maria@example.com', passwordHash, 'traveler-3', 150),
];

export const admins: Admin[] = [
  new Admin('Admin Litrip', 'admin@litrip.com', passwordHash, 'superadmin', 'admin-1'),
];

// ===== FLIGHTS =====
export const flights: Flight[] = [
  new Flight('TG-676', 'Thai Airways', 'BKK', 'NRT',
    new Date('2026-11-14T08:00:00Z'), new Date('2026-11-14T16:45:00Z'),
    12000, 'economy', 'flight-1'),
  new Flight('TG-677', 'Thai Airways', 'NRT', 'BKK',
    new Date('2026-11-21T10:00:00Z'), new Date('2026-11-21T15:00:00Z'),
    11500, 'economy', 'flight-2'),
  new Flight('TG-678', 'Thai Airways', 'BKK', 'NRT',
    new Date('2026-11-14T08:00:00Z'), new Date('2026-11-14T16:45:00Z'),
    32000, 'business', 'flight-3'),
  new Flight('SQ-707', 'Singapore Airlines', 'BKK', 'SIN',
    new Date('2026-12-01T10:00:00Z'), new Date('2026-12-01T13:20:00Z'),
    5200, 'economy', 'flight-4'),
  new Flight('SQ-708', 'Singapore Airlines', 'SIN', 'BKK',
    new Date('2026-12-05T14:00:00Z'), new Date('2026-12-05T15:30:00Z'),
    4800, 'economy', 'flight-5'),
  new Flight('BA-010', 'British Airways', 'BKK', 'LHR',
    new Date('2026-12-10T23:30:00Z'), new Date('2026-12-11T06:00:00Z'),
    25000, 'economy', 'flight-6'),
  new Flight('BA-011', 'British Airways', 'LHR', 'BKK',
    new Date('2026-12-20T09:00:00Z'), new Date('2026-12-20T22:30:00Z'),
    26500, 'economy', 'flight-7'),
  new Flight('JL-707', 'Japan Airlines', 'NRT', 'BKK',
    new Date('2026-10-10T18:00:00Z'), new Date('2026-10-10T23:00:00Z'),
    11000, 'economy', 'flight-8'),
  new Flight('SK-842', 'SkyWings', 'SIN', 'BKK',
    new Date('2026-11-20T09:00:00Z'), new Date('2026-11-20T10:30:00Z'),
    3800, 'economy', 'flight-9'),
  new Flight('SK-843', 'SkyWings', 'BKK', 'SIN',
    new Date('2026-11-15T14:00:00Z'), new Date('2026-11-15T17:20:00Z'),
    4200, 'premium_economy', 'flight-10'),
];

// ===== HOTEL ROOMS =====
const HOTEL_IMAGES = [
  "1618773928121-c32242e63f39", "1611892440504-42a792e24d32", "1445019980597-93fa8acb246c", "1629140727571-9b5c6f6267b4", "1566073771259-6a8506099945",
  "1584132967334-10e028bd69f7", "1520250497591-112f2f40a3f4", "1455587734955-081b22074882", "1495365200479-c4ed1d35e1aa", "1631049307264-da0ec9d70304",
  "1496417263034-38ec4f0b665a", "1535827841776-24afc1e255ac", "1540541338287-41700207dee6", "1610641818989-c2051b5e2cfd", "1602002418816-5c0aeef426aa",
  "1582719508461-905c673771fd", "1623718649591-311775a30c43", "1606402179428-a57976d71fa4", "1586611292717-f828b167408c", "1630587148265-761cbd139043",
  "1578683010236-d716f9a3f461", "1523496922380-91d5afba98a3", "1522255272218-7ac5249be344", "1621293954908-907159247fc8", "1488345979593-09db0f85545f",
  "1590381105924-c72589b9ef3f", "1571003123894-1f0594d2b5d9", "1518860308377-800f02d5498a", "1724947053227-2335bf21d0ae", "1711059985570-4c32ed12a12c",
  "1631049552057-403cdb8f0658", "1583847268964-b28dc8f51f92", "1582719478250-c89cae4dc85b", "1566665797739-1674de7a421a", "1568495248636-6432b97bd949",
  "1590490360182-c33d57733427", "1580587771525-78b9dba3b914", "1512917774080-9991f1c4c750", "1613977257365-aaae5a9817ff", "1688653802629-5360086bf632",
  "1600596542815-ffad4c1539a9", "1623298317883-6b70254edf31", "1582268611958-ebfd161ef9cf", "1568605114967-8130f3a36994", "1613490493576-7fde63acd811",
  "1564013799919-ab600027ffc6", "1613977257592-4871e5fcd7c4", "1593714604578-d9e41b00c6c6", "1564501049412-61c2a3083791", "1602343168117-bb8ffe3e2e9f",
  "1716807335226-dfe1e2062db1", "1596120236172-231999844ade", "1501426026826-31c667bdf23d", "1566371486490-560ded23b5e4", "1506012787146-f92b2d7d6d96",
  "1440778303588-435521a205bc", "1613425653628-23fd58c3c2b1", "1612278675615-7b093b07772d", "1502301197179-65228ab57f78", "1473496169904-658ba7c44d8a",
  "1512100356356-de1b84283e18", "1475503572774-15a45e5d60b9", "1502784444187-359ac186c5bb", "1602088113235-229c19758e9f", "1568145675395-66a2eda0c6d7",
  "1591285713698-598d587de63e", "1566230555350-59683b1d16e0", "1536745511564-a5fa6e596e7b", "1576610616656-d3aa5d1f4534", "1614667288602-9ac6e37318a7",
  "1530549387789-4c1017266635", "1498747946579-bde604cb8f44", "1532347922424-c652d9b7208e", "1596701062351-8c2c14d1fdd0", "1576354302919-96748cb8299e",
  "1596394516093-501ba68a0ba6", "1630660664869-c9d3cc676880", "1445991842772-097fea258e7b", "1578898886225-c7c894047899", "1521783988139-89397d761dce",
  "1631049421450-348ccd7f8949", "1648132274182-1bd07089d2c9", "1500815845799-7748ca339f27", "1519868343531-805e97cbda3e", "1567455231583-6a1b94181ef4"
].map(id => `https://images.unsplash.com/photo-${id}`);

let imageCursor = 0;

export function getHotelImage(index: number): string {
  // Use a strictly incrementing cursor for perfect 1:1 mapping
  const current = imageCursor;
  imageCursor++;

  if (current < HOTEL_IMAGES.length) {
    return HOTEL_IMAGES[current];
  }
  // Fallback to picsum seed if we somehow exceed the provided pool
  return `https://picsum.photos/seed/hotel-${index}/600/400`;
}

export const hotelRooms: HotelRoom[] = [
  new HotelRoom('Shinjuku Granbell Hotel', 'standard',
    new Date('2026-11-14'), new Date('2026-11-15'),
    3500, 'Tokyo, Japan', 4.5, ['WiFi', 'Breakfast', 'Near Station'],
    getHotelImage(0), 'hotel-1'),
  new HotelRoom('Tokyo Palace Hotel', 'suite',
    new Date('2026-11-14'), new Date('2026-11-15'),
    8500, 'Tokyo, Japan', 4.9, ['WiFi', 'Breakfast', 'Onsen', 'Lounge Access'],
    getHotelImage(1), 'hotel-2'),
  new HotelRoom('Marina Bay Sands', 'deluxe',
    new Date('2026-12-01'), new Date('2026-12-02'),
    7800, 'Singapore', 4.8, ['Infinity Pool', 'WiFi', 'City View', 'Breakfast'],
    getHotelImage(2), 'hotel-3'),
  new HotelRoom('The Fullerton Hotel', 'standard',
    new Date('2026-12-01'), new Date('2026-12-02'),
    4500, 'Singapore', 4.6, ['WiFi', 'Pool', 'Heritage Building'],
    getHotelImage(3), 'hotel-4'),
  new HotelRoom('The Savoy London', 'deluxe',
    new Date('2026-12-10'), new Date('2026-12-11'),
    9500, 'London, UK', 4.9, ['WiFi', 'Breakfast', 'River View', 'Butler Service'],
    getHotelImage(4), 'hotel-5'),
  new HotelRoom('Siam Kempinski Hotel', 'superior',
    new Date('2026-09-20'), new Date('2026-09-21'),
    4200, 'Bangkok, Thailand', 4.7, ['WiFi', 'Breakfast', 'BTS Access', 'Pool'],
    getHotelImage(5), 'hotel-6'),
  new HotelRoom('Banyan Tree Bangkok', 'presidential',
    new Date('2026-10-01'), new Date('2026-10-02'),
    22000, 'Bangkok, Thailand', 5.0, ['WiFi', 'Breakfast', 'Spa', 'Pool', 'Butler', 'Lounge'],
    getHotelImage(6), 'hotel-7'),
  new HotelRoom('Capsule Hotel Shibuya', 'standard',
    new Date('2026-11-14'), new Date('2026-11-15'),
    1200, 'Tokyo, Japan', 4.0, ['WiFi', 'Vending Machines'],
    getHotelImage(7), 'hotel-8'),
];

// ===== PROMOTION CODES =====
export const promoCodes: PromotionCode[] = [
  new PromotionCode('LITRIP25', 0.25, 5000, new Date('2027-12-31'), 3000, 100, 'promo-1'),
  new PromotionCode('NEWUSER10', 0.10, 2000, new Date('2027-12-31'), 1000, 500, 'promo-2'),
  new PromotionCode('GOLD50', 0.50, 10000, new Date('2027-12-31'), 10000, 50, 'promo-3'),
];

// ===== MUTABLE COLLECTIONS =====
export const bookings: Booking[] = [];
export const trips: Trip[] = [];
export const reviews: Review[] = [];

export class Activity {
  public itemId: string;
  public type: 'activity' = 'activity';
  public addOns?: any[];
  public itinerary?: string[];
  public inclusions?: string[];
  constructor(
    public title: string,
    public destinationCode: string,
    public category: string,
    public duration: string,
    public price: number,
    public rating: number,
    public reviewsCount: number,
    public imageUrl: string,
    public highlights: string[],
    public vipDiscountPercent: number = 0,
    id?: string
  ) {
    this.itemId = id || `act-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  }
  toJSON() { return { ...this }; }
}
export const activities: Activity[] = [];


// ===== HELPER FUNCTIONS =====
export function findTravelerById(id: string): Traveler | undefined {
  return travelers.find(t => t.id === id);
}

export function findTravelerByEmail(email: string): Traveler | undefined {
  return travelers.find(t => t.email === email);
}

export function findFlightById(id: string): Flight | undefined {
  return flights.find(f => f.itemId === id);
}

export function findHotelById(id: string): HotelRoom | undefined {
  return hotelRooms.find(h => h.itemId === id);
}

export function findBookingById(id: string): Booking | undefined {
  return bookings.find(b => b.bookingId === id);
}

export function findPromoByCode(code: string): PromotionCode | undefined {
  return promoCodes.find(p => p.code === code.toUpperCase());
}

// ===== AUTO GENERATOR (1-Month Data) =====
function generateExtendedData() {

  const startDate = new Date('2026-09-01T00:00:00Z');
  const endDate = new Date('2026-12-31T00:00:00Z');

  const ROUTES = [
    { dest: 'NRT', destCity: 'Tokyo, Japan', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'Japan Airlines', code: 'JL' }], price: 12000, dur: 6 },
    { dest: 'SIN', destCity: 'Singapore', airlines: [{ name: 'Singapore Airlines', code: 'SQ' }, { name: 'SkyWings', code: 'SK' }], price: 4000, dur: 2 },
    { dest: 'LHR', destCity: 'London, UK', airlines: [{ name: 'British Airways', code: 'BA' }, { name: 'Thai Airways', code: 'TG' }], price: 28000, dur: 12 },
    { dest: 'ICN', destCity: 'Seoul, South Korea', airlines: [{ name: 'Korean Air', code: 'KE' }, { name: 'Thai Airways', code: 'TG' }], price: 10000, dur: 5 },
    { dest: 'CDG', destCity: 'Paris, France', airlines: [{ name: 'Air France', code: 'AF' }, { name: 'Thai Airways', code: 'TG' }], price: 30000, dur: 13 },
    { dest: 'SYD', destCity: 'Sydney, Australia', airlines: [{ name: 'Qantas', code: 'QF' }, { name: 'Thai Airways', code: 'TG' }], price: 20000, dur: 9 },
    { dest: 'DEL', destCity: 'New Delhi, India', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'Air India', code: 'AI' }], price: 8500, dur: 4.5 },
  
    { dest: 'KIX', destCity: 'Osaka, Japan', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'Japan Airlines', code: 'JL' }, { name: 'Peach Aviation', code: 'MM' }], price: 13000, dur: 5.5 },
    { dest: 'CTS', destCity: 'Sapporo, Japan', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'ANA', code: 'NH' }], price: 18000, dur: 6.5 },
    { dest: 'FUK', destCity: 'Fukuoka, Japan', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'Vietjet', code: 'VZ' }], price: 11000, dur: 5 },
    { dest: 'CNX', destCity: 'Chiang Mai, Thailand', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'Bangkok Airways', code: 'PG' }, { name: 'Thai AirAsia', code: 'FD' }, { name: 'Nok Air', code: 'DD' }], price: 1800, dur: 1.2 },
    { dest: 'HKT', destCity: 'Phuket, Thailand', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'Bangkok Airways', code: 'PG' }, { name: 'Thai AirAsia', code: 'FD' }], price: 2200, dur: 1.5 },
    { dest: 'KBV', destCity: 'Krabi, Thailand', airlines: [{ name: 'Thai Airways', code: 'TG' }, { name: 'Thai AirAsia', code: 'FD' }], price: 2000, dur: 1.4 },
    { dest: 'PYX', destCity: 'Pattaya, Thailand', airlines: [{ name: 'Bangkok Airways', code: 'PG' }, { name: 'Thai AirAsia', code: 'FD' }], price: 1000, dur: 1 },
    { dest: 'PMI', destCity: 'Palma de Mallorca, Spain', airlines: [{ name: 'Emirates', code: 'EK' }, { name: 'Lufthansa', code: 'LH' }, { name: 'Qatar Airways', code: 'QR' }], price: 35000, dur: 14 },
];

  const nonBkkCities = [
    { code: 'NRT', airlines: ['JL', 'NH'] },
    { code: 'SIN', airlines: ['SQ', 'TR'] },
    { code: 'LHR', airlines: ['BA', 'VS'] },
    { code: 'ICN', airlines: ['KE', 'OZ'] },
    { code: 'CDG', airlines: ['AF', 'U2'] },
    { code: 'SYD', airlines: ['QF', 'JQ'] },
    { code: 'DEL', airlines: ['AI', '6E'] }
  
    ,{ code: 'KIX', airlines: ['JL', 'MM'] },
    { code: 'CTS', airlines: ['NH', 'MM'] },
    { code: 'FUK', airlines: ['JL', 'VZ'] },
    { code: 'CNX', airlines: ['PG', 'FD', 'DD'] },
    { code: 'HKT', airlines: ['TG', 'PG', 'FD'] },
    { code: 'KBV', airlines: ['FD', 'DD'] },
    { code: 'PYX', airlines: ['PG', 'FD'] },
    { code: 'PMI', airlines: ['EK', 'LH', 'IB'] }
];

  const AIRLINE_MAP: Record<string, string> = {
    'JL': 'Japan Airlines', 'NH': 'ANA',
    'SQ': 'Singapore Airlines', 'TR': 'Scoot',
    'BA': 'British Airways', 'VS': 'Virgin Atlantic',
    'KE': 'Korean Air', 'OZ': 'Asiana Airlines',
    'AF': 'Air France', 'U2': 'easyJet',
    'QF': 'Qantas', 'JQ': 'Jetstar',
    'AI': 'Air India', '6E': 'IndiGo'
  };


  // ===== 10 Activities per Destination =====
  const actDb: Record<string, any[]> = {
    'PMI': [
      { t: 'ล่องเรือใบคาตามารันชมอ่าวและหาดลับ (Catamaran Cove Tour)', c: 'luxury', d: 'ครึ่งวัน', p: 4500, img: 'https://images.unsplash.com/photo-1555881389-1fc5e6b05202?w=800&q=80', h: ['บุฟเฟต์ทาปาส', 'ดำน้ำตื้น'] },
      { t: 'ทัวร์ปราสาทเบลล์เวอร์และวิหารปัลมา (Bellver & Cathedral)', c: 'culture', d: '4 ชั่วโมง', p: 2000, img: 'https://images.unsplash.com/photo-1547285149-aebba8140e79?w=800&q=80', h: ['ไกด์ท้องถิ่น', 'ตั๋วแบบ Fast-track'] },
      { t: 'ดำน้ำตื้นและแพดเดิลบอร์ดอ่าวซานตาปอนซา', c: 'adventure', d: '3 ชั่วโมง', p: 1800, img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80', h: ['อุปกรณ์กีฬาทางน้ำ', 'ครูฝึก'] },
      { t: 'เที่ยวชมหมู่บ้านประวัติศาสตร์วัลเดมอสซา (Valldemossa)', c: 'romantic', d: 'ครึ่งวัน', p: 2500, img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80', h: ['ชิมขนมท้องถิ่น', 'เดินชมเมือง'] },
      { t: 'สปอร์ตคาร์ทัวร์เลียบชายฝั่งเมดิเตอร์เรเนียน', c: 'luxury', d: '2 ชั่วโมง', p: 15000, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', h: ['รถเปิดประทุน', 'น้ำมันฟรี'] },
      { t: 'คลาสชิมไวน์ทาปาสสเปนแบบดั้งเดิม', c: 'culture', d: '3 ชั่วโมง', p: 3200, img: 'https://images.unsplash.com/photo-1515444744559-7be63e1600de?w=800&q=80', h: ['ไวน์พรีเมียม 5 ชนิด', 'ทาปาสเซ็ต'] },
      { t: 'ทัวร์สำรวจถ้ำดรัช (Drach Caves Underground Lake)', c: 'nature', d: 'ครึ่งวัน', p: 2800, img: 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&q=80', h: ['คอนเสิร์ตใต้ดิน', 'ล่องเรือในถ้ำ'] },
      { t: 'ล่องเรือยอชต์ส่วนตัวชมพระอาทิตย์ตก (Sunset Private Yacht)', c: 'romantic', d: '3 ชั่วโมง', p: 12000, img: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80', h: ['แชมเปญฟรี', 'ลูกเรือส่วนตัว'] },
      { t: 'เช่าจักรยานขี่ชมเมืองเก่าปัลมา (Palma Old Town Bike Tour)', c: 'family', d: '3 ชั่วโมง', p: 1200, img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', h: ['จักรยานไฟฟ้า', 'ไกด์นำทาง'] },
      { t: 'สปาเมดิเตอร์เรเนียนริมหาดสุดเอ็กซ์คลูซีฟ', c: 'wellness', d: '2 ชั่วโมง', p: 4500, img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', h: ['นวดน้ำมันอโรม่า', 'ห้องสปาวิวทะเล'] }
    ],
    'KBV': [
      { t: 'ปีนผาอ่าวไร่เลย์ (Railay Rock Climbing)', c: 'adventure', d: 'ครึ่งวัน', p: 1500, img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80', h: ['อุปกรณ์ครบ', 'ครูฝึกส่วนตัว'] },
      { t: 'พายเรือคายัคสำรวจป่าโกงกางอ่าวท่าเลน', c: 'nature', d: '3 ชั่วโมง', p: 800, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', h: ['ไกด์ท้องถิ่น', 'น้ำดื่มฟรี'] },
      { t: 'ดำน้ำลึก Scuba หมู่เกาะพีพี & ถ้ำไวกิ้ง', c: 'adventure', d: 'เต็มวัน', p: 3500, img: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800&q=80', h: ['อุปกรณ์ดำน้ำ', 'อาหารกลางวัน'] },
      { t: 'ทริป 4 เกาะ ทะเลแหวกและเกาะปอดะ', c: 'nature', d: 'เต็มวัน', p: 1200, img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', h: ['สปีดโบ๊ท', 'อาหารกลางวันบนเกาะ'] },
      { t: 'ล่องเรือหางยาวโบราณพรีเมียมชมพระอาทิตย์ตก', c: 'luxury', d: '4 ชั่วโมง', p: 4500, img: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80', h: ['ไวน์ฟรี', 'คานาเป้', 'เรือส่วนตัว'] },
      { t: 'สปาธรรมชาติแช่น้ำตกร้อน & สระมรกต', c: 'wellness', d: 'ครึ่งวัน', p: 1000, img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', h: ['รถรับส่ง', 'ตั๋วเข้าชม'] },
      { t: 'SUP Board ยามเช้ากลางทะเลอันดามัน', c: 'nature', d: '2 ชั่วโมง', p: 600, img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80', h: ['บอร์ด SUP', 'ถ่ายภาพโดรน'] },
      { t: 'เดินป่าพิชิตเขาหงอนนาค ชมวิว 360 องศา', c: 'adventure', d: '5 ชั่วโมง', p: 700, img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', h: ['ไกด์นำทาง', 'น้ำดื่ม & ขนม'] },
      { t: 'คลาสเรียนทำอาหารไทยปักษ์ใต้', c: 'culture', d: '3 ชั่วโมง', p: 1500, img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', h: ['เดินตลาดเช้า', 'ทำอาหาร 4 เมนู'] },
      { t: 'สปาอโรมาเธอราพีริมหาด (Luxury Spa)', c: 'wellness', d: '2 ชั่วโมง', p: 2500, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80', h: ['ห้องส่วนตัว', 'น้ำมันออร์แกนิก'] }
    ],
    'CNX': [
      { t: 'โหนสลิง Zipline ข้ามหุบเขาและยอดไม้', c: 'adventure', d: 'ครึ่งวัน', p: 2200, img: 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&q=80', h: ['อุปกรณ์เซฟตี้', '30 ฐาน'] },
      { t: 'ล่องแก่งเรือยางแม่น้ำแม่แตง', c: 'adventure', d: 'ครึ่งวัน', p: 1800, img: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=80', h: ['ไกด์ผู้เชี่ยวชาญ', 'อาหารกลางวัน'] },
      { t: 'ขับรถ ATV ตะลุยดอยออฟโรด', c: 'adventure', d: '3 ชั่วโมง', p: 1600, img: 'https://images.unsplash.com/photo-1596328546171-77e37b5f8ce2?w=800&q=80', h: ['ATV 150cc', 'อุปกรณ์ป้องกัน'] },
      { t: 'ศูนย์อนุรักษ์ช้างเชิงจริยธรรม (VIP)', c: 'nature', d: 'เต็มวัน', p: 3500, img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80', h: ['อาบน้ำช้าง', 'ถ่ายรูปส่วนตัว'] },
      { t: 'เดินป่ากิ่วแม่ปาน ดอยอินทนนท์', c: 'nature', d: 'เต็มวัน', p: 1200, img: 'https://images.unsplash.com/photo-1580133318919-61f2f8da8eb4?w=800&q=80', h: ['รถตู้ VIP', 'ไกด์ท้องถิ่น'] },
      { t: 'ขึ้นบอลลูนลมร้อนชมพระอาทิตย์ขึ้น', c: 'luxury', d: '3 ชั่วโมง', p: 8500, img: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80', h: ['แชมเปญเบรกฟาสต์', 'ใบรับรอง'] },
      { t: 'เวิร์กช็อปดริปกาแฟออร์แกนิก ดอยแม่กำปอง', c: 'culture', d: 'ครึ่งวัน', p: 900, img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80', h: ['ชิมกาแฟ 3 ชนิด', 'ของว่างล้านนา'] },
      { t: 'แช่น้ำพุร้อนออนเซ็นธรรมชาติสันกำแพง', c: 'wellness', d: 'ครึ่งวัน', p: 800, img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', h: ['ห้องแช่ส่วนตัว', 'ต้มไข่น้ำพุร้อน'] },
      { t: 'ทัวร์ไหว้พระวัดลับกลางป่า (วัดอุโมงค์ & ผาลาด)', c: 'culture', d: '4 ชั่วโมง', p: 1000, img: 'https://images.unsplash.com/photo-1592398501258-356b718914b1?w=800&q=80', h: ['รถรับส่ง', 'ไกด์ส่วนตัว'] },
      { t: 'ขันโตกดินเนอร์ & การแสดงล้านนาโบราณ', c: 'culture', d: '3 ชั่วโมง', p: 850, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', h: ['บุฟเฟต์อาหารเหนือ', 'ชมการแสดง 1.5 ชม.'] }
    ],
    'NRT': [
      { t: 'ทัวร์เฮลิคอปเตอร์ส่วนตัวเหนือน่านฟ้าโตเกียว', c: 'luxury', d: '30 นาที', p: 15000, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', h: ['ชมวิวโตเกียวทาวเวอร์', 'ถ่ายภาพมุมสูง'] },
      { t: 'TeamLab Planets VIP Fast Pass', c: 'culture', d: '2 ชั่วโมง', p: 1200, img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80', h: ['ช่องทางพิเศษ', 'ไร้ขีดจำกัดเวลา'] },
      { t: 'ล่องเรือยากาตะบูเนะ ดินเนอร์เทมปุระ', c: 'luxury', d: '2.5 ชั่วโมง', p: 3500, img: 'https://images.unsplash.com/photo-1524413840847-07c6ac3a4049?w=800&q=80', h: ['ดินเนอร์ชุดใหญ่', 'ชมอ่าวโตเกียว'] },
      { t: 'ขับโกคาร์ทชมเมืองโตเกียว (Street Go-Kart)', c: 'adventure', d: '2 ชั่วโมง', p: 2500, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', h: ['ชุดแฟนซี', 'ไกด์นำทาง'] },
      { t: 'ทัวร์ตลาดปลาโทโยสึ & คลาสทำซูชิ', c: 'culture', d: 'ครึ่งวัน', p: 4000, img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80', h: ['เชฟซูชิส่วนตัว', 'วัตถุดิบพรีเมียม'] },
      { t: 'ทัวร์ชมการฝึกซ้อมซูโม่ VIP', c: 'culture', d: '3 ชั่วโมง', p: 3800, img: 'https://images.unsplash.com/photo-1526698905402-e13b8fb35fa9?w=800&q=80', h: ['ถ่ายรูปกับนักซูโม่', 'ไกด์พูดอังกฤษ'] },
      { t: 'ช้อปปิ้งกินซ่าพร้อม Personal Stylist', c: 'luxury', d: 'ครึ่งวัน', p: 6000, img: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80', h: ['ผู้เชี่ยวชาญแฟชั่น', 'รถลิมูซีนรับส่ง'] },
      { t: 'สวมกิโมโนเดินชมวัดเซ็นโซจิ อาซากุสะ', c: 'culture', d: '4 ชั่วโมง', p: 1800, img: 'https://images.unsplash.com/photo-1524413840847-07c6ac3a4049?w=800&q=80', h: ['ชุดกิโมโนแท้', 'ช่างภาพส่วนตัว'] },
      { t: 'Warner Bros. Studio Tour Tokyo VIP', c: 'nature', d: 'เต็มวัน', p: 2500, img: 'https://images.unsplash.com/photo-1618944810773-6701bcf5a452?w=800&q=80', h: ['บัตรเข้าชมล่วงหน้า', 'เซ็ตของที่ระลึก'] },
      { t: 'ดินเนอร์เนื้อวากิว A5 วิวตึกระฟ้าชินจูกุ', c: 'luxury', d: '2 ชั่วโมง', p: 5500, img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80', h: ['คอร์ส 7 เมนู', 'ที่นั่งริมหน้าต่าง'] }
    ],
    'SIN': [
      { t: 'บัตร Universal Studios Singapore VIP', c: 'nature', d: 'เต็มวัน', p: 3500, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80', h: ['Fast Pass ไม่ต้องรอคิว', 'เข้าโซนพิเศษ'] },
      { t: 'ล่องเรือ River Cruise ชมวิวอ่าวมารีน่า', c: 'culture', d: '1.5 ชั่วโมง', p: 900, img: 'https://images.unsplash.com/photo-1546708681-420228d4d420?w=800&q=80', h: ['ถ่ายรูปกับ Merlion', 'ไกด์ออดิโอ'] },
      { t: 'ดินเนอร์หรู Marina Bay Sands SkyPark', c: 'luxury', d: '2 ชั่วโมง', p: 5500, img: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80', h: ['คอร์สอาหารนานาชาติ', 'วิว 360 องศา'] },
      { t: 'ทัวร์ Gardens by the Bay & Cloud Forest', c: 'nature', d: 'ครึ่งวัน', p: 1200, img: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&q=80', h: ['ตั๋วโดมคู่', 'จุดถ่ายรูปฮิต'] },
      { t: 'ทัวร์อาหาร Peranakan & ชิม Kaya Toast', c: 'culture', d: '3 ชั่วโมง', p: 1500, img: 'https://images.unsplash.com/photo-1579730248231-5079a0ebf353?w=800&q=80', h: ['ชิมอาหาร 6 อย่าง', 'ไกด์ท้องถิ่น'] }
    ],
    'CDG': [
      { t: 'ตั๋ว VIP Fast-Track พิพิธภัณฑ์ลูฟวร์', c: 'culture', d: 'ครึ่งวัน', p: 2500, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80', h: ['ไกด์ประวัติศาสตร์ศิลปะ', 'ไม่ต้องรอคิว'] },
      { t: 'ล่องเรือแม่น้ำแซน ดินเนอร์แชมเปญใต้หอไอเฟล', c: 'luxury', d: '3 ชั่วโมง', p: 6500, img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80', h: ['ดินเนอร์ 3 คอร์ส', 'ดนตรีสด'] },
      { t: 'ทัวร์พระราชวังแวร์ซายส์ & สวนดอกไม้ส่วนตัว', c: 'culture', d: 'เต็มวัน', p: 4000, img: 'https://images.unsplash.com/photo-1564501170757-08b3e8c18bd2?w=800&q=80', h: ['รถโค้ชปรับอากาศ', 'ตั๋วเข้าปราสาท'] },
      { t: 'เวิร์กช็อปอบขนมมาการองต้นตำรับฝรั่งเศส', c: 'culture', d: '2 ชั่วโมง', p: 3200, img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80', h: ['เชฟมืออาชีพ', 'นำขนมกลับบ้าน'] },
      { t: 'ทัวร์ชิมไวน์ & ชีส ย่านมงมาทร์', c: 'luxury', d: '3 ชั่วโมง', p: 3800, img: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&q=80', h: ['ไวน์พรีเมียม 4 ชนิด', 'ไกด์ผู้เชี่ยวชาญ'] }
    ],
    'LHR': [
      { t: 'ลอนดอนอาย VIP Capsule พร้อมแชมเปญ', c: 'luxury', d: '1 ชั่วโมง', p: 3500, img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', h: ['ช่องด่วนส่วนตัว', 'วิวแม่น้ำเทมส์'] },
      { t: 'Afternoon Tea ณ โรงแรม The Ritz', c: 'luxury', d: '2 ชั่วโมง', p: 4500, img: 'https://images.unsplash.com/photo-1577048981600-618dd2db9672?w=800&q=80', h: ['ชาพรีเมียม', 'สโคน & ขนมหวาน'] },
      { t: 'ทัวร์สตูดิโอ Harry Potter Warner Bros.', c: 'nature', d: 'เต็มวัน', p: 3800, img: 'https://images.unsplash.com/photo-1618944810773-6701bcf5a452?w=800&q=80', h: ['รถบัสไปกลับ', 'บัตรรวมทุกโซน'] },
      { t: 'ทัวร์ชมพระราชวังบักกิงแฮม & หอนาฬิกาบิ๊กเบน', c: 'culture', d: 'ครึ่งวัน', p: 2200, img: 'https://images.unsplash.com/photo-1529655683823-dcbf3d4f5fc5?w=800&q=80', h: ['ไกด์บรรยาย', 'จุดถ่ายรูปสวยๆ'] },
      { t: 'ทริป Stone Henge & Bath', c: 'culture', d: 'เต็มวัน', p: 5000, img: 'https://images.unsplash.com/photo-1549429712-404c0dcb2b1f?w=800&q=80', h: ['ไกด์ประวัติศาสตร์', 'ตั๋วเข้าชมครบ'] }
    ],
    'SYD': [
      { t: 'ปีนสะพานซิดนีย์ฮาร์เบอร์ (BridgeClimb)', c: 'adventure', d: '3 ชั่วโมง', p: 8500, img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80', h: ['ชุดปีนสะพาน', 'ประกาศนียบัตร'] },
      { t: 'ล่องเรือยอชต์ชมวาฬ & อ่าวซิดนีย์', c: 'nature', d: '4 ชั่วโมง', p: 4500, img: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80', h: ['บุฟเฟต์อาหารทะเล', 'ผู้เชี่ยวชาญ'] },
      { t: 'ทัวร์โรงอุปรากรซิดนีย์ (Opera House) รอบพิเศษ', c: 'culture', d: '1.5 ชั่วโมง', p: 1800, img: 'https://images.unsplash.com/photo-1524823126233-ff1f1737e1ab?w=800&q=80', h: ['เข้าชมเบื้องหลัง', 'ไกด์ส่วนตัว'] },
      { t: 'บินเฮลิคอปเตอร์ชมหุบเขาสามอนงค์ (Blue Mt.)', c: 'luxury', d: 'ครึ่งวัน', p: 12000, img: 'https://images.unsplash.com/photo-1546708681-420228d4d420?w=800&q=80', h: ['รับส่งจากโรงแรม', 'แวะทานอาหาร'] },
      { t: 'เล่นเซิร์ฟหาดบอนได (Bondi Beach)', c: 'adventure', d: '2 ชั่วโมง', p: 2500, img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80', h: ['ครูสอนเซิร์ฟ', 'บอร์ด & ชุด'] }
    ],
    'ICN': [
      { t: 'สวมชุดฮันบกพรีเมียม ถ่ายภาพพระราชวังเคียงบก', c: 'culture', d: '3 ชั่วโมง', p: 1500, img: 'https://images.unsplash.com/photo-1538669715315-16fb5758063f?w=800&q=80', h: ['ชุดฮันบกใหม่', 'ช่างทำผม'] },
      { t: 'เวิร์กช็อปแต่งหน้า K-Beauty ย่านกังนัม', c: 'culture', d: '2 ชั่วโมง', p: 3500, img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80', h: ['สอนสไตล์ไอดอล', 'แถมเครื่องสำอาง'] },
      { t: 'ดินเนอร์เนื้อย่างฮันอู 1++ วิว N Seoul Tower', c: 'luxury', d: '2.5 ชั่วโมง', p: 4800, img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80', h: ['คอร์ส 5 เมนู', 'ที่นั่งริมหน้าต่าง'] },
      { t: 'ตั๋ว VIP สวนสนุก Lotte World', c: 'nature', d: 'เต็มวัน', p: 2200, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80', h: ['Fast Pass 3 เครื่องเล่น', 'ตั๋วอควาเรียม'] },
      { t: 'คลาสเรียนเต้น K-Pop กับครูสอนศิลปิน', c: 'adventure', d: '2 ชั่วโมง', p: 2500, img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', h: ['ห้องซ้อมมาตรฐาน', 'ใบจบหลักสูตร'] }
    ],
    'HKT': [
      { t: 'ล่องเรือยอชต์หรูชมพระอาทิตย์ตก แหลมพรหมเทพ', c: 'luxury', d: 'ครึ่งวัน', p: 4500, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', h: ['เครื่องดื่มไม่อั้น', 'ดีเจบนเรือ'] },
      { t: 'ทริปสปีดโบ๊ทส่วนตัว เกาะพีพี & อ่าวมาหยา', c: 'nature', d: 'เต็มวัน', p: 5500, img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80', h: ['ตั๋วอุทยาน', 'บุฟเฟต์กลางวัน'] },
      { t: 'ทัวร์เดินชมเมืองเก่า (Old Phuket Town) & คาเฟ่ลับ', c: 'culture', d: '4 ชั่วโมง', p: 1200, img: 'https://images.unsplash.com/photo-1592398501258-356b718914b1?w=800&q=80', h: ['ชิมขนมพื้นเมือง', 'ไกด์ท้องถิ่น'] },
      { t: 'สปาไข่มุกอันดามันระดับ 5 ดาวริมหาด', c: 'wellness', d: '3 ชั่วโมง', p: 3500, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80', h: ['ขัดผิวด้วยผงไข่มุก', 'นวดน้ำมันอุ่น'] },
      { t: 'สวนน้ำ Andamanda Phuket VIP Cabana', c: 'nature', d: 'เต็มวัน', p: 2800, img: 'https://images.unsplash.com/photo-1582239308696-6e21fb5a8e2c?w=800&q=80', h: ['เต็นท์ส่วนตัว', 'ล็อกเกอร์ VIP'] }
    ],
    'CTS': [
      { t: 'สกีรีสอร์ทนิเซโกะ พร้อมครูฝึกส่วนตัว', c: 'adventure', d: 'เต็มวัน', p: 6500, img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', h: ['อุปกรณ์สกีครบ', 'ครูพูดอังกฤษ/ไทย'] },
      { t: 'แช่ออนเซ็นธรรมชาติ โจซังเค ท่ามกลางหิมะ', c: 'wellness', d: 'ครึ่งวัน', p: 2500, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', h: ['บ่อส่วนตัว', 'รถรับส่งจากซัปโปโร'] },
      { t: 'ทัวร์โรงกลั่นวิสกี้ Yoichi & ชิมปูยักษ์ทาระบะ', c: 'culture', d: 'เต็มวัน', p: 4500, img: 'https://images.unsplash.com/photo-1546708681-420228d4d420?w=800&q=80', h: ['ชิมวิสกี้ 3 ชนิด', 'เซ็ตปูยักษ์พรีเมียม'] },
      { t: 'เวิร์กช็อปทำช็อกโกแลต Shiroi Koibito', c: 'culture', d: '2 ชั่วโมง', p: 1500, img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80', h: ['เพ้นท์คุกกี้', 'ตั๋วเข้าชมโรงงาน'] },
      { t: 'นั่งเรือตัดน้ำแข็งชม Drift Ice (ฤดูหนาว)', c: 'nature', d: '3 ชั่วโมง', p: 3200, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', h: ['จุดถ่ายภาพสวย', 'เสื้อกันหนาวพิเศษ'] }
    ]
  };

  const DEFAULT_ACTS = [
    { t: 'ทัวร์ไฮไลต์รอบเมืองแบบเอ็กซ์คลูซีฟ (Private Tour)', c: 'culture', d: 'ครึ่งวัน', p: 2000, img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', h: ['ไกด์ท้องถิ่น', 'รถส่วนตัว'] },
    { t: 'ดินเนอร์หรูบนเรือสำราญ ชมพระอาทิตย์ตกดิน', c: 'luxury', d: '3 ชั่วโมง', p: 4500, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', h: ['บุฟเฟต์นานาชาติ', 'ไวน์ฟรี'] },
    { t: 'เดินป่าสำรวจธรรมชาติและน้ำตก', c: 'adventure', d: 'เต็มวัน', p: 1500, img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', h: ['อาหารกลางวัน', 'อุปกรณ์เดินป่า'] },
    { t: 'แพ็กเกจสปาอโรมาและออนเซ็นระดับ 5 ดาว', c: 'wellness', d: '3 ชั่วโมง', p: 3000, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80', h: ['นวด 120 นาที', 'ห้องส่วนตัว'] },
    { t: 'ทัวร์ชิมสตรีทฟู้ดมิชลิน พร้อมไกด์ผู้เชี่ยวชาญ', c: 'culture', d: '3 ชั่วโมง', p: 1200, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', h: ['ชิมอาหาร 5 ร้าน', 'ไกด์ผู้เชี่ยวชาญ'] },
    { t: 'ทัวร์เฮลิคอปเตอร์ส่วนตัว ชมวิวเมืองมุมสูง 360 องศา', c: 'luxury', d: '30 นาที', p: 12000, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', h: ['มุมมองแบบเบิร์ดอาย', 'VIP Lounge'] },
    { t: 'ทัวร์พิพิธภัณฑ์ประวัติศาสตร์ ช่องทางพิเศษ Fast-Track', c: 'culture', d: 'ครึ่งวัน', p: 1800, img: 'https://images.unsplash.com/photo-1524413840847-07c6ac3a4049?w=800&q=80', h: ['ช่องทางพิเศษ', 'เครื่องบรรยายเสียง'] },
    { t: 'ดำน้ำลึก Scuba Diving พร้อมครูฝึกส่วนตัว', c: 'adventure', d: 'ครึ่งวัน', p: 2500, img: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800&q=80', h: ['ครูฝึกส่วนตัว', 'อุปกรณ์ครบ'] },
    { t: 'บัตรสวนสนุกยอดนิยม แพ็กเกจ VIP ไม่ต้องรอคิว', c: 'nature', d: 'เต็มวัน', p: 4000, img: 'https://images.unsplash.com/photo-1505993597083-3bd19fd75e7a?w=800&q=80', h: ['Fast Pass', 'โซนพัก VIP'] },
    { t: 'ล่องเรือยอชต์ส่วนตัว ดำน้ำชมเกาะระดับ VIP', c: 'luxury', d: 'เต็มวัน', p: 8500, img: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=800&q=80', h: ['เรือยอชต์ส่วนตัว', 'แชมเปญฟรี'] }
  ];

  // We will populate activities dynamically based on ROUTES
  if (activities.length === 0) {
    const ALL_DEST = Array.from(new Set([...ROUTES.map(r => r.dest), ...nonBkkCities.map(r => r.code), 'BKK', 'HKT']));
    ALL_DEST.forEach((dest, dIdx) => {
      const list = actDb[dest] || DEFAULT_ACTS;
      list.forEach((act, i) => {
          const newAct = new Activity(
            act.t, dest, act.c, act.d, act.p,
            4.5 + (Math.random() * 0.5),
            Math.floor(Math.random() * 500) + 50,
            act.img, act.h,
            act.c === 'luxury' ? 10 : 0, 
            `act-${dest}-${i}`
          );
          
          newAct.addOns = [
            { id: 'trans', name: 'รถลีมูซีนส่วนตัว รับ-ส่งจากโรงแรม', price: 3500, icon: 'airport_shuttle' },
            { id: 'photo', name: 'ช่างภาพมืออาชีพส่วนตัว (พร้อมวิดีโอโดรน 4K)', price: 4900, icon: 'photo_camera' },
            { id: 'guide', name: 'ไกด์นำเที่ยวส่วนตัว (Thai/Eng)', price: 2500, icon: 'record_voice_over' },
            { id: 'wine', name: 'เซ็ตแชมเปญพรีเมียม และคานาเป้', price: 1800, icon: 'wine_bar' },
            { id: 'insure', name: 'ประกันภัยยกเลิกฟรีแบบไร้เงื่อนไข', price: 500, icon: 'health_and_safety' }
          ];
          
          newAct.itinerary = [
            '10:00 - บริการรถรับจากโรงแรมที่พัก (หากเลือกบริการเสริม)',
            '10:30 - ลงทะเบียนที่เลานจ์ VIP และรับฟังคำแนะนำความปลอดภัย',
            '11:00 - เริ่มต้นกิจกรรมสุดเอ็กซ์คลูซีฟ (Private Experience)',
            '12:30 - แวะพักผ่อนและรับประทานของว่าง/เครื่องดื่ม',
            '13:30 - สิ้นสุดกิจกรรม และเดินทางกลับโรงแรมโดยสวัสดิภาพ'
          ];
          
          newAct.inclusions = [
            'ประกันอุบัติเหตุความคุ้มครองสูงสุด 1,000,000 บาท',
            'อุปกรณ์เซฟตี้มาตรฐานสากล',
            'เครื่องดื่มต้อนรับ (Welcome Drink)',
            'พนักงานดูแลส่วนตัว (Personal Concierge)'
          ];
          
          activities.push(newAct);
      });
    });
  }

  const DIRECT_INTL_ROUTES: any[] = [];
  for (let i = 0; i < nonBkkCities.length; i++) {
    for (let j = i + 1; j < nonBkkCities.length; j++) {
       const c1 = nonBkkCities[i];
       const c2 = nonBkkCities[j];
       DIRECT_INTL_ROUTES.push({
         origin: c1.code, 
         dest: c2.code,
         airlines: [
           { name: AIRLINE_MAP[c1.airlines[0]] || (c1.airlines[0] + ' Airlines'), code: c1.airlines[0] }, 
           { name: AIRLINE_MAP[c2.airlines[0]] || (c2.airlines[0] + ' Airlines'), code: c2.airlines[0] }
         ],
         price: 9000 + Math.floor(Math.random() * 12000), 
         dur: 4 + Math.floor(Math.random() * 6)
       });
    }
  }

  let flightIdCounter = 100;
  let hotelIdCounter = 100;

  // Generate Hotels for new cities (10 per city)
  const hotelTemplates = [
    {
      city: 'New Delhi, India',
      hotels: [
        { name: 'The Taj Mahal Hotel, New Delhi', price: 9500, type: 'presidential', rating: 4.9 },
        { name: 'The Leela Palace New Delhi', price: 11000, type: 'suite', rating: 5.0 },
        { name: 'The Imperial New Delhi', price: 8500, type: 'suite', rating: 4.8 },
        { name: 'ITC Maurya, A Luxury Collection', price: 7200, type: 'deluxe', rating: 4.7 },
        { name: 'The Oberoi New Delhi', price: 12500, type: 'presidential', rating: 4.9 },
        { name: 'Taj Palace, New Delhi', price: 6800, type: 'deluxe', rating: 4.6 },
        { name: 'Radisson Blu Marina Hotel Connaught Place', price: 4200, type: 'superior', rating: 4.3 },
        { name: 'Bloomrooms @ Janpath', price: 1800, type: 'standard', rating: 4.2 },
        { name: 'ibis New Delhi Aerocity', price: 2100, type: 'standard', rating: 4.0 },
        { name: 'Lemon Tree Premier, Delhi Airport', price: 2500, type: 'standard', rating: 4.1 }
      ]
    },
    {
      city: 'Seoul, South Korea',
      hotels: [
        { name: 'The Shilla Seoul', price: 9500, type: 'suite', rating: 4.9 },
        { name: 'Signiel Seoul', price: 12000, type: 'presidential', rating: 5.0 },
        { name: 'Lotte Hotel Seoul', price: 6500, type: 'deluxe', rating: 4.7 },
        { name: 'Four Seasons Seoul', price: 11000, type: 'suite', rating: 4.9 },
        { name: 'Grand Hyatt Seoul', price: 7200, type: 'deluxe', rating: 4.6 },
        { name: 'Ryse Hotel', price: 5800, type: 'superior', rating: 4.5 },
        { name: 'Shilla Stay Gwanghwamun', price: 3200, type: 'standard', rating: 4.2 },
        { name: 'Glad Gangnam', price: 2800, type: 'standard', rating: 4.1 },
        { name: 'Nine Tree Premier Myeongdong', price: 2500, type: 'standard', rating: 4.3 },
        { name: 'Josun Palace', price: 8500, type: 'deluxe', rating: 4.8 }
      ]
    },
    {
      city: 'Paris, France',
      hotels: [
        { name: 'The Ritz Paris', price: 25000, type: 'presidential', rating: 5.0 },
        { name: 'Le Meurice', price: 18000, type: 'suite', rating: 4.9 },
        { name: 'Hotel Plaza Ath├⌐n├⌐e', price: 22000, type: 'suite', rating: 4.9 },
        { name: 'Four Seasons George V', price: 28000, type: 'presidential', rating: 5.0 },
        { name: 'Le Bristol Paris', price: 21000, type: 'deluxe', rating: 4.8 },
        { name: 'Novotel Paris Centre', price: 5000, type: 'superior', rating: 4.0 },
        { name: 'Pullman Tour Eiffel', price: 7500, type: 'deluxe', rating: 4.4 },
        { name: 'Mercure Paris Centre', price: 4200, type: 'standard', rating: 4.1 },
        { name: 'CitizenM Paris Gare de Lyon', price: 3500, type: 'standard', rating: 4.3 },
        { name: 'Ibis Paris Tour Eiffel', price: 2800, type: 'standard', rating: 3.8 }
      ]
    },
    {
      city: 'Sydney, Australia',
      hotels: [
        { name: 'Park Hyatt Sydney', price: 15000, type: 'suite', rating: 4.9 },
        { name: 'Crown Sydney', price: 12500, type: 'deluxe', rating: 4.8 },
        { name: 'Four Seasons Sydney', price: 9500, type: 'deluxe', rating: 4.7 },
        { name: 'The Langham Sydney', price: 11000, type: 'suite', rating: 4.9 },
        { name: 'Shangri-La Sydney', price: 8500, type: 'superior', rating: 4.6 },
        { name: 'Meriton Suites World Tower', price: 5500, type: 'superior', rating: 4.5 },
        { name: 'Ovolo The Wharf', price: 6200, type: 'deluxe', rating: 4.6 },
        { name: 'QT Sydney', price: 5800, type: 'superior', rating: 4.4 },
        { name: 'Rydges Sydney Harbour', price: 4200, type: 'standard', rating: 4.0 },
        { name: 'Ibis Sydney Darling Harbour', price: 2500, type: 'standard', rating: 3.8 }
      ]
    },
    {
      city: 'Tokyo, Japan',
      hotels: [
        { name: 'Aman Tokyo', price: 22000, type: 'suite', rating: 5.0 },
        { name: 'Park Hyatt Tokyo', price: 16000, type: 'deluxe', rating: 4.9 },
        { name: 'Imperial Hotel', price: 12000, type: 'superior', rating: 4.8 },
        { name: 'The Prince Gallery', price: 14000, type: 'suite', rating: 4.8 },
        { name: 'Keio Plaza Hotel', price: 6500, type: 'superior', rating: 4.5 },
        { name: 'Cerulean Tower Tokyu', price: 7200, type: 'deluxe', rating: 4.6 },
        { name: 'Hotel Gracery Shinjuku', price: 3800, type: 'standard', rating: 4.3 },
        { name: 'Shinjuku Granbell', price: 3500, type: 'standard', rating: 4.2 },
        { name: 'APA Hotel Shinjuku', price: 1800, type: 'standard', rating: 3.9 },
        { name: 'Nine Hours Shinjuku', price: 1450, type: 'standard', rating: 4.1 }
      ]
    },
    {
      city: 'Singapore',
      hotels: [
        { name: 'Marina Bay Sands', price: 12000, type: 'deluxe', rating: 4.8 },
        { name: 'Raffles Singapore', price: 18000, type: 'suite', rating: 5.0 },
        { name: 'The Fullerton Hotel', price: 9500, type: 'superior', rating: 4.7 },
        { name: 'Capella Singapore', price: 15000, type: 'suite', rating: 4.9 },
        { name: 'Oasia Hotel Downtown', price: 5500, type: 'superior', rating: 4.4 },
        { name: 'Swiss├┤tel The Stamford', price: 6800, type: 'deluxe', rating: 4.5 },
        { name: 'Pan Pacific Singapore', price: 7200, type: 'superior', rating: 4.6 },
        { name: 'PARKROYAL COLLECTION', price: 6500, type: 'deluxe', rating: 4.5 },
        { name: 'Village Hotel Bugis', price: 3200, type: 'standard', rating: 4.0 },
        { name: 'Hotel Indigo Katong', price: 4500, type: 'standard', rating: 4.3 }
      ]
    },
    {
      city: 'London, UK',
      hotels: [
        { name: 'The Savoy', price: 18000, type: 'suite', rating: 4.9 },
        { name: 'The Ritz London', price: 21000, type: 'presidential', rating: 5.0 },
        { name: 'Claridge\'s', price: 19500, type: 'suite', rating: 4.9 },
        { name: 'Shangri-La The Shard', price: 15000, type: 'deluxe', rating: 4.8 },
        { name: 'The Dorchester', price: 16500, type: 'deluxe', rating: 4.8 },
        { name: 'The Langham', price: 12000, type: 'superior', rating: 4.7 },
        { name: 'Hilton London Park Lane', price: 8500, type: 'superior', rating: 4.4 },
        { name: 'Sea Containers London', price: 7500, type: 'standard', rating: 4.5 },
        { name: 'CitizenM Tower of London', price: 4200, type: 'standard', rating: 4.3 },
        { name: 'Premier Inn London City', price: 2800, type: 'standard', rating: 3.9 }
      ]
    },
    {
      city: 'Bangkok, Thailand',
      hotels: [
        { name: 'Mandarin Oriental', price: 14000, type: 'suite', rating: 5.0 },
        { name: 'Siam Kempinski', price: 11000, type: 'deluxe', rating: 4.9 },
        { name: 'Capella Bangkok', price: 15000, type: 'presidential', rating: 5.0 },
        { name: 'The Peninsula Bangkok', price: 9500, type: 'suite', rating: 4.8 },
        { name: 'Banyan Tree Bangkok', price: 6500, type: 'superior', rating: 4.7 },
        { name: 'Shangri-La Bangkok', price: 7200, type: 'deluxe', rating: 4.7 },
        { name: 'Centara Grand at CentralWorld', price: 5500, type: 'superior', rating: 4.5 },
        { name: 'Grande Centre Point Terminal 21', price: 4500, type: 'standard', rating: 4.4 },
        { name: 'Novotel Bangkok on Siam Square', price: 3200, type: 'standard', rating: 4.2 },
        { name: 'Ibis Bangkok Sukhumvit', price: 1500, type: 'standard', rating: 3.9 }
      ]
    },
  
  {
    city: 'Osaka',
    hotels: [
      { name: 'Swissôtel Nankai Osaka', rating: 5, price: 6500, type: "deluxe", img: 'https://images.unsplash.com/photo-1590559899731-a382839ce556?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa', 'Gym'] },
      { name: 'Hotel Granvia Osaka', rating: 4, price: 4200, type: "deluxe", img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Breakfast', 'Gym'] },
      { name: 'Dotonbori Hotel', rating: 3, price: 2800, type: "deluxe", img: 'https://images.unsplash.com/photo-1512806509653-f7d988cc6c9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Breakfast'] }
    ]
  },
  {
    city: 'Sapporo',
    hotels: [
      { name: 'Sapporo Grand Hotel', rating: 4, price: 4000, type: "deluxe", img: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Breakfast', 'Spa'] },
      { name: 'JR Tower Hotel Nikko Sapporo', rating: 5, price: 7000, type: "deluxe", img: 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa'] }
    ]
  },
  {
    city: 'Fukuoka',
    hotels: [
      { name: 'Grand Hyatt Fukuoka', rating: 5, price: 5500, type: "deluxe", img: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa', 'Gym'] },
      { name: 'Hotel Okura Fukuoka', rating: 4, price: 3800, type: "deluxe", img: 'https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Breakfast', 'Gym'] }
    ]
  },
  {
    city: 'Chiang Mai',
    hotels: [
      { name: 'Anantara Chiang Mai Resort', rating: 5, price: 8500, type: "deluxe", img: 'https://images.unsplash.com/photo-1551882547-ff40eb0d4732?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa'] },
      { name: 'U Chiang Mai', rating: 4, price: 4500, type: "deluxe", img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast'] },
      { name: 'The Inside House', rating: 5, price: 6000, type: "deluxe", img: 'https://images.unsplash.com/photo-1566073171615-356587c4af65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa'] }
    ]
  },
  {
    city: 'Phuket',
    hotels: [
      { name: 'The Shore at Katathani', rating: 5, price: 12000, type: "deluxe", img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Private Pool', 'Breakfast', 'Spa'] },
      { name: 'Sri Panwa Phuket', rating: 5, price: 15000, type: "deluxe", img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa', 'Gym'] },
      { name: 'Amari Phuket', rating: 4, price: 5500, type: "deluxe", img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast'] }
    ]
  },
  {
    city: 'Krabi',
    hotels: [
      { name: 'Rayavadee', rating: 5, price: 18000, type: "deluxe", img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa'] },
      { name: 'Centara Grand Beach Resort & Villas Krabi', rating: 5, price: 6500, type: "deluxe", img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Gym'] }
    ]
  },
  {
    city: 'Pattaya',
    hotels: [
      { name: 'Hilton Pattaya', rating: 5, price: 7000, type: "deluxe", img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa', 'Gym'] },
      { name: 'Centara Grand Mirage Beach Resort', rating: 5, price: 6500, type: "deluxe", img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Water Park', 'Breakfast', 'Spa'] }
    ]
  },
  {
    city: 'Palma de Mallorca',
    hotels: [
      { name: 'Hotel Victoria Gran Meliá', rating: 5, price: 9000, type: "deluxe", img: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa'] },
      { name: 'Nixe Palace Hotel', rating: 5, price: 8500, type: "deluxe", img: 'https://images.unsplash.com/photo-1618773928120-22c60814d4ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa'] }
    ]
  },
];

  hotelTemplates.forEach(t => {
    t.hotels.forEach((h) => {
      const amenities = h.rating >= 4.7 ? ['WiFi', 'Breakfast', 'Spa', 'Pool', 'Lounge'] : (h.rating >= 4.3 ? ['WiFi', 'Breakfast', 'Pool'] : ['WiFi', 'Breakfast']);
      hotelRooms.push(new HotelRoom(
        h.name, h.type as any,
        new Date('2026-09-01'), new Date('2026-09-02'), // 1 Night duration standard
        h.price, t.city, h.rating,
        amenities, getHotelImage(hotelIdCounter), `gen-hotel-${hotelIdCounter++}`
      ));
    });
  });

  // Generate Flights for 30 days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toISOString().split('T')[0];

    ROUTES.forEach(r => {
      r.airlines.forEach((al, idx) => {
        // Morning Flight (BKK -> Dest)
        const dep1 = new Date(`${dayStr}T08:00:00Z`);
        const arr1 = new Date(dep1.getTime() + r.dur * 60 * 60 * 1000);
        flights.push(new Flight(`${al.code}-${100 + idx}`, al.name, 'BKK', r.dest, dep1, arr1, r.price, 'economy', `gen-flight-${flightIdCounter++}`));

        // Return Flight (Dest -> BKK)
        const dep2 = new Date(`${dayStr}T15:00:00Z`);
        const arr2 = new Date(dep2.getTime() + r.dur * 60 * 60 * 1000);
        flights.push(new Flight(`${al.code}-${200 + idx}`, al.name, r.dest, 'BKK', dep2, arr2, r.price, 'economy', `gen-flight-${flightIdCounter++}`));

        // Night Flight (BKK -> Dest) only for first airline
        if (idx === 0) {
          const dep3 = new Date(`${dayStr}T23:00:00Z`);
          const arr3 = new Date(dep3.getTime() + r.dur * 60 * 60 * 1000);
          flights.push(new Flight(`${al.code}-${300}`, al.name, 'BKK', r.dest, dep3, arr3, r.price * 0.9, 'economy', `gen-flight-${flightIdCounter++}`));
        }
      });
    });

    DIRECT_INTL_ROUTES.forEach(r => {
      r.airlines.forEach((al: any, idx: number) => {
        // Outbound
        const dep1 = new Date(`${dayStr}T10:00:00Z`);
        const arr1 = new Date(dep1.getTime() + r.dur * 60 * 60 * 1000);
        flights.push(new Flight(`${al.code}-${400 + idx}`, al.name, r.origin, r.dest, dep1, arr1, r.price, 'economy', `gen-flight-${flightIdCounter++}`));
        // Return
        const dep2 = new Date(`${dayStr}T18:00:00Z`);
        const arr2 = new Date(dep2.getTime() + r.dur * 60 * 60 * 1000);
        flights.push(new Flight(`${al.code}-${500 + idx}`, al.name, r.dest, r.origin, dep2, arr2, r.price, 'economy', `gen-flight-${flightIdCounter++}`));
      });
    });
  }
}

generateExtendedData();
