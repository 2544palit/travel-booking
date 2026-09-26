import { BookingItem } from './BookingItem';

export type SeatType = 'economy' | 'premium_economy' | 'business' | 'first';

/**
 * Class: Flight (extends BookingItem)
 * Demonstrates: Polymorphism, Encapsulation
 */
export class Flight extends BookingItem {
  private _flightNo: string;
  private _airline: string;
  private _departure: string;
  private _arrival: string;
  private _departureTime: Date;
  private _arrivalTime: Date;
  private _seatType: SeatType;
  private _origin: string;
  private _destination: string;

  private static readonly TAX_RATES: Record<string, number> = {
    airport_tax: 0.07,
    fuel_surcharge: 0.03
  };

  private static readonly SEAT_MULTIPLIERS: Record<SeatType, number> = {
    economy: 1.0,
    premium_economy: 1.5,
    business: 2.8,
    first: 4.5
  };

  constructor(
    flightNo: string,
    airline: string,
    origin: string,
    destination: string,
    departureTime: Date,
    arrivalTime: Date,
    basePrice: number,
    seatType: SeatType = 'economy',
    itemId?: string
  ) {
    super(basePrice, itemId);
    this._flightNo = flightNo;
    this._airline = airline;
    this._origin = origin;
    this._destination = destination;
    this._departureTime = Flight.requireValidDate(departureTime, 'departureTime');
    this._arrivalTime = Flight.requireValidDate(arrivalTime, 'arrivalTime');
    this._departure = origin;
    this._arrival = destination;
    this._seatType = seatType;
  }

  get flightNo(): string { return this._flightNo; }
  get airline(): string { return this._airline; }
  get origin(): string { return this._origin; }
  get destination(): string { return this._destination; }
  get departureTime(): Date { return this._departureTime; }
  get arrivalTime(): Date { return this._arrivalTime; }
  get seatType(): SeatType { return this._seatType; }

  /** Polymorphic: Calculate flight price with seat class multiplier */
  calculatePrice(): number {
    const seatMultiplier = Flight.SEAT_MULTIPLIERS[this._seatType];
    const subtotal = this._basePrice * seatMultiplier;
    return Math.round((subtotal + this.calculateTax()) * 100) / 100;
  }

  /** Polymorphic: Calculate airport tax + fuel surcharge */
  calculateTax(): number {
    const seatMultiplier = Flight.SEAT_MULTIPLIERS[this._seatType];
    const subtotal = this._basePrice * seatMultiplier;
    const totalTaxRate = Object.values(Flight.TAX_RATES).reduce((a, b) => a + b, 0);
    return Math.round(subtotal * totalTaxRate * 100) / 100;
  }

  getType(): string { return 'flight'; }

  /** Get flight duration in hours */
  getDuration(): string {
    const diffMs = this._arrivalTime.getTime() - this._departureTime.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  getDetails(): object {
    return {
      flightNo: this._flightNo,
      airline: this._airline,
      origin: this._origin,
      destination: this._destination,
      departureTime: this._departureTime.toISOString(),
      arrivalTime: this._arrivalTime.toISOString(),
      duration: this.getDuration(),
      seatType: this._seatType
    };
  }
}
