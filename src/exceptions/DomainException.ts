/**
 * Base Domain Exception
 */
export class DomainException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationException extends DomainException {
  constructor(message: string = 'Invalid input data') {
    super(message, 400);
  }
}

export class SeatUnavailableException extends DomainException {
  constructor(message: string = 'The selected seat/room is no longer available') {
    super(message, 409);
  }
}

export class InvalidPromotionException extends DomainException {
  constructor(message: string = 'The promotion code is invalid or expired') {
    super(message, 400);
  }
}

export class PaymentDeclinedException extends DomainException {
  constructor(message: string = 'Payment was declined') {
    super(message, 402);
  }
}

export class BookingStateException extends DomainException {
  constructor(message: string = 'Invalid booking state transition') {
    super(message, 409);
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class NotFoundException extends DomainException {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
