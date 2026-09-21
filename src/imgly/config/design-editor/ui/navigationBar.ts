/**
 * Navigation bar: the top strip of the editor.
 *
 * The export entries run the actions registered in `../actions.ts`.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/customization/navigation-bar-8e9b0f/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

export function setupNavigationBar(cesdk: CreativeEditorSDK): void {
  cesdk.ui.setComponentOrder({ in: 'ly.img.navigation.bar' }, [
    'ly.img.documentSettings.navigationBar',
    'ly.img.undoRedo.navigationBar',
    'ly.img.spacer',
    'ly.img.title.navigationBar',
    'ly.img.spacer',
    'ly.img.zoom.navigationBar',
    'ly.img.preview.navigationBar',
    {
      id: 'ly.img.actions.navigationBar',
      children: [
        'ly.img.exportImage.navigationBar',
        'ly.img.exportPDF.navigationBar'
      ]
    }
  ]);
}
