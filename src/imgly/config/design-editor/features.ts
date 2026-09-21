/**
 * Which editor features this demo turns on.
 *
 * Design mode only: everything video, audio and template-placeholder
 * related stays off. Features control UI visibility; what a *user* may
 * change on a specific block is a separate mechanism, the block scopes in
 * `src/scene.ts`.
 *
 * Glob patterns work too (`'ly.img.text.*'`). For the full catalog of
 * feature ids see the docs.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/customization/disable-or-enable-f058e2/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

export function setupFeatures(cesdk: CreativeEditorSDK): void {
  cesdk.feature.enable([
    'ly.img.keyboard.shortcuts' /* The engine's built-in shortcut catalog */,

    'ly.img.navigation' /* Navigation bar, undo/redo, zoom, actions */,
    'ly.img.canvas' /* Canvas bar and canvas menu */,
    'ly.img.dock' /* Asset dock */,
    'ly.img.library.panel' /* Asset library panel */,
    'ly.img.inspector' /* Inspector panel */,
    'ly.img.inspector.bar' /* Contextual toolbar */,
    'ly.img.inspector.toggle' /* Inspector toggle button */,
    'ly.img.notifications' /* Undo/redo notifications */,

    'ly.img.text' /* Text editing: the headline is a real text block */,
    'ly.img.transform' /* Position, size, rotation */,
    'ly.img.crop' /* Crop the product or background */,
    'ly.img.page' /* Page controls, including resize */,
    'ly.img.scene.layout' /* Page layout modes */,

    'ly.img.delete',
    'ly.img.duplicate',
    'ly.img.group',
    'ly.img.replace' /* Replace a block's image fill */,

    'ly.img.fill.color',
    'ly.img.fill.image',
    'ly.img.stroke',
    'ly.img.opacity',
    'ly.img.blendMode',
    'ly.img.shape.options',
    'ly.img.combine',
    'ly.img.position',

    'ly.img.adjustment',
    'ly.img.filter',
    'ly.img.effect',
    'ly.img.blur',
    'ly.img.shadow',
    'ly.img.cutout'
  ]);
}
