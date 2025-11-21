import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Loader2 } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { translations } from '../utils/translations';

interface ChatAssistantProps {
  language: Language;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ language }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t.assistant.initialMsg,
      timestamp: new Date(),
    },
  ]);
  
  // Update initial message if language changes and it's the only message
  useEffect(() => {
      setMessages(prev => {
          if (prev.length === 1 && prev[0].id === 'welcome') {
              return [{
                  id: 'welcome',
                  role: 'model',
                  text: t.assistant.initialMsg,
                  timestamp: new Date(),
              }];
          }
          return prev;
      });
  }, [language, t.assistant.initialMsg]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare history for the service
    const history = messages.map(m => ({ role: m.role, text: m.text }));

    const responseText = await generateChatResponse(history, userMsg.text, language);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-3 shadow-md z-10">
        <div className="bg-white/20 p-2 rounded-full">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold">{t.assistant.title}</h2>
          <p className="text-emerald-100 text-xs">{t.assistant.poweredBy}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-600' : 'bg-emerald-100 dark:bg-emerald-900'
              }`}
            >
              {msg.role === 'user' ? (
                <UserIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-600'
              }`}
            >
              {msg.text}
              <div className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
             </div>
             <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-600 shadow-sm flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t.assistant.thinking}</span>
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.assistant.placeholder}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;