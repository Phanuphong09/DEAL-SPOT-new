export interface PinnedLocation {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export interface Store {
  id: string;
  name: string;
  brand: '7-Eleven' | 'Lotus' | 'BigC' | 'Tops' | 'Gourmet' | 'Other';
  address: string;
  vicinity?: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  walkTimeMin?: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openHoursText: string;
  activeDealsCount: number;
  photoUrl?: string;
  isFollowing?: boolean;
  isRealGmp?: boolean;
  placeId?: string;
}

export interface Deal {
  id: string;
  title: string;
  brand: string;
  subtitle?: string;
  category: 'food' | 'beverages' | 'household' | 'health';
  storeId: string;
  storeName: string;
  storeLocationText: string;
  storeLat?: number;
  storeLng?: number;
  discountBadge: string; // e.g., "-40% OFF", "BUY 1 GET 1", "-50% OFF"
  discountPercent: number;
  price: number;
  originalPrice: number;
  savingAmount: number;
  stockText: string;
  stockCount: number;
  claimedPercent: number;
  expiresText: string;
  expiresSeconds: number; // For countdown
  imageUrl: string;
  imageAlt?: string;
  isFlash: boolean;
  isFavorited?: boolean;
  unit?: string;
  competitorPrices?: {
    storeName: string;
    brandType: '7' | 'L' | 'B' | 'T';
    distanceText: string;
    price: number;
    diffBadge: string; // "BEST DEAL", "-21%", "Standard"
    isBest?: boolean;
  }[];
}

export interface NotificationItem {
  id: string;
  type: 'flash' | 'price_drop' | 'store_clearance' | 'location';
  title: string;
  message: string;
  storeName?: string;
  timestampText: string;
  isRead: boolean;
  dealPreview?: {
    title: string;
    price: number;
    originalPrice: number;
    discountBadge: string;
    imageUrl: string;
    distanceText: string;
    expiresText: string;
  };
  highlightPill?: string;
  routeInfo?: string;
  isToday: boolean;
}

export interface AlertPreferences {
  minDiscountPercent: number;
  proximityRadiusKm: number;
  flashDealCountdowns: boolean;
  pushNotifications: boolean;
}
