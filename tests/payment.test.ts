import { CreditCardPayment, PromptPayPayment } from '../src/patterns/IPaymentStrategy';
import { Payment } from '../src/models/Payment';
import { PromotionCode } from '../src/models/PromotionCode';
import { InvalidPromotionException } from '../src/exceptions/DomainException';

describe('Payment System Tests', () => {

  // ===== Strategy Pattern: Payment Methods =====
  describe('Strategy Pattern: CreditCardPayment', () => {
    test('Valid credit card processes payment successfully', () => {
      const strategy = new CreditCardPayment(
        '4242424242424242', 'Alex Chen', 12, 2027, '123'
      );
      const result = strategy.processPayment(15000);

      expect(result.success).toBe(true);
      expect(result.method).toBe('credit_card');
      expect(result.amount).toBe(15000);
      expect(result.transactionId).toMatch(/^CC-/);
    });

    test('Invalid card number fails validation', () => {
      const strategy = new CreditCardPayment(
        '123', 'Bad Card', 12, 2027, '123'
      );
      const result = strategy.processPayment(5000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    test('Expired card fails validation', () => {
      const strategy = new CreditCardPayment(
        '4242424242424242', 'Expired Card', 1, 2020, '123'
      );
      expect(strategy.validate()).toBe(false);
    });
  });

  describe('Strategy Pattern: PromptPayPayment', () => {
    test('Valid phone number processes payment successfully', () => {
      const strategy = new PromptPayPayment('0812345678');
      const result = strategy.processPayment(8500);

      expect(result.success).toBe(true);
      expect(result.method).toBe('promptpay');
      expect(result.transactionId).toMatch(/^PP-/);
    });

    test('Invalid phone number fails', () => {
      const strategy = new PromptPayPayment('1234');
      const result = strategy.processPayment(5000);

      expect(result.success).toBe(false);
    });
  });

  describe('Payment class with Strategy', () => {
    test('Payment processes via CreditCard strategy', () => {
      const strategy = new CreditCardPayment(
        '5555555555554444', 'Test User', 6, 2028, '456'
      );
      const payment = new Payment('BK-001', 25000, strategy);
      const result = payment.processPayment();

      expect(payment.isProcessed).toBe(true);
      expect(payment.isSuccessful).toBe(true);
      expect(result.amount).toBe(25000);
    });
  });

  // ===== PromotionCode Tests =====
  describe('PromotionCode Discount Logic', () => {
    test('Valid promo applies correct discount', () => {
      const promo = new PromotionCode(
        'LITRIP25',
        0.25,     // 25% off
        5000,     // max 5000 THB
        new Date('2026-12-31'),
        1000      // min spend 1000 THB
      );

      expect(promo.isValid(5000)).toBe(true);
      const discount = promo.applyDiscount(10000);
      expect(discount).toBe(2500);  // 10000 * 0.25 = 2500 (under max)
    });

    test('Discount does not exceed maxDiscount', () => {
      const promo = new PromotionCode(
        'BIGDEAL',
        0.50,     // 50% off
        3000,     // max 3000 THB
        new Date('2026-12-31')
      );

      const discount = promo.applyDiscount(50000);
      // 50000 * 0.50 = 25000, but max is 3000
      expect(discount).toBe(3000);
    });

    test('Expired promo code throws InvalidPromotionException', () => {
      const promo = new PromotionCode(
        'EXPIRED',
        0.10,
        1000,
        new Date('2020-01-01')  // already expired
      );

      expect(promo.isValid()).toBe(false);
      expect(() => promo.applyDiscount(5000)).toThrow(InvalidPromotionException);
    });

    test('Below minimum spend throws InvalidPromotionException', () => {
      const promo = new PromotionCode(
        'MINSPENDFAIL',
        0.15,
        2000,
        new Date('2026-12-31'),
        10000  // min spend 10000
      );

      expect(promo.isValid(5000)).toBe(false);
      expect(() => promo.applyDiscount(5000)).toThrow(InvalidPromotionException);
    });
  });
});
