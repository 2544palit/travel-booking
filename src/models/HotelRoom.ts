import { BookingItem } from './BookingItem';
import { ValidationException } from '../exceptions/DomainException';

export type RoomType = 'standard' | 'superior' | 'deluxe' | 'suite' | 'presidential';

/**
 * Class: HotelRoom (extends BookingItem)
 * Demonstrates: Polymorphism, Encapsulation
 */
export class HotelRoom extends BookingItem {
  private _hotelName: string;
  private _roomType: RoomType;
  private _checkIn: Date;
  private _checkOut: Date;
  private _nights: number;
  private _location: string;
  private _rating: number;
  private _amenities: string[];
  private _imageUrl: string;

  private static readonly SERVICE_CHARGE_RATE = 0.10;
  private static readonly VAT_RATE = 0.07;

  private static readonly ROOM_MULTIPLIERS: Record<RoomType, number> = {
    standard: 1.0,
    superior: 1.3,
    deluxe: 1.8,
    suite: 2.5,
    presidential: 4.0
  };

  constructor(
    hotelName: string,
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date,
    pricePerNight: number,
    location: string = '',
    rating: number = 4.0,
    amenities: string[] = [],
    imageUrl: string = '',
    itemId?: string
  ) {
    super(pricePerNight, itemId);
    this._hotelName = hotelName;
    this._roomType = roomType;
    this._checkIn = HotelRoom.requireValidDate(checkIn, 'checkIn');
    this._checkOut = HotelRoom.requireValidDate(checkOut, 'checkOut');
    if (this._checkOut < this._checkIn) {
      throw new ValidationException("'checkOut' must not be before 'checkIn'");
    }
    this._nights = this.calculateNights();
    this._location = location;
    this._rating = rating;
    this._amenities = amenities;
    this._imageUrl = imageUrl;
  }

  get hotelName(): string { return this._hotelName; }
  get roomType(): RoomType { return this._roomType; }
  get checkIn(): Date { return this._checkIn; }
  get checkOut(): Date { return this._checkOut; }
  get nights(): number { return this._nights; }
  get location(): string { return this._location; }
  get rating(): number { return this._rating; }
  get amenities(): string[] { return [...this._amenities]; }
  get imageUrl(): string { return this._imageUrl; }

  private calculateNights(): number {
    const diffTime = this._checkOut.getTime() - this._checkIn.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  /** Polymorphic: nights × pricePerNight × roomMultiplier + taxes */
  calculatePrice(): number {
    const roomMultiplier = HotelRoom.ROOM_MULTIPLIERS[this._roomType];
    const subtotal = this._basePrice * this._nights * roomMultiplier;
    return Math.round((subtotal + this.calculateTax()) * 100) / 100;
  }

  /** Polymorphic: service charge 10% + VAT 7% */
  calculateTax(): number {
    const roomMultiplier = HotelRoom.ROOM_MULTIPLIERS[this._roomType];
    const subtotal = this._basePrice * this._nights * roomMultiplier;
    const serviceCharge = subtotal * HotelRoom.SERVICE_CHARGE_RATE;
    const vat = (subtotal + serviceCharge) * HotelRoom.VAT_RATE;
    return Math.round((serviceCharge + vat) * 100) / 100;
  }

  getType(): string { return 'hotel'; }

  getDetails(): object {
    return {
      hotelName: this._hotelName,
      roomType: this._roomType,
      checkIn: this._checkIn.toISOString().split('T')[0],
      checkOut: this._checkOut.toISOString().split('T')[0],
      nights: this._nights,
      location: this._location,
      rating: this._rating,
      amenities: this._amenities,
      imageUrl: this._imageUrl,
      pricePerNight: this._basePrice
    };
  }
}
