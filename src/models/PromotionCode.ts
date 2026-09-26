import { v4 as uuidv4 } from 'uuid';
import { InvalidPromotionException } from '../exceptions/DomainException';

/**
 * Class: PromotionCode
 * Validates and applies discount codes
 */
export class PromotionCode {
  private readonly _id: string;
  private _code: string;
  private _discountRate: number; // 0.0 - 1.0 (e.g., 0.15 = 15%)
  private _maxDiscount: number;
  private _minimumSpend: number;
  private _expirationDate: Date;
  private _usageLimit: number;
  private _usedCount: number;

  constructor(
    code: string,
    discountRate: number,
    maxDiscount: number,
    expirationDate: Date,
    minimumSpend: number = 0,
    usageLimit: number = 100,
    id?: string
  ) {
    this._id = id || uuidv4();
    this._code = code.toUpperCase();
    this._discountRate = Math.min(Math.max(discountRate, 0), 1);
    this._maxDiscount = maxDiscount;
    this._minimumSpend = minimumSpend;
    this._expirationDate = expirationDate;
    this._usageLimit = usageLimit;
    this._usedCount = 0;
  }

  get id(): string { return this._id; }
  get code(): string { return this._code; }
  get discountRate(): number { return this._discountRate; }
  get maxDiscount(): number { return this._maxDiscount; }
  get expirationDate(): Date { return this._expirationDate; }

  /** Check if promo code is valid */
  isValid(orderAmount: number = 0): boolean {
    const now = new Date();
    if (now > this._expirationDate) return false;
    if (this._usedCount >= this._usageLimit) return false;
    if (orderAmount < this._minimumSpend) return false;
    return true;
  }

  /** Apply discount and return the discount amount */
  applyDiscount(amount: number): number {
    if (!this.isValid(amount)) {
      throw new InvalidPromotionException(
        `Promotion code '${this._code}' is invalid or expired`
      );
    }
    const discount = Math.min(amount * this._discountRate, this._maxDiscount);
    this._usedCount++;
    return Math.round(discount * 100) / 100;
  }

  toJSON(): object {
    return {
      id: this._id,
      code: this._code,
      discountRate: this._discountRate,
      maxDiscount: this._maxDiscount,
      minimumSpend: this._minimumSpend,
      expirationDate: this._expirationDate.toISOString(),
      usageLimit: this._usageLimit,
      usedCount: this._usedCount
    };
  }
}
