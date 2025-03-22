import React, { useState, useEffect } from 'react';
import { FaCog, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';
import { motion } from 'framer-motion';
import { db, auth } from './firebase';
import ChatWindow from './components/ChatWindow';
import InputSection from './components/InputSection';
import JournalSection from './components/JournalSection';
import SettingsPanel from './components/SettingsPanel';
import HistorySidebar from './components/HistorySidebar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePanel from './components/ProfilePanel';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hi! I’m your virtual therapist—how can I support you today?' }]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showJournal, setShowJournal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const today = new Date().toDateString();

  useEffect(() => {
    document.body.className = darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-100 to-green-50';
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMessageCount(data.messageCount?.[today] || 0);
            setIsPremium(data.isPremium || false);
          }
        });

        const sessionsQuery = query(collection(db, 'sessions'), orderBy('date', 'desc'));
        onSnapshot(sessionsQuery, (snapshot) => {
          const sessionData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setSessions(sessionData);
        });

        const journalsQuery = query(collection(db, 'journals'), orderBy('date', 'desc'));
        onSnapshot(journalsQuery, (snapshot) => {
          const journalData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setJournalEntries(journalData);
        });
      }
    });
    return () => unsubscribeAuth();
  }, [darkMode]);

  const handleSendMessage = async (input, isVoice = false, callback) => {
    if (!isPremium && messageCount >= 10) {
      alert('You’ve reached the 10-message daily limit. Upgrade to premium for unlimited access!');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        input_type: isVoice ? 'voice' : 'text',
        input: input,
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
          { sender: 'user', text: input },
          { sender: 'ai', text: response_text },
        ]);
      }

      const newCount = messageCount + 1;
      setMessageCount(newCount);
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { messageCount: { [today]: newCount } }, { merge: true });

      const sessionMessages = isVoice
        ? [...messages, { sender: 'user', text: transcribed_text }, { sender: 'ai', text: response_text }]
        : [...messages, { sender: 'user', text: input }, { sender: 'ai', text: response_text }];
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

  const handleVoiceCommand = (command) => {
    if (command === 'showJournal') setShowJournal(true);
    else if (command === 'toggleDarkMode') setDarkMode(!darkMode);
    else if (command === 'showProfile') setShowProfile(true);
  };

  const handleJournalSubmit = async (entry) => {
    await addDoc(collection(db, 'journals'), {
      date: new Date().toISOString(),
      text: entry,
      userId: user.uid,
    });
  };

  const loadSession = (sessionMessages) => {
    setMessages(sessionMessages);
    setShowHistory(false);
  };

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleRegister = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await setDoc(doc(db, 'users', newUser.uid), {
        email,
        createdAt: new Date().toISOString(),
        isPremium: false,
        messageCount: {},
      });
      setShowRegister(false);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  const handleSwitchToRegister = () => setShowRegister(true);
  const handleSwitchToLogin = () => setShowRegister(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessages([{ sender: 'ai', text: 'Hi! I’m your virtual therapist—how can I support you today?' }]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return showRegister ? (
      <RegisterPage onRegister={handleRegister} onSwitchToLogin={handleSwitchToLogin} />
    ) : (
      <LoginPage onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-100 to-green-50'} flex flex-col relative`}>
      <header className="fixed top-0 w-full bg-blue-500 dark:bg-gray-800 text-white p-4 shadow-md z-10 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Virtual AI Therapist</h1>
        <div className="flex gap-4 items-center">
          <span className="cursor-pointer hover:text-blue-200" onClick={() => setShowPlans(true)}>
            Free Version
          </span>
          <FaCog className="cursor-pointer hover:text-blue-200" onClick={() => setShowSettings(!showSettings)} />
          <FaHistory className="cursor-pointer hover:text-blue-200" onClick={() => setShowHistory(!showHistory)} />
          <FaSignOutAlt className="cursor-pointer hover:text-blue-200" onClick={handleLogout} title="Logout" />
        </div>
      </header>
      <main className={`flex-grow pt-20 p-6 flex gap-6 max-w-6xl mx-auto ${showPlans ? 'blur-sm' : ''}`}>
        {showHistory && <HistorySidebar sessions={sessions} onLoadSession={loadSession} />}
        <div className="flex-grow flex flex-col">
          <ChatWindow messages={messages} isLoading={isLoading} darkMode={darkMode} />
          <InputSection onSendMessage={handleSendMessage} onVoiceCommand={handleVoiceCommand} darkMode={darkMode} />
          <button
            className="mt-4 bg-blue-400 dark:bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 dark:hover:bg-blue-700 transition duration-300"
            onClick={() => setShowJournal(!showJournal)}
          >
            {showJournal ? 'Return to Chat' : 'Open Journal'}
          </button>
        </div>
        {showJournal && (
          <div className="fixed right-0 top-20 bottom-0 w-96 p-4 overflow-y-auto">
            <JournalSection
              entries={journalEntries}
              onJournalSubmit={handleJournalSubmit}
              onClose={() => setShowJournal(false)}
              darkMode={darkMode}
            />
          </div>
        )}
        {showSettings && (
          <div className="fixed right-0 top-20 bottom-0 w-96 p-4 overflow-y-auto">
            <SettingsPanel
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onClose={() => setShowSettings(false)}
              setLanguage={setLanguage}
            />
          </div>
        )}
        {showProfile && (
          <div className="fixed right-0 top-20 bottom-0 w-96 p-4 overflow-y-auto">
            <ProfilePanel
              user={user}
              journalEntries={journalEntries}
              darkMode={darkMode}
              onClose={() => setShowProfile(false)}
            />
          </div>
        )}
      </main>
      {showPlans && (
        <div className="fixed inset-0 flex items-center justify-center z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl"
          >
            {/* ... (plans content unchanged) */}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;