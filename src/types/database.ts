export interface UserPreferences {
  id: string;
  user_id: string;
  language: 'IT' | 'EN';
  reading_tone: 'soft' | 'pragmatic' | 'spiritual' | 'direct';
  focus_areas: string[];
  experience_level: 'beginner' | 'intermediate';
  created_at: string;
  updated_at: string;
}

export interface TarotCard {
  id: number;
  name_en: string;
  name_it: string;
  arcana: 'major' | 'minor';
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
  number: number | null;
  court: 'page' | 'knight' | 'queen' | 'king' | null;
  keywords_en: string[];
  keywords_it: string[];
  upright_meaning_en: string;
  upright_meaning_it: string;
  reversed_meaning_en: string;
  reversed_meaning_it: string;
  image_url: string | null;
}

export interface Reading {
  id: string;
  user_id: string;
  question: string;
  spread_type: 'single' | 'three_card' | 'celtic_cross';
  interpretation: Record<string, unknown>;
  notes: string;
  mood: number | null;
  seed: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingCard {
  id: string;
  reading_id: string;
  card_id: number;
  position: number;
  position_name: string;
  is_reversed: boolean;
  created_at: string;
  card?: TarotCard;
}

export interface Customer {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  plan_type: 'free' | 'basic' | 'premium';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditLedger {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'subscription' | 'usage' | 'bonus' | 'refund' | 'signup';
  description: string;
  reference_id: string | null;
  balance_after: number;
  created_at: string;
}

export type SpreadType = 'single' | 'three_card' | 'celtic_cross';

export interface SpreadPosition {
  index: number;
  name_en: string;
  name_it: string;
  description_en: string;
  description_it: string;
}

export const SPREAD_POSITIONS: Record<SpreadType, SpreadPosition[]> = {
  single: [
    { index: 0, name_en: 'The Card', name_it: 'La Carta', description_en: 'Your guidance for this moment', description_it: 'La tua guida per questo momento' }
  ],
  three_card: [
    { index: 0, name_en: 'Past', name_it: 'Passato', description_en: 'What influences you from the past', description_it: 'Cosa ti influenza dal passato' },
    { index: 1, name_en: 'Present', name_it: 'Presente', description_en: 'Your current situation', description_it: 'La tua situazione attuale' },
    { index: 2, name_en: 'Future', name_it: 'Futuro', description_en: 'Potential direction', description_it: 'Direzione potenziale' }
  ],
  celtic_cross: [
    { index: 0, name_en: 'Present', name_it: 'Presente', description_en: 'Your current situation', description_it: 'La tua situazione attuale' },
    { index: 1, name_en: 'Challenge', name_it: 'Sfida', description_en: 'What crosses you', description_it: 'Cosa ti attraversa' },
    { index: 2, name_en: 'Foundation', name_it: 'Fondamento', description_en: 'The basis of the matter', description_it: 'La base della questione' },
    { index: 3, name_en: 'Recent Past', name_it: 'Passato Recente', description_en: 'What is passing away', description_it: 'Cosa sta passando' },
    { index: 4, name_en: 'Crown', name_it: 'Corona', description_en: 'What could be achieved', description_it: 'Cosa potrebbe essere raggiunto' },
    { index: 5, name_en: 'Near Future', name_it: 'Futuro Prossimo', description_en: 'What is coming', description_it: 'Cosa sta arrivando' },
    { index: 6, name_en: 'Self', name_it: 'Te Stesso', description_en: 'How you see yourself', description_it: 'Come ti vedi' },
    { index: 7, name_en: 'Environment', name_it: 'Ambiente', description_en: 'External influences', description_it: 'Influenze esterne' },
    { index: 8, name_en: 'Hopes & Fears', name_it: 'Speranze e Paure', description_en: 'Your inner feelings', description_it: 'I tuoi sentimenti interiori' },
    { index: 9, name_en: 'Outcome', name_it: 'Risultato', description_en: 'Potential outcome', description_it: 'Risultato potenziale' }
  ]
};
