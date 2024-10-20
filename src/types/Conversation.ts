export interface Conversation {
    id: string;
    participants: string[];
    otherUser?: {
      name: string;
    };
    lastMessage?: string;
    updatedAt?: any; // Consider using a more specific type for dates
    unreadCount: number;

  }
