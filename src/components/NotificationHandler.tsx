import React, { useEffect, useState } from 'react';
import useFcmToken from '../hooks/useFcmToken';
import { useAuth } from '../contexts/AuthContext';

const NotificationHandler: React.FC = () => {
  const { user } = useAuth();
  const { token, notificationPermissionStatus } = useFcmToken();
  const [displayToken, setDisplayToken] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setDisplayToken(token);
      console.log('Firebase Cloud Messaging Token:', token);
    }
  }, [token]);

  if (!user || !token) return null;

  return (
    <div className="max-w-xl mx-auto mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">FCM Token:</h3>
      <p className="break-all text-sm font-mono bg-white p-2 rounded border">
        {displayToken}
      </p>
    </div>
  );
};

export default NotificationHandler;
