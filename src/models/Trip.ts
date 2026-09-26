import { v4 as uuidv4 } from 'uuid';
import { Booking } from './Booking';

/**
 * Class: Trip
 * A travel trip that contains multiple bookings
 * Demonstrates: Association (Traveler), Composition (Bookings)
 */
export class Trip {
  private readonly _tripId: string;
  private _travelerId: string;            // Association with Traveler
  private _tripName: string;
  private _bookings: Booking[];           // Composition: bookings belong to this trip
  private _startDate: Date | null;
  private _endDate: Date | null;
  private _createdAt: Date;

  constructor(
    travelerId: string,
    tripName: string,
    tripId?: string
  ) {
    this._tripId = tripId || `TR-${uuidv4().substring(0, 8).toUpperCase()}`;
    this._travelerId = travelerId;
    this._tripName = tripName;
    this._bookings = [];
    this._startDate = null;
    this._endDate = null;
    this._createdAt = new Date();
  }

  // Getters
  get tripId(): string { return this._tripId; }
  get travelerId(): string { return this._travelerId; }
  get tripName(): string { return this._tripName; }
  get bookings(): Booking[] { return [...this._bookings]; }
  get startDate(): Date | null { return this._startDate; }
  get endDate(): Date | null { return this._endDate; }

  set tripName(value: string) {
    if (!value || value.trim().length === 0) throw new Error('Trip name cannot be empty');
    this._tripName = value.trim();
  }

  /**
   * Add a booking to this trip (Composition)
   */
  addBooking(booking: Booking): void {
    this._bookings.push(booking);
  }

  /**
   * Get total cost across all bookings
   */
  getTotalCost(): number {
    return this._bookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );
  }

  /**
   * Get count of bookings by state
   */
  getBookingStats(): { pending: number; confirmed: number; cancelled: number } {
    return {
      pending: this._bookings.filter(b => b.stateName === 'pending').length,
      confirmed: this._bookings.filter(b => b.stateName === 'confirmed').length,
      cancelled: this._bookings.filter(b => b.stateName === 'cancelled').length
    };
  }

  toJSON(): object {
    return {
      tripId: this._tripId,
      travelerId: this._travelerId,
      tripName: this._tripName,
      bookings: this._bookings.map(b => b.toJSON()),
      bookingCount: this._bookings.length,
      totalCost: this.getTotalCost(),
      stats: this.getBookingStats(),
      createdAt: this._createdAt.toISOString()
    };
  }
}
