/**
 * Canvas bar and canvas menu.
 *
 * The canvas menu is what pops up next to a selected block. The AI Apps
 * plugin prepends its own entries here; see `../../../plugins/ai-apps.ts`.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/customization/canvas-menu-3d8b1e/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

export function setupCanvas(cesdk: CreativeEditorSDK): void {
  cesdk.ui.setComponentOrder({ in: 'ly.img.canvas.bar', at: 'bottom' }, [
    'ly.img.settings.canvasBar',
    'ly.img.spacer',
    'ly.img.page.add.canvasBar',
    'ly.img.spacer'
  ]);

  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.menu', when: { editMode: 'Transform' } },
    [
      'ly.img.group.enter.canvasMenu',
      'ly.img.group.select.canvasMenu',
      'ly.img.page.moveUp.canvasMenu',
      'ly.img.page.moveDown.canvasMenu',
      'ly.img.separator',
      'ly.img.text.edit.canvasMenu',
      'ly.img.text.styles.canvasMenu',
      'ly.img.replace.canvasMenu',
      'ly.img.separator',
      'ly.img.bringForward.canvasMenu',
      'ly.img.sendBackward.canvasMenu',
      'ly.img.separator',
      'ly.img.duplicate.canvasMenu',
      'ly.img.delete.canvasMenu',
      'ly.img.separator',
      'ly.img.options.canvasMenu'
    ]
  );

  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.menu', when: { editMode: 'Text' } },
    [
      'ly.img.text.color.canvasMenu',
      'ly.img.separator',
      'ly.img.text.bold.canvasMenu',
      'ly.img.text.italic.canvasMenu',
      'ly.img.text.underline.canvasMenu',
      'ly.img.text.strikethrough.canvasMenu',
      'ly.img.separator',
      'ly.img.text.list.unordered.canvasMenu',
      'ly.img.text.list.ordered.canvasMenu',
      'ly.img.separator',
      'ly.img.text.variables.canvasMenu'
    ]
  );

  // Vector edit mode puts its controls in the inspector bar instead.
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.menu', when: { editMode: 'Vector' } },
    []
  );
}
