import { BookingItem } from '../models/BookingItem';
import { Flight, SeatType } from '../models/Flight';
import { HotelRoom, RoomType } from '../models/HotelRoom';
import { VipItem } from '../models/VipItem';

/**
 * Factory Pattern: BookingItem Creation
 * Creates Flight or HotelRoom from plain JSON data
 * Demonstrates: Factory Method Pattern, OCP
 */
export interface FlightData {
  type: 'flight';
  flightNo: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  seatType?: SeatType;
  itemId?: string;
}

export interface HotelData {
  type: 'hotel';
  hotelName: string;
  roomType?: RoomType;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  location?: string;
  rating?: number;
  amenities?: string[];
  imageUrl?: string;
  itemId?: string;
}

export interface VipData {
  type: 'vip';
  plan: string;
  title: string;
  basePrice: number;
  itemId?: string;
}

export type BookingItemData = FlightData | HotelData | VipData;

export class BookingItemFactory {
  /**
   * Factory Method: Create a BookingItem from JSON payload
   * @throws Error if type is unknown
   */
  static createItem(data: BookingItemData): BookingItem {
    switch (data.type) {
      case 'flight':
        return BookingItemFactory.createFlight(data);
      case 'hotel':
        return BookingItemFactory.createHotel(data);
      case 'vip':
        return BookingItemFactory.createVip(data);
      default:
        throw new Error(`Unknown booking item type: ${(data as any).type}`);
    }
  }

  private static createFlight(data: FlightData): Flight {
    return new Flight(
      data.flightNo,
      data.airline,
      data.origin,
      data.destination,
      new Date(data.departureTime),
      new Date(data.arrivalTime),
      data.basePrice,
      data.seatType || 'economy',
      data.itemId
    );
  }

  private static createHotel(data: HotelData): HotelRoom {
    return new HotelRoom(
      data.hotelName,
      data.roomType || 'standard',
      new Date(data.checkIn),
      new Date(data.checkOut),
      data.pricePerNight,
      data.location || '',
      data.rating || 4.0,
      data.amenities || [],
      data.imageUrl || '',
      data.itemId
    );
  }

  private static createVip(data: VipData): VipItem {
    return new VipItem(
      data.plan,
      data.title,
      data.basePrice,
      data.itemId
    );
  }

  /** Create multiple items from an array of data */
  static createItems(dataArray: BookingItemData[]): BookingItem[] {
    return dataArray.map(data => BookingItemFactory.createItem(data));
  }
}
