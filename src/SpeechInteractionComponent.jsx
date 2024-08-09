import React, { useState, useEffect, useCallback } from 'react';

const SpeechInteractionComponent = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentSection, setCurrentSection] = useState('header');
  const [currentIndex, setCurrentIndex] = useState(-1);  // Start at -1 to allow for section callout
  const [transcribedText, setTranscribedText] = useState('');
  const [googleVoice, setGoogleVoice] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const questionsToAsk = {
    header: [
      "Truck Serial Number?",
      "Truck Model?",
      "Inspector Name?",
      "Inspection Employee ID?",
      "Date & Time of Inspection?",
      "Location of Inspection?",
      "Service Meter Hours (Odometer reading)?",
      "Customer Name /Company name?",
      "CAT Customer ID?",
    ],
    tires: [
      "Tire pressure for left front?",
      "Tire pressure for right front?",
      "Tire pressure for left rear?",
      "Tire pressure for right rear?",
      "Tire tread depth for left front?",
      "Tire tread depth for right front?",
      "Tire tread depth for left rear?",
      "Tire tread depth for right rear?",
    ]
  };
  useEffect(() => {
    const initializeVoices = async () => {
      setIsLoading(true);
      try {
        const synth = window.speechSynthesis;
        const loadVoices = () => {
          return new Promise((resolve) => {
            let voices = synth.getVoices();
            if (voices.length > 0) {
              resolve(voices);
            } else {
              synth.onvoiceschanged = () => {
                voices = synth.getVoices();
                resolve(voices);
              };
            }
          });
        };

        const voices = await loadVoices();
        const googleVoice = voices.find(voice => 
          voice.name.includes('Google') && voice.lang.startsWith('en-US')
        );
        if (googleVoice) {
          setGoogleVoice(googleVoice);
        } else {
          throw new Error("Google US English voice not found");
        }
      } catch (err) {
        setError("Failed to load voices. Please refresh and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeVoices();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setTranscribedText(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      setRecognition(recognition);
    } else {
      setError("Speech recognition not supported in this browser");
    }

    return () => {
      window.speechSynthesis.cancel();
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const speakText = useCallback((text) => {
    return new Promise((resolve, reject) => {
      if (googleVoice) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = googleVoice;
        utterance.onend = resolve;
        utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));
        
        // Set a timeout in case the speech doesn't start or end
        const timeout = setTimeout(() => {
          synth.cancel();
          reject(new Error("Speech synthesis timed out"));
        }, 10000); // 10 second timeout

        utterance.onstart = () => clearTimeout(timeout);
        utterance.onend = () => {
          clearTimeout(timeout);
          resolve();
        };

        synth.speak(utterance);
      } else {
        reject(new Error("Google voice not available"));
      }
    });
  }, [googleVoice]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const processInteraction = useCallback(async () => {
    const currentQuestions = questionsToAsk[currentSection];
    
    if (currentIndex === -1) {
      // Callout the section name
      try {
        setIsLoading(true);
        await speakText(`Starting ${currentSection} section`);
        setCurrentIndex(prevIndex => prevIndex + 1);
      } catch (err) {
        setError(`Error during section callout: ${err.message}`);
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    } else if (currentIndex < currentQuestions.length && isActive) {
      try {
        setIsLoading(true);
        await speakText(currentQuestions[currentIndex]);
        setTranscribedText('');
        startListening();

        // Wait for 7 seconds to allow for user response
        await new Promise(resolve => setTimeout(resolve, 7000));

        stopListening();
        setCurrentIndex(prevIndex => prevIndex + 1);
      } catch (err) {
        setError(`Error during interaction: ${err.message}`);
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    } else if (currentSection === 'header' && isActive) {
      // Move to the tires section
      setCurrentSection('tires');
      setCurrentIndex(-1);  // Reset to -1 to allow for section callout
    } else {
      setIsActive(false);
    }
  }, [currentSection, currentIndex, isActive, speakText, startListening, stopListening]);

  useEffect(() => {
    if (isActive && !isListening && !isLoading) {
      processInteraction();
    }
  }, [isActive, isListening, isLoading, processInteraction]);

  const handleStart = () => {
    setError(null);
    setIsActive(true);
    setCurrentSection('header');
    setCurrentIndex(-1);  // Start at -1 to allow for section callout
    setTranscribedText('');
  };

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-6">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p>{error}</p>
        <button
          className="mt-4 w-full py-2 px-4 rounded-full font-semibold text-white bg-blue-500 hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Speech Interaction</h2>
      <button
        className={`w-full py-2 px-4 rounded-full font-semibold text-white transition-colors duration-300 ${
          isActive || isLoading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
        }`}
        onClick={handleStart}
        disabled={isActive || isLoading}
      >
        {isLoading ? 'Loading...' : isActive ? 'In Progress...' : 'Start Interaction'}
      </button>
      <div className="mt-4">
        <p className="font-semibold">Current section: {currentSection}</p>
        <p className="font-semibold">Current question:</p>
        <p>
          {currentIndex === -1 
            ? `Starting ${currentSection} section` 
            : (questionsToAsk[currentSection][currentIndex] || 'Finished')}
        </p>
      </div>
      <div className="mt-4">
        <p className="font-semibold">Transcribed Text:</p>
        <p className="break-words">{transcribedText || 'No transcription yet...'}</p>
      </div>
    </div>
  );
};

export default SpeechInteractionComponent;