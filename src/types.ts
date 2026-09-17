export interface AlbumPhotoItem {
  id: string;
  imageUrl: string;
  caption: string;
  date?: string;
  title?: string;
}

export interface CarouselPhotoItem {
  id: string;
  imageUrl: string;
  caption?: string;
  date?: string;
  slotIndex?: number;
}

export interface ExtraPhotoConfig {
  imageUrl: string;
  title?: string;
  caption?: string;
}

export interface RelationshipConfig {
  partnerName: string;
  photoHeaderTitle?: string;
  startDate: string; // ISO date string e.g. "2024-10-24T00:15:00"
  displayDateText: string; // e.g. "24 setembro 2025" or custom
  declarationSubtitle: string; // e.g. "Eu te amooooo 🤍🤍🤍"
  photoUrl: string;
  scratchPhotoUrl?: string;
  scratchPhotoScale?: number;
  scratchPhotoOffsetY?: number;
  scratchPhotoOffsetX?: number;
  extraPhotoUrl?: string;
  extraPhotoTitle?: string;
  extraPhotoCaption?: string;
  albumPhotos?: AlbumPhotoItem[];
  letterGreeting: string;
  letterParagraphs: string[];
  letterClosing: string;
  letterEmojis: string;
  musicEnabled: boolean;
  floatingHeartsEnabled: boolean;
}

export interface HeartBalloonItem {
  id: string;
  title: string;
  color: string;
  phrase: string;
}

export interface TenThingsReasonItem {
  id: string;
  number: number;
  text: string;
}

export interface TimeElapsed {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
}
