export interface Donation {
  _id: string;
  donorId: string | {
    _id: string;
    name: string;
  };
  foodType?: string;
  foodName: string;
  foodCategory: 'Veg' | 'Non-veg';
  quantity: number;
  totalQuantity: number;
  remainingQuantity: number;
  quantityUnit: 'plates' | 'people';
  status: 'active' | 'completed' | 'expired';
  foodPreparedTime: string;
  availableUntil: string;
  lat?: number;
  lng?: number;
  area?: string;
  city?: string;
  state?: string;
  location: string;
  fullAddress: string;
  pincode?: string;
  contactNumber: string;
  foodImage?: {
    fileName: string;
    contentType: string;
    dataUrl: string;
  };
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchDonation extends Donation {
  routeInfo?: {
    routeTimeMin: number;
    routeDistanceKm: number;
    walkingTimeMin: number;
    walkingDistanceKm: number;
    error?: string;
  };
}

export type FoodCategory = 'Veg' | 'Non-veg';

export interface RouteInfo {
  routeTimeMin: number;
  routeDistanceKm: number;
  walkingTimeMin: number;
  walkingDistanceKm: number;
  error?: string;
}
export type QuantityUnit = 'plates' | 'people';
