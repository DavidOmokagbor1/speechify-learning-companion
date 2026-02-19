import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const ACCEPTED_FORMATS = '.pdf,.doc,.docx,.txt,.epub,.rtf,.html';

function getFirstName(email) {
  if (!email) return 'there';
  const part = email.split('@')[0];
  const name = part.split(/[._-]/)[0];
  return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : 'there';
}

export default function Home() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [pasteLinkUrl, setPasteLinkUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const goToListen = (initialText = '', title = '') => {
    navigate('/listen', { state: { initialText, initialTitle: title } });
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    if (ext === 'txt' || file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = () => goToListen(reader.result || '');
      reader.readAsText(file);
    } else {
      showToast('For now, only .txt files are supported. Paste or type content in Listen.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  const handlePasteLink = async () => {
    const input = pasteLinkUrl.trim();
    if (!input) {
      showToast('Enter a URL');
      return;
    }
    const url = input.startsWith('http') ? input : `https://${input}`;
    setLinkLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/content/from-url`, { url });
      goToListen(res.data.text, res.data.title);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch content from URL');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCloudConnect = (name) => {
    showToast(`${name} integration coming soon`);
  };

  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Listen to anything. Learn as you go.
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Speechify Learning Companion adds AI comprehension quizzes during playback — so you retain more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg border border-white/20 text-slate-300 hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const firstName = getFirstName(user?.email);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white">Library</h2>
          <p className="text-slate-500 text-sm mt-1">Speechify Learning</p>
        </div>
        <Link to="/imported" className="text-slate-400 hover:text-white text-sm">
          View Imported →
        </Link>
      </div>

      <h3 className="text-2xl font-semibold text-white mb-6">
        Hey {firstName}, upload your first file
      </h3>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors mb-8 ${
          isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/30'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-slate-400">Drop files here to upload, or</p>
          <button
            type="button"
            onClick={handleBrowseClick}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
        <p className="text-slate-500 text-xs mt-4">
          Accepted formats: pdf, doc, docx, txt, epub, rtf, html
        </p>
      </div>

      {/* Create Text & Paste Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <button
          type="button"
          onClick={() => goToListen()}
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left"
        >
          <span className="text-4xl font-bold text-slate-400">T</span>
          <span className="text-white font-medium">Create Text</span>
        </button>

        <div className="flex flex-col gap-3 p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-white font-medium">Paste Link</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-black/30 border border-white/10 overflow-hidden">
            <span className="px-3 py-2 text-slate-500 text-sm">https://</span>
            <input
              type="url"
              value={pasteLinkUrl}
              onChange={(e) => setPasteLinkUrl(e.target.value)}
              placeholder="example.com/article"
              className="flex-1 px-2 py-2 bg-transparent text-white text-sm placeholder-slate-600 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handlePasteLink}
            disabled={linkLoading}
            className="self-start px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {linkLoading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>

      {/* Cloud integrations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: 'Google Drive', icon: '📁', colors: 'from-green-500/20 to-blue-500/20' },
          { name: 'Dropbox', icon: '📦', colors: 'from-blue-500/20 to-blue-600/20' },
          { name: 'OneDrive', icon: '☁️', colors: 'from-sky-400/20 to-blue-500/20' },
        ].map(({ name, icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => handleCloudConnect(name)}
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
          >
            <span className="text-3xl">{icon}</span>
            <span className="text-white font-medium">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
