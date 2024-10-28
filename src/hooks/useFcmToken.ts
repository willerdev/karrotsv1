import { useEffect, useRef, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getMessaging } from "firebase/messaging";
import { app } from "../firebase";

const messaging = getMessaging(app);

async function getNotificationPermissionAndToken() {
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  if (Notification.permission === "granted") {
    return await getToken(messaging, {
      vapidKey: "BJJTN0Na3Ob0e322cEsQDgvs6Hka6wB5Oe84TiJzV9vAf_gh5zRgge4IlmXnJQxtdYFA7-TYdoZIUNj2zsxEuxM"
    });
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await getToken(messaging, {
        vapidKey: "BJJTN0Na3Ob0e322cEsQDgvs6Hka6wB5Oe84TiJzV9vAf_gh5zRgge4IlmXnJQxtdYFA7-TYdoZIUNj2zsxEuxM"
      });
    }
  }

  console.log("Notification permission not granted.");
  return null;
}

const useFcmToken = () => {
  const navigate = useNavigate();
  const [notificationPermissionStatus, setNotificationPermissionStatus] = 
    useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false);

  const loadToken = async () => {
    if (isLoading.current) return;

    isLoading.current = true;
    const token = await getNotificationPermissionAndToken();

    if (Notification.permission === "denied") {
      setNotificationPermissionStatus("denied");
      isLoading.current = false;
      return;
    }

    if (!token) {
      if (retryLoadToken.current >= 3) {
        console.error("Unable to load token after 3 retries");
        isLoading.current = false;
        return;
      }

      retryLoadToken.current += 1;
      isLoading.current = false;
      await loadToken();
      return;
    }

    setNotificationPermissionStatus(Notification.permission);
    setToken(token);
    isLoading.current = false;
  };

  useEffect(() => {
    if ("Notification" in window) {
      loadToken();
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      if (Notification.permission !== "granted") return;

      const link = payload.fcmOptions?.link || payload.data?.link;

      toast(payload.notification?.body || "New notification", {
        duration: 5000,
        icon: '🔔',
        onClick: () => {
          if (link) {
            navigate(link);
          }
        },
      });

      const n = new Notification(payload.notification?.title || "New message", {
        body: payload.notification?.body || "You have a new message",
        data: link ? { url: link } : undefined,
      });

      n.onclick = (event) => {
        event.preventDefault();
        const link = (event.target as any)?.data?.url;
        if (link) {
          navigate(link);
        }
      };
    });

    return () => unsubscribe();
  }, [token, navigate]);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
