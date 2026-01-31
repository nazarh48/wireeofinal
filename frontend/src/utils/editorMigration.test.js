/**
 * Basic tests for editor migration: old format → Konva node schema.
 */

import { describe, it, expect } from 'vitest';
import { normalizeElement, normalizeElements, toSerializable } from './editorMigration.js';

describe('editorMigration', () => {
  describe('normalizeElement', () => {
    it('adds id, type, zIndex, locked, visible to legacy element', () => {
      const legacy = { x: 10, y: 20, width: 100, height: 50, fill: '#f00' };
      const out = normalizeElement(legacy, 0);
      expect(out).toBeDefined();
      expect(out.id).toBeDefined();
      expect(out.type).toBe('rectangle');
      expect(out.zIndex).toBe(0);
      expect(out.visible).toBe(true);
      expect(out.locked).toBe(false);
      expect(out.x).toBe(10);
      expect(out.y).toBe(20);
      expect(out.width).toBe(100);
      expect(out.height).toBe(50);
      expect(out.fill).toBe('#f00');
    });

    it('preserves existing id and type', () => {
      const legacy = { id: 'elem_123', type: 'text', text: 'Hello' };
      const out = normalizeElement(legacy, 0);
      expect(out.id).toBe('elem_123');
      expect(out.type).toBe('text');
      expect(out.text).toBe('Hello');
    });

    it('returns null for invalid input', () => {
      expect(normalizeElement(null)).toBeNull();
      expect(normalizeElement(undefined)).toBeNull();
      expect(normalizeElement('string')).toBeNull();
    });
  });

  describe('normalizeElements', () => {
    it('normalizes array of legacy elements', () => {
      const raw = [
        { type: 'rectangle', x: 0, y: 0, width: 50, height: 50 },
        { type: 'text', text: 'Hi', x: 10, y: 10 },
      ];
      const out = normalizeElements(raw);
      expect(out).toHaveLength(2);
      expect(out[0].type).toBe('rectangle');
      expect(out[0].x).toBe(0);
      expect(out[1].type).toBe('text');
      expect(out[1].text).toBe('Hi');
    });

    it('returns empty array for non-array input', () => {
      expect(normalizeElements(null)).toEqual([]);
      expect(normalizeElements(undefined)).toEqual([]);
      expect(normalizeElements({})).toEqual([]);
    });
  });

  describe('toSerializable', () => {
    it('returns flat object for persistence', () => {
      const node = { id: 'a', type: 'rect', x: 1, y: 2, zIndex: 0 };
      const out = toSerializable(node);
      expect(out.id).toBe('a');
      expect(out.x).toBe(1);
      expect(out.y).toBe(2);
    });
  });
});
