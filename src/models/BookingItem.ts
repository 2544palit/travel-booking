import { v4 as uuidv4 } from 'uuid';
import { ValidationException } from '../exceptions/DomainException';

/**
 * Abstract Class: BookingItem
 * Base class for all bookable items (Flight, HotelRoom)
 * Demonstrates: Abstraction, Polymorphism
 */
export abstract class BookingItem {
  protected readonly _itemId: string;
  protected _basePrice: number;
  protected _available: boolean;

  constructor(basePrice: number, itemId?: string) {
    this._itemId = itemId || uuidv4();
    this._basePrice = BookingItem.requireValidAmount(basePrice, 'basePrice');
    this._available = true;
  }

  /**
   * Guard: an item must never be constructed with an Invalid Date.
   * Once such an item is inside a booking, every later toJSON() throws
   * RangeError and the traveler's whole booking list becomes unreadable.
   */
  protected static requireValidDate(value: Date, field: string): Date {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new ValidationException(`Invalid date for '${field}'`);
    }
    return value;
  }

  /** Guard: a non-finite or negative price makes totalPrice NaN */
  protected static requireValidAmount(value: number, field: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new ValidationException(`Invalid amount for '${field}'`);
    }
    return value;
  }

  get itemId(): string { return this._itemId; }
  get basePrice(): number { return this._basePrice; }
  get available(): boolean { return this._available; }

  set available(value: boolean) { this._available = value; }

  /** Calculate total price including taxes - POLYMORPHIC */
  abstract calculatePrice(): number;

  /** Calculate tax amount - POLYMORPHIC */
  abstract calculateTax(): number;

  /** Get item details - POLYMORPHIC */
  abstract getDetails(): object;

  /** Get item type name */
  abstract getType(): string;

  toJSON(): object {
    const totalPrice = this.calculatePrice();
    const details: any = this.getDetails();
    
    // Explicitly expose pricePerNight for frontend consistency
    let pricePerNight = totalPrice;
    if (this.getType() === 'hotel' && details.nights) {
      pricePerNight = totalPrice / details.nights;
    }

    return {
      itemId: this._itemId,
      type: this.getType(),
      basePrice: this._basePrice,
      pricePerNight: pricePerNight,
      totalPrice: totalPrice,
      tax: this.calculateTax(),
      available: this._available,
      details: details
    };
  }
}
