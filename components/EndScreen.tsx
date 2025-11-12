
import React from 'react';
import { PhoneFrame } from './PhoneFrame';
import { ChatScreen } from './ChatScreen';
import { useAppContext } from '../AppContext';

export const EndScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { messages, clientName } = state;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center space-y-6 animate-fade-in">
      <div className="text-center bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-primary-green">Goed gedaan!</h1>
        <p className="text-warm-gray-700 mt-2">Je hebt je leerdoel voor dit gesprek behaald. Bekijk hieronder het gesprek om te reflecteren.</p>
      </div>
      <PhoneFrame>
        <ChatScreen
          messages={messages}
          isLoading={false}
          clientName={clientName}
          onSendMessage={() => {}} // No-op
          isReadOnly={true}
        />
      </PhoneFrame>
       <button
        onClick={() => dispatch({ type: 'NAVIGATE', payload: 'onderdeel3' })}
        className="w-full max-w-sm p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-transform transform hover:scale-105"
      >
        Afronden
      </button>
    </div>
  );
};
