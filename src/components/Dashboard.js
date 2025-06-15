// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { FaCog, FaHistory, FaSignOutAlt, FaUser, FaBook, FaStethoscope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { db, auth } from '../firebase';
import ChatWindow from './ChatWindow';
import InputSection from './InputSection';
import JournalSection from './JournalSection';
import SettingsPanel from './SettingsPanel';
import HistorySidebar from './HistorySidebar';
import ProfilePanel from './ProfilePanel';
import Diagnostics from './Diagnostics';
import healthTips from '../data/health_tips.json';

function Dashboard({ user }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    { sender: 'ai', text: t('initial_ai_message') },
  ]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showJournal, setShowJournal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [messageCount, setMessageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const today = new Date().toDateString();
  const [showContact, setShowContact] = useState(false);

  // Handle dark mode and set English default
  useEffect(() => {
    document.body.className = darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
    localStorage.setItem('darkMode', darkMode);
    i18n.changeLanguage('en');
    localStorage.setItem('language', 'en');
  }, [darkMode, i18n]);

  // Firebase data fetching
  useEffect(() => {
    const today = new Date().toDateString();
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessageCount(data.messageCount?.[today] || 0);
        setIsPremium(data.isPremium || false);
      } else {
        console.warn('User document not found');
      }
    }, (error) => {
      console.error('User snapshot error:', error);
    });

    const sessionsQuery = query(collection(db, 'sessions'), orderBy('date', 'desc'));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionData = snapshot.docs
        .filter((doc) => doc.data().userId === user.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessions(sessionData);
    }, (error) => {
      console.error('Sessions snapshot error:', error);
    });

    const journalsQuery = query(collection(db, 'journals'), orderBy('date', 'desc'));
    const unsubscribeJournals = onSnapshot(journalsQuery, (snapshot) => {
      const journalData = snapshot.docs
        .filter((doc) => doc.data().userId === user.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setJournalEntries(journalData);
    }, (error) => {
      console.error('Journals snapshot error:', error);
    });

    return () => {
      unsubscribeUser();
      unsubscribeSessions();
      unsubscribeJournals();
    };
  }, [user.uid]);

  // Replace getChatResponse in C:\Users\rupes\Portifolio\Health Bot\frontend\src\components\Dashboard.js
const getChatResponse = async (text, targetLang) => {
  const textLower = text.toLowerCase();
  for (const [symptom, tip] of Object.entries(healthTips)) {
    if (textLower.includes(symptom)) return tip;
  }

  try {
    const response = await axios.post('http://localhost:5001/translate', {
      text: `You are a compassionate virtual therapist trained in cognitive-behavioral therapy. Provide an empathetic, supportive, and actionable response to: "${text}". Offer practical advice, validate their feelings, and suggest a positive next step. Keep the tone warm and encouraging, and limit the response to 100 words.`,
      target_lang: targetLang,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data.translated_text;
  } catch (error) {
    console.error('Translation API error:', error);
    return t('Chat Error');
  }
};

  const handleSendMessage = async (input, isVoice = false, callback) => {
    if (!isPremium && messageCount >= 10) {
      alert(t('message_limit_reached'));
      return;
    }

    setIsLoading(true);
    try {
      let transcribedText = input;
      let responseText;

      if (isVoice) {
        console.warn('Voice input not supported locally; using input as transcribed text');
        transcribedText = input;
        responseText = await getChatResponse(transcribedText, i18n.language);
      } else {
        responseText = await getChatResponse(input, i18n.language);
      }

      const newMessages = isVoice
        ? [
            ...messages,
            { sender: 'user', text: transcribedText, timestamp: new Date().toISOString() },
            { sender: 'ai', text: responseText, timestamp: new Date().toISOString() },
          ]
        : [
            ...messages,
            { sender: 'user', text: input, timestamp: new Date().toISOString() },
            { sender: 'ai', text: responseText, timestamp: new Date().toISOString() },
          ];
      setMessages(newMessages);

      if (isVoice && callback) {
        callback(transcribedText);
      }

      const newCount = messageCount + 1;
      setMessageCount(newCount);
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { messageCount: { [today]: newCount } }, { merge: true });

      await addDoc(collection(db, 'sessions'), {
        date: new Date().toISOString(),
        messages: newMessages,
        userId: user.uid,
      });
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: t('chat_error'), timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCommand = (command) => {
    if (command === 'showJournal') setShowJournal(true);
    else if (command === 'toggleDarkMode') setDarkMode(!darkMode);
    else if (command === 'showProfile') setShowProfile(true);
    else if (command === 'showDiagnostics') setShowDiagnostics(true);
  };

  const handleJournalSubmit = async (entry) => {
    try {
      const mood = entry.toLowerCase().includes('happy') ? 3 : entry.toLowerCase().includes('sad') ? 1 : 2;
      await addDoc(collection(db, 'journals'), {
        date: new Date().toISOString(),
        text: entry,
        mood,
        userId: user.uid,
      });
    } catch (error) {
      console.error('Error saving journal:', error);
      alert(t('journal_error'));
    }
  };

  const loadSession = (sessionMessages) => {
    setMessages(sessionMessages);
    setShowHistory(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(`${t('logout_error')}: ${error.message}`);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex flex-col`}>
      <header className="fixed top-0 w-full bg-blue-600 dark:bg-gray-800 text-white p-4 shadow-lg z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('app_title')}</h1>
        <div className="flex gap-4 items-center">
          <button
            className="text-sm px-3 py-1 rounded-full bg-blue-700 dark:bg-gray-700 hover:bg-blue-800 dark:hover:bg-gray-600 transition"
            onClick={() => setShowPlans(true)}
          >
            {isPremium ? t('premium') : t('upgrade_premium')}
          </button>
          <FaUser
            className="cursor-pointer hover:text-blue-200"
            title={t('profile')}
            onClick={() => setShowProfile(!showProfile)}
          />
          <FaCog
            className="cursor-pointer hover:text-blue-200"
            title={t('settings')}
            onClick={() => setShowSettings(!showSettings)}
          />
          <FaHistory
            className="cursor-pointer hover:text-blue-200"
            title={t('history')}
            onClick={() => setShowHistory(!showHistory)}
          />
          <FaBook
            className="cursor-pointer hover:text-blue-200"
            title={t('journal')}
            onClick={() => setShowJournal(!showJournal)}
          />
          <FaStethoscope
            className="cursor-pointer hover:text-blue-200"
            title={t('diagnostics')}
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          />
          <FaSignOutAlt
            className="cursor-pointer hover:text-blue-200"
            title={t('logout')}
            onClick={handleLogout}
          />
        </div>
      </header>
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 pb-6 flex gap-6 max-w-7xl mx-auto">
        <div className="flex-grow flex flex-col min-h-0">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            darkMode={darkMode}
            user={user}
            onSendMessage={handleSendMessage}
          />
          <p className="text-red-500 text-sm mt-2">{t('chat_disclaimer')}</p>
          <div className="mt-4">
            <InputSection
              onSendMessage={handleSendMessage}
              onVoiceCommand={handleVoiceCommand}
              darkMode={darkMode}
            />
          </div>
        </div>
        {(showJournal || showSettings || showProfile || showHistory || showDiagnostics) && (
          <div className="hidden md:block w-1/3">
            {showJournal && (
              <JournalSection
                entries={journalEntries}
                onJournalSubmit={handleJournalSubmit}
                onClose={() => setShowJournal(false)}
                darkMode={darkMode}
              />
            )}
            {showSettings && (
              <SettingsPanel
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onClose={() => setShowSettings(false)}
                setLanguage={(lang) => {
                  i18n.changeLanguage(lang);
                  localStorage.setItem('language', lang);
                }}
              />
            )}
            {showProfile && (
              <ProfilePanel
                user={user}
                journalEntries={journalEntries}
                darkMode={darkMode}
                onClose={() => setShowProfile(false)}
              />
            )}
            {showHistory && (
              <HistorySidebar sessions={sessions} onLoadSession={loadSession} />
            )}
            {showDiagnostics && (
              <Diagnostics user={user} darkMode={darkMode} onClose={() => setShowDiagnostics(false)} />
            )}
          </div>
        )}
      </main>
      {(showJournal || showSettings || showProfile || showHistory || showDiagnostics) && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-11/12 max-w-md"
          >
            {showJournal && (
              <JournalSection
                entries={journalEntries}
                onJournalSubmit={handleJournalSubmit}
                onClose={() => setShowJournal(false)}
                darkMode={darkMode}
              />
            )}
            {showSettings && (
              <SettingsPanel
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onClose={() => setShowSettings(false)}
                setLanguage={(lang) => {
                  i18n.changeLanguage(lang);
                  localStorage.setItem('language', lang);
                }}
              />
            )}
            {showProfile && (
              <ProfilePanel
                user={user}
                journalEntries={journalEntries}
                darkMode={darkMode}
                onClose={() => setShowProfile(false)}
              />
            )}
            {showHistory && (
              <HistorySidebar sessions={sessions} onLoadSession={loadSession} onClose={() => setShowHistory(false)} />
            )}
            {showDiagnostics && (
              <Diagnostics user={user} darkMode={darkMode} onClose={() => setShowDiagnostics(false)} />
            )}
          </motion.div>
        </div>
      )}
      
{showPlans && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
    >
      <h2 className="text-2xl font-bold mb-4">{t('Subscription Plans')}</h2>
      <div className="flex flex-col gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-semibold">{t('Free Plan')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{t('Current Features')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t('💬 Daily Chat Limit – Up to 10 smart health chats per day with full context.')}</li>
            <li>{t('📊 Basic Mood Trends – Visualize mood patterns over recent days.')}</li>
            <li>{t('🎙️ Voice Chat with Bot – Talk naturally with the health assistant via speech input.')}</li>
            <li>{t('🧠 Disease Prediction (Free) – Detect possible illnesses like Fever, COVID-19, Flu, Malaria, and Cold using symptom-based AI.')}</li>
            <li>{t('💉 Diabetes Risk Check – Estimate your diabetes risk from health inputs like BMI and glucose.')}</li>
            <li>{t('🧘 Mental Health Screening – Evaluate stress, depression, and social activity for mental wellness alerts.')}</li>
            <li>{t('🏥 Nearby Hospital Locator – Find closest hospitals by GPS or typed location.')}</li>
          </ul>
          <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-full cursor-not-allowed">
            {t('Current Plan')}
          </button>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-semibold">{t('Premium Plan')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{t('Future Features')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t('🔄 Unlimited Disease Checks – Predict more conditions with no daily limit or symptom cap.')}</li>
            <li>{t('📈 Advanced Mood Trends – Weekly/monthly insights with emotion heatmaps.')}</li>
            <li>{t('🔔 Mood & Health Reminders – Get smart prompts to check-in on health or log moods.')}</li>
            <li>{t('🗺️ Hospital Ratings & Wait Times – Real-time ER wait times and reviews for nearby hospitals.')}</li>
            <li>{t('📅 Smart Health Scheduler – Personalized check-up routines based on your patterns.')}</li>
            <li>{t('👨‍⚕️ AI-Powered Health Plans – Custom wellness goals and lifestyle tips from your history.')}</li>
          </ul>


        </div>
      </div>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
        onClick={() => setShowContact(true)}
      >
        {t('Upgrade Button')}
      </button>
        {showContact && (
    <p className="mt-2 text-sm text-blue-600">
      📩 {t('Please contact us at')} <a href="mailto:rupeshbabu.sangoju@gmail.com" className="underline">rupeshbabu.sangoju@gmail.com</a>
    </p>
  )}
    </motion.div>
  </div>
)}
      <footer className="text-center text-gray-600 dark:text-gray-400 py-4">
        {t('messages_today', { count: messageCount, premium: isPremium ? t('premium') : '' })}
      </footer>
    </div>
  );
}

export default Dashboard;