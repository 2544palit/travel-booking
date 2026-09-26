import { Payment } from '../models/Payment';
import { CreditCardPayment, PromptPayPayment, IPaymentStrategy } from '../patterns/IPaymentStrategy';
import { BookingService } from './BookingService';
import { NotFoundException, PaymentDeclinedException } from '../exceptions/DomainException';

import { supabase } from '../config/supabase';

export class PaymentService {

  static async processPayment(
    bookingId: string,
    method: string,
    details: {
      cardNumber?: string;
      cardHolder?: string;
      expiryMonth?: number;
      expiryYear?: number;
      cvv?: string;
      phoneNumber?: string;
    },
    usePoints?: number,
    travelerId?: string
  ): Promise<object> {
    const booking = await BookingService.getBooking(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (usePoints && usePoints > 0 && travelerId) {
      // 1. Fetch current points from Supabase
      const { data: traveler, error: fetchErr } = await supabase.from('travelers').select('points').eq('id', travelerId).single();
      
      if (!fetchErr && traveler && traveler.points >= usePoints) {
        // 2. Deduct points in DB
        const newPoints = traveler.points - usePoints;
        await supabase.from('travelers').update({ points: newPoints }).eq('id', travelerId);
        
        // 3. Apply points discount to booking
        const discountAmount = Math.floor(usePoints / 10);
        booking.applyPointsDiscount(discountAmount, usePoints);
        booking.recalculateTotal();
      }
    }

    let strategy: IPaymentStrategy;
    switch (method) {
      case 'credit_card':
        if (!details.cardNumber || !details.cardHolder || !details.expiryMonth || !details.expiryYear || !details.cvv) {
          throw new PaymentDeclinedException('Missing credit card details');
        }
        strategy = new CreditCardPayment(details.cardNumber, details.cardHolder, details.expiryMonth, details.expiryYear, details.cvv);
        break;
      case 'promptpay':
        if (!details.phoneNumber) {
          throw new PaymentDeclinedException('Missing PromptPay phone number');
        }
        strategy = new PromptPayPayment(details.phoneNumber);
        break;
      default:
        throw new PaymentDeclinedException('Unknown payment method');
    }

    const payment = new Payment(bookingId, booking.totalPrice, strategy);
    const result = payment.processPayment();

    if (!result.success) {
      throw new PaymentDeclinedException(result.message);
    }

    booking.confirm(result.transactionId);
    await BookingService.updateBookingInDb(booking); // Save the confirmed state!

    return {
      payment: payment.toJSON(),
      booking: booking.toJSON()
    };
  }
}
