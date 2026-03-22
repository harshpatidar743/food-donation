export type FoodCategory = "Veg" | "Non-veg";

export type QuantityUnit = "people" | "plates";
export type DonationStatus = "active" | "completed" | "expired";

export type DonationImage = {
  fileName: string;
  contentType: string;
  dataUrl: string;
};

export type Donation = {
  _id?: string;
  foodName?: string;
  foodType?: string;
  foodCategory?: FoodCategory;
  quantity: number;
  totalQuantity?: number;
  remainingQuantity?: number;
  quantityUnit?: QuantityUnit;
  status?: DonationStatus;
  foodPreparedTime?: string;
  availableUntil?: string;
  fullAddress?: string;
  location?: string;
  pincode?: string;
  contactNumber?: string;
  additionalNotes?: string;
  foodImage?: DonationImage;
  createdAt?: string;
  donorId?: {
    name?: string;
  } | string;
};
