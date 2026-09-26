import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'email' | 'sms' | 'push';

/**
 * Class: Notification
 * System notifications (used by Observer Pattern)
 */
export class Notification {
  private readonly _notificationId: string;
  private _message: string;
  private _recipientEmail: string;
  private _type: NotificationType;
  private _sentAt: Date | null;
  private _read: boolean;

  constructor(
    message: string,
    recipientEmail: string,
    type: NotificationType = 'email',
    notificationId?: string
  ) {
    this._notificationId = notificationId || uuidv4();
    this._message = message;
    this._recipientEmail = recipientEmail;
    this._type = type;
    this._sentAt = null;
    this._read = false;
  }

  get notificationId(): string { return this._notificationId; }
  get message(): string { return this._message; }
  get recipientEmail(): string { return this._recipientEmail; }
  get type(): NotificationType { return this._type; }
  get sentAt(): Date | null { return this._sentAt; }
  get read(): boolean { return this._read; }

  /** Send the notification (simulated) */
  send(): void {
    console.log(`[${this._type.toUpperCase()}] To: ${this._recipientEmail} | ${this._message}`);
    this._sentAt = new Date();
  }

  markAsRead(): void { this._read = true; }

  toJSON(): object {
    return {
      notificationId: this._notificationId,
      message: this._message,
      recipientEmail: this._recipientEmail,
      type: this._type,
      sentAt: this._sentAt?.toISOString() || null,
      read: this._read
    };
  }
}
