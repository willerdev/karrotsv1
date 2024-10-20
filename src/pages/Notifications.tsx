import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Message', description: 'You have a new message from John', icon: '💬' },
    { id: '2', title: 'Price Drop', description: 'The item you saved has dropped in price', icon: '💰' },
    { id: '3', title: 'New Follower', description: 'Sarah started following your shop', icon: '👤' },
  ]);

  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const deleteAllNotifications = () => {
    setNotifications([]);
    setShowDeleteOptions(false);
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
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
              <div className="text-2xl mr-4">{notification.icon}</div>
              <div className="flex-grow">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-gray-600">{notification.description}</p>
              </div>
              {showDeleteOptions && (
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;