import React from 'react';

function HistorySidebar({ sessions, onLoadSession }) {
  return (
    <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 border-blue-200">
      <h2 className={`text-xl font-semibold mb-4 ${sessions.length ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
        Chat History
      </h2>
      {sessions.length === 0 ? (
        <p className="text-gray-400 italic">No sessions yet—start chatting!</p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="mb-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 transition duration-200"
              onClick={() => onLoadSession(session.messages)}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{session.date}</p>
              <p className={`text-blue-800 dark:text-white truncate`}>{session.messages[0]?.text || 'Session'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistorySidebar;