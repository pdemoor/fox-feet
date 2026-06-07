import React from 'react';

export default function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>How To Play</h2>
        <div className="help-section">
          <p>Guess the <strong>Fox Feet</strong> word in 6 tries.</p>
          <p>Each guess must be a valid 5-letter word. Hit the Enter button to submit.</p>
          <p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>

          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--color-header-border)' }} />

          <p><strong>Examples</strong></p>

          <div className="help-example">
            <div className="help-tile correct">W</div>
            <div className="help-tile">E</div>
            <div className="help-tile">A</div>
            <div className="help-tile">R</div>
            <div className="help-tile">Y</div>
          </div>
          <p className="help-note"><strong>W</strong> is in the word and in the correct spot.</p>

          <div className="help-example">
            <div className="help-tile">P</div>
            <div className="help-tile present">I</div>
            <div className="help-tile">L</div>
            <div className="help-tile">L</div>
            <div className="help-tile">S</div>
          </div>
          <p className="help-note"><strong>I</strong> is in the word but in the wrong spot.</p>

          <div className="help-example">
            <div className="help-tile">V</div>
            <div className="help-tile">A</div>
            <div className="help-tile">G</div>
            <div className="help-tile absent">U</div>
            <div className="help-tile">E</div>
          </div>
          <p className="help-note"><strong>U</strong> is not in the word in any spot.</p>

          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--color-header-border)' }} />
          <p>A new puzzle is available each day!</p>
        </div>
      </div>
    </div>
  );
}
