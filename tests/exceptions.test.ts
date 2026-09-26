import {
  DomainException,
  SeatUnavailableException,
  InvalidPromotionException,
  PaymentDeclinedException,
  BookingStateException,
  UnauthorizedException,
  NotFoundException
} from '../src/exceptions/DomainException';

describe('Custom Exception Handling Tests', () => {

  describe('DomainException base class', () => {
    test('Has correct name and message', () => {
      const err = new DomainException('Something went wrong', 400);
      expect(err.name).toBe('DomainException');
      expect(err.message).toBe('Something went wrong');
      expect(err.statusCode).toBe(400);
    });

    test('Is an instance of Error', () => {
      const err = new DomainException('Test');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(DomainException);
    });
  });

  describe('SeatUnavailableException', () => {
    test('Returns HTTP 409 Conflict', () => {
      const err = new SeatUnavailableException();
      expect(err.statusCode).toBe(409);
      expect(err.name).toBe('SeatUnavailableException');
      expect(err.message).toContain('no longer available');
    });

    test('Accepts custom message', () => {
      const err = new SeatUnavailableException('Seat 12A is taken');
      expect(err.message).toBe('Seat 12A is taken');
    });
  });

  describe('InvalidPromotionException', () => {
    test('Returns HTTP 400 Bad Request', () => {
      const err = new InvalidPromotionException();
      expect(err.statusCode).toBe(400);
      expect(err.name).toBe('InvalidPromotionException');
    });
  });

  describe('PaymentDeclinedException', () => {
    test('Returns HTTP 402 Payment Required', () => {
      const err = new PaymentDeclinedException();
      expect(err.statusCode).toBe(402);
      expect(err.name).toBe('PaymentDeclinedException');
    });
  });

  describe('BookingStateException', () => {
    test('Returns HTTP 409 Conflict', () => {
      const err = new BookingStateException();
      expect(err.statusCode).toBe(409);
      expect(err.name).toBe('BookingStateException');
    });
  });

  describe('UnauthorizedException', () => {
    test('Returns HTTP 401 Unauthorized', () => {
      const err = new UnauthorizedException();
      expect(err.statusCode).toBe(401);
    });
  });

  describe('NotFoundException', () => {
    test('Returns HTTP 404 Not Found', () => {
      const err = new NotFoundException('Booking not found');
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Booking not found');
    });
  });

  describe('Exception hierarchy and Error Handler mapping', () => {
    test('All custom exceptions are instances of DomainException', () => {
      const exceptions = [
        new SeatUnavailableException(),
        new InvalidPromotionException(),
        new PaymentDeclinedException(),
        new BookingStateException(),
        new UnauthorizedException(),
        new NotFoundException()
      ];

      exceptions.forEach(err => {
        expect(err).toBeInstanceOf(DomainException);
        expect(err).toBeInstanceOf(Error);
      });
    });

    test('Status codes cover all HTTP error ranges', () => {
      expect(new UnauthorizedException().statusCode).toBe(401);
      expect(new InvalidPromotionException().statusCode).toBe(400);
      expect(new PaymentDeclinedException().statusCode).toBe(402);
      expect(new NotFoundException().statusCode).toBe(404);
      expect(new SeatUnavailableException().statusCode).toBe(409);
      expect(new BookingStateException().statusCode).toBe(409);
    });
  });
});
