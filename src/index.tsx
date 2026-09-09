/**
 * Editable AI ads: React entry point.
 *
 * @see https://img.ly/docs/cesdk/js/get-started/overview-e18f40/
 * @see https://img.ly/docs/cesdk/js/configuration-2c1c3d/
 */

import type { Configuration } from '@cesdk/cesdk-js';
import { createRoot } from 'react-dom/client';

import App from './app/App';

const editorConfig: Partial<Configuration> = {
  // From https://img.ly/dashboard. Without it the editor shows a watermark.
  license: import.meta.env.VITE_CESDK_LICENSE,
  userId: 'editable-ai-ads-user',
  // Engine assets are served from public/assets (see README).
  baseURL: '/assets'
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

createRoot(container).render(<App config={editorConfig} />);
