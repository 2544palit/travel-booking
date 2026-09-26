import { v4 as uuidv4 } from 'uuid';
import { IPaymentStrategy, PaymentResult } from '../patterns/IPaymentStrategy';

/**
 * Class: Payment
 * Handles payment processing using Strategy Pattern
 * Demonstrates: Strategy Pattern, Encapsulation
 */
export class Payment {
  private readonly _transactionId: string;
  private _amount: number;
  private _strategy: IPaymentStrategy;
  private _result: PaymentResult | null;
  private _bookingId: string;
  private _processedAt: Date | null;

  constructor(
    bookingId: string,
    amount: number,
    strategy: IPaymentStrategy
  ) {
    this._transactionId = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    this._bookingId = bookingId;
    this._amount = amount;
    this._strategy = strategy;
    this._result = null;
    this._processedAt = null;
  }

  get transactionId(): string { return this._transactionId; }
  get amount(): number { return this._amount; }
  get result(): PaymentResult | null { return this._result; }
  get bookingId(): string { return this._bookingId; }
  get isProcessed(): boolean { return this._result !== null; }
  get isSuccessful(): boolean { return this._result?.success === true; }

  /**
   * Process payment using the assigned strategy
   * Demonstrates: Strategy Pattern — behavior changes based on strategy
   */
  processPayment(): PaymentResult {
    this._result = this._strategy.processPayment(this._amount);
    this._processedAt = new Date();
    return this._result;
  }

  toJSON(): object {
    return {
      transactionId: this._transactionId,
      bookingId: this._bookingId,
      amount: this._amount,
      method: this._strategy.methodName,
      result: this._result,
      processedAt: this._processedAt?.toISOString() || null
    };
  }
}
