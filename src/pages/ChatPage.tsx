import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Conversation } from '../types/Conversation';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getUserById } from '../services/userService';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [adTitles, setAdTitles] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedConversations: Conversation[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));

      // Fetch user names and ad titles
      const names: { [key: string]: string } = {};
      const titles: { [key: string]: string } = {};

      for (const conv of fetchedConversations) {
        const otherUserId = conv.participants.find(id => id !== user.uid);
        if (otherUserId && !names[otherUserId]) {
          const userData = await getUserById(otherUserId);
          names[otherUserId] = userData?.name || 'Unknown User';
        }

        // Fetch ad title if conversation has adId
        if (conv.adId) {
          const adRef = doc(db, 'ads', conv.adId);
          const adDoc = await getDoc(adRef);
          if (adDoc.exists()) {
            titles[conv.id] = adDoc.data().title || 'Unknown Ad';
          }
        }
      }

      setUserNames(names);
      setAdTitles(titles);
      setConversations(fetchedConversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredConversations = conversations.filter(conv => {
    if (!user) return false;
    const otherUserId = conv.participants.find(id => id !== user.uid);
    return userNames[otherUserId || '']?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {filteredConversations.map((conv) => {
            const otherUserId = conv.participants.find(id => id !== user?.uid);
            const userName = userNames[otherUserId || ''];
            
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4"
              >
                <Link to={`/chat/${conv.id}`} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-semibold">
                    {userName?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {adTitles[conv.id] 
                        ? `${adTitles[conv.id]} - ${new Date(conv.updatedAt?.toDate()).toLocaleDateString()}`
                        : userName
                      }
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'Resume chat'}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
