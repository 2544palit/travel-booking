import { Flight } from '../src/models/Flight';
import { HotelRoom } from '../src/models/HotelRoom';
import { Booking } from '../src/models/Booking';
import { BookingEventManager, NotificationObserver, LoyaltyPointObserver } from '../src/patterns/BookingObserver';
import { PendingState, ConfirmedState, CancelledState } from '../src/patterns/IBookingState';
import { BookingItemFactory } from '../src/patterns/BookingItemFactory';
import { BookingStateException } from '../src/exceptions/DomainException';

describe('Booking System Tests', () => {
  let eventManager: BookingEventManager;
  let booking: Booking;
  let flight: Flight;
  let hotel: HotelRoom;

  beforeEach(() => {
    eventManager = new BookingEventManager();
    eventManager.subscribe(new NotificationObserver());

    booking = new Booking('traveler-1', 'test@example.com', eventManager);

    flight = new Flight(
      'SK-100',
      'SkyWings',
      'BKK',
      'NRT',
      new Date('2025-11-14T08:00:00Z'),
      new Date('2025-11-14T14:45:00Z'),
      12000,  // 12,000 THB
      'economy'
    );

    hotel = new HotelRoom(
      'Grand Palace Hotel',
      'deluxe',
      new Date('2025-11-14'),
      new Date('2025-11-17'),
      3500,  // 3,500 THB/night
      'Tokyo, Japan',
      4.8,
      ['WiFi', 'Breakfast', 'Pool']
    );
  });

  // ===== Polymorphism Tests =====
  describe('Polymorphism: calculatePrice()', () => {
    test('Flight calculates price with airport tax + fuel surcharge (10%)', () => {
      const price = flight.calculatePrice();
      // Base: 12000 * 1.0 (economy) = 12000
      // Tax: 12000 * 0.10 = 1200
      // Total: 12000 + 1200 = 13200
      expect(price).toBe(13200);
    });

    test('Flight business class applies multiplier correctly', () => {
      const businessFlight = new Flight(
        'SK-200', 'SkyWings', 'BKK', 'LHR',
        new Date('2025-11-14T08:00:00Z'),
        new Date('2025-11-14T20:30:00Z'),
        25000, 'business'
      );
      const price = businessFlight.calculatePrice();
      // Base: 25000 * 2.8 = 70000
      // Tax: 70000 * 0.10 = 7000
      // Total: 70000 + 7000 = 77000
      expect(price).toBe(77000);
    });

    test('HotelRoom calculates price with nights × multiplier + taxes', () => {
      const price = hotel.calculatePrice();
      // Base: 3500 * 3 nights * 1.8 (deluxe) = 18900
      // Service charge: 18900 * 0.10 = 1890
      // VAT: (18900 + 1890) * 0.07 = 1455.3
      // Tax total: 1890 + 1455.3 = 3345.3
      // Total: 18900 + 3345.3 = 22245.3
      expect(price).toBe(22245.3);
    });

    test('Booking.calculateTotal() sums Flight and HotelRoom correctly (Polymorphism)', () => {
      booking.addItem(flight);
      booking.addItem(hotel);

      const total = booking.totalPrice;
      const expectedTotal = flight.calculatePrice() + hotel.calculatePrice();
      expect(total).toBe(expectedTotal);
    });
  });

  // ===== State Pattern Tests =====
  describe('State Pattern: Booking Lifecycle', () => {
    test('New booking starts in Pending state', () => {
      expect(booking.stateName).toBe('pending');
    });

    test('Pending booking can be confirmed', () => {
      booking.addItem(flight);
      booking.confirm('TX-123');
      expect(booking.stateName).toBe('confirmed');
      expect(booking.paymentTransactionId).toBe('TX-123');
    });

    test('Pending booking can be cancelled', () => {
      booking.addItem(flight);
      booking.cancel();
      expect(booking.stateName).toBe('cancelled');
    });

    test('Confirmed booking CANNOT be confirmed again → throws BookingStateException', () => {
      booking.addItem(flight);
      booking.confirm('TX-123');
      expect(() => booking.confirm('TX-456')).toThrow(BookingStateException);
    });

    test('Cancelled booking CANNOT be confirmed → throws BookingStateException', () => {
      booking.addItem(flight);
      booking.cancel();
      expect(() => booking.confirm('TX-789')).toThrow(BookingStateException);
    });

    test('Cancelled booking CANNOT be cancelled again → throws BookingStateException', () => {
      booking.addItem(flight);
      booking.cancel();
      expect(() => booking.cancel()).toThrow(BookingStateException);
    });

    test('Cannot modify items when booking is confirmed', () => {
      booking.addItem(flight);
      booking.confirm('TX-123');
      expect(() => booking.addItem(hotel)).toThrow();
    });
  });

  // ===== Factory Pattern Tests =====
  describe('Factory Pattern: BookingItemFactory', () => {
    test('Creates Flight from JSON data', () => {
      const item = BookingItemFactory.createItem({
        type: 'flight',
        flightNo: 'SK-300',
        airline: 'SkyWings',
        origin: 'BKK',
        destination: 'SIN',
        departureTime: '2025-12-01T10:00:00Z',
        arrivalTime: '2025-12-01T13:20:00Z',
        basePrice: 5000,
        seatType: 'premium_economy'
      });

      expect(item).toBeInstanceOf(Flight);
      expect(item.getType()).toBe('flight');
      expect(item.calculatePrice()).toBeGreaterThan(5000);
    });

    test('Creates HotelRoom from JSON data', () => {
      const item = BookingItemFactory.createItem({
        type: 'hotel',
        hotelName: 'Test Hotel',
        roomType: 'suite',
        checkIn: '2025-12-01',
        checkOut: '2025-12-03',
        pricePerNight: 8000,
        location: 'Singapore',
        rating: 4.5,
        amenities: ['WiFi', 'Pool']
      });

      expect(item).toBeInstanceOf(HotelRoom);
      expect(item.getType()).toBe('hotel');
      expect(item.calculatePrice()).toBeGreaterThan(8000);
    });

    test('Throws error for unknown item type', () => {
      expect(() => {
        BookingItemFactory.createItem({ type: 'car' } as any);
      }).toThrow();
    });

    test('Creates multiple items from array', () => {
      const items = BookingItemFactory.createItems([
        {
          type: 'flight',
          flightNo: 'SK-400', airline: 'AirTest', origin: 'A', destination: 'B',
          departureTime: '2025-12-01T10:00:00Z', arrivalTime: '2025-12-01T12:00:00Z',
          basePrice: 3000
        },
        {
          type: 'hotel',
          hotelName: 'Hotel X', checkIn: '2025-12-01', checkOut: '2025-12-02',
          pricePerNight: 2000
        }
      ]);

      expect(items).toHaveLength(2);
      expect(items[0]).toBeInstanceOf(Flight);
      expect(items[1]).toBeInstanceOf(HotelRoom);
    });
  });

  // ===== Observer Pattern Tests =====
  describe('Observer Pattern: Event notifications', () => {
    test('NotificationObserver is triggered on booking confirmation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      booking.addItem(flight);
      booking.confirm('TX-OBS-1');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[EMAIL]')
      );
      consoleSpy.mockRestore();
    });

    test('LoyaltyPointObserver awards points on confirmation', () => {
      let awardedPoints = 0;
      const loyaltyObserver = new LoyaltyPointObserver();
      loyaltyObserver.setCallback((_travelerId, points) => {
        awardedPoints = points;
      });
      eventManager.subscribe(loyaltyObserver);

      booking.addItem(flight);
      booking.confirm('TX-OBS-2');

      // Points = totalPrice / 100
      expect(awardedPoints).toBeGreaterThan(0);
      expect(awardedPoints).toBe(Math.floor(booking.totalPrice / 100));
    });
  });
});
