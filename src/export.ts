/**
 * Step 6: export and save for later edits.
 *
 * Exports render the page as it is. Saving keeps the blocks so a user can
 * come back and edit them, and there are two flavours:
 *
 *   saveScene   the scene as text. Small, but it only *references* its
 *               images. Generated images in this demo live in in-memory
 *               `blob:` URLs, which die with the tab, so a scene saved
 *               this way will not render again after a reload. A product
 *               uploads generated images to its own storage first (see
 *               `persistImage` in `generate.ts`), and then this format is
 *               the right one.
 *   saveArchive the scene plus its pixels, as a zip. Larger, but it
 *               reloads anywhere. That is what the demo offers, so "save
 *               and come back later" actually works without a backend.
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

import { FORMATS, type AdFormat, type AdFormatId } from './formats';
import { currentFormat, currentPage, resizeTo } from './resize';

export async function exportPng(cesdk: CreativeEditorSDK): Promise<Blob> {
  const page = currentPage(cesdk.engine);
  return cesdk.engine.block.export(page, { mimeType: 'image/png' });
}

export async function exportPdf(cesdk: CreativeEditorSDK): Promise<Blob> {
  const page = currentPage(cesdk.engine);
  return cesdk.engine.block.export(page, { mimeType: 'application/pdf' });
}

/**
 * Renders every format from the one scene, then restores the format the
 * user had.
 *
 * Note that each resize re-runs `layoutPage`, so any block the user moved
 * by hand goes back to its rule-based position. Snapshot the transforms
 * first if you need to keep manual placement.
 */
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

/** The scene as a string: the engine's own format, images by reference. */
export function saveScene(cesdk: CreativeEditorSDK): Promise<string> {
  return cesdk.engine.scene.saveToString();
}

/** The scene plus its images, as a zip the engine can load back. */
export function saveArchive(cesdk: CreativeEditorSDK): Promise<Blob> {
  return cesdk.engine.scene.saveToArchive();
}

/**
 * Plain browser download with a filename of our choosing.
 *
 * The object URL is revoked on the next tick, not immediately: revoking
 * in the same task can cancel the download before the browser has read
 * the blob.
 */
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
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Several downloads in a row.
 *
 * Browsers throttle or block automatic downloads that arrive back to
 * back, so these are spaced out.
 */
export async function downloadAll(
  files: Array<{ data: Blob | string; mimeType: string; filename: string }>
): Promise<void> {
  for (const [index, file] of files.entries()) {
    if (index > 0) await delay(400);
    download(file.data, file.mimeType, file.filename);
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
