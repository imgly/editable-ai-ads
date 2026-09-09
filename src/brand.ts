/**
 * Brand kit for the demo.
 *
 * The logo is a fixed asset, never generated. The headline uses one
 * approved typeface and one approved color. In a product these values
 * come from the customer's brand settings; here they are constants so
 * the article can show them in one place.
 */

import type { Typeface } from '@cesdk/cesdk-js';

// Absolute URLs: CE.SDK resolves relative URIs against its asset baseURL,
// not against this app's origin.
const origin = window.location.origin;

export const BRAND = {
  name: 'Northwind',

  logo: {
    uri: `${origin}/brand/logo.png`,
    width: 600,
    height: 200
  },

  headline: {
    color: { r: 1, g: 1, b: 1, a: 1 },
    fontUri: `${origin}/assets/ly.img.typeface/fonts/Archivo/static/Archivo/Archivo-Bold.ttf`,
    typeface: {
      name: 'Archivo',
      fonts: [
        {
          uri: `${origin}/assets/ly.img.typeface/fonts/Archivo/static/Archivo/Archivo-Bold.ttf`,
          subFamily: 'Bold',
          weight: 'bold',
          style: 'normal'
        }
      ]
    } as Typeface
  }
};
