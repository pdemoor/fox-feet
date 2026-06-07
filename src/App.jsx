import React, { useState, useEffect, useCallback } from 'react';
import Board from './Board.jsx';
import Keyboard from './Keyboard.jsx';
import HelpModal from './HelpModal.jsx';
import StatsModal from './StatsModal.jsx';
import { useGameState } from './useGameState.js';

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function SettingsModal({ darkMode, setDarkMode, hardMode, setHardMode, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Settings</h2>
        <div className="setting-row">
          <div>
            <div className="setting-label">Hard Mode</div>
            <div className="setting-desc">Any revealed hints must be used in subsequent guesses</div>
          </div>
          <Toggle checked={hardMode} onChange={setHardMode} />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Dark Theme</div>
          </div>
          <Toggle checked={darkMode} onChange={setDarkMode} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkModeState] = useState(() => {
    const saved = localStorage.getItem('foxfeet_dark');
    return saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [hardMode, setHardModeState] = useState(() => {
    return localStorage.getItem('foxfeet_hard') === 'true';
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const setDarkMode = (v) => {
    setDarkModeState(v);
    localStorage.setItem('foxfeet_dark', v);
  };
  const setHardMode = (v) => {
    setHardModeState(v);
    localStorage.setItem('foxfeet_hard', v);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const {
    guesses, currentGuess, gameStatus, letterStates, stats,
    shakeTrigger, bounceRow, toasts,
    addLetter, deleteLetter, submitGuess, puzzleNumber,
  } = useGameState(hardMode);

  // Show stats after game ends
  useEffect(() => {
    if (gameStatus !== 'playing') {
      const t = setTimeout(() => setShowStats(true), 2200);
      return () => clearTimeout(t);
    }
  }, [gameStatus]);

  const handleKey = useCallback((key) => {
    if (key === 'Enter') {
      submitGuess();
    } else if (key === '⌫' || key === 'Backspace') {
      deleteLetter();
    } else if (/^[a-zA-Z]$/.test(key)) {
      addLetter(key);
    }
  }, [submitGuess, deleteLetter, addLetter]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-icons" style={{ flex: 1, justifyContent: 'flex-start' }}>
          <button className="icon-btn" onClick={() => setShowHelp(true)} title="Help">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div className="header-title">Fox Feet</div>
        <div className="header-icons" style={{ flex: 1, justifyContent: 'flex-end' }}>
          <button className="icon-btn" onClick={() => setShowStats(true)} title="Statistics">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      <Board
        guesses={guesses}
        currentGuess={currentGuess}
        gameStatus={gameStatus}
        bounceRow={bounceRow}
        shakeTrigger={shakeTrigger}
      />

      <Keyboard
        letterStates={letterStates}
        onKey={handleKey}
      />

      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showStats && (
        <StatsModal
          stats={stats}
          gameStatus={gameStatus}
          guesses={guesses}
          onClose={() => setShowStats(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          hardMode={hardMode}
          setHardMode={setHardMode}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
