import { User } from './User';

export interface SavedCard {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface PointHistory {
  date: Date;
  desc: string;
  points: number;
}

/**
 * Class: Traveler (extends User)
 * Demonstrates: Inheritance, Encapsulation
 */
export class Traveler extends User {
  private _loyaltyPoints: number;
  private _savedCards: SavedCard[];
  private _tier: 'Member' | 'Silver' | 'Gold' | 'Platinum';
  private _pointHistory: PointHistory[];

  constructor(
    name: string,
    email: string,
    passwordHash: string,
    id?: string,
    loyaltyPoints: number = 0
  ) {
    super(name, email, passwordHash, id);
    this._loyaltyPoints = loyaltyPoints;
    this._savedCards = [];
    this._pointHistory = [];
    this._tier = this.calculateTier();
  }

  get loyaltyPoints(): number { return this._loyaltyPoints; }
  get savedCards(): SavedCard[] { return [...this._savedCards]; }
  get tier(): string { return this._tier; }
  get pointHistory(): PointHistory[] { return [...this._pointHistory].reverse(); } // Newest first

  getRole(): string { return 'traveler'; }

  /** Add loyalty points with optional multiplier and history record */
  addPoints(points: number, desc: string = 'รับคะแนน', applyMultiplier: boolean = false): void {
    if (points < 0) throw new Error('Points cannot be negative');
    
    let earned = points;
    if (applyMultiplier) {
      if (this._tier === 'Silver') earned = Math.floor(points * 1.2);
      else if (this._tier === 'Gold') earned = Math.floor(points * 1.5);
      else if (this._tier === 'Platinum') earned = Math.floor(points * 2.0);
    }

    this._loyaltyPoints += earned;
    this._pointHistory.push({ date: new Date(), desc, points: earned });
    this._tier = this.calculateTier();
  }

  /** Redeem points (returns true if successful) */
  redeemPoints(points: number, desc: string = 'ใช้คะแนนแลกส่วนลด'): boolean {
    if (points > this._loyaltyPoints) return false;
    this._loyaltyPoints -= points;
    this._pointHistory.push({ date: new Date(), desc, points: -points });
    this._tier = this.calculateTier();
    return true;
  }

  /** Add a saved payment card */
  addCard(card: SavedCard): void {
    this._savedCards.push(card);
  }

  private calculateTier(): 'Member' | 'Silver' | 'Gold' | 'Platinum' {
    if (this._loyaltyPoints >= 10000) return 'Platinum';
    if (this._loyaltyPoints >= 5000) return 'Gold';
    if (this._loyaltyPoints >= 2000) return 'Silver';
    return 'Member';
  }

  // Calculate points needed for next tier
  getNextTierInfo(): { nextTier: string, pointsNeeded: number } | null {
    if (this._loyaltyPoints < 2000) return { nextTier: 'Silver', pointsNeeded: 2000 - this._loyaltyPoints };
    if (this._loyaltyPoints < 5000) return { nextTier: 'Gold', pointsNeeded: 5000 - this._loyaltyPoints };
    if (this._loyaltyPoints < 10000) return { nextTier: 'Platinum', pointsNeeded: 10000 - this._loyaltyPoints };
    return null; // Already max tier
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      loyaltyPoints: this._loyaltyPoints,
      tier: this._tier,
      savedCards: this._savedCards,
      pointHistory: this.pointHistory,
      nextTierInfo: this.getNextTierInfo()
    };
  }
}
