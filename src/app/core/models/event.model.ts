export interface Seat {
  seatNumber: number;
  guestId?: string;
  guestName?: string;
}

export interface Table {
  _id?: string;
  tableNumber: number;
  label: string;
  shape: 'round' | 'rectangular';
  capacity: number;
  seats: Seat[];
}

export interface Asoebi {
  name: string;
  price: number;
  description: string;
}

export interface Moment {
  _id?: string;
  eventId?: string;
  eventTitle?: string;
  imageUrl: string;
  caption: string;
  postedBy: string;
  likesCount: number;
  liked?: boolean;
  commentsCount: number;
  comments?: { authorName: string; text: string; createdAt: string }[];
  createdAt: string;
}

export interface Event {
  _id?: string;
  hostId: string;
  type: 'wedding' | 'birthday' | 'conference' | 'owambe' | 'traditional' | 'other';
  title: string;
  coupleNames: string;
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  venueLat?: number;
  venueLng?: number;
  dressCode: string;
  accentColor: string;
  theme: string;
  font: string;
  language: string;
  coverImage: string;

  giftEnabled: boolean;
  giftMessage: string;

  customBgColor?: string;
  customTextColor?: string;

  asoebi: Asoebi[];
  meals: { name: string }[];
  tables: Table[];
  moments: Moment[];
  published: boolean;
  slug: string;
  createdAt?: string;
}