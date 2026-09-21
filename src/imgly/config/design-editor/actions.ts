/**
 * Actions the editor's own UI runs (navigation bar, keyboard shortcuts).
 *
 * These override CE.SDK's defaults so save, export and import go through
 * this app. The article's steps do not use them; they call `src/export.ts`
 * directly. Both end up at the same engine calls.
 *
 * Note the same caveat as `src/export.ts`: a saved scene points at the
 * image URLs currently in the blocks, which for generated images are
 * in-memory `blob:` URLs. Use "Save archive" (`Mod+Shift+S`) to get a
 * `.zip` with the pixels embedded.
 *
 * @see https://img.ly/docs/cesdk/js/actions-6ch24x
 * @see https://img.ly/docs/cesdk/js/export-save-publish/export/overview-9ed3a8/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

export function setupActions(cesdk: CreativeEditorSDK): void {
  // The scene as text. Small, but only as durable as the URLs inside it.
  cesdk.actions.register('saveScene', async () => {
    const scene = await cesdk.engine.scene.saveToString();
    await cesdk.utils.downloadFile(scene, 'text/plain;charset=UTF-8');
  });

  // The scene plus its assets. This one survives a page reload.
  cesdk.actions.register('exportScene', async ({ format = 'scene' }) => {
    await cesdk.utils.downloadFile(
      format === 'archive'
        ? await cesdk.engine.scene.saveToArchive()
        : await cesdk.engine.scene.saveToString(),
      format === 'archive' ? 'application/zip' : 'text/plain;charset=UTF-8'
    );
  });

  // One picker for both: the engine tells a scene from an archive by content.
  cesdk.actions.register('importScene', async () => {
    const blobURL = await cesdk.utils.loadFile({
      accept: '.imgly,.scene,.zip',
      returnType: 'objectURL'
    });
    try {
      await cesdk.engine.scene.load(blobURL);
    } finally {
      URL.revokeObjectURL(blobURL);
    }
    await cesdk.actions.run('zoom.toPage', { page: 'first' });
  });

  // Used by the SDK's built-in export UI.
  cesdk.actions.register('exportDesign', async (exportOptions) => {
    const { blobs, options } = await cesdk.utils.export(exportOptions);
    await cesdk.utils.downloadFile(blobs[0], options.mimeType);
  });

  // The navigation bar's "Export image" entry.
  cesdk.actions.register('exportImage', async () => {
    const { blobs, options } = await cesdk.utils.export({
      mimeType: 'image/png'
    });
    await cesdk.utils.downloadFile(blobs[0], options.mimeType);
  });

  // Local blob URLs for files dropped into the upload library.
  cesdk.actions.register('uploadFile', (file, onProgress, context) => {
    return cesdk.utils.localUpload(file, context);
  });
}
