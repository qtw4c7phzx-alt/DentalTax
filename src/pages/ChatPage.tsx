import React from 'react';
import { ChatConsole } from '../components/ChatConsole';

export function ChatPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">AI Chat Console</h1>
      <ChatConsole />
    </div>
  );
}
