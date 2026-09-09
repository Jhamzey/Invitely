export interface Review {
  _id?: string;
  vendorId: string;
  hostId: string;
  hostName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}