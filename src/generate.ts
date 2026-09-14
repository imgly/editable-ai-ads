/**
 * Step 1: generate the parts, not the picture.
 *
 * An ad is four parts. Each comes from a different source:
 *   background  text-to-image model
 *   product     the customer's own photo, background removed in the browser
 *   headline    text model
 *   logo        brand kit asset, no model involved
 *
 * Nothing here touches the editor. The output is plain data that
 * `scene.ts` turns into blocks.
 */

import { removeBackground } from '@imgly/background-removal';
import type { GatewayClient } from '@imgly/plugin-ai-generation-web';

import { BRAND } from './brand';
import { buildInput } from './gateway';

// Gateway model IDs. Any id from GET https://gateway.img.ly/v1/models works;
// these two image models are on IMG.LY's published model list.
export const MODELS = {
  text2image: 'ideogram/v3',
  image2image: 'google/nano-banana-pro-edit',
  text2text: 'anthropic/claude-sonnet-4.6'
} as const;

export interface AdBrief {
  productName: string;
  audience: string;
  backgroundPrompt: string;
  productImage: Blob;
}

export interface ImagePart {
  uri: string;
  width: number;
  height: number;
}

export interface AdParts {
  background: ImagePart;
  product: ImagePart;
  headline: string;
  logo: ImagePart;
}

export async function generateParts(
  client: GatewayClient,
  brief: AdBrief
): Promise<AdParts> {
  // The three sources are independent, so they run at the same time.
  const [background, headline, product] = await Promise.all([
    generateBackground(client, brief.backgroundPrompt),
    generateHeadline(client, brief),
    cutOutProduct(brief.productImage)
  ]);

  return { background, product, headline, logo: BRAND.logo };
}

/** One text-to-image call. Returns the image URL the gateway hands back. */
export async function generateBackground(
  client: GatewayClient,
  prompt: string
): Promise<ImagePart> {
  // Ideogram V3 takes `format` (1:1, 4:3, 16:9, 3:4, 9:16) and a `style`.
  const input = await buildInput(client, MODELS.text2image, {
    prompt,
    format: '1:1',
    style: 'REALISTIC'
  });
  const uri = await client.generate(MODELS.text2image, input, {});
  return measureImage(await persistImage(uri));
}

/**
 * Gateway output URLs are short-lived (they redirect to signed storage
 * URLs that expire within the hour) and the engine cannot always fetch
 * them directly. Download the image once and hand the engine a local
 * object URL. A product would upload the blob to its own storage here
 * instead, so that saved scenes keep working; see README.
 */
export async function persistImage(uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Could not download generated image (${response.status})`);
  }
  return URL.createObjectURL(await response.blob());
}

/** One text call. The headline is returned as text, never rendered into pixels. */
export async function generateHeadline(
  client: GatewayClient,
  brief: Pick<AdBrief, 'productName' | 'audience'>
): Promise<string> {
  const prompt =
    `Write one advertising headline for ${brief.productName}. ` +
    `Audience: ${brief.audience}. ` +
    'At most six words. No quotation marks. No punctuation at the end. ' +
    'Reply with the headline only.';

  // Text models advertise a `prompt` field, but the gateway's text endpoint
  // takes chat-style `messages`. The editor's own text provider does this
  // same mapping before every call.
  const input = { messages: [{ role: 'user', content: prompt }] };

  // The stream yields the accumulated text; the last value is the full reply.
  let text = '';
  for await (const chunk of client.generateStream(MODELS.text2text, input, {})) {
    text = chunk;
  }
  return text.trim().replace(/^["']+|["']+$/g, '');
}

/** No model call. Background removal runs in the browser and returns a PNG with alpha. */
export async function cutOutProduct(image: Blob | string): Promise<ImagePart> {
  const cutout = await removeBackground(image);
  const trimmed = await cropToContent(cutout);
  return measureImage(URL.createObjectURL(trimmed));
}

/**
 * Crops transparent margins off a cutout so the block that holds it is
 * the size of the product, not the size of the original photo.
 */
async function cropToContent(image: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (context == null) return image;
  context.drawImage(bitmap, 0, 0);

  const { data, width, height } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return image;

  const crop = document.createElement('canvas');
  crop.width = right - left + 1;
  crop.height = bottom - top + 1;
  crop.getContext('2d')?.drawImage(canvas, -left, -top);
  return new Promise((resolve) =>
    crop.toBlob((blob) => resolve(blob ?? image), 'image/png')
  );
}

/** Loads an image once to learn its size. The engine needs width and height for layout. */
export function measureImage(uri: string): Promise<ImagePart> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ uri, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error(`Could not load image: ${uri}`));
    image.src = uri;
  });
}
