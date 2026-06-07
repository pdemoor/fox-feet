import React, { useRef, useEffect } from 'react';

function Tile({ letter, state, flipDelay, shake, bounce }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!state || state === 'tbd' || state === 'empty') return;
    const el = ref.current;
    if (!el) return;
    // First half: rotate to -90deg (hidden), staggered by flipDelay
    const t1 = setTimeout(() => {
      el.style.transition = `transform 0.25s ease ${flipDelay}s`;
      el.style.transform = 'rotateX(-90deg)';
    }, 10);
    // Midpoint: tile is hidden — swap colour, then rotate back with no extra delay
    const t2 = setTimeout(() => {
      el.dataset.state = state;
      el.style.transition = 'transform 0.25s ease';
      el.style.transform = 'rotateX(0deg)';
    }, (flipDelay + 0.25) * 1000);
    // Cleanup: remove inline transition so future animations are unaffected
    const t3 = setTimeout(() => {
      el.style.transition = '';
    }, (flipDelay + 0.5) * 1000 + 50);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // Only run when state transitions from undefined/tbd to a result state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={`tile${shake ? ' shake' : ''}${bounce ? ' bounce' : ''}`}
      data-state={letter ? (state || 'tbd') : 'empty'}
      style={{ animationDelay: bounce ? `${flipDelay}s` : undefined }}
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
            flipDelay={c * 0.1}
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
