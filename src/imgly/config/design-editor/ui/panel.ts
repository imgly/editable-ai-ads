/**
 * Panels: where the inspector and the asset library sit.
 *
 * Both are docked left and push the canvas, so the app's own "Generate ad"
 * panel keeps the right-hand side to itself.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/ui-extensions/create-custom-panel-d87b83/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

export function setupPanels(cesdk: CreativeEditorSDK): void {
  cesdk.ui.setPanelPosition('//ly.img.panel/inspector', 'left');
  cesdk.ui.setPanelFloating('//ly.img.panel/inspector', false);

  cesdk.ui.setPanelPosition('//ly.img.panel/assets', 'left');
  cesdk.ui.setPanelFloating('//ly.img.panel/assets', false);
}
