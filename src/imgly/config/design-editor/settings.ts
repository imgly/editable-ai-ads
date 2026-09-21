/**
 * Engine settings: how the canvas behaves.
 *
 * @see https://img.ly/docs/cesdk/js/settings-970c98/
 */

import type { CreativeEngine } from '@cesdk/cesdk-js';

export function setupSettings(engine: CreativeEngine): void {
  // Interaction
  engine.editor.setSetting('doubleClickToCropEnabled', true);
  engine.editor.setSetting('doubleClickSelectionMode', 'Hierarchical');

  // Page
  engine.editor.setSetting('page/allowCropInteraction', true);
  engine.editor.setSetting('page/dimOutOfPageAreas', true);
  engine.editor.setSetting('page/moveChildrenWhenCroppingFill', false);
  engine.editor.setSetting('page/selectWhenNoBlocksSelected', false);

  // Page title above the canvas
  engine.editor.setSetting('page/title/show', true);
  engine.editor.setSetting('page/title/showOnSinglePage', true);
  engine.editor.setSetting('page/title/showPageTitleTemplate', true);
  engine.editor.setSetting('page/title/appendPageName', true);
  engine.editor.setSetting('page/title/separator', '-');
  engine.editor.setSetting('page/title/canEdit', true);

  engine.editor.setSetting('placeholderControls/showOverlay', true);
  engine.editor.setSetting('placeholderControls/showButton', true);

  engine.editor.setSetting('colorPicker/colorMode', 'Any');
}
