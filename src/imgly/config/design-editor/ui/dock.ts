/**
 * Dock: the asset libraries down the left edge.
 *
 * The AI Apps plugin prepends an "AI" entry at the start; see
 * `../../../plugins/ai-apps.ts`.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/customization/dock-cb916c/
 * @see https://img.ly/docs/cesdk/js/user-interface/appearance/icons-679e32/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

export function setupDock(cesdk: CreativeEditorSDK): void {
  cesdk.engine.editor.setSetting('dock/hideLabels', false);
  cesdk.engine.editor.setSetting('dock/iconSize', 'large');

  cesdk.ui.setComponentOrder({ in: 'ly.img.dock' }, [
    {
      id: 'ly.img.assetLibrary.dock',
      key: 'ly.img.elements',
      icon: '@imgly/Library',
      label: 'component.library.elements',
      entries: [
        'ly.img.image',
        'ly.img.text',
        'ly.img.vector.shape',
        'ly.img.sticker'
      ]
    },
    {
      id: 'ly.img.assetLibrary.dock',
      key: 'ly.img.upload',
      icon: '@imgly/Upload',
      label: 'libraries.ly.img.upload.label',
      entries: ['ly.img.upload']
    },
    {
      id: 'ly.img.assetLibrary.dock',
      key: 'ly.img.image',
      icon: '@imgly/Image',
      label: 'libraries.ly.img.image.label',
      entries: ['ly.img.image', 'ly.img.image.upload']
    },
    {
      id: 'ly.img.assetLibrary.dock',
      key: 'ly.img.text',
      icon: '@imgly/Text',
      label: 'libraries.ly.img.text.label',
      entries: ['ly.img.text']
    },
    {
      id: 'ly.img.assetLibrary.dock',
      key: 'ly.img.vector.shape',
      icon: '@imgly/Shapes',
      label: 'libraries.ly.img.vector.shape.label',
      entries: ['ly.img.vector.shape']
    },
    {
      id: 'ly.img.assetLibrary.dock',
      key: 'ly.img.sticker',
      icon: '@imgly/Sticker',
      label: 'libraries.ly.img.sticker.label',
      entries: ['ly.img.sticker']
    }
  ]);
}
