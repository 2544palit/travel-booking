import { BookingItem } from './BookingItem';

export class VipItem extends BookingItem {
  private _plan: string;
  private _title: string;

  constructor(plan: string, title: string, basePrice: number, itemId?: string) {
    super(basePrice, itemId);
    this._plan = plan;
    this._title = title;
  }

  calculatePrice(): number {
    return this.basePrice;
  }

  calculateTax(): number {
    return this.basePrice * 0.07;
  }

  getDetails(): object {
    return {
      isVip: true,
      plan: this._plan,
      title: this._title
    };
  }

  getType(): string {
    return 'vip';
  }
}
