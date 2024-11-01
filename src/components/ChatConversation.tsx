import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Send, ArrowLeft, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: any;
  conversationId: string;
}

interface Ad {
  title: string;
  // ... other ad properties
}

interface Conversation {
  adId: string;
  updatedAt: any;
  // ... other conversation properties
}

const ChatConversation = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ad, setAd] = useState<Ad | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message))
        .filter(msg => msg.conversationId === conversationId);
      setMessages(fetchedMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribeConv = onSnapshot(doc(db, 'conversations', conversationId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setConversation(docSnapshot.data() as Conversation);
        
        const docData = docSnapshot.data();
        const adRef = doc(db, 'ads', docData.adId);
        getDoc(adRef).then((adDoc) => {
          if (adDoc.exists()) {
            setAd(adDoc.data() as Ad);
          }
        });
      }
    });

    return () => unsubscribeConv();
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        content: newMessage,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/product/${conversation?.adId}`;
      await navigator.clipboard.writeText(shareUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gray-50">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/chat" className="mr-4">
            <ArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold">
            {ad?.title} {conversation?.updatedAt && 
              `- ${conversation.updatedAt.toDate().toLocaleDateString()}`
            }
          </h1>
        </div>
        <div className="flex items-center space-x-2 relative">
          <Link
            to={`/product/${conversation?.adId}`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ExternalLink size={20} />
          </Link>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Share2 size={20} />
          </button>
          {showShareTooltip && (
            <div className="absolute right-0 top-full mt-2 bg-black text-white text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap">
              Link copied to clipboard!
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="h-full overflow-y-auto pr-2"
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 mb-2 ${
                  message.senderId === user?.uid
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-800'
                } shadow-sm`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.createdAt?.toDate().toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </motion.div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t mb-safe">
        <div className="flex space-x-2 pb-8">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatConversation;
