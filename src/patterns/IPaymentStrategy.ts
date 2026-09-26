import { v4 as uuidv4 } from 'uuid';

/**
 * Strategy Pattern: Payment Processing
 * Interface for different payment methods
 * Demonstrates: Strategy Pattern, OCP (Open/Closed Principle)
 */
export interface IPaymentStrategy {
  readonly methodName: string;
  processPayment(amount: number): PaymentResult;
  validate(): boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  method: string;
  amount: number;
  message: string;
  processedAt: Date;
}

/**
 * Concrete Strategy: Credit Card Payment
 */
export class CreditCardPayment implements IPaymentStrategy {
  readonly methodName = 'credit_card';
  private _cardNumber: string;
  private _cardHolder: string;
  private _expiryMonth: number;
  private _expiryYear: number;
  private _cvv: string;

  constructor(cardNumber: string, cardHolder: string, expiryMonth: number, expiryYear: number, cvv: string) {
    this._cardNumber = cardNumber;
    this._cardHolder = cardHolder;
    this._expiryMonth = expiryMonth;
    this._expiryYear = expiryYear;
    this._cvv = cvv;
  }

  validate(): boolean {
    // Basic validation
    if (this._cardNumber.replace(/\s/g, '').length < 13) return false;
    if (this._cvv.length < 3) return false;
    const now = new Date();
    if (this._expiryYear < now.getFullYear()) return false;
    if (this._expiryYear === now.getFullYear() && this._expiryMonth < now.getMonth() + 1) return false;
    return true;
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validate()) {
      return {
        success: false,
        transactionId: '',
        method: this.methodName,
        amount,
        message: 'Invalid card details',
        processedAt: new Date()
      };
    }

    // Simulate payment processing (always succeeds for demo)
    return {
      success: true,
      transactionId: `CC-${uuidv4().substring(0, 8).toUpperCase()}`,
      method: this.methodName,
      amount,
      message: `Payment of ฿${amount.toLocaleString()} processed via Credit Card ending ${this._cardNumber.slice(-4)}`,
      processedAt: new Date()
    };
  }
}

/**
 * Concrete Strategy: PromptPay Payment
 */
export class PromptPayPayment implements IPaymentStrategy {
  readonly methodName = 'promptpay';
  private _phoneNumber: string;

  constructor(phoneNumber: string) {
    this._phoneNumber = phoneNumber;
  }

  validate(): boolean {
    // Thai phone number validation (10 digits starting with 0)
    return /^0[0-9]{9}$/.test(this._phoneNumber.replace(/[\s-]/g, ''));
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validate()) {
      return {
        success: false,
        transactionId: '',
        method: this.methodName,
        amount,
        message: 'Invalid PromptPay phone number',
        processedAt: new Date()
      };
    }

    return {
      success: true,
      transactionId: `PP-${uuidv4().substring(0, 8).toUpperCase()}`,
      method: this.methodName,
      amount,
      message: `Payment of ฿${amount.toLocaleString()} processed via PromptPay (${this._phoneNumber})`,
      processedAt: new Date()
    };
  }
}
