/**
 * Step 4: regenerate one layer only.
 *
 * When the background is wrong, run an image-to-image model on the
 * background block alone. The product, headline and logo blocks are
 * not touched, so the rest of the ad stays exactly as the user left it.
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { GatewayClient } from '@imgly/plugin-ai-generation-web';

import { buildInput } from './gateway';
import { measureImage, MODELS } from './generate';
import { findLayer, LAYER } from './scene';

export async function regenerateBackground(
  cesdk: CreativeEditorSDK,
  client: GatewayClient,
  prompt: string
): Promise<void> {
  const engine = cesdk.engine;
  const background = findLayer(engine, LAYER.background);

  // The model needs the current background as its input image. Export
  // just that block, upload it to the gateway, and pass the URL along.
  const current = await engine.block.export(background, { mimeType: 'image/png' });
  const upload = await client.upload(current, 'image/png');

  // NanoBanana Pro Edit takes `prompt` and `image_urls`; `format: 'auto'` keeps the input size.
  const input = await buildInput(client, MODELS.image2image, {
    prompt,
    image_urls: [upload.asset_url],
    format: 'auto'
  });
  const uri = await client.generate(MODELS.image2image, input, {});

  // Swap the image on the existing fill. Position, size and stacking order stay.
  const image = await measureImage(uri);
  const fill = engine.block.getFill(background);
  engine.block.setSourceSet(fill, 'fill/image/sourceSet', [image]);
}
