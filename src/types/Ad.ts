export interface Ad {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string | null;
  condition: "new" | "used" | "refurbished" | "used_s_class" | "used_a_class" | "used_b_grade" | "used_cracked" | "for_parts";
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
