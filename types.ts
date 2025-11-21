
export enum UserRole {
  USER = 'user',
  COLLECTOR = 'collector',
  ADMIN = 'admin'
}

export type Language = 'en' | 'fr' | 'pt';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ecoCoins: number;
  avatarUrl?: string;
  language?: Language;
}

export interface WasteItem {
  type: 'plastic' | 'glass' | 'paper' | 'metal' | 'organic' | 'e-waste';
  weightKg?: number;
  quantity?: number; // e.g., number of bags
}

export interface PickupRequest {
  id: string;
  status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: string; // ISO date string
  items: WasteItem[];
  location: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export enum View {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PICKUP = 'PICKUP',
  HISTORY = 'HISTORY',
  ASSISTANT = 'ASSISTANT',
  REWARDS = 'REWARDS',
  SMART_BIN = 'SMART_BIN',
  MAP = 'MAP'
}
