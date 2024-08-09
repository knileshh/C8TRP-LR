import React, { useState, useEffect, useCallback } from 'react';


const VoiceToText = () => {
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [timer, setTimer] = useState(15);
    const [lastSpeechTime, setLastSpeechTime] = useState(Date.now());
  
    const stopListening = useCallback(() => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
        setTimer(15);
      }
    }, [recognition]);
  
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
          setLastSpeechTime(Date.now());
        };
  
        recognition.onend = () => {
          setIsListening(false);
          setTimer(15);
        };
  
        setRecognition(recognition);
      }
    }, []);
  
    useEffect(() => {
      let interval;
      if (isListening) {
        interval = setInterval(() => {
          const elapsedTime = (Date.now() - lastSpeechTime) / 1000;
          const remainingTime = Math.max(0, 15 - Math.floor(elapsedTime));
          setTimer(remainingTime);
          
          if (remainingTime === 0) {
            stopListening();
          }
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isListening, lastSpeechTime, stopListening]);
  
    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
        setLastSpeechTime(Date.now());
        setTimer(15);
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
            {isListening ? `Stop Listening (${timer}s)` : 'Start Listening'}
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="font-semibold text-gray-700 mb-2">Transcribed Text:</p>
          <p className="text-gray-600 break-words">{text || 'Start speaking to see transcription...'}</p>
        </div>
      </div>
    );
  };

export default VoiceToText