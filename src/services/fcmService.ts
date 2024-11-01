import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const messaging = getMessaging(app);

export const requestNotificationPermission = async (userId: string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BJJTN0Na3Ob0e322cEsQDgvs6Hka6wB5Oe84TiJzV9vAf_gh5zRgge4IlmXnJQxtdYFA7-TYdoZIUNj2zsxEuxM"
      });

   //   console.log('FCM Registration Token:', token); // Add this line to log the token

      // Save the token to the user's document
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fcmToken: token,
        notificationSettings: {
          push: true
        }
      });

      return token;
    }
    
    throw new Error("Notification permission denied");
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    throw error;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
