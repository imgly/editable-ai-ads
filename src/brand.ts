/**
 * Brand kit for the demo.
 *
 * The logo is a fixed asset, never generated. It comes in approved
 * variants the user may swap between, but never edit. The headline uses
 * one approved typeface and one approved color. In a product these values
 * come from the customer's brand settings; here they are constants so
 * the article can show them in one place.
 */

import type { Typeface } from '@cesdk/cesdk-js';

// Absolute URLs: CE.SDK resolves relative URIs against its asset baseURL,
// not against this app's origin.
const origin = window.location.origin;

export interface LogoVariant {
  id: 'dark' | 'light';
  label: string;
  uri: string;
  width: number;
  height: number;
}

const LOGOS: LogoVariant[] = [
  {
    id: 'dark',
    label: 'Dark on light',
    uri: `${origin}/brand/logo-dark.png`,
    width: 600,
    height: 200
  },
  {
    id: 'light',
    label: 'White on dark',
    uri: `${origin}/brand/logo-light.png`,
    width: 600,
    height: 200
  }
];

export const BRAND = {
  name: 'Northwind',

  logos: LOGOS,
  logo: LOGOS[0],

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
