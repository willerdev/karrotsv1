import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '../types/Message';
import { User } from '../types/User';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaImage, FaMapMarkerAlt, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

interface ChatWindowProps {
  currentUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser }) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message))
        .filter(message => message.conversationId === conversationId);
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageFile) return;

    try {
      let imageUrl = '';
      if (imageFile) {
        const storage = getStorage();
        const imageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: currentUser.uid,
        content: newMessage,
        imageUrl,
        createdAt: serverTimestamp(),
        readBy: [currentUser.uid]
      });

      setNewMessage('');
      setImageFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setNewMessage(`https://www.google.com/maps?q=${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const renderMessageContent = (content: string) => {
    const locationRegex = /https:\/\/www\.google\.com\/maps\?q=[-\d.]+,[-\d.]+/;
    if (locationRegex.test(content)) {
      return (
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          📍 View My Location
        </a>
      );
    }
    return <p>{content}</p>;
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-orange-50">
        <p className="text-xl text-orange-600 font-semibold">
          Please choose a chat to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Hide the header */}
      <div className="hidden">
        {/* Your header content goes here */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs ${message.senderId === currentUser.uid ? 'bg-orange-200 text-orange-900' : 'bg-white'} rounded-lg p-3`}>
              {message.imageUrl && (
                <img src={message.imageUrl} alt="Shared image" className="max-w-full h-auto rounded-lg mb-2" />
              )}
              {renderMessageContent(message.content)}
              <p className="text-xs text-gray-500 mt-1">
                {message.createdAt?.toDate().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="bg-orange-100 p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-grow p-3 rounded-full border-2 border-orange-300 focus:border-orange-500 focus:outline-none transition-all duration-300 ease-in-out"
          />
          <div className="flex space-x-2">
            <label className="cursor-pointer hover:scale-110 transition-transform duration-200">
              <FaImage className="text-orange-500 text-2xl hover:text-orange-600" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <FaMapMarkerAlt
              className="text-orange-500 text-2xl cursor-pointer hover:text-orange-600 hover:scale-110 transition-all duration-200"
              onClick={handleSendLocation}
            />
            <button
              type="submit"
              className="p-3 rounded-full bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <FaPaperPlane className="text-xl" />
            </button>
          </div>
        </div>
        {imageFile && (
          <div className="mt-3 animate-fadeIn">
            <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
              Image selected: {imageFile.name}
            </span>
          </div>
        )}
      </form>

      {/* Add padding at the bottom */}
      <div className="h-16"></div>
    </div>
  );
};

export default ChatWindow; // This line ensures it's a default export
