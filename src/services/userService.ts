import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "../types/User";

export const createUser = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, "users", userId);
    const newUser: User = {
      id: userId,
      name: userData.name || "",
      email: userData.email || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      darkModeEnabled: false,
      notificationSettings: {
        email: true,
        push: true,
        sms: false,
      },
      savedAds: [],
      postedAds: [],
      ...userData
    };

    await setDoc(userRef, newUser);
    console.log("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user profile. Please try again.");
  }
};
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      // Ensure the id field is set correctly
      return { ...userData, id: userId };
    } else {
      console.log("No user found with the given ID");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user data. Please try again.");
  }
};
export const updateNotificationSettings = async (userId: string, settings: User['notificationSettings']) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { notificationSettings: settings });
    console.log("Notification settings updated successfully");
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw new Error("Failed to update notification settings. Please try again.");
  }
};
