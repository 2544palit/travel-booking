import { User } from './User';

export type AccessLevel = 'moderator' | 'manager' | 'superadmin';

/**
 * Class: Admin (extends User)
 * Demonstrates: Inheritance
 */
export class Admin extends User {
  private _accessLevel: AccessLevel;

  constructor(
    name: string,
    email: string,
    passwordHash: string,
    accessLevel: AccessLevel = 'moderator',
    id?: string
  ) {
    super(name, email, passwordHash, id);
    this._accessLevel = accessLevel;
  }

  get accessLevel(): AccessLevel { return this._accessLevel; }

  getRole(): string { return 'admin'; }

  /** Check if admin can manage promotions */
  canManagePromotions(): boolean {
    return this._accessLevel === 'manager' || this._accessLevel === 'superadmin';
  }

  /** Check if admin can manage users */
  canManageUsers(): boolean {
    return this._accessLevel === 'superadmin';
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      accessLevel: this._accessLevel
    };
  }
}
