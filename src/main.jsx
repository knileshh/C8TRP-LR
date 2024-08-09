import React from 'react';
import { StrictMode } from 'react'; 
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import Home from './Home.jsx';
import TextToSpeech from './TextToSpeech.jsx';
import VoiceToText from './VoiceToText.jsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vt" element={<VoiceToText />} />
        <Route path="/ts" element={<TextToSpeech />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
