import { Booking } from '../models/Booking';
import { BookingItemFactory, BookingItemData } from '../patterns/BookingItemFactory';
import { findPromoByCode, eventManager, flights, hotelRooms } from '../data/seedData';
import { NotFoundException, InvalidPromotionException } from '../exceptions/DomainException';
import { supabase } from '../config/supabase';

// Helper to hydrate Booking model from DB JSON
function hydrateBooking(dbData: any): Booking {
  const booking = new Booking(dbData.traveler_id, 'user@example.com', eventManager, dbData.booking_id);
  
  // State pattern needs to match string (case-insensitive)
  if (dbData.status?.toLowerCase() === 'confirmed') {
    booking.confirm('MIGRATED');
  } else if (dbData.status?.toLowerCase() === 'cancelled') {
    booking.cancel();
  }
  
  let rawItems = dbData.items || [];
  let promoCode = null;
  let discount = 0;
  let pointsDiscount = 0;
  let usedPoints = 0;
  
  // Extract metadata if exists
  const metaIndex = rawItems.findIndex((i: any) => i.type === 'metadata');
  if (metaIndex >= 0) {
    const meta = rawItems[metaIndex];
    promoCode = meta.promoCode;
    discount = meta.discount;
    pointsDiscount = meta.pointsDiscount || 0;
    usedPoints = meta.usedPoints || 0;
    rawItems.splice(metaIndex, 1);
  }
  
  const createdAt = dbData.created_at ? new Date(dbData.created_at) : undefined;
  booking.loadRawData(Number(dbData.total_price), rawItems, createdAt);
  
  // Apply discounts BEFORE recalculating total
  if (promoCode) {
    booking.applyDiscount(discount, promoCode);
  }
  if (usedPoints > 0) {
    booking.applyPointsDiscount(pointsDiscount, usedPoints);
  }
  
  booking.recalculateTotal();
  return booking;
}

export class BookingService {

  static async createBooking(travelerId: string, travelerEmail: string): Promise<Booking> {
    const booking = new Booking(travelerId, travelerEmail, eventManager);
    
    const { error } = await supabase.from('bookings').insert([{
      booking_id: booking.bookingId,
      traveler_id: travelerId,
      total_price: booking.totalPrice,
      status: 'pending',
      items: []
    }]);

    if (error) {
       console.error("Supabase insert error:", error);
       throw new Error("Failed to create booking in DB");
    }

    return booking;
  }

  static async getBooking(bookingId: string): Promise<Booking | null> {
    const { data, error } = await supabase.from('bookings').select('*').eq('booking_id', bookingId).maybeSingle();
    if (error || !data) return null;
    return hydrateBooking(data);
  }

  static async getBookingsByTraveler(travelerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('traveler_id', travelerId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(hydrateBooking);
  }

  static async updateBookingInDb(booking: Booking) {
    const itemsToSave = booking.items.map(i => typeof (i as any).toJSON === 'function' ? (i as any).toJSON() : i);
    
    // Inject metadata into items to preserve promo code and points discount since Supabase schema lacks the columns
    if (booking.promoCode || booking.usedPoints > 0) {
      itemsToSave.push({
        type: 'metadata',
        promoCode: booking.promoCode,
        discount: booking.discount,
        pointsDiscount: booking.pointsDiscount,
        usedPoints: booking.usedPoints
      } as any);
    }

    const { error } = await supabase.from('bookings').update({
      total_price: booking.totalPrice,
      status: booking.stateName,
      items: itemsToSave
    }).eq('booking_id', booking.bookingId);
    
    if (error) console.error("Supabase update error:", error);
  }

  static async addItemToBooking(bookingId: string, itemData: BookingItemData): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const item = BookingItemFactory.createItem(itemData);
    const rawItems = booking.items;
    rawItems.push(item as any);
    booking.loadRawData(0, rawItems);
    booking.recalculateTotal();
    
    await this.updateBookingInDb(booking);
    return booking;
  }

  static async addExistingItemToBooking(bookingId: string, itemId: string, itemType: string): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    let item;
    if (itemType === 'flight') item = flights.find(f => f.itemId === itemId);
    else if (itemType === 'hotel') item = hotelRooms.find(h => h.itemId === itemId);

    if (!item) throw new NotFoundException('Item not found');

    const rawItems = booking.items;
    rawItems.push(item as any);
    booking.loadRawData(0, rawItems);
    booking.recalculateTotal();
    
    await this.updateBookingInDb(booking);
    return booking;
  }

  static async applyPromoCode(bookingId: string, code: string): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const promo = findPromoByCode(code);
    if (!promo) throw new InvalidPromotionException('Promo code is invalid');

    const disc = promo.applyDiscount(booking.totalPrice);
    booking.applyDiscount(disc, code);
    await this.updateBookingInDb(booking);
    return booking;
  }

  static async cancelBooking(bookingId: string): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    booking.cancel();
    await this.updateBookingInDb(booking);
    return booking;
  }
}
