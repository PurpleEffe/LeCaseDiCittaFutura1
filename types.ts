export interface User {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: 'user' | 'admin';
}

export interface House {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  capacity: number;
  images: string[];
  amenities: string[];
  blockedDates: string[]; // YYYY-MM-DD format
}

export interface Reservation {
  id: number;
  houseId: number;
  houseName: string;
  userId: number;
  guestName: string;
  guestEmail: string;
  checkIn: string; // YYYY-MM-DD format
  checkOut: string; // YYYY-MM-DD format
  guests: number;
  message: string;
  status: 'pending' | 'confirmed' | 'rejected';
}