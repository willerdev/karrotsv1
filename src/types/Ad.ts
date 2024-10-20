export interface Ad {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'used';
  negotiable: boolean;
  images: string[];
  location: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'sold' | 'unavailable';
  views: number;
  savedBy: string[];
  isVip?: boolean;
}
