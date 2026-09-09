/**
 * Step 5: resize the same design to 1:1, 9:16 and 16:9.
 *
 * The page changes size and the layout rules in `scene.ts` run again.
 * No block is regenerated; the headline reflows because it is text.
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { CreativeEngine } from '@cesdk/cesdk-js';

import { FORMATS, type AdFormat } from './formats';
import { layoutPage } from './scene';

export async function resizeTo(
  cesdk: CreativeEditorSDK,
  format: AdFormat
): Promise<void> {
  const engine = cesdk.engine;
  const page = currentPage(engine);

  engine.block.setWidth(page, format.width);
  engine.block.setHeight(page, format.height);
  layoutPage(engine, page);

  void engine.scene.zoomToBlock(page, { padding: 40, animate: false });
}

export function currentPage(engine: CreativeEngine): number {
  const [page] = engine.block.findByType('page');
  if (page == null) throw new Error('The scene has no page');
  return page;
}

/** The format whose size matches the page, or undefined if the user resized it by hand. */
export function currentFormat(engine: CreativeEngine): AdFormat | undefined {
  const page = currentPage(engine);
  const width = engine.block.getWidth(page);
  const height = engine.block.getHeight(page);
  return Object.values(FORMATS).find(
    (format) => format.width === width && format.height === height
  );
}
