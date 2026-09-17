/**
 * Editable AI ads: React entry point.
 *
 * @see https://img.ly/docs/cesdk/js/get-started/overview-e18f40/
 * @see https://img.ly/docs/cesdk/js/configuration-2c1c3d/
 */

import type { Configuration } from '@cesdk/cesdk-js';
import { createRoot } from 'react-dom/client';

import App from './app/App';
import { CESDK_ASSETS_URL } from './config';

const editorConfig: Partial<Configuration> = {
  // The license key is added by App after it has been checked; see
  // src/app/settings.ts for where keys come from.
  userId: 'editable-ai-ads-user',
  // Engine assets: IMG.LY's CDN by default, see src/config.ts.
  baseURL: CESDK_ASSETS_URL
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

createRoot(container).render(<App config={editorConfig} />);
