import React, { useEffect, useRef } from 'react';

const ChatBox = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 rounded-xl shadow-inner border border-white/20 h-64 md:h-auto backdrop-blur-sm">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Start speaking to interact with your AI assistant.
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
              }`}
            >
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatBox;
