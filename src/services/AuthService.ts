import { hashSync, compareSync } from 'bcryptjs';
import { supabase } from '../config/supabase';
import { UnauthorizedException } from '../exceptions/DomainException';
import { Traveler } from '../models/Traveler';

export class AuthService {

  static async register(
    name: string,
    email: string,
    password: string,
    _phone?: string
  ): Promise<{ user: object; token: string }> {
    const { data: existing } = await supabase
      .from('travelers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = hashSync(password, 10);
    
    const { data: newTraveler, error } = await supabase
      .from('travelers')
      .insert([
        { 
          name, 
          email, 
          password: passwordHash,
          tier: 'Member',
          points: 500
        }
      ])
      .select()
      .single();

    if (error || !newTraveler) {
      throw new Error('Failed to create traveler: ' + error?.message);
    }

    const travelerObj = new Traveler(newTraveler.name, newTraveler.email, newTraveler.password, newTraveler.id);
    (travelerObj as any)._loyaltyPoints = newTraveler.points;
    (travelerObj as any)._tier = 'Member';

    const token = Buffer.from(newTraveler.id).toString('base64');

    return {
      user: travelerObj.toJSON(),
      token
    };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: object; token: string }> {
    const { data: traveler, error } = await supabase
      .from('travelers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !traveler) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = compareSync(password, traveler.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const travelerObj = new Traveler(traveler.name, traveler.email, traveler.password, traveler.id);
    (travelerObj as any)._loyaltyPoints = traveler.points;
    
    let actualTier = 'Member';
    if (traveler.points >= 10000) actualTier = 'Platinum';
    else if (traveler.points >= 5000) actualTier = 'Gold';
    else if (traveler.points >= 2000) actualTier = 'Silver';
    (travelerObj as any)._tier = actualTier;

    const token = Buffer.from(traveler.id).toString('base64');

    return {
      user: travelerObj.toJSON(),
      token
    };
  }

  static async getMe(token: string): Promise<object | null> {
    try {
      const travelerId = Buffer.from(token, 'base64').toString('utf8');
      const { data: traveler, error } = await supabase
        .from('travelers')
        .select('*')
        .eq('id', travelerId)
        .maybeSingle();
        
      if (error || !traveler) return null;

      const travelerObj = new Traveler(traveler.name, traveler.email, traveler.password, traveler.id);
      (travelerObj as any)._loyaltyPoints = traveler.points;

      let actualTier = 'Member';
      if (traveler.points >= 10000) actualTier = 'Platinum';
      else if (traveler.points >= 5000) actualTier = 'Gold';
      else if (traveler.points >= 2000) actualTier = 'Silver';
      (travelerObj as any)._tier = actualTier;

      return travelerObj.toJSON();
    } catch (err) {
      return null;
    }
  }
}
