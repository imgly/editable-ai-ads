/**
 * Output formats the same ad is resized to.
 */

export type AdFormatId = 'square' | 'story' | 'landscape';

export interface AdFormat {
  id: AdFormatId;
  label: string;
  width: number;
  height: number;
}

export const FORMATS: Record<AdFormatId, AdFormat> = {
  square: { id: 'square', label: '1:1', width: 1080, height: 1080 },
  story: { id: 'story', label: '9:16', width: 1080, height: 1920 },
  landscape: { id: 'landscape', label: '16:9', width: 1920, height: 1080 }
};
