export interface Vendor {
  _id?: string;
  name: string;
  category: string;
  city: string;
  description: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  images: string[];
  phone: string;
  email: string;
  instagram: string;
  verified: boolean;
}