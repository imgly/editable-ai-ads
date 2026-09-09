/**
 * Step 6: export and save for later edits.
 *
 * Exports render the page as it is. Saving keeps the scene as JSON so a
 * user can come back and edit the same blocks. One caveat that matters:
 * gateway image URLs are short-lived. A scene that still points at them
 * stops rendering once they expire, so a product should re-upload
 * generated images to its own storage before saving.
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

import { FORMATS, type AdFormat, type AdFormatId } from './formats';
import { currentFormat, currentPage, resizeTo } from './resize';

export async function exportPng(cesdk: CreativeEditorSDK): Promise<Blob> {
  const page = currentPage(cesdk.engine);
  return cesdk.engine.block.export(page, { mimeType: 'image/png' });
}

export async function exportPdf(cesdk: CreativeEditorSDK): Promise<Blob> {
  const scene = cesdk.engine.scene.get();
  if (scene == null) throw new Error('No scene to export');
  return cesdk.engine.block.export(scene, { mimeType: 'application/pdf' });
}

/** Renders every format from the one scene, then restores the format the user had. */
export async function exportAllFormats(
  cesdk: CreativeEditorSDK
): Promise<Record<AdFormatId, Blob>> {
  const before: AdFormat = currentFormat(cesdk.engine) ?? FORMATS.square;
  const output = {} as Record<AdFormatId, Blob>;

  for (const format of Object.values(FORMATS)) {
    await resizeTo(cesdk, format);
    output[format.id] = await exportPng(cesdk);
  }

  await resizeTo(cesdk, before);
  return output;
}

/** The scene as a string. Store it wherever your designs live. */
export function saveScene(cesdk: CreativeEditorSDK): Promise<string> {
  return cesdk.engine.scene.saveToString();
}

/** Plain browser download with a filename of our choosing. */
export function download(
  data: Blob | string,
  mimeType: string,
  filename: string
): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
