import React from 'react';

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['Enter','z','x','c','v','b','n','m','⌫'],
];

export default function Keyboard({ letterStates, onKey }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map(key => (
            <button
              key={key}
              className={`key${key === 'Enter' || key === '⌫' ? ' wide' : ''}`}
              data-state={letterStates[key] || ''}
              onPointerDown={e => { e.preventDefault(); onKey(key); }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
