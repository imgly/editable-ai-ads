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

import { BRAND } from './brand';
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

  const background = await addImageBlock(engine, page, parts.background, LAYER.background);
  engine.block.setContentFillMode(background, 'Cover');

  const product = await addImageBlock(engine, page, parts.product, LAYER.product);
  engine.block.setContentFillMode(product, 'Contain');

  const headline = engine.block.create('text');
  engine.block.setName(headline, LAYER.headline);
  engine.block.replaceText(headline, parts.headline);
  engine.block.setFont(headline, BRAND.headline.fontUri, BRAND.headline.typeface);
  engine.block.setTextColor(headline, BRAND.headline.color);
  engine.block.setWidthMode(headline, 'Absolute');
  engine.block.setHeightMode(headline, 'Auto');
  engine.block.appendChild(page, headline);

  const logo = await addImageBlock(engine, page, parts.logo, LAYER.logo);
  engine.block.setContentFillMode(logo, 'Contain');
  lockBlock(engine, logo);

  layoutPage(engine, page);
  await engine.scene.zoomToBlock(page, { padding: 40, animate: false });
}

async function addImageBlock(
  engine: CreativeEngine,
  page: number,
  image: ImagePart,
  name: string
): Promise<number> {
  const block = await engine.block.addImage(image.uri, {
    size: { width: image.width, height: image.height }
  });
  engine.block.setName(block, name);
  engine.block.appendChild(page, block);
  return block;
}

/** Finds a named layer. Throws if the scene was not built by `composeScene`. */
export function findLayer(engine: CreativeEngine, name: string): number {
  const [block] = engine.block.findByName(name);
  if (block == null) throw new Error(`No block named "${name}" in the scene`);
  return block;
}

/**
 * Turns off every scope that would let a user change the block. The
 * global scope must defer to the block for the block setting to count.
 */
export function lockBlock(engine: CreativeEngine, block: number): void {
  const scopes = [
    'layer/move',
    'layer/resize',
    'layer/rotate',
    'layer/crop',
    'fill/change',
    'fill/changeType',
    'lifecycle/destroy',
    'lifecycle/duplicate'
  ] as const;
  for (const scope of scopes) {
    engine.editor.setGlobalScope(scope, 'Defer');
    engine.block.setScopeEnabled(block, scope, false);
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
