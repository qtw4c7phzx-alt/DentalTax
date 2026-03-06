import { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useStore } from '../store';
import { Input, Button } from './ui';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// very simple heuristics-based "AI" that looks at the seed data
function generateBotReply(query: string): string {
  const store = useStore.getState();
  const q = query.toLowerCase();

  // some simple keywords-based responses
  if (q.includes('tenant')) {
    const names = store.tenants.map(t => t.name).join(', ');
    return `There are ${store.tenants.length} tenant(s) on the platform: ${names}.`;
  }

  if (q.includes('user')) {
    const names = store.users.map(u => u.name).join(', ');
    return `Currently ${store.users.length} user(s) exist: ${names}.`;
  }

  if (q.includes('envelope')) {
    const open = store.envelopes.filter(e => e.state === 'open').length;
    return `${store.envelopes.length} envelope(s) in total, ${open} open.`;
  }

  if (q.includes('document')) {
    return `${store.documents.length} document(s) have been uploaded in the seed data.`;
  }

  if (q.includes('bank') && q.includes('transaction')) {
    return `There are ${store.bankAccounts.length} bank account(s) and ${store.transactions.length} transaction(s) seeded.`;
  }

  // generic search: look for the query term anywhere in the JSON of each collection
  const term = q.trim();
  if (term.length > 3) {
    const hits: string[] = [];
    const collections: { name: string; items: any[] }[] = [
      { name: 'tenants', items: store.tenants },
      { name: 'users', items: store.users },
      { name: 'envelopes', items: store.envelopes },
      { name: 'documents', items: store.documents },
      { name: 'bankAccounts', items: store.bankAccounts },
      { name: 'transactions', items: store.transactions },
      { name: 'matches', items: store.matches },
      { name: 'tickets', items: store.tickets },
      { name: 'customers', items: store.customers },
      { name: 'invoices', items: store.invoices },
    ];
    collections.forEach(col => {
      const matchCount = col.items.filter(i =>
        JSON.stringify(i).toLowerCase().includes(term)
      ).length;
      if (matchCount) {
        hits.push(`${matchCount} ${col.name}`);
      }
    });
    if (hits.length) {
      return `Search results: ${hits.join(', ')} contain "${term}".`;
    }
  }

  // fallback
  return "I'm a demo AI chat – ask me about tenants, users, envelopes, documents, bank data, etc.";
}

export function ChatConsole() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const addMessage = (msg: ChatMessage) => {
    setMessages(msgs => [...msgs, msg]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: uuid(), sender: 'user', text, timestamp: new Date().toISOString() };
    addMessage(userMsg);

    const botText = generateBotReply(text);
    const botMsg: ChatMessage = { id: uuid(), sender: 'bot', text: botText, timestamp: new Date().toISOString() };

    // simulate thinking delay
    setTimeout(() => addMessage(botMsg), 300);

    setInput('');
  };

  // scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 border rounded-lg"
        style={{ minHeight: '300px' }}
      >
        {messages.map(m => (
          <div
            key={m.id}
            className={
              m.sender === 'user'
                ? 'text-right'
                : 'text-left'
            }
          >
            <div
              className={
                `inline-block px-4 py-2 rounded-lg max-w-[80%] break-words ` +
                (m.sender === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200')
              }
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          className="flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} variant="primary">
          Send
        </Button>
      </div>
    </div>
  );
}
