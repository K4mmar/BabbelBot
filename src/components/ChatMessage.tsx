import React from 'react';
import type { Message } from '../types';
import { DoubleCheckIcon, EyeIcon } from './IconComponents';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {message.nonVerbalCue && !isUser && (
        <div className="mb-2 px-3 py-2 text-sm text-warm-gray-700 bg-warm-gray-100 border border-warm-gray-200 rounded-xl max-w-xs md:max-w-md lg:max-w-lg flex items-start space-x-2 shadow-sm">
            <EyeIcon className="w-5 h-5 text-warm-gray-500 flex-shrink-0 mt-0.5" />
            <span>{message.nonVerbalCue}</span>
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-xl shadow-sm ${
          isUser
            ? 'bg-primary-green-light rounded-br-none'
            : 'bg-white rounded-bl-none'
        }`}
      >
        <p className="text-sm text-warm-gray-800 break-words">{message.text}</p>
        <div className="flex justify-end items-center mt-1">
          <span className="text-xs text-warm-gray-500 mr-1">{message.timestamp}</span>
          {isUser && <DoubleCheckIcon className="w-4 h-4 text-blue-500" />}
        </div>
      </div>
    </div>
  );
};