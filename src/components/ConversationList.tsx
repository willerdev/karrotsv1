import React, { useState, useEffect } from 'react';
import { User } from '../types/User';

interface ConversationListProps {
  currentUser: User;
  onSelectConversation: (id: string) => void;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ currentUser, onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Mock API call to fetch conversations
    const fetchConversations = async () => {
      // Simulating an API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockConversations: Conversation[] = [
        { id: '1', name: 'Alice', lastMessage: 'Hey, how are you?' },
        { id: '2', name: 'Bob', lastMessage: 'Did you see the latest update?' },
        { id: '3', name: 'Charlie', lastMessage: 'Let\'s meet tomorrow.' },
      ];
      
      setConversations(mockConversations);
    };

    fetchConversations();
  }, []);

  return (
    <div className="conversation-list">
      <h2>Conversations for {currentUser.name}</h2>
      <ul>
        {conversations.map(conv => (
          <li key={conv.id} onClick={() => onSelectConversation(conv.id)}>
            <h3>{conv.name}</h3>
            <p>{conv.lastMessage}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
