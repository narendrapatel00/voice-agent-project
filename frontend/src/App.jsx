import React, { useState, useEffect } from 'react';
import VoiceInput from './components/VoiceInput';
import ChatBox from './components/ChatBox';
import TodoList from './components/TodoList';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [todos, setTodos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google'));
      if (englishVoice) utterance.voice = englishVoice;
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-speech not supported.");
    }
  };

  const handleMessageSent = async (messageText) => {
    // Add user message to UI
    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      const data = await response.json();
      
      // Add agent reply to UI
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'agent', text: data.reply }]);
        speakText(data.reply);
      }

      // Refresh todos in case they were modified
      fetchTodos();

    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages(prev => [...prev, { sender: 'agent', text: 'Sorry, I encountered an error connecting to the server.' }]);
      speakText("Sorry, I encountered an error connecting to the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Chat and Voice Input */}
        <div className="md:col-span-2 flex flex-col space-y-6 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-6 md:p-8 h-[80vh]">
          
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              Voice Assistant
            </h1>
            <p className="text-gray-500 mt-2">Manage your tasks naturally with your voice.</p>
          </div>

          <ChatBox messages={messages} />

          <div className="mt-auto pt-4 border-t border-gray-100">
            <VoiceInput onMessageSent={handleMessageSent} isProcessing={isProcessing} />
          </div>
        </div>

        {/* Right column: To-Do List */}
        <div className="md:col-span-1 h-[80vh]">
          <TodoList todos={todos} />
        </div>

      </div>
    </div>
  );
};

export default App;
