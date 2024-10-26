import React from 'react';
import AIChat from '../components/Aichat';

const ChatPage: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat with AI</h1>
      <AIChat />
    </div>
  );
};

export default ChatPage;