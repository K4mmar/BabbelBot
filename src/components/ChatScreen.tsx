import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { SendIcon } from './IconComponents';
import type { Message } from '../types';

interface ChatScreenProps {
  messages: Message[];
  isLoading: boolean;
  clientName: string;
  onSendMessage: (messageText: string) => void;
  onUserTypingChange?: (isTyping: boolean) => void;
  isReadOnly?: boolean;
  isInputDisabled?: boolean;
  isInputHidden?: boolean;
  inputPlaceholder?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
    messages, 
    isLoading, 
    clientName, 
    onSendMessage,
    onUserTypingChange,
    isReadOnly = false, 
    isInputDisabled = false, 
    isInputHidden = false, 
    inputPlaceholder 
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading && !isInputDisabled) {
      onSendMessage(inputText);
      setInputText('');
      onUserTypingChange?.(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    onUserTypingChange?.(text.length > 0);
  };

  return (
    <div className="flex flex-col h-full bg-cover bg-[url('https://picsum.photos/800/1200?blur=1')]">
      <header className="bg-primary-green text-white p-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center">
            <div className="w-10 h-10 bg-warm-gray-300 rounded-full mr-3 overflow-hidden">
                <img src={`https://i.pravatar.cc/40?u=${clientName}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{clientName}</h2>
              <p className="text-xs text-primary-green-light">{isLoading ? 'typt...' : 'online'}</p>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-black bg-opacity-10 backdrop-blur-sm">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && !isReadOnly && (
          <div className="flex justify-start">
            <div className="max-w-xs px-3 py-2 rounded-xl shadow-sm bg-white rounded-bl-none">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {isReadOnly ? (
        <footer className="p-4 bg-warm-gray-100 text-center">
            <p className="text-sm text-warm-gray-600 font-medium">Het gesprek is beëindigd.</p>
        </footer>
      ) : !isInputHidden ? (
        <footer className="p-2 bg-warm-gray-100 border-t border-warm-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={inputPlaceholder || (isInputDisabled ? "Wacht op de coach..." : "Typ een bericht")}
              className="flex-1 p-3 rounded-full bg-warm-gray-800 text-white placeholder-warm-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-accent-lime transition"
              disabled={isLoading || isInputDisabled}
            />
            <button
              type="submit"
              className="bg-primary-green text-white p-3 rounded-full hover:bg-primary-green-dark disabled:bg-warm-gray-400 transition-colors duration-200"
              disabled={isLoading || !inputText.trim() || isInputDisabled}
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </footer>
      ) : null}
    </div>
  );
};