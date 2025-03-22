import React from 'react';

function ProfilePanel({ user, journalEntries, darkMode, onClose }) {
  const daysActive = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
  const avgMood = journalEntries.length
    ? journalEntries.reduce((sum, e) => {
        if (e.text.toLowerCase().includes('good') || e.text.toLowerCase().includes('happy')) return sum + 3;
        if (e.text.toLowerCase().includes('bad') || e.text.toLowerCase().includes('sad')) return sum + 1;
        return sum + 2;
      }, 0) / journalEntries.length
    : 0;

  return (
    <div className={`p-6 rounded-xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-blue-200 text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Profile</h2>
        <button className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100" onClick={onClose}>
          ✕
        </button>
      </div>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Days Active:</strong> {daysActive}</p>
      <p><strong>Average Mood:</strong> {avgMood.toFixed(1)} (1-3 scale)</p>
    </div>
  );
}

export default ProfilePanel;