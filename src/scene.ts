/**
 * Step 2: compose the parts into an editable scene.
 *
 * Each part becomes its own block on one page. The headline is a real
 * text block, so the user edits words, not pixels. The logo is an image
 * block with its editing scopes turned off, so it stays exact. Blocks
 * are named so later steps can find them.
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { CreativeEngine } from '@cesdk/cesdk-js';

import { BRAND, type LogoVariant } from './brand';
import { FORMATS, type AdFormat } from './formats';
import type { AdParts, ImagePart } from './generate';

export const LAYER = {
  background: 'background',
  product: 'product',
  headline: 'headline',
  logo: 'logo'
} as const;

export async function composeScene(
  cesdk: CreativeEditorSDK,
  parts: AdParts,
  format: AdFormat = FORMATS.square
): Promise<void> {
  const engine = cesdk.engine;

  await cesdk.actions.run('scene.create', {
    page: { width: format.width, height: format.height, unit: 'Pixel' }
  });
  const page = engine.block.findByType('page')[0];

  const background = addImageBlock(engine, page, parts.background, LAYER.background);
  engine.block.setContentFillMode(background, 'Cover');

  const product = addImageBlock(engine, page, parts.product, LAYER.product);
  engine.block.setContentFillMode(product, 'Contain');

  const headline = engine.block.create('text');
  engine.block.setName(headline, LAYER.headline);
  engine.block.replaceText(headline, parts.headline);
  engine.block.setFont(headline, BRAND.headline.fontUri, BRAND.headline.typeface);
  engine.block.setTextColor(headline, BRAND.headline.color);
  engine.block.setWidthMode(headline, 'Absolute');
  engine.block.setHeightMode(headline, 'Auto');
  engine.block.appendChild(page, headline);

  const logo = addImageBlock(engine, page, parts.logo, LAYER.logo);
  engine.block.setContentFillMode(logo, 'Contain');

  // Step 3: what the user may change. Everything except the logo.
  setEditable(engine, background, true);
  setEditable(engine, product, true);
  setEditable(engine, headline, true);
  setEditable(engine, logo, false);

  layoutPage(engine, page);
  void engine.scene.zoomToBlock(page, { padding: 40, animate: false });
}

/**
 * A graphic block with an image fill. The source set carries the image
 * size, so the engine can lay the block out before the pixels arrive.
 */
function addImageBlock(
  engine: CreativeEngine,
  page: number,
  image: ImagePart,
  name: string
): number {
  const block = engine.block.create('graphic');
  engine.block.setShape(block, engine.block.createShape('rect'));

  const fill = engine.block.createFill('image');
  engine.block.setSourceSet(fill, 'fill/image/sourceSet', [toSource(image)]);
  engine.block.setFill(block, fill);

  engine.block.setName(block, name);
  engine.block.appendChild(page, block);
  return block;
}

/**
 * Step 3: swap the logo for another approved variant.
 *
 * The user cannot replace the logo with an arbitrary image (its
 * `fill/change` scope is off), but the app can. That is the difference
 * between "locked" and "fixed": the block's position, size and existence
 * are protected, and the only images that can go into it are the ones
 * the brand kit approves.
 */
export function swapLogo(engine: CreativeEngine, variant: LogoVariant): void {
  const logo = findLayer(engine, LAYER.logo);
  const fill = engine.block.getFill(logo);
  engine.block.setSourceSet(fill, 'fill/image/sourceSet', [toSource(variant)]);
}

/** The engine accepts exactly uri, width and height in a source set, nothing more. */
function toSource(image: ImagePart): ImagePart {
  return { uri: image.uri, width: image.width, height: image.height };
}

/** Finds a named layer. Throws if the scene was not built by `composeScene`. */
export function findLayer(engine: CreativeEngine, name: string): number {
  const [block] = engine.block.findByName(name);
  if (block == null) throw new Error(`No block named "${name}" in the scene`);
  return block;
}

/** The scopes that decide whether a user can change a block. */
const EDIT_SCOPES = [
  'layer/move',
  'layer/resize',
  'layer/rotate',
  'layer/crop',
  'fill/change',
  'fill/changeType',
  'lifecycle/destroy',
  'lifecycle/duplicate'
] as const;

/**
 * Locks or unlocks one block. The global scope is set to defer to the
 * block, so each block's own setting decides. Note that once a global
 * scope defers, every block needs an explicit setting: a block that is
 * never passed here stays locked.
 */
export function setEditable(
  engine: CreativeEngine,
  block: number,
  editable: boolean
): void {
  for (const scope of EDIT_SCOPES) {
    engine.editor.setGlobalScope(scope, 'Defer');
    engine.block.setScopeEnabled(block, scope, editable);
  }
}

/**
 * Places the four layers for the page's current size.
 *
 * Runs after compose and after every resize. Positions are fractions of
 * the page, so the same rules produce a 1:1, 9:16 or 16:9 layout.
 */
export function layoutPage(engine: CreativeEngine, page: number): void {
  const width = engine.block.getWidth(page);
  const height = engine.block.getHeight(page);
  const margin = Math.round(Math.min(width, height) * 0.06);
  const portrait = height > width;

  place(engine, findLayer(engine, LAYER.background), 0, 0, width, height);

  // Logo: top right, always the same share of the width.
  const logoWidth = width * 0.22;
  const logoHeight = logoWidth * (BRAND.logo.height / BRAND.logo.width);
  place(engine, findLayer(engine, LAYER.logo), width - margin - logoWidth, margin, logoWidth, logoHeight);

  const headline = findLayer(engine, LAYER.headline);
  const product = findLayer(engine, LAYER.product);

  if (portrait) {
    // Stacked: headline under the logo line, product in the lower half.
    engine.block.setFloat(headline, 'text/fontSize', width * 0.09);
    engine.block.setPositionX(headline, margin);
    engine.block.setPositionY(headline, margin + logoHeight + margin);
    engine.block.setWidth(headline, width - 2 * margin);

    place(engine, product, margin, height * 0.42, width - 2 * margin, height * 0.52);
  } else {
    // Side by side: headline left, product right.
    engine.block.setFloat(headline, 'text/fontSize', width * 0.055);
    engine.block.setPositionX(headline, margin);
    engine.block.setPositionY(headline, height * 0.38);
    engine.block.setWidth(headline, width * 0.5 - margin);

    const top = margin + logoHeight;
    place(engine, product, width * 0.52, top, width * 0.48 - margin, height - top - margin);
  }
}

function place(
  engine: CreativeEngine,
  block: number,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  engine.block.setPositionX(block, x);
  engine.block.setPositionY(block, y);
  engine.block.setWidth(block, width);
  engine.block.setHeight(block, height);
}
