import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract Class: User
 * Base class for all user types (Traveler, Admin)
 * Demonstrates: Abstraction, Encapsulation
 */
export abstract class User {
  protected readonly _id: string;
  protected _name: string;
  protected _email: string;
  protected _passwordHash: string;
  protected _createdAt: Date;

  constructor(name: string, email: string, passwordHash: string, id?: string) {
    this._id = id || uuidv4();
    this._name = name;
    this._email = email;
    this._passwordHash = passwordHash;
    this._createdAt = new Date();
  }

  // Getters (Encapsulation)
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
  get createdAt(): Date { return this._createdAt; }

  // Setters with validation
  set name(value: string) {
    if (!value || value.trim().length === 0) throw new Error('Name cannot be empty');
    this._name = value.trim();
  }

  set email(value: string) {
    if (!value || !value.includes('@')) throw new Error('Invalid email format');
    this._email = value.toLowerCase().trim();
  }

  /** Abstract method - each user type must define their role */
  abstract getRole(): string;

  /** Convert to safe JSON (no password) */
  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this.getRole(),
      createdAt: this._createdAt.toISOString()
    };
  }
}
