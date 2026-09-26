import { Notification } from '../models/Notification';

/**
 * Observer Pattern: Booking Events
 * When a booking state changes, observers are notified
 * Demonstrates: Observer Pattern, Loose Coupling
 */
export interface IBookingObserver {
  update(event: BookingEvent): void;
}

export interface BookingEvent {
  bookingId: string;
  newState: string;
  travelerEmail: string;
  travelerId: string;
  totalAmount: number;
  timestamp: Date;
}

/** Notification store (in-memory) */
export const notificationStore: Notification[] = [];

/**
 * Concrete Observer: Sends notification when booking state changes
 */
export class NotificationObserver implements IBookingObserver {
  update(event: BookingEvent): void {
    let message = '';

    switch (event.newState) {
      case 'confirmed':
        message = `✅ การจองหมายเลข ${event.bookingId} ได้รับการยืนยันแล้ว! ยอดชำระ ฿${event.totalAmount.toLocaleString()}`;
        break;
      case 'cancelled':
        message = `❌ การจองหมายเลข ${event.bookingId} ถูกยกเลิกแล้ว`;
        break;
      default:
        message = `📋 สถานะการจองหมายเลข ${event.bookingId} เปลี่ยนเป็น: ${event.newState}`;
    }

    const notification = new Notification(message, event.travelerEmail, 'email');
    notification.send();
    notificationStore.push(notification);
  }
}

/**
 * Concrete Observer: Awards loyalty points when booking is confirmed
 */
export class LoyaltyPointObserver implements IBookingObserver {
  // Store callback so the service layer can handle the actual point addition
  private _onPointsAwarded: ((travelerId: string, points: number, bookingId: string) => void) | null = null;

  setCallback(callback: (travelerId: string, points: number, bookingId: string) => void): void {
    this._onPointsAwarded = callback;
  }

  update(event: BookingEvent): void {
    if (event.newState === 'confirmed') {
      // Award 1 point per 100 baht spent
      const points = Math.floor(event.totalAmount / 100);
      console.log(`[Loyalty] Awarding ${points} LitPoints to traveler ${event.travelerId}`);

      if (this._onPointsAwarded) {
        this._onPointsAwarded(event.travelerId, points, event.bookingId);
      }
    }
  }
}

/**
 * Observable: Manages list of observers
 */
export class BookingEventManager {
  private _observers: IBookingObserver[] = [];

  subscribe(observer: IBookingObserver): void {
    this._observers.push(observer);
  }

  unsubscribe(observer: IBookingObserver): void {
    this._observers = this._observers.filter(o => o !== observer);
  }

  notify(event: BookingEvent): void {
    for (const observer of this._observers) {
      observer.update(event);
    }
  }
}
