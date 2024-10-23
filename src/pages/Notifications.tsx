import React, { useState, useEffect } from 'react';
import { Trash2, Carrot, X } from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  details: string;
  status: boolean;
  dateCreated: Date;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('dateCreated', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedNotifications: Notification[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateCreated: doc.data().dateCreated.toDate()
      } as Notification));

      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    setShowDeleteOptions(false);
  };

  const dismissNotification = async (id: string) => {
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { status: true });
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button onClick={() => setShowDeleteOptions(!showDeleteOptions)}>
          <Trash2 size={24} className="text-gray-600" />
        </button>
      </div>

      {showDeleteOptions && (
        <div className="mb-4 flex justify-end space-x-2">
          <button
            onClick={deleteAllNotifications}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete All
          </button>
          <button
            onClick={() => setShowDeleteOptions(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="bg-white p-4 rounded shadow flex items-start">
              <div className="text-2xl mr-4">
                <Carrot size={24} className="text-orange-500" />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-gray-600">{notification.details}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {notification.dateCreated.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
