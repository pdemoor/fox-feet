import React from 'react';
import { puzzleNumber, todayWord } from './words/answers.js';

export default function StatsModal({ stats, gameStatus, guesses, onClose }) {
  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(1, ...Object.values(stats.distribution));
  const wonGuessCount = gameStatus === 'won' ? guesses.length : null;

  function buildShareText() {
    const CORRECT = '🟩';
    const PRESENT = '🟨';
    const ABSENT  = '⬜';
    const THIN_SPACE = ' ';

    const formattedNumber = puzzleNumber.toLocaleString('en-US');
    const header = `FoxFeet ${formattedNumber} ${gameStatus === 'won' ? guesses.length : 'X'}/6`;
    const rows = guesses.map(g =>
      g.result.map(r => r === 'correct' ? CORRECT : r === 'present' ? PRESENT : ABSENT)
              .join(THIN_SPACE)
    ).join('\n');
    return `${header}\n\n${rows}`;
  }

  function handleShare() {
    const text = buildShareText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      });
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Statistics</h2>

        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-number">{stats.played}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{winPct}</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>

        <div className="guess-distribution">
          <h3>Guess Distribution</h3>
          {[1,2,3,4,5,6].map(n => {
            const count = stats.distribution[n] ?? 0;
            const pct = Math.max(7, Math.round((count / maxDist) * 100));
            const isCurrent = wonGuessCount === n;
            return (
              <div key={n} className="dist-row">
                <div className="dist-num">{n}</div>
                <div className="dist-bar-wrap">
                  <div
                    className={`dist-bar${isCurrent ? ' current' : ''}`}
                    style={{ width: `${pct}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(gameStatus === 'won' || gameStatus === 'lost') && (
          <button className="share-btn" onClick={handleShare}>Share</button>
        )}
      </div>
    </div>
  );
}
