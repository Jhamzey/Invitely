export interface AppNotification {
  _id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}