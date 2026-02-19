import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaForward, FaBackward } from 'react-icons/fa';

/**
 * AudioPlayer Component
 * 
 * Handles text-to-speech playback with:
 * - Play/pause controls
 * - Speed selection (0.5x, 1x, 1.5x, 2x)
 * - Volume control
 * - Skip forward/backward (15 seconds)
 * - Real-time text highlighting
 * - Progress bar
 * 
 * @param {string} contentText - The text to convert to speech
 * @param {function} onQuizTrigger - Callback when quiz should display (every 5 min)
 * @param {function} onTimeUpdate - Callback for current playback time
 */
export default function AudioPlayer({
  contentText = '',
  onQuizTrigger = () => {},
  onTimeUpdate = () => {},
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  const words = contentText.split(/\s+/).filter(w => w.length > 0);
  const AVG_READING_SPEED = 0.4; // seconds per word at 1x speed

  // Get available voices
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].voiceURI);
      }
    };

    updateVoices();
    synth.onvoiceschanged = updateVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // Handle play/pause
  const togglePlayPause = () => {
    if (!contentText.trim()) {
      alert('Please upload or paste text first');
      return;
    }

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        startSpeech();
      }
      setIsPlaying(true);
    }
  };

  const startSpeech = () => {
    synth.cancel();

    utteranceRef.current = new SpeechSynthesisUtterance(contentText);
    utteranceRef.current.rate = playbackRate;
    utteranceRef.current.volume = volume;

    if (selectedVoice) {
      const voice = voices.find(v => v.voiceURI === selectedVoice);
      if (voice) utteranceRef.current.voice = voice;
    }

    // Update progress and highlight
    utteranceRef.current.onboundary = (event) => {
      const timeElapsed = (event.charIndex / contentText.length) * duration;
      setCurrentTime(timeElapsed);
      
      // Calculate highlighted word based on time
      const estimatedWord = Math.floor(timeElapsed / (AVG_READING_SPEED / playbackRate));
      setHighlightedWordIndex(Math.min(estimatedWord, words.length - 1));
      
      onTimeUpdate(timeElapsed);

      // Trigger quiz every 5 minutes (300 seconds)
      if (Math.floor(timeElapsed / 300) > Math.floor((timeElapsed - 0.1) / 300)) {
        onQuizTrigger();
        synth.pause();
        setIsPlaying(false);
      }
    };

    utteranceRef.current.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setHighlightedWordIndex(0);
    };

    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };

    setDuration(words.length * (AVG_READING_SPEED / playbackRate));
    synth.speak(utteranceRef.current);
  };

  // Handle speed change
  const handleSpeedChange = (newRate) => {
    setPlaybackRate(newRate);
    if (isPlaying) {
      synth.cancel();
      startSpeech();
    }
  };

  // Handle skip forward (15 seconds)
  const handleSkipForward = () => {
    const newTime = Math.min(currentTime + 15, duration);
    skipToTime(newTime);
  };

  // Handle skip backward (15 seconds)
  const handleSkipBackward = () => {
    const newTime = Math.max(currentTime - 15, 0);
    skipToTime(newTime);
  };

  const skipToTime = (newTime) => {
    synth.cancel();
    setCurrentTime(newTime);
    
    // Calculate new text position
    const estimatedWord = Math.floor(newTime / (AVG_READING_SPEED / playbackRate));
    const skippedText = words.slice(estimatedWord).join(' ');
    
    if (skippedText.trim()) {
      utteranceRef.current = new SpeechSynthesisUtterance(skippedText);
      utteranceRef.current.rate = playbackRate;
      utteranceRef.current.volume = volume;
      if (selectedVoice) {
        const voice = voices.find(v => v.voiceURI === selectedVoice);
        if (voice) utteranceRef.current.voice = voice;
      }
      
      if (isPlaying) {
        synth.speak(utteranceRef.current);
      }
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Build highlighted text view
  const highlightedText = words.map((word, index) => (
    <span
      key={index}
      className={`${
        index === highlightedWordIndex
          ? 'bg-yellow-300 font-bold'
          : index < highlightedWordIndex
          ? 'text-gray-400'
          : 'text-gray-800'
      } transition-colors duration-100`}
    >
      {word}{' '}
    </span>
  ));

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Text Display with Highlighting */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto border border-gray-200">
        <p className="text-base leading-relaxed text-justify">
          {contentText.length > 0 ? highlightedText : 'No text loaded. Upload or paste text to begin.'}
        </p>
      </div>

      {/* Playback Controls */}
      <div className="space-y-4">
        {/* Play/Pause and Skip Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleSkipBackward}
            disabled={!contentText.trim()}
            className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Skip backward 15 seconds"
          >
            <FaBackward />
          </button>

          <button
            onClick={togglePlayPause}
            disabled={!contentText.trim()}
            className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
          </button>

          <button
            onClick={handleSkipForward}
            disabled={!contentText.trim()}
            className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Skip forward 15 seconds"
          >
            <FaForward />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={Math.ceil(duration)}
            value={Math.floor(currentTime)}
            onChange={(e) => skipToTime(parseInt(e.target.value))}
            disabled={!contentText.trim()}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Row: Speed, Voice, Volume */}
        <div className="grid grid-cols-3 gap-4">
          {/* Speed Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed
            </label>
            <select
              value={playbackRate}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              disabled={!contentText.trim()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={selectedVoice || ''}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={!contentText.trim() || voices.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            >
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaVolumeUp /> Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={!contentText.trim()}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      {!contentText.trim() && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          📄 Upload a file or paste text to get started
        </div>
      )}
    </div>
  );
}
