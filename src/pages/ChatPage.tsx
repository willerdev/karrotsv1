import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { Conversation } from '../types/Conversation';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { User as ChatUser } from '../types/User';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedConversations: Conversation[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      setConversations(fetchedConversations);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return <div>Please log in to view your chats.</div>;

  const chatUser: ChatUser = {
    id: user.uid,
    uid: user.uid,
    name: user.displayName || 'Anonymous',
    email: user.email || '',
    createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date(),
    updatedAt: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime) : new Date(),
    // Add the missing properties
    darkModeEnabled: false, // Default value
    notificationSettings: {
      email: false,
      push: false,
      sms: false
    }, // Default all to false
    savedAds: [], // Default empty array
    postedAds: [], // Default empty array
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-orange-100">
      <ChatList conversations={conversations} />
      <ChatWindow currentUser={chatUser} />
    </div>
  );
};

export default ChatPage;
