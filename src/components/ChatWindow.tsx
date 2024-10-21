import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '../types/Message';
import { User } from '../types/User';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaImage, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

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

      <form onSubmit={handleSendMessage} className="bg-orange-100 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="w-[70%] p-2 rounded-md"
          />
          <label className="cursor-pointer">
            <FaImage className="text-orange-500 text-xl" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          <FaMapMarkerAlt
            className="text-orange-500 text-xl cursor-pointer"
            onClick={handleSendLocation}
          />
          <button type="submit" className="p-2 rounded-full bg-orange-500 text-white">
            Send
          </button>
        </div>
        {imageFile && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Image selected: {imageFile.name}</span>
          </div>
        )}
      </form>

      {/* Add padding at the bottom */}
      <div className="h-16"></div>
    </div>
  );
};

export default ChatWindow; // This line ensures it's a default export
