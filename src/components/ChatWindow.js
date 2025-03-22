import React, { useEffect, useRef } from 'react';

function ChatWindow({ messages, isLoading, darkMode }) {
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  return (
    <div
      ref={chatRef}
      className={`chat-window p-6 rounded-xl shadow-lg flex-grow overflow-y-auto mb-3 border ${
        darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-black border-blue-200'
      }`}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.sender === 'ai' && (
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white mr-2">AI</div>
          )}
          <span
            className={`inline-block p-3 rounded-lg ${
              msg.sender === 'user'
                ? 'bg-blue-100 text-blue-800'
                : darkMode
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {msg.text}
          </span>
        </div>
      ))}
      {isLoading && (
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;