import { BookingStateException } from '../exceptions/DomainException';

/**
 * State Pattern: Booking Lifecycle
 * Controls state transitions: Pending → Confirmed → (Cancelled)
 * Demonstrates: State Pattern, encapsulated transition rules
 */
export interface IBookingState {
  readonly stateName: string;
  confirm(context: BookingStateContext): void;
  cancel(context: BookingStateContext): void;
  canModify(): boolean;
}

/** Context interface that states use to change the booking's state */
export interface BookingStateContext {
  setState(state: IBookingState): void;
  getStateName(): string;
}

/**
 * Concrete State: Pending
 * - Can be confirmed or cancelled
 */
export class PendingState implements IBookingState {
  readonly stateName = 'pending';

  confirm(context: BookingStateContext): void {
    console.log('[State] Booking transition: Pending → Confirmed');
    context.setState(new ConfirmedState());
  }

  cancel(context: BookingStateContext): void {
    console.log('[State] Booking transition: Pending → Cancelled');
    context.setState(new CancelledState());
  }

  canModify(): boolean { return true; }
}

/**
 * Concrete State: Confirmed
 * - Can only be cancelled (not re-confirmed)
 */
export class ConfirmedState implements IBookingState {
  readonly stateName = 'confirmed';

  confirm(_context: BookingStateContext): void {
    throw new BookingStateException('Booking is already confirmed');
  }

  cancel(context: BookingStateContext): void {
    console.log('[State] Booking transition: Confirmed → Cancelled');
    context.setState(new CancelledState());
  }

  canModify(): boolean { return false; }
}

/**
 * Concrete State: Cancelled
 * - Terminal state — no further transitions allowed
 */
export class CancelledState implements IBookingState {
  readonly stateName = 'cancelled';

  confirm(_context: BookingStateContext): void {
    throw new BookingStateException('Cannot confirm a cancelled booking');
  }

  cancel(_context: BookingStateContext): void {
    throw new BookingStateException('Booking is already cancelled');
  }

  canModify(): boolean { return false; }
}
