import React, { useState, useRef } from 'react';

function InputSection({ onSendMessage, onVoiceCommand, darkMode }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const toggleVoiceRecording = () => {
    if (!isListening) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          streamRef.current = stream;
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          const chunks = [];

          mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/wav' });
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result.split(',')[1];
              onSendMessage(base64String, true, (transcribed) => {
                const lowerText = transcribed.toLowerCase();
                if (lowerText.includes('show journal')) onVoiceCommand('showJournal');
                else if (lowerText.includes('toggle dark mode')) onVoiceCommand('toggleDarkMode');
                else if (lowerText.includes('show profile')) onVoiceCommand('showProfile');
              });
            };
            reader.readAsDataURL(blob);
            stream.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          };

          setIsListening(true);
          mediaRecorder.start();
        })
        .catch((err) => {
          console.error('Audio recording error:', err);
          alert('Failed to access microphone.');
          setIsListening(false);
        });
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input, false);
      setInput('');
    }
  };

  return (
    <div className="flex gap-3">
      <button
        className={`px-4 py-2 rounded-full text-white transition duration-300 ${
          isListening ? 'bg-red-400 hover:bg-red-500' : 'bg-green-400 dark:bg-green-600 hover:bg-green-500 dark:hover:bg-green-700'
        }`}
        onClick={toggleVoiceRecording}
      >
        {isListening ? 'Stop' : 'Speak'}
      </button>
      <form onSubmit={handleSubmit} className="flex-grow flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How are you feeling?"
          className={`flex-grow p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200'
          }`}
        />
        <button
          type="submit"
          className="bg-blue-400 dark:bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 dark:hover:bg-blue-700 transition duration-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default InputSection;