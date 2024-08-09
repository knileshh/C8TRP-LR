import React, { useState, useEffect } from 'react';

const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setText(transcript);
      };

      setRecognition(recognition);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Voice to Text</h2>
      <div className="mb-4">
        <button
          className={`w-full py-2 px-4 rounded-full font-semibold text-white transition-colors duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="font-semibold text-gray-700 mb-2">Transcribed Text:</p>
        <p className="text-gray-600 break-words">{text || 'Start speaking to see transcription...'}</p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <VoiceToText />
    </div>
  );
};

export default App;