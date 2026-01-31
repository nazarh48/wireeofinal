/**
 * Basic tests for undo/redo reducer logic (configurator history).
 * Uses the store's initial state shape and simulates history transitions.
 */

import { describe, it, expect } from 'vitest';

// Pure undo/redo logic matching useStore: given history array and index, return new elements and index
function applyUndo(history, historyIndex) {
  if (!history?.length || historyIndex <= 0) return null;
  return {
    elements: JSON.parse(JSON.stringify(history[historyIndex - 1])),
    historyIndex: historyIndex - 1,
  };
}

function applyRedo(history, historyIndex) {
  if (!history?.length || historyIndex >= history.length - 1) return null;
  return {
    elements: JSON.parse(JSON.stringify(history[historyIndex + 1])),
    historyIndex: historyIndex + 1,
  };
}

describe('undo/redo reducer', () => {
  const empty = [];
  const stateA = [{ id: '1', type: 'rect', x: 0, y: 0 }];
  const stateB = [{ id: '1', type: 'rect', x: 10, y: 0 }];
  const history = [empty, stateA, stateB];
  const index = 2;

  it('undo returns previous state and decremented index', () => {
    const result = applyUndo(history, index);
    expect(result).not.toBeNull();
    expect(result.historyIndex).toBe(1);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0].x).toBe(0);
  });

  it('undo at index 0 returns null', () => {
    expect(applyUndo(history, 0)).toBeNull();
  });

  it('redo returns next state and incremented index', () => {
    const result = applyRedo(history, 0);
    expect(result).not.toBeNull();
    expect(result.historyIndex).toBe(1);
    expect(result.elements[0].x).toBe(0);
  });

  it('redo at last index returns null', () => {
    expect(applyRedo(history, 2)).toBeNull();
  });
});
