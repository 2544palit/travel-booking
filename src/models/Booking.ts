import { v4 as uuidv4 } from 'uuid';
import { BookingItem } from './BookingItem';
import { IBookingState, BookingStateContext, PendingState } from '../patterns/IBookingState';
import { BookingEventManager, BookingEvent } from '../patterns/BookingObserver';
import { SeatUnavailableException } from '../exceptions/DomainException';

/**
 * Class: Booking
 * Core aggregate root - manages booking lifecycle
 * Demonstrates: State Pattern, Composition, Observer Pattern, Encapsulation
 */
export class Booking implements BookingStateContext {
  private readonly _bookingId: string;
  private _items: BookingItem[];          // Composition: items belong to this booking
  private _state: IBookingState;          // State Pattern
  private _totalPrice: number;
  private _discount: number;
  private _pointsDiscount: number;
  private _usedPoints: number;
  private _promoCode: string | null;
  private _paymentTransactionId: string | null;
  private _travelerId: string;
  private _travelerEmail: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  // Observer Pattern: event manager for state changes
  private _eventManager: BookingEventManager;

  constructor(
    travelerId: string,
    travelerEmail: string,
    eventManager: BookingEventManager,
    bookingId?: string
  ) {
    this._bookingId = bookingId || `BK-${uuidv4().substring(0, 8).toUpperCase()}`;
    this._items = [];
    this._state = new PendingState();     // Initial state
    this._totalPrice = 0;
    this._discount = 0;
    this._pointsDiscount = 0;
    this._usedPoints = 0;
    this._promoCode = null;
    this._paymentTransactionId = null;
    this._travelerId = travelerId;
    this._travelerEmail = travelerEmail;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._eventManager = eventManager;
  }

  // --- Getters (Encapsulation) ---
  get bookingId(): string { return this._bookingId; }
  get items(): BookingItem[] { return [...this._items]; }
  get stateName(): string { return this._state.stateName; }
  get totalPrice(): number { return this._totalPrice; }
  get discount(): number { return this._discount; }
  get pointsDiscount(): number { return this._pointsDiscount; }
  get usedPoints(): number { return this._usedPoints; }
  get promoCode(): string | null { return this._promoCode; }
  get travelerId(): string { return this._travelerId; }
  get travelerEmail(): string { return this._travelerEmail; }
  get paymentTransactionId(): string | null { return this._paymentTransactionId; }
  get createdAt(): Date { return this._createdAt; }

  // --- State Pattern Implementation ---
  setState(state: IBookingState): void {
    this._state = state;
    this._updatedAt = new Date();
  }

  getStateName(): string {
    return this._state.stateName;
  }

  // --- Business Methods ---

  /**
   * Add a booking item (Flight or HotelRoom) — Polymorphism
   * @throws SeatUnavailableException if item is not available
   */
  addItem(item: BookingItem): void {
    if (!this._state.canModify()) {
      throw new Error('Cannot modify booking in current state: ' + this._state.stateName);
    }
    if (!item.available) {
      throw new SeatUnavailableException(
        `Item ${item.itemId} is no longer available`
      );
    }
    this._items.push(item);
    this.recalculateTotal();
  }

  // Hydrate from DB
  loadRawData(totalPrice: number, items: any[], createdAt?: Date): void {
     this._totalPrice = totalPrice;
     this._items = items as any;
     if (createdAt) {
       this._createdAt = createdAt;
     }
  }

  /**
   * Remove an item from the booking
   */
  removeItem(itemId: string): void {
    if (!this._state.canModify()) {
      throw new Error('Cannot modify booking in current state: ' + this._state.stateName);
    }
    this._items = this._items.filter(i => i.itemId !== itemId);
    this.recalculateTotal();
  }

  /**
   * Calculate total price using Polymorphism
   * Each item.calculatePrice() returns different values for Flight vs HotelRoom
   */
  recalculateTotal(): void {
    const subtotal = this.getSubtotal();
    const tax = subtotal * 0.07;
    this._totalPrice = Math.round((subtotal + tax - this._discount - this._pointsDiscount) * 100) / 100;
    if (this._totalPrice < 0) this._totalPrice = 0;
  }

  /**
   * Apply a discount amount (from PromotionCode)
   */
  applyDiscount(discountAmount: number, promoCode: string): void {
    this._discount = discountAmount;
    this._promoCode = promoCode;
    this.recalculateTotal();
  }

  /**
   * Apply discount from points
   */
  applyPointsDiscount(discountAmount: number, pointsUsed: number): void {
    this._pointsDiscount = discountAmount;
    this._usedPoints = pointsUsed;
    this.recalculateTotal();
  }

  /**
   * Confirm the booking — triggers State transition + Observer notifications
   */
  confirm(transactionId: string): void {
    this._state.confirm(this);   // State Pattern: delegates to current state
    this._paymentTransactionId = transactionId;
    this._updatedAt = new Date();

    // Observer Pattern: notify all observers
    const event: BookingEvent = {
      bookingId: this._bookingId,
      newState: this._state.stateName,
      travelerEmail: this._travelerEmail,
      travelerId: this._travelerId,
      totalAmount: this._totalPrice,
      timestamp: new Date()
    };
    this._eventManager.notify(event);

    // Mark all items as no longer available
    this._items.forEach(item => { item.available = false; });
  }

  /**
   * Cancel the booking — triggers State transition + Observer notifications
   */
  cancel(): void {
    this._state.cancel(this);    // State Pattern: delegates to current state
    this._updatedAt = new Date();

    // Observer Pattern: notify all observers
    const event: BookingEvent = {
      bookingId: this._bookingId,
      newState: this._state.stateName,
      travelerEmail: this._travelerEmail,
      travelerId: this._travelerId,
      totalAmount: this._totalPrice,
      timestamp: new Date()
    };
    this._eventManager.notify(event);

    // Release items back to available
    this._items.forEach(item => { item.available = true; });
  }

  /**
   * Get subtotal before discount
   */
  getSubtotal(): number {
    return this._items.reduce((sum, item: any) => {
       if (item.calculatePrice) return sum + item.calculatePrice();
       // Fallback for plain json items
       if (item.totalPrice) return sum + item.totalPrice;
       if (item.basePrice) return sum + item.basePrice;
       if (item.pricePerNight && item.details?.nights) return sum + (item.pricePerNight * item.details.nights);
       if (item.pricePerNight) return sum + item.pricePerNight; // default 1 night if missing
       return sum;
    }, 0);
  }

  /**
   * Get total tax amount (VAT 7% on top of subtotal)
   */
  getTotalTax(): number {
    return Math.round(this.getSubtotal() * 0.07 * 100) / 100;
  }

  toJSON(): object {
    return {
      bookingId: this._bookingId,
      travelerId: this._travelerId,
      state: this._state.stateName,
      items: this._items.map(i => typeof i.toJSON === 'function' ? i.toJSON() : i),
      itemCount: this._items.length,
      subtotal: this.getSubtotal(),
      tax: this.getTotalTax(),
      discount: this._discount,
      pointsDiscount: this._pointsDiscount,
      usedPoints: this._usedPoints,
      promoCode: this._promoCode,
      totalPrice: this._totalPrice,
      paymentTransactionId: this._paymentTransactionId,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString()
    };
  }
}
