import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { API_URL } from '../config';

const QUIZ_INTERVAL_OPTIONS = [
  { label: '30 sec', value: 0.5 },
  { label: '1 min', value: 1 },
  { label: '2 min', value: 2 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
];

export default function Listen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [text, setText] = useState(location.state?.initialText || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quizIntervalMinutes, setQuizIntervalMinutes] = useState(2);
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [listenedChars, setListenedChars] = useState(0);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const playbackActiveRef = useRef(false);
  const playbackSpeedRef = useRef(playbackSpeed);
  const currentChunkStartRef = useRef(0);
  const selectedVoiceRef = useRef(selectedVoice);
  const voicesRef = useRef(voices);
  const sessionIdRef = useRef(null);
  const quizRef = useRef(null);
  const listenedCharsRef = useRef(0);
  const quizIntervalRef = useRef(quizIntervalMinutes);
  const resumeWordIndexRef = useRef(0);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
    voicesRef.current = voices;
  }, [selectedVoice, voices]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
    quizRef.current = quiz;
    listenedCharsRef.current = listenedChars;
    quizIntervalRef.current = quizIntervalMinutes;
  }, [sessionId, quiz, listenedChars, quizIntervalMinutes]);

  useEffect(() => {
    if (isPlaying && playbackActiveRef.current && text) {
      synthRef.current?.cancel();
      speakChunk(currentChunkStartRef.current);
    }
  }, [playbackSpeed, selectedVoice]);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      const enVoices = list.filter((v) => v.lang.startsWith('en'));
      setVoices(enVoices);
      setSelectedVoice((prev) => {
        if (prev) return prev;
        if (enVoices.length > 0) {
          const defaultVoice = enVoices.find((v) => v.default) || enVoices[0];
          return defaultVoice?.name || null;
        }
        return null;
      });
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      synthRef.current?.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const startPlayback = async () => {
    if (!text.trim()) return;
    const existingSessionId = location.state?.sessionId;
    if (existingSessionId) {
      setSessionId(existingSessionId);
      setListenedChars(0);
      listenedCharsRef.current = 0;
      startTimeRef.current = Date.now();
      playbackActiveRef.current = true;
      scheduleQuiz();
      speakChunk(0);
      setIsPlaying(true);
      return;
    }
    let title = location.state?.initialTitle;
    if (!title) {
      const first = text.trim().split(/\n/)[0]?.trim() || '';
      title = first.length > 60 ? first.slice(0, 57) + '...' : first || 'Listening Session';
    }
    try {
      const res = await axios.post(`${API_URL}/api/sessions`, {
        content_text: text,
        content_title: title,
        total_duration_seconds: Math.ceil(text.split(/\s+/).length / 2),
      });
      setSessionId(res.data.id);
      setListenedChars(0);
      listenedCharsRef.current = 0;
      startTimeRef.current = Date.now();
      playbackActiveRef.current = true;
      scheduleQuiz();
      speakChunk(0);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to start session');
    }
  };

  const speakChunk = (startIndex) => {
    if (!synthRef.current || !text) return;
    currentChunkStartRef.current = startIndex;
    synthRef.current.cancel();
    const words = text.split(/\s+/);
    const chunk = words.slice(startIndex, startIndex + 50).join(' ');
    if (!chunk) {
      setIsPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = playbackSpeedRef.current;
    const voiceName = selectedVoiceRef.current;
    if (voiceName) {
      const voice = voicesRef.current.find((v) => v.name === voiceName);
      if (voice) utterance.voice = voice;
    }
    utterance.onend = () => {
      const newIndex = startIndex + 50;
      setListenedChars((c) => {
        const newCount = c + chunk.length;
        listenedCharsRef.current = newCount;
        return newCount;
      });
      if (newIndex < words.length && playbackActiveRef.current) {
        speakChunk(newIndex);
      } else {
        playbackActiveRef.current = false;
        setIsPlaying(false);
      }
    };
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const scheduleQuiz = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const intervalMs = quizIntervalRef.current * 60 * 1000;
    timerRef.current = setTimeout(() => triggerQuiz(), intervalMs);
  };

  const triggerQuiz = async () => {
    if (!sessionIdRef.current || quizRef.current) return;
    resumeWordIndexRef.current = currentChunkStartRef.current;
    playbackActiveRef.current = false;
    synthRef.current?.cancel();
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setQuizLoading(true);
    try {
      const chars = listenedCharsRef.current;
      const chunkStart = Math.max(0, chars - 2000);
      const contentChunk = text.slice(chunkStart, chars + 500);
      const res = await axios.post(`${API_URL}/api/quiz/generate`, {
        content: contentChunk || text.slice(0, 2000),
        difficulty: quizDifficulty,
      });
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
      setQuiz({
        question: 'Quiz generation failed. Continue?',
        options: { A: 'Yes', B: 'No', C: '-', D: '-' },
        correct_answer: 'A',
        explanation: null,
      });
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswer = async (answer) => {
    if (!quiz || quizAnswered) return;
    const isCorrect = answer === quiz.correct_answer;
    setLastAnswerCorrect(isCorrect);
    setQuizAnswered(true);
    try {
      await axios.post(`${API_URL}/api/quiz/attempt`, {
        session_id: sessionId,
        question: quiz.question,
        options: quiz.options,
        user_answer: answer,
        correct_answer: quiz.correct_answer,
        is_correct: isCorrect,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryQuiz = () => {
    setQuizAnswered(false);
    setLastAnswerCorrect(null);
  };

  const handleContinueAfterQuiz = () => {
    setQuiz(null);
    setQuizAnswered(false);
    setLastAnswerCorrect(null);
    quizRef.current = null;
    const words = text.split(/\s+/);
    const startIndex = Math.min(resumeWordIndexRef.current, Math.max(0, words.length - 1));
    const charsBeforeStart = words.slice(0, startIndex).join(' ').length;
    setListenedChars(charsBeforeStart);
    listenedCharsRef.current = charsBeforeStart;
    playbackActiveRef.current = true;
    scheduleQuiz();
    speakChunk(startIndex);
    setIsPlaying(true);
  };

  const pausePlayback = () => {
    playbackActiveRef.current = false;
    synthRef.current?.cancel();
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  if (!user) return null;

  const progress = text ? Math.min(100, (listenedChars / text.length) * 100) : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Reader area - Speechify style */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-8 max-w-3xl mx-auto">
          <div className="mb-6 flex gap-2">
            <label className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${(isPlaying || quiz) ? 'border-white/10 text-slate-500 cursor-not-allowed' : 'border-white/20 text-slate-300 hover:border-blue-500/50 hover:text-blue-400'}`}>
              Upload .txt
              <input
                type="file"
                accept=".txt,text/plain"
                disabled={isPlaying || !!quiz}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setText(reader.result || '');
                    reader.readAsText(file);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your content here. AI quizzes will appear during playback."
            rows={16}
            disabled={isPlaying || !!quiz}
            className="w-full px-0 py-4 bg-transparent border-none text-white text-lg leading-relaxed placeholder-slate-500 focus:outline-none focus:ring-0 resize-none disabled:opacity-70"
          />
        </div>

        {/* Right sidebar - controls */}
        <aside className="w-72 border-l border-white/10 p-6 flex flex-col gap-6 bg-[#141414]">
          <div>
            <label className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-2">Voice</label>
            {voices.length > 0 ? (
              <select
                value={selectedVoice || ''}
                onChange={(e) => setSelectedVoice(e.target.value || null)}
                disabled={isPlaying || !!quiz}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            ) : (
              <span className="text-slate-500 text-sm">Loading...</span>
            )}
          </div>
          <div>
            <label className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-2">Speed</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-lg bg-white/10 accent-blue-500"
              />
              <span className="text-white text-sm font-mono w-10">{playbackSpeed}x</span>
            </div>
          </div>
          <div>
            <label className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-2">Quiz every</label>
            <select
              value={quizIntervalMinutes}
              onChange={(e) => setQuizIntervalMinutes(Number(e.target.value))}
              disabled={isPlaying || !!quiz}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QUIZ_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-2">Difficulty</label>
            <select
              value={quizDifficulty}
              onChange={(e) => setQuizDifficulty(e.target.value)}
              disabled={isPlaying || !!quiz}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </aside>
      </div>

      {/* Bottom playback bar - Speechify style */}
      <div className="border-t border-white/10 bg-[#141414] px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-6">
          <button
            onClick={isPlaying ? pausePlayback : startPlayback}
            disabled={!text.trim() || !!quiz}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <div className="flex-1">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz modal */}
      {quizLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md border border-white/10">
            <p className="text-lg text-white">Generating your quiz...</p>
          </div>
        </div>
      )}

      {quiz && !quizLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 max-w-lg w-full border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Comprehension Check</h2>
            <p className="text-white mb-6">{quiz.question}</p>
            <div className="space-y-3">
              {Object.entries(quiz.options).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => handleQuizAnswer(key)}
                  disabled={quizAnswered}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                    quizAnswered
                      ? key === quiz.correct_answer
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-white/10 text-slate-500 opacity-60'
                      : 'border-white/20 text-white hover:border-blue-500/50 hover:bg-blue-500/10'
                  }`}
                >
                  <span className="font-mono mr-2 text-slate-400">{key}.</span> {val}
                </button>
              ))}
            </div>
            {quizAnswered && (
              <>
                <div className={`mt-4 px-4 py-2 rounded-lg font-medium ${lastAnswerCorrect ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {lastAnswerCorrect ? 'Correct!' : 'Incorrect'}
                </div>
                {quiz.explanation && (
                  <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Explanation</p>
                    <p className="text-slate-300 text-sm">{quiz.explanation}</p>
                  </div>
                )}
                <div className="mt-6 flex gap-3">
                  {!lastAnswerCorrect && (
                    <button onClick={handleRetryQuiz} className="flex-1 py-3 rounded-xl bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 font-medium">
                      Try Again
                    </button>
                  )}
                  <button onClick={handleContinueAfterQuiz} className={`py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium ${!lastAnswerCorrect ? 'flex-1' : 'w-full'}`}>
                    Continue Listening
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
