/**
 * Where CE.SDK loads its engine assets (fonts, icons, WebAssembly core).
 *
 * Defaults to IMG.LY's CDN for the matching SDK version, so a deploy is
 * a few megabytes. Set VITE_CESDK_BASE_URL to serve a local copy instead,
 * for example `/assets` after unzipping imgly-assets.zip into public/.
 */
export const CESDK_VERSION = '1.81.1';

export const CESDK_ASSETS_URL: string =
  import.meta.env.VITE_CESDK_BASE_URL ||
  `https://cdn.img.ly/packages/imgly/cesdk-js/${CESDK_VERSION}/assets`;
