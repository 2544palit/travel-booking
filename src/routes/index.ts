import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { BookingService } from '../services/BookingService';
import { PaymentService } from '../services/PaymentService';
import { flights, hotelRooms, promoCodes, reviews, findPromoByCode, activities } from '../data/seedData';
import { Review } from '../models/Review';
import { BookingItemFactory } from '../patterns/BookingItemFactory';

const router = Router();

// ===== Auth Routes =====
router.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const result = await AuthService.register(name, email, password, phone);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/api/auth/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    
    const user = await AuthService.getMe(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

// ===== Locations API (aa+a+a+a+a+ 2 & 4: a+a+a+aa+a++a+a+a+a+a+a+aa+a+a+a+a+a+a+a+ + Cascading) =====
const CITY_DB = [
  { code: 'BKK', name: 'Bangkok', keywords: ['bangkok', 'bkk', 'กรุงเทพ'] },
  { code: 'NRT', name: 'Tokyo', keywords: ['tokyo', 'nrt', 'japan', 'โตเกียว', 'ญี่ปุ่น'] },
  { code: 'SIN', name: 'Singapore', keywords: ['singapore', 'sin', 'สิงคโปร์'] },
  { code: 'LHR', name: 'London', keywords: ['london', 'lhr', 'united kingdom', 'ลอนดอน', 'อังกฤษ'] },
  { code: 'ICN', name: 'Seoul', keywords: ['seoul', 'icn', 'korea', 'โซล', 'เกาหลี'] },
  { code: 'CDG', name: 'Paris', keywords: ['paris', 'cdg', 'france', 'ปารีส', 'ฝรั่งเศส'] },
  { code: 'SYD', name: 'Sydney', keywords: ['sydney', 'syd', 'australia', 'ซิดนีย์'] },
  { code: 'DEL', name: 'New Delhi', keywords: ['new delhi', 'delhi', 'del', 'india', 'นิวเดลี', 'อินเดีย'] },
  { code: 'CNX', name: 'Chiang Mai', keywords: ['chiang mai', 'cnx', 'เชียงใหม่'] },
  { code: 'HKT', name: 'Phuket', keywords: ['phuket', 'hkt', 'ภูเก็ต'] },
  { code: 'KBV', name: 'Krabi', keywords: ['krabi', 'kbv', 'กระบี่'] },
  { code: 'PYX', name: 'Pattaya', keywords: ['pattaya', 'pyx', 'พัทยา'] },
  { code: 'KIX', name: 'Osaka', keywords: ['osaka', 'kix', 'โอซาก้า'] },
  { code: 'CTS', name: 'Sapporo', keywords: ['sapporo', 'cts', 'ซัปโปโร'] },
  { code: 'FUK', name: 'Fukuoka', keywords: ['fukuoka', 'fuk', 'ฟุกุโอกะ'] },
  { code: 'PMI', name: 'Palma de Mallorca', keywords: ['palma', 'mallorca', 'pmi', 'spain', 'สเปน', 'ปัลมา'] }
];

router.get('/api/locations', (req, res) => {
  const { origin } = req.query;

  const getCityDisplayName = (codeOrName: string): string => {
    const lower = codeOrName.toLowerCase();
    const match = CITY_DB.find(city => city.keywords.some(kw => lower.includes(kw)));
    if (match) return `${match.name} (${match.code})`;
    return codeOrName; 
  };

  const searchOrigin = origin ? (origin as string).toLowerCase() : '';
  const matchLoc = (dbLoc: string) => {
    if (!searchOrigin) return true;
    return getCityDisplayName(dbLoc).toLowerCase().includes(searchOrigin) || dbLoc.toLowerCase().includes(searchOrigin);
  };

  // a+a+a+a+a++aa+aa+a++a+a+a+aa+a+a+a+aa+a+aa+aa+aa+a+a+a+ (unique origins) a+Pa+aa+a+ format a+a+a+a+a+a+
  const origins = [...new Set(flights.filter(f => f.available).map(f => getCityDisplayName(f.origin)))].sort();

  // a+a+a+a+aa+a+a+a+a+a+a+a+a+a+a+a+a+a+ flights (a+a+a+a+a+a+ Connecting Flights a+aa+a+ Hub BKK) 
  // a+a+aa+aa+a+a+a+a+a+a+a+a+a+a+a+a+a+aaa+a+aa+a+a+aaa+a+a+aaa+a
  let flightDests: string[];
  if (origin) {
    flightDests = [...new Set(flights.filter(f => f.available).map(f => f.destination))]
      .filter(d => getCityDisplayName(d).toLowerCase() !== searchOrigin)
      .sort();
  } else {
    flightDests = [...new Set(flights.filter(f => f.available).map(f => f.destination))].sort();
  }

  // a+a+a+a+aa+a+a+a+aa+a+aa+a+/location a+a+a+a+aa+a+a+Pa+a+ (cascade: a+a+a+ origin a+a+aaa+a++a+a+ -> match a+a+a+ dest a+a+a+ flights)
  let hotelLocations: string[];
  if (origin) {
    hotelLocations = [...new Set(
      hotelRooms.filter(h => h.available && flightDests.some(d => {
        const dLower = d.toLowerCase();
        const mappedCity = CITY_DB.find(c => c.code.toLowerCase() === dLower)?.name.toLowerCase() || dLower;
        const hLocLower = h.location.toLowerCase();
        return hLocLower.includes(dLower) || 
               dLower.includes(hLocLower.split(',')[0].trim()) ||
               hLocLower.includes(mappedCity);
      })).map(h => h.location)
    )].sort();
    
    // a+aa+aa+aa+a+aa+a+aa+a+a+a+a+a+a+a+aa+a+aa+a+a+a+a+aa+a+ aa+aa+a++a+a+aa+a+a+aa+a+a+a+
    if (hotelLocations.length === 0) {
      hotelLocations = [...new Set(hotelRooms.filter(h => h.available).map(h => h.location))].sort();
    }
  } else {
    hotelLocations = [...new Set(hotelRooms.filter(h => h.available).map(h => h.location))].sort();
  }

  // a+a+a+ destinations a+a+aa+a+a+a+ aa+a+ map aa+aa+a+a+aaa+a+a+a+aa+a+aa+a+a+a+a+a+a+aa+Pa++aa+a+aa+a+a+a+a+a+aa+a+a+a+a+aa+a+aa+a+
  const rawAllDestinations = [...flightDests, ...hotelLocations];
  const allDestinations = [...new Set(rawAllDestinations.map(d => getCityDisplayName(d)))].sort();

  res.json({
    success: true,
    data: {
      origins,
      destinations: allDestinations,
      flightDestinations: [...new Set(flightDests.map(d => getCityDisplayName(d)))].sort(),
      hotelLocations: [...new Set(hotelLocations.map(d => getCityDisplayName(d)))].sort(),
    }
  });
});

// ===== Search Routes (aa+a+a+a+a+ 3: aa+Pa+aa+ Date filtering) =====
router.get('/api/search', (req, res, next) => {
  try {
    const { type, dest, origin, seatType, roomType, dateFrom, dateTo } = req.query;
    const results: any = {};

    // Normalize location inputs (e.g., 'New Delhi (DEL)' -> 'DEL' or match against CITY_DB)
    const normalizeLoc = (val: any) => {
      if (!val) return '';
      const str = (val as string).toLowerCase();
      const matchCode = str.match(/\(([a-z]{3})\)/);
      if (matchCode) return matchCode[1];
      const city = CITY_DB.find(c => c.keywords.some(kw => str.includes(kw)));
      if (city) return city.code.toLowerCase();
      return str;
    };

    const normOrigin = normalizeLoc(origin);
    const normDest = normalizeLoc(dest);

    if (type === 'flight' || type === 'all' || !type) {
      let baseFlights = flights.filter(f => f.available);
      if (seatType) baseFlights = baseFlights.filter(f => f.seatType === seatType);
      if (dateFrom) {
        const from = new Date(dateFrom as string);
        baseFlights = baseFlights.filter(f => f.departureTime >= from);
      }
      if (dateTo) {
        const to = new Date(dateTo as string);
        to.setHours(23, 59, 59, 999);
        baseFlights = baseFlights.filter(f => f.departureTime <= to);
      }

      let finalFlights: any[] = [];

      // 1. Direct Flights
      let directFlights = [...baseFlights];
      if (normOrigin) directFlights = directFlights.filter(f => f.origin.toLowerCase().includes(normOrigin));
      if (normDest) directFlights = directFlights.filter(f => f.destination.toLowerCase().includes(normDest));
      finalFlights.push(...directFlights.map(f => f.toJSON()));

      // 2. Connecting Flights (via BKK Hub)
      if (normOrigin && normDest) {
        const originStr = normOrigin.toUpperCase();
        const destStr = normDest.toUpperCase();
        
        // leg1 must be on the selected date (baseFlights)
        const leg1 = baseFlights.filter(f => f.origin.toUpperCase().includes(originStr) && f.destination === 'BKK');
        // leg2 can be on the next day, so we search the full `flights` array (only filtering seatType)
        let leg2Pool = flights.filter(f => f.available && f.origin === 'BKK' && f.destination.toUpperCase().includes(destStr));
        if (seatType) leg2Pool = leg2Pool.filter(f => f.seatType === seatType);
        
        // OPTIMIZATION: Pre-serialize JSON to avoid recalculating N*M times in the double loop
        const leg1Parsed = leg1.map(f => ({ obj: f, json: f.toJSON() as any }));
        const leg2Parsed = leg2Pool.map(f => ({ obj: f, json: f.toJSON() as any }));

        leg1Parsed.forEach(f1 => {
          leg2Parsed.forEach(f2 => {
            const layoverMs = f2.obj.departureTime.getTime() - f1.obj.arrivalTime.getTime();
            const layoverHours = layoverMs / (1000 * 60 * 60);
            
            // Valid layover: 0.5 to 24 hours
            if (layoverHours >= 0.5 && layoverHours <= 24) {
              const f1Json = f1.json;
              const f2Json = f2.json;
              
              finalFlights.push({
                itemId: `${f1.obj.itemId}_${f2.obj.itemId}`,
                type: 'flight',
                basePrice: f1.obj.basePrice + f2.obj.basePrice,
                totalPrice: Math.floor((f1Json.totalPrice + f2Json.totalPrice) * 0.85), // 15% discount for connecting
                tax: f1Json.tax + f2Json.tax,
                available: true,
                details: {
                  isConnecting: true,
                  segments: [f1Json, f2Json],
                  airline: f1.obj.airline === f2.obj.airline ? f1.obj.airline : `${f1.obj.airline} / ${f2.obj.airline}`,
                  origin: f1.obj.origin,
                  destination: f2.obj.destination,
                  departureTime: f1.obj.departureTime.toISOString(),
                  arrivalTime: f2.obj.arrivalTime.toISOString(),
                  flightNo: `${f1.obj.flightNo} + ${f2.obj.flightNo}`,
                  seatType: f1.obj.seatType,
                  duration: `${Math.floor((f2.obj.arrivalTime.getTime() - f1.obj.departureTime.getTime()) / 3600000)}h ${Math.floor(((f2.obj.arrivalTime.getTime() - f1.obj.departureTime.getTime()) % 3600000) / 60000)}m`,
                  layoverHours: layoverHours.toFixed(1)
                }
              });
            }
          });
        });
      }

      results.flights = finalFlights;
    }

    if (type === 'hotel' || type === 'all' || !type) {
      let filteredHotels = hotelRooms.filter(h => h.available);
      if (normDest) {
        const mappedCity = CITY_DB.find(c => c.code.toLowerCase() === normDest)?.name.toLowerCase() || normDest;
        filteredHotels = filteredHotels.filter(h =>
          h.location.toLowerCase().includes(normDest) || h.location.toLowerCase().includes(mappedCity)
        );
      }
      if (roomType) filteredHotels = filteredHotels.filter(h => h.roomType === roomType);
      // a+a+a+a+aa+a+ Date filtering (aa+a+a+a+a+ B): aa+a+aa+a+a+a++a+a+aa+a+a+a+aa+a+a+aa+a+a+a+a+a+a+a+aa+a+a+ 
      // aa+Pa++aa+aa+aa+aa+a+a+aa+a+aa+a+a+ aa+a+aa+a User aa+aa+a++a+a+a+a+a+aa+aa+a+Pa+a+a+a+a+a+aa+a+aa+a+a+a+a+
      /*
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom as string);
        const to = new Date(dateTo as string);
        filteredHotels = filteredHotels.filter(h => h.checkIn <= to && h.checkOut >= from);
      }
      */
      results.hotels = filteredHotels.map(h => h.toJSON());
    }

    // ===== Package Deals (aa+a+aa+a+a+a+a++a+a+aa+Pa+a+ a+a+ 15%) =====
    
    // ===== Activities =====
    if (type === 'activity' || type === 'all') {
      let filteredActs = activities;
      if (normDest) {
        const mappedCode = CITY_DB.find(c => c.code.toLowerCase() === normDest)?.code.toUpperCase() || normDest.toUpperCase();
        filteredActs = filteredActs.filter(a => a.destinationCode.toUpperCase() === mappedCode || a.destinationCode.toLowerCase().includes(normDest));
      }
      results.activities = filteredActs.map(a => a.toJSON());
    }
if (type === 'all' || type === 'package') {
      const PACKAGE_DISCOUNT = 0.15;
      
      // Get hotels based on destination filter (if any)
      let pkgHotels = hotelRooms.filter(h => h.available);
      if (normDest) {
        const mappedCity = CITY_DB.find(c => c.code.toLowerCase() === normDest)?.name.toLowerCase() || normDest;
        pkgHotels = pkgHotels.filter(h =>
          h.location.toLowerCase().includes(normDest) || h.location.toLowerCase().includes(mappedCity)
        );
      }

      const packages: any[] = [];
      let pkgIndexCounter = 0;

      pkgHotels.forEach(hotel => {
        // Find destination code specifically for this hotel
        const hLocLower = hotel.location.toLowerCase();
        let destCode = normDest ? normDest.toUpperCase() : null;
        if (!destCode) {
           const cityMatch = CITY_DB.find(c => hLocLower.includes(c.name.toLowerCase()) || hLocLower.includes(c.code.toLowerCase()));
           if (cityMatch) destCode = cityMatch.code.toUpperCase();
        }

        if (destCode) {
          // Helper to find route options (direct or connecting via BKK)
          const findRouteOptions = (orig: string, dst: string, targetDate: string | null) => {
            let baseF = flights.filter(f => f.available);
            if (targetDate) {
              const start = new Date(targetDate);
              const end = new Date(targetDate);
              end.setHours(23, 59, 59, 999);
              baseF = baseF.filter(f => f.departureTime >= start && f.departureTime <= end);
            }
            
            let options: any[] = [];
            
            // 1. Direct Flights
            const direct = baseF.filter(f => f.origin.toUpperCase() === orig.toUpperCase() && f.destination.toUpperCase() === dst.toUpperCase());
            options.push(...direct.map(f => ({
                isConnecting: false,
                itemId: f.itemId,
                flightNo: f.flightNo,
                airline: f.airline,
                origin: f.origin,
                destination: f.destination,
                departureTime: f.departureTime,
                arrivalTime: f.arrivalTime,
                totalPrice: (f.toJSON() as any).totalPrice
            })));
            
            // 2. Connecting Flights (via BKK Hub)
            if (orig.toUpperCase() !== 'BKK' && dst.toUpperCase() !== 'BKK') {
              const leg1 = baseF.filter(f => f.origin.toUpperCase() === orig.toUpperCase() && f.destination === 'BKK');
              const leg2Pool = flights.filter(f => f.available && f.origin === 'BKK' && f.destination.toUpperCase() === dst.toUpperCase());
              
              leg1.forEach(f1 => {
                leg2Pool.forEach(f2 => {
                  const layoverHours = (f2.departureTime.getTime() - f1.arrivalTime.getTime()) / (1000 * 60 * 60);
                  if (layoverHours >= 0.5 && layoverHours <= 24) {
                    options.push({
                      isConnecting: true,
                      itemId: `${f1.itemId}_${f2.itemId}`,
                      flightNo: `${f1.flightNo} + ${f2.flightNo}`,
                      airline: f1.airline === f2.airline ? f1.airline : `${f1.airline} / ${f2.airline}`,
                      origin: f1.origin,
                      destination: f2.destination,
                      departureTime: f1.departureTime,
                      arrivalTime: f2.arrivalTime,
                      totalPrice: Math.floor(((f1.toJSON() as any).totalPrice + (f2.toJSON() as any).totalPrice) * 0.85) // 15% discount for connecting
                    });
                  }
                });
              });
            }
            
            return options.sort((a, b) => a.totalPrice - b.totalPrice);
          };

          const outboundOptions = findRouteOptions(normOrigin || 'BKK', destCode, dateFrom as string);
          const returnOptions = findRouteOptions(destCode, normOrigin || 'BKK', dateTo as string);
          
          if (outboundOptions.length > 0) {
            // Pick a different option for each hotel to diversify airlines!
            const cheapestOutbound = outboundOptions[pkgIndexCounter % outboundOptions.length];
            const cheapestReturn = returnOptions.length > 0 ? returnOptions[pkgIndexCounter % returnOptions.length] : null;
            pkgIndexCounter++;
            const flightBundlePrice = cheapestOutbound.totalPrice + (cheapestReturn ? cheapestReturn.totalPrice : 0);
            
            const hotelJson = hotel.toJSON() as any;
            const hotelPricePerNight = hotelJson.pricePerNight || hotelJson.totalPrice;
            let defaultNights = 3;
            if (dateFrom && dateTo) {
               const diff = Math.ceil((new Date(dateTo as string).getTime() - new Date(dateFrom as string).getTime()) / (1000*60*60*24));
               if (diff > 0) defaultNights = diff;
            }
            const hotelTotalPrice = hotelPricePerNight * defaultNights;
            const originalTotal = flightBundlePrice + hotelTotalPrice;
            const discountAmount = Math.floor(originalTotal * PACKAGE_DISCOUNT);
            const packagePrice = originalTotal - discountAmount;

            packages.push({
              itemId: `pkg_${cheapestOutbound.itemId}_${cheapestReturn?.itemId || 'none'}_${hotel.itemId}`,
              type: 'package',
              originalPrice: originalTotal,
              totalPrice: packagePrice,
              discountPercent: Math.round(PACKAGE_DISCOUNT * 100),
              discountAmount: discountAmount,
              defaultNights: defaultNights,
              details: {
                hotel: {
                  hotelName: hotelJson.details.hotelName,
                  location: hotelJson.details.location,
                  roomType: hotelJson.details.roomType,
                  rating: hotelJson.details.rating,
                  amenities: hotelJson.details.amenities,
                  imageUrl: hotelJson.details.imageUrl,
                  pricePerNight: hotelPricePerNight,
                  hotelItemId: hotel.itemId
                },
                outbound: {
                  flightNo: cheapestOutbound.flightNo,
                  airline: cheapestOutbound.airline,
                  origin: cheapestOutbound.origin,
                  destination: cheapestOutbound.destination,
                  departureTime: cheapestOutbound.departureTime.toISOString ? cheapestOutbound.departureTime.toISOString() : new Date(cheapestOutbound.departureTime).toISOString(),
                  arrivalTime: cheapestOutbound.arrivalTime.toISOString ? cheapestOutbound.arrivalTime.toISOString() : new Date(cheapestOutbound.arrivalTime).toISOString(),
                  price: cheapestOutbound.totalPrice,
                  flightItemId: cheapestOutbound.itemId,
                  isConnecting: cheapestOutbound.isConnecting
                },
                returnFlight: cheapestReturn ? {
                  flightNo: cheapestReturn.flightNo,
                  airline: cheapestReturn.airline,
                  origin: cheapestReturn.origin,
                  destination: cheapestReturn.destination,
                  departureTime: cheapestReturn.departureTime.toISOString ? cheapestReturn.departureTime.toISOString() : new Date(cheapestReturn.departureTime).toISOString(),
                  arrivalTime: cheapestReturn.arrivalTime.toISOString ? cheapestReturn.arrivalTime.toISOString() : new Date(cheapestReturn.arrivalTime).toISOString(),
                  price: cheapestReturn.totalPrice,
                  flightItemId: cheapestReturn.itemId,
                  isConnecting: cheapestReturn.isConnecting
                } : null
              }
            });
          }
        }
      });

      packages.sort((a, b) => a.totalPrice - b.totalPrice);
      results.packages = packages;
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Helper to convert frontend itemData into payload for BookingItemFactory
function parseItemToPayload(itemData: any, flightsArr: any[], hotelsArr: any[]): any {
  if (itemData.itemType === 'hotel' && itemData.details && itemData.details.checkInDate) {
    const baseItem = hotelsArr.find(h => h.itemId === itemData.itemId);
    if (baseItem) {
      const isPkg = itemData.details.isPackage;
      let overrideBasePrice = baseItem.basePrice;
      if (isPkg && itemData.unitPrice) {
         overrideBasePrice = itemData.unitPrice / 1.177 / (itemData.details.nights || 1); 
      } else if (isPkg) {
         overrideBasePrice = Math.round(baseItem.basePrice * 0.85);
      }
      return {
         type: 'hotel', hotelName: baseItem.hotelName, roomType: baseItem.roomType,
         checkIn: itemData.details.checkInDate, checkOut: itemData.details.checkOutDate,
         pricePerNight: overrideBasePrice, location: baseItem.location, rating: baseItem.rating,
         amenities: baseItem.amenities, imageUrl: baseItem.imageUrl, itemId: itemData.itemId + '_' + Date.now()
      };
    }
  } else if (itemData.itemType === 'flight' && itemData.itemId && itemData.itemId.includes('_')) {
    const [leg1Id, leg2Id] = itemData.itemId.split('_');
    const leg1 = flightsArr.find(f => f.itemId === leg1Id);
    const leg2 = flightsArr.find(f => f.itemId === leg2Id);
    if (leg1 && leg2) {
      let overrideBasePrice = Math.round((leg1.basePrice + leg2.basePrice) * 0.85);
      if (itemData.details?.isPackage && itemData.unitPrice) {
         overrideBasePrice = itemData.unitPrice / 1.10;
      }
      return {
         type: 'flight', flightNo: itemData.details?.flightNo || `${leg1.flightNo} + ${leg2.flightNo}`,
         airline: itemData.details?.airline || `${leg1.airline} / ${leg2.airline}`,
         origin: leg1.origin, destination: leg2.destination,
         departureTime: leg1.departureTime.toISOString(), arrivalTime: leg2.arrivalTime.toISOString(),
         basePrice: overrideBasePrice, seatType: leg1.seatType, itemId: itemData.itemId + '_' + Date.now()
      };
    }
  } else if (itemData.itemType === 'flight' && itemData.itemId && itemData.details?.isPackage) {
    const baseFlight = flightsArr.find(f => f.itemId === itemData.itemId);
    if (baseFlight) {
      let overrideBasePrice = Math.round(baseFlight.basePrice * 0.85);
      if (itemData.unitPrice) {
         overrideBasePrice = itemData.unitPrice / 1.10;
      }
      return {
         type: 'flight', flightNo: baseFlight.flightNo, airline: baseFlight.airline,
         origin: baseFlight.origin, destination: baseFlight.destination,
         departureTime: baseFlight.departureTime.toISOString(), arrivalTime: baseFlight.arrivalTime.toISOString(),
         basePrice: overrideBasePrice, seatType: baseFlight.seatType, itemId: itemData.itemId + '_' + Date.now()
      };
    }
  }
  return null;
}

router.post('/api/bookings', async (req, res, next) => {
  try {
    const { travelerId, travelerEmail, items, promoCode } = req.body;
    let booking = await BookingService.createBooking(travelerId, travelerEmail);
    
    // Batch process items
    if (items && Array.isArray(items) && items.length > 0) {
      const rawItems = booking.items;
      for (const itemData of items) {
        // Expand item if quantity > 1
        const qty = itemData.quantity || 1;
        for (let i = 0; i < qty; i++) {
          const payload = parseItemToPayload(itemData, flights, hotelRooms);
          if (payload) {
            const item = BookingItemFactory.createItem(payload);
            rawItems.push(item as any);
          } else if (itemData.itemId) {
            let existingItem;
            if (itemData.itemType === 'flight') existingItem = flights.find(f => f.itemId === itemData.itemId);
            else if (itemData.itemType === 'hotel') existingItem = hotelRooms.find(h => h.itemId === itemData.itemId);
            if (existingItem) rawItems.push(existingItem as any);
            else if (itemData.type) {
               // Fallback if it's already a direct payload
               const item = BookingItemFactory.createItem(itemData);
               rawItems.push(item as any);
            }
          }
        }
      }
      booking.loadRawData(0, rawItems);
      booking.recalculateTotal();
    }
    
    if (promoCode) {
      const promo = findPromoByCode(promoCode);
      if (promo) {
        // Calculate discount based on subtotal (before tax) to match frontend logic
        const disc = promo.applyDiscount(booking.getSubtotal());
        booking.applyDiscount(disc, promoCode);
      }
    }
    
    if ((items && items.length > 0) || promoCode) {
      await BookingService.updateBookingInDb(booking); // ONLY ONE CLOUD UPDATE CALL!
    }
    
    res.status(201).json({ success: true, data: booking.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.get('/api/bookings', async (req, res, next) => {
  try {
    const { travelerId } = req.query;
    if (!travelerId) {
      res.json({ success: true, data: [] });
      return;
    }
    const userBookings = await BookingService.getBookingsByTraveler(travelerId as string);
    res.json({ success: true, data: userBookings });
  } catch (error) {
    next(error);
  }
});

router.get('/api/bookings/:id', async (req, res, next) => {
  try {
    const booking = await BookingService.getBooking(req.params.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

router.post('/api/bookings/:id/items', async (req, res, next) => {
  try {
    const itemData = req.body;
    // Check if it's a hotel with dynamic dates from the frontend
    if (itemData.itemType === 'hotel' && itemData.details && itemData.details.checkInDate) {
      const baseItem = hotelRooms.find(h => h.itemId === itemData.itemId);
      if (baseItem) {
        const isPkg = itemData.details.isPackage;
        // Accept frontend's adjusted price to prevent 1-baht rounding discrepancy
        let overrideBasePrice = baseItem.basePrice;
        if (isPkg && itemData.unitPrice) {
           overrideBasePrice = itemData.unitPrice / 1.177 / (itemData.details.nights || 1); 
           // 1.177 is the tax multiplier for hotel. Reverse it to get basePrice.
        } else if (isPkg) {
           overrideBasePrice = Math.round(baseItem.basePrice * 0.85);
        }

        const payload: any = {
           type: 'hotel',
           hotelName: baseItem.hotelName,
           roomType: baseItem.roomType,
           checkIn: itemData.details.checkInDate,
           checkOut: itemData.details.checkOutDate,
           pricePerNight: overrideBasePrice,
           location: baseItem.location,
           rating: baseItem.rating,
           amenities: baseItem.amenities,
           imageUrl: baseItem.imageUrl,
           itemId: itemData.itemId + '_' + Date.now()
        };
        await BookingService.addItemToBooking(req.params.id, payload);
      } else {
        await BookingService.addExistingItemToBooking(req.params.id, itemData.itemId, itemData.itemType);
      }
    }
    // Check if it's a connecting flight (composite ID)
    else if (itemData.itemType === 'flight' && itemData.itemId && itemData.itemId.includes('_')) {
      const [leg1Id, leg2Id] = itemData.itemId.split('_');
      const leg1 = flights.find(f => f.itemId === leg1Id);
      const leg2 = flights.find(f => f.itemId === leg2Id);
      
      if (leg1 && leg2) {
        let overrideBasePrice = Math.round((leg1.basePrice + leg2.basePrice) * 0.85);
        if (itemData.details?.isPackage && itemData.unitPrice) {
           overrideBasePrice = itemData.unitPrice / 1.10; // Reverse tax to get basePrice
        }

        const payload: any = {
           type: 'flight',
           flightNo: itemData.details?.flightNo || `${leg1.flightNo} + ${leg2.flightNo}`,
           airline: itemData.details?.airline || `${leg1.airline} / ${leg2.airline}`,
           origin: leg1.origin,
           destination: leg2.destination,
           departureTime: leg1.departureTime.toISOString(),
           arrivalTime: leg2.arrivalTime.toISOString(),
           basePrice: overrideBasePrice,
           seatType: leg1.seatType,
           itemId: itemData.itemId + '_' + Date.now()
        };
        await BookingService.addItemToBooking(req.params.id, payload);
      } else {
        await BookingService.addExistingItemToBooking(req.params.id, itemData.itemId, itemData.itemType);
      }
    }
    // Check if it's a single package flight (needs 15% discount)
    else if (itemData.itemType === 'flight' && itemData.itemId && itemData.details?.isPackage) {
      const baseFlight = flights.find(f => f.itemId === itemData.itemId);
      if (baseFlight) {
        let overrideBasePrice = Math.round(baseFlight.basePrice * 0.85);
        if (itemData.unitPrice) {
           overrideBasePrice = itemData.unitPrice / 1.10; // Reverse tax to get basePrice
        }

        const payload: any = {
           type: 'flight',
           flightNo: baseFlight.flightNo,
           airline: baseFlight.airline,
           origin: baseFlight.origin,
           destination: baseFlight.destination,
           departureTime: baseFlight.departureTime.toISOString(),
           arrivalTime: baseFlight.arrivalTime.toISOString(),
           basePrice: overrideBasePrice,
           seatType: baseFlight.seatType,
           itemId: itemData.itemId + '_' + Date.now()
        };
        await BookingService.addItemToBooking(req.params.id, payload);
      } else {
        await BookingService.addExistingItemToBooking(req.params.id, itemData.itemId, itemData.itemType);
      }
    }
    // Support adding existing items by ID or creating new via Factory
    else if (itemData.itemId && itemData.itemType) {
      await BookingService.addExistingItemToBooking(req.params.id, itemData.itemId, itemData.itemType);
    } else {
      await BookingService.addItemToBooking(req.params.id, itemData);
    }
   
    const booking = await BookingService.getBooking(req.params.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

router.post('/api/bookings/:id/promo', async (req, res, next) => {
  try {
    const { code } = req.body;
    await BookingService.applyPromoCode(req.params.id, code);
    const booking = await BookingService.getBooking(req.params.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

router.post('/api/bookings/:id/pay', async (req, res, next) => {
  try {
    const { method, usePoints, travelerId, ...details } = req.body;
    // Process payment and also handle LitPoints deduction
    const result = await PaymentService.processPayment(req.params.id, method, details, usePoints, travelerId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.put('/api/bookings/:id/cancel', async (req, res, next) => {
  try {
    const booking = await BookingService.cancelBooking(req.params.id);
    res.json({ success: true, data: booking.toJSON(), message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
});

// ===== Review Routes =====
router.post('/api/reviews', (req, res, next) => {
  try {
    const { travelerId, itemId, itemType, rating, comment } = req.body;
    const review = new Review(travelerId, itemId, itemType, rating, comment);
    reviews.push(review);
    res.status(201).json({ success: true, data: review.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.get('/api/reviews', (req, res, next) => {
  try {
    const { itemId } = req.query;
    let filteredReviews = reviews;
    if (itemId) {
      filteredReviews = filteredReviews.filter(r => r.itemId === itemId);
    }
    res.json({ success: true, data: filteredReviews.map(r => r.toJSON()) });
  } catch (error) {
    next(error);
  }
});

// ===== Data Routes =====
router.get('/api/flights', (_req, res) => {
  res.json({ success: true, data: flights.map(f => f.toJSON()) });
});

router.get('/api/hotels', (_req, res) => {
  res.json({ success: true, data: hotelRooms.map(h => h.toJSON()) });
});

router.get('/api/promos', (_req, res) => {
  res.json({ success: true, data: promoCodes.map(p => p.toJSON()) });
});

export default router;

