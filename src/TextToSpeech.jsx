import React, { useState, useEffect } from 'react';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [googleVoice, setGoogleVoice] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const findGoogleVoice = () => {
      const voices = synth.getVoices();
      const googleVoice = voices.find(voice => 
        voice.name.includes('Google') && voice.lang.startsWith('en-US')
      );
      if (googleVoice) {
        setGoogleVoice(googleVoice);
      }
    };

    findGoogleVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = findGoogleVoice;
    }
  }, []);

  const speak = () => {
    if (text !== '' && googleVoice) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.voice = googleVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synth.speak(utterance);
    }
  };

  const stop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Text to Speech</h2>
      <textarea
        className="w-full p-2 mb-4 border rounded-md"
        rows="4"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to be read aloud..."
      />
      <button
        className={`w-full py-2 px-4 rounded-full font-semibold text-white transition-colors duration-300 ${
          isSpeaking 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
        onClick={isSpeaking ? stop : speak}
      >
        {isSpeaking ? 'Stop Speaking' : 'Start Speaking'}
      </button>
    </div>
  );
};

export default TextToSpeech;