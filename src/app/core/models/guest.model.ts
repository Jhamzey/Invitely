export interface Guest {
  _id?: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  tableNumber: number | null;
  seatNumber: number | null;
  mealChoice: string;
  rsvp: 'pending' | 'attending' | 'declined';
  arrived: boolean;
  arrivedAt?: string;
  qrCode: string;
  qrCodeImage: string;
  asoebiOrdered: string;
  asoebiPaid: boolean;
  inviteSent: boolean;
  uniqueToken: string;
  createdAt?: string;
}