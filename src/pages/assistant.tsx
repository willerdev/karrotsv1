import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, increment, setDoc, getDoc } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI("AIzaSyAbR1c7IgMxOSHQ-jB-xB3TjtWi0bEOkbo");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface Message {
  content: string;
  sender: 'user' | 'ai';
}

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { content: `Hi ${userName} how can i help you today 😊`, sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchUserName();
    }
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserName = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserName(userData.name || 'there');
        setMessages([
          { content: `Hi ${userData.name || 'there'}, how can I help you today? 😊`, sender: 'ai' }
        ]);
      } else {
        setUserName('there');
        setMessages([
          { content: "Hi there, how can I help you today? 😊", sender: 'ai' }
        ]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = { content: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await model.generateContent(input);
      const aiMessage: Message = { content: result.response.text(), sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);

      // Update AIusers table
      const userRef = doc(db, 'AIusers', user.uid);
      await setDoc(userRef, {
        userId: user.uid,
        timesUsed: increment(1)
      }, { merge: true });

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = { content: 'Sorry, I encountered an error. Please try again.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-[600px] flex flex-col h-screen">
        <header className="bg-orange-500 text-white py-4 px-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Karrot AI</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[80%] ${
                message.sender === 'user' ? 'ml-auto bg-orange-500 text-white' : 'mr-auto bg-white text-gray-800'
              } rounded-lg p-3 shadow`}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 mb-11 bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
