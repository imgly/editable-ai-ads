/**
 * Inspector bar: the contextual toolbar above the canvas.
 *
 * One component order per edit mode. Video and audio entries are left out;
 * this is a design editor.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/customization/inspector-bar-cd3b78/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

export function setupInspectorBar(cesdk: CreativeEditorSDK): void {
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.inspector.bar', when: { editMode: 'Transform' } },
    [
      'ly.img.spacer',

      'ly.img.pageResize.inspectorBar',
      'ly.img.separator',

      // Shape and cutout
      'ly.img.shape.options.inspectorBar',
      'ly.img.cutout.type.inspectorBar',
      'ly.img.cutout.offset.inspectorBar',
      'ly.img.cutout.smoothing.inspectorBar',

      // Groups
      'ly.img.group.create.inspectorBar',
      'ly.img.group.ungroup.inspectorBar',
      'ly.img.separator',

      // Text
      'ly.img.text.typeFace.inspectorBar',
      'ly.img.text.bold.inspectorBar',
      'ly.img.text.italic.inspectorBar',
      'ly.img.text.fontSize.inspectorBar',
      'ly.img.text.alignHorizontal.inspectorBar',
      'ly.img.text.advanced.inspectorBar',
      'ly.img.combine.inspectorBar',
      'ly.img.separator',

      // Fill, crop, stroke
      'ly.img.fill.inspectorBar',
      'ly.img.crop.inspectorBar',
      'ly.img.separator',
      'ly.img.stroke.inspectorBar',
      'ly.img.separator',
      'ly.img.text.background.inspectorBar',
      'ly.img.separator',
      'ly.img.text.path.inspectorBar',
      'ly.img.separator',

      // Effects
      {
        id: 'ly.img.appearance.inspectorBar',
        children: [
          'ly.img.adjustment.inspectorBar',
          'ly.img.filter.inspectorBar',
          'ly.img.effect.inspectorBar',
          'ly.img.blur.inspectorBar'
        ]
      },
      'ly.img.separator',
      'ly.img.shadow.inspectorBar',
      'ly.img.separator',

      'ly.img.opacityOptions.inspectorBar',
      'ly.img.separator',
      'ly.img.position.inspectorBar',
      'ly.img.spacer',
      'ly.img.separator',
      'ly.img.inspectorToggle.inspectorBar'
    ]
  );

  cesdk.ui.setComponentOrder(
    { in: 'ly.img.inspector.bar', when: { editMode: 'Crop' } },
    ['ly.img.cropControls.inspectorBar']
  );

  cesdk.ui.setComponentOrder(
    { in: 'ly.img.inspector.bar', when: { editMode: 'Vector' } },
    [
      'ly.img.vectorEdit.moveMode.inspectorBar',
      'ly.img.vectorEdit.addMode.inspectorBar',
      'ly.img.vectorEdit.deleteMode.inspectorBar',
      'ly.img.separator',
      'ly.img.vectorEdit.bendMode.inspectorBar',
      'ly.img.vectorEdit.mirrorMode.inspectorBar',
      'ly.img.separator',
      'ly.img.vectorEdit.done.inspectorBar'
    ]
  );
}
