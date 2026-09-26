import { v4 as uuidv4 } from 'uuid';

/**
 * Class: Review
 * Traveler reviews for flights/hotels
 */
export class Review {
  private readonly _reviewId: string;
  private _travelerId: string;
  private _itemId: string;
  private _itemType: 'flight' | 'hotel';
  private _rating: number;
  private _comment: string;
  private _createdAt: Date;

  constructor(
    travelerId: string,
    itemId: string,
    itemType: 'flight' | 'hotel',
    rating: number,
    comment: string,
    reviewId?: string
  ) {
    this._reviewId = reviewId || uuidv4();
    this._travelerId = travelerId;
    this._itemId = itemId;
    this._itemType = itemType;
    this._rating = Math.min(Math.max(rating, 1), 5);
    this._comment = comment;
    this._createdAt = new Date();
  }

  get reviewId(): string { return this._reviewId; }
  get travelerId(): string { return this._travelerId; }
  get itemId(): string { return this._itemId; }
  get rating(): number { return this._rating; }
  get comment(): string { return this._comment; }

  toJSON(): object {
    return {
      reviewId: this._reviewId,
      travelerId: this._travelerId,
      itemId: this._itemId,
      itemType: this._itemType,
      rating: this._rating,
      comment: this._comment,
      createdAt: this._createdAt.toISOString()
    };
  }
}
