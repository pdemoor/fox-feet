import React, { useRef, useEffect } from 'react';

function Tile({ letter, state, flipDelay, shake, bounce }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!state || state === 'tbd' || state === 'empty') return;
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.style.transition = `transform 0.25s ease ${flipDelay}s, background 0s ${flipDelay + 0.125}s, border-color 0s ${flipDelay + 0.125}s`;
      el.style.transform = 'rotateX(-90deg)';
      setTimeout(() => {
        el.dataset.state = state;
        el.style.transform = 'rotateX(0deg)';
        setTimeout(() => {
          el.style.transition = '';
        }, 300);
      }, (flipDelay + 0.25) * 1000);
    }, 10);
    return () => clearTimeout(timer);
  // Only run when state transitions from undefined/tbd to a result state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={`tile${shake ? ' shake' : ''}${bounce ? ' bounce' : ''}`}
      data-state={letter ? (state || 'tbd') : 'empty'}
      style={{ animationDelay: bounce ? `${flipDelay * 0.1}s` : undefined }}
    >
      {letter?.toUpperCase()}
    </div>
  );
}

export default function Board({ guesses, currentGuess, gameStatus, bounceRow, shakeTrigger }) {
  const rows = [];

  for (let r = 0; r < 6; r++) {
    const submitted = guesses[r];
    const isCurrentRow = !submitted && r === guesses.length;
    const cells = [];

    for (let c = 0; c < 5; c++) {
      if (submitted) {
        cells.push(
          <Tile
            key={`${r}-${c}-${submitted.word}`}
            letter={submitted.word[c]}
            state={submitted.result[c]}
            flipDelay={c * 0.3}
            bounce={bounceRow === r}
          />
        );
      } else if (isCurrentRow) {
        cells.push(
          <Tile
            key={`cur-${c}`}
            letter={currentGuess[c]}
            state={currentGuess[c] ? 'tbd' : 'empty'}
            flipDelay={0}
            shake={shakeTrigger}
          />
        );
      } else {
        cells.push(<Tile key={`${r}-${c}`} letter="" state="empty" flipDelay={0} />);
      }
    }

    rows.push(<div key={r} className="row">{cells}</div>);
  }

  return (
    <div className="board-container">
      <div className="board">{rows}</div>
    </div>
  );
}
