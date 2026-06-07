import { useState, useEffect, useCallback } from 'react';
import { answers, todayWord, todayIndex, puzzleNumber } from './words/answers.js';
import { validGuesses } from './words/validGuesses.js';

const ALL_VALID = new Set([...answers, ...validGuesses]);

function loadState() {
  try {
    const raw = localStorage.getItem('foxfeet_state');
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (state.puzzleNumber !== puzzleNumber) return null;
    return state;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem('foxfeet_state', JSON.stringify({ ...state, puzzleNumber }));
  } catch {}
}

function loadStats() {
  try {
    const raw = localStorage.getItem('foxfeet_stats');
    return raw ? JSON.parse(raw) : defaultStats();
  } catch {
    return defaultStats();
  }
}

function defaultStats() {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

function saveStats(stats) {
  try {
    localStorage.setItem('foxfeet_stats', JSON.stringify(stats));
  } catch {}
}

function computeLetterStates(guesses, word) {
  const map = {};
  for (const guess of guesses) {
    for (let i = 0; i < guess.word.length; i++) {
      const letter = guess.word[i];
      const result = guess.result[i];
      const prev = map[letter];
      if (result === 'correct') {
        map[letter] = 'correct';
      } else if (result === 'present' && prev !== 'correct') {
        map[letter] = 'present';
      } else if (!prev) {
        map[letter] = 'absent';
      }
    }
  }
  return map;
}

export function useGameState(hardMode) {
  const saved = loadState();

  const [guesses, setGuesses] = useState(saved?.guesses ?? []);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState(saved?.gameStatus ?? 'playing');
  const [letterStates, setLetterStates] = useState(saved?.letterStates ?? {});
  const [stats, setStats] = useState(loadStats());
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [bounceRow, setBounceRow] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    saveState({ guesses, gameStatus, letterStates });
  }, [guesses, gameStatus, letterStates]);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2000);
  }, []);

  const addLetter = useCallback((letter) => {
    if (gameStatus !== 'playing') return;
    if (currentGuess.length >= 5) return;
    setCurrentGuess(g => g + letter.toLowerCase());
  }, [gameStatus, currentGuess]);

  const deleteLetter = useCallback(() => {
    if (gameStatus !== 'playing') return;
    setCurrentGuess(g => g.slice(0, -1));
  }, [gameStatus]);

  const submitGuess = useCallback(() => {
    if (gameStatus !== 'playing') return;
    if (currentGuess.length !== 5) {
      addToast('Not enough letters');
      setShakeTrigger(t => !t);
      return;
    }
    if (!ALL_VALID.has(currentGuess)) {
      addToast('Not in word list');
      setShakeTrigger(t => !t);
      return;
    }

    // Hard mode validation
    if (hardMode && guesses.length > 0) {
      for (const prev of guesses) {
        for (let i = 0; i < 5; i++) {
          if (prev.result[i] === 'correct' && currentGuess[i] !== prev.word[i]) {
            addToast(`${prev.word[i].toUpperCase()} must be in position ${i + 1}`);
            setShakeTrigger(t => !t);
            return;
          }
        }
        for (let i = 0; i < 5; i++) {
          if (prev.result[i] === 'present' && !currentGuess.includes(prev.word[i])) {
            addToast(`Guess must contain ${prev.word[i].toUpperCase()}`);
            setShakeTrigger(t => !t);
            return;
          }
        }
      }
    }

    // Score the guess
    const result = scoreGuess(currentGuess, todayWord);
    const newGuess = { word: currentGuess, result };
    const newGuesses = [...guesses, newGuess];
    const newLetterStates = computeLetterStates(newGuesses, todayWord);

    setGuesses(newGuesses);
    setLetterStates(newLetterStates);
    setCurrentGuess('');

    const won = result.every(r => r === 'correct');
    if (won) {
      const rowIdx = newGuesses.length - 1;
      setTimeout(() => {
        setBounceRow(rowIdx);
        setTimeout(() => setBounceRow(null), 1500);
      }, 500);
      setTimeout(() => {
        const msgs = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
        addToast(msgs[newGuesses.length - 1] ?? 'Nice!');
      }, 1600);
      setGameStatus('won');
      const newStats = updateStats(stats, newGuesses.length, true);
      setStats(newStats);
      saveStats(newStats);
    } else if (newGuesses.length >= 6) {
      setTimeout(() => addToast(todayWord.toUpperCase()), 600);
      setGameStatus('lost');
      const newStats = updateStats(stats, 0, false);
      setStats(newStats);
      saveStats(newStats);
    }
  }, [gameStatus, currentGuess, guesses, hardMode, stats, addToast]);

  return {
    guesses,
    currentGuess,
    gameStatus,
    letterStates,
    stats,
    shakeTrigger,
    bounceRow,
    toasts,
    addLetter,
    deleteLetter,
    submitGuess,
    todayWord,
    puzzleNumber,
  };
}

function scoreGuess(guess, answer) {
  const result = Array(5).fill('absent');
  const answerArr = answer.split('');
  const guessArr = guess.split('');
  const used = Array(5).fill(false);

  // First pass: correct
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  // Second pass: present
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guessArr[i] === answerArr[j]) {
        result[i] = 'present';
        used[j] = true;
        break;
      }
    }
  }
  return result;
}

function updateStats(stats, guessCount, won) {
  const newStats = { ...stats, distribution: { ...stats.distribution } };
  newStats.played += 1;
  if (won) {
    newStats.won += 1;
    newStats.currentStreak += 1;
    newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
    newStats.distribution[guessCount] = (newStats.distribution[guessCount] ?? 0) + 1;
  } else {
    newStats.currentStreak = 0;
  }
  return newStats;
}
