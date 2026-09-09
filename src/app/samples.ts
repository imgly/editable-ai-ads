/**
 * Sample parts for running the demo without an AI key.
 *
 * The background is a stock photo and the headline is fixed text.
 * Background removal still runs for real, in the browser, on the
 * sample product photo. Everything after this point (compose, edit,
 * resize, export) is identical to the AI path.
 */

import { BRAND } from '../brand';
import { cutOutProduct, measureImage, type AdParts } from '../generate';

const origin = window.location.origin;

export const SAMPLE_PRODUCT_URL = `${origin}/samples/product.jpg`;
export const SAMPLE_BACKGROUND_URL = `${origin}/samples/background.jpg`;

export async function sampleParts(): Promise<AdParts> {
  const [background, product] = await Promise.all([
    measureImage(SAMPLE_BACKGROUND_URL),
    fetch(SAMPLE_PRODUCT_URL)
      .then((response) => response.blob())
      .then(cutOutProduct)
  ]);

  return {
    background,
    product,
    headline: 'Hear every detail',
    logo: BRAND.logo
  };
}
