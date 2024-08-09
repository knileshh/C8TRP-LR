import React, { useState, useEffect, useCallback } from 'react';
import TextToSpeech from './TextToSpeech';
import VoiceToText from './VoiceToText';


const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4 m-4">
      <VoiceToText />
      <TextToSpeech />
    </div>
  );
};

export default App;