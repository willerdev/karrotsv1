export interface User {
  uid: string;
  id: string;  // This will be the Firebase Auth UID
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  paymentMethods?: string[];
  shopName?: string;
  darkModeEnabled: boolean;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  savedAds: string[];  // Array of ad IDs that the user has saved
  postedAds: string[];  // Array of ad IDs that the user has posted
  isVerified?: boolean;
}
