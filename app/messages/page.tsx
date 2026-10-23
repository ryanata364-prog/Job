'use client';
import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { mockConversations } from '@/lib/mockData';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';

export default function MessagesPage() {
  const [conversations] = useState(mockConversations);
  const [activeConv] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
          <div className="flex h-[600px] border border-gray-200 rounded-2xl overflow-hidden">
            <div className="w-80 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="space-y-1">
                {conversations.map(conv => (
                  <div key={conv.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${activeConv?.id === conv.id ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <Image width={40} height={40} src={conv.participantAvatar} alt={conv.participantName} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{conv.participantName}</div>
                        <div className="text-sm text-gray-500 truncate">{conv.lastMessage}</div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <Image width={40} height={40} src={activeConv?.participantAvatar || ''} alt={activeConv?.participantName || ''} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">{activeConv?.participantName}</div>
                  <div className="text-sm text-gray-500">{activeConv?.participantTitle}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv?.messages.map(msg => (
                  <div key={msg.id} className={`max-w-[70%] ${msg.senderId === 'u1' ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} p-3 rounded-xl`}>
                    <p className="text-sm">{msg.content}</p>
                    <div className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-600 text-sm"
                    onKeyDown={e => { if (e.key === 'Enter' && newMessage.trim()) { setNewMessage(''); } }} />
                  <button onClick={() => { if (newMessage.trim()) setNewMessage(''); }}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
