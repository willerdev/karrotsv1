import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Conversation } from '../types/Conversation';
import { getUserById } from '../services/userService';

interface ChatListProps {
  conversations: Conversation[];
}

const ChatList: React.FC<ChatListProps> = ({ conversations }) => {
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchUserNames = async () => {
      const names: { [key: string]: string } = {};
      for (const conv of conversations) {
        const otherUserId = conv.participants[1];
        if (!names[otherUserId]) {
          const user = await getUserById(otherUserId);
          names[otherUserId] = user?.name || 'Unknown User';
        }
      }
      setUserNames(names);
    };

    fetchUserNames();
  }, [conversations]);

  if (!conversations || conversations.length === 0) {
    return <div>No conversations available.</div>;
  }

  return (
    <div className="w-full md:w-1/3 bg-orange-500 text-white p-4 hidden md:block md:w-1/3 lg:w-1/4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Messages ({conversations.length})</h1>
      </div>
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        {conversations.map((conv) => (
          <Link key={conv.id} to={`/chat/${conv.id}`}>
            <div className="flex items-center space-x-3 cursor-pointer py-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">
                {userNames[conv.participants[1]]?.split(' ').map(n => n[0]).join('') || '?'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-semibold">{userNames[conv.participants[1]] || 'Unknown'}</span>
                  <span className="text-xs">{conv.updatedAt?.toDate().toLocaleString() || ''}</span>
                </div>
                <p className="text-sm text-orange-200 truncate">{conv.lastMessage || 'Click to view Message'}</p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="bg-white text-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {conv.unreadCount}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
