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
