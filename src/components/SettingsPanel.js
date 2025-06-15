import React from 'react';

function SettingsPanel({ darkMode, setDarkMode, onClose }) {
  const [language, setLanguage] = React.useState('en');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem('language', e.target.value); // Persist choice
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-blue-200 text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Settings</h2>
        <button className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100" onClick={onClose}>
          ✕
        </button>
      </div>
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          className="mr-2"
        />
        Dark Mode
      </label>
      <div className="mb-4">
        <label className="block mb-2">Language:</label>
        <select
          value={language}
          onChange={handleLanguageChange}
          className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200'}`}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  );
}

export default SettingsPanel;