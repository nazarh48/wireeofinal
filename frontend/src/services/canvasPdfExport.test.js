/**
 * Basic tests for canvas PDF export pipeline.
 */

import { describe, it, expect, vi } from 'vitest';
import { stageToDataURL, exportCanvasToPDF } from './canvasPdfExport.js';

describe('canvasPdfExport', () => {
  describe('stageToDataURL', () => {
    it('returns a string (data URL) when stage has toDataURL', async () => {
      const fakeStage = {
        toDataURL: vi.fn(() => 'data:image/png;base64,abc'),
      };
      const url = await stageToDataURL(fakeStage);
      expect(typeof url).toBe('string');
      expect(url.startsWith('data:')).toBe(true);
    });
  });

  describe('exportCanvasToPDF', () => {
    it('throws when stage ref is missing or invalid', async () => {
      await expect(exportCanvasToPDF(null)).rejects.toThrow('Stage ref is required');
      await expect(exportCanvasToPDF(undefined)).rejects.toThrow('Stage ref is required');
      await expect(exportCanvasToPDF({ current: null })).rejects.toThrow('Stage ref is required');
      await expect(exportCanvasToPDF({})).rejects.toThrow('Stage ref is required');
    });
  });
});
