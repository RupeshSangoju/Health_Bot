import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import JournalSection from './components/JournalSection';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messageCount, setMessageCount] = useState(0);
  const [isPremium] = useState(false); // Removed setIsPremium since unused
  const [showJournal, setShowJournal] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Message Count from Firestore
  useEffect(() => {
    const fetchMessageCount = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setMessageCount(data.messageCount?.[today] || 0);
        }
      }
    };
    fetchMessageCount();
  }, [user, today]); // Removed 'db' from dependency array

  // Handle Sending Messages (Text or Voice)
  const handleSendMessage = async (inputValue, isVoice = false, callback) => {
    if (!isPremium && messageCount >= 10) {
      alert('You’ve reached the 10-message daily limit. Upgrade to premium for unlimited access!');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        input_type: isVoice ? 'voice' : 'text',
        input: inputValue,
        language: language,
      };
      const res = await axios.post('/.netlify/functions/chat', payload);
      const { transcribed_text, response_text, response_audio } = res.data;

      if (isVoice) {
        setMessages((prev) => [
          ...prev,
          { sender: 'user', text: transcribed_text },
          { sender: 'ai', text: response_text },
        ]);
        const audio = new Audio(`data:audio/mp3;base64,${response_audio}`);
        audio.play();
        if (callback) callback(transcribed_text);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'user', text: inputValue },
          { sender: 'ai', text: response_text },
        ]);
      }

      const newCount = messageCount + 1;
      setMessageCount(newCount);
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { messageCount: { [today]: newCount } }, { merge: true });

      const sessionMessages = isVoice
        ? [...messages, { sender: 'user', text: transcribed_text }, { sender: 'ai', text: response_text }]
        : [...messages, { sender: 'user', text: inputValue }, { sender: 'ai', text: response_text }];
      await addDoc(collection(db, 'sessions'), {
        date: new Date().toISOString(),
        messages: sessionMessages,
        userId: user.uid,
      });
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Oops, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Text Input Submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSendMessage(input);
      setInput('');
    }
  };

  // Handle Voice Input (Placeholder)
  const handleVoiceSubmit = () => {
    const audioBase64 = "your-audio-base64-data"; // Replace with actual voice logic
    handleSendMessage(audioBase64, true, (transcribed) => {
      console.log('Transcribed:', transcribed);
    });
  };

  // Handle Journal Entries
  const handleJournalSubmit = async (entry) => {
    if (user) {
      await addDoc(collection(db, 'sessions'), {
        date: new Date().toISOString(),
        messages: [{ sender: 'user', text: entry }],
        userId: user.uid,
      });
    }
  };

  // Logout
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="App">
      {user ? (
        <>
          <header>
            <h1>Virtual AI Therapist</h1>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => setShowJournal(!showJournal)}>
              {showJournal ? 'Close Journal' : 'Open Journal'}
            </button>
          </header>

          <div className="chat-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleTextSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              Send
            </button>
            <button type="button" onClick={handleVoiceSubmit} disabled={isLoading}>
              Voice
            </button>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </form>

          {showJournal && (
            <JournalSection
              entries={messages.filter((m) => m.sender === 'user')}
              onJournalSubmit={handleJournalSubmit}
              onClose={() => setShowJournal(false)}
              darkMode={false}
            />
          )}

          <p>Messages today: {messageCount}/10 {isPremium && '(Premium)'}</p>
        </>
      ) : (
        <div className="login-prompt">
          <p>Please log in to use the Virtual AI Therapist.</p>
        </div>
      )}
    </div>
  );
}

export default App;