export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isAdjusted?: boolean;
    feedback?: 'good' | 'bad' | null;
  }
  
  export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
  }
  