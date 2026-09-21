/**
 * UI layout for the design editor.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/overview-41101a/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

import { setupCanvas } from './canvas';
import { setupDock } from './dock';
import { setupInspectorBar } from './inspectorBar';
import { setupNavigationBar } from './navigationBar';
import { setupPanels } from './panel';

export function setupUI(cesdk: CreativeEditorSDK): void {
  setupPanels(cesdk); // Panel positions first: they affect the layout.
  setupNavigationBar(cesdk); // Top bar
  setupCanvas(cesdk); // Canvas bar and canvas menu
  setupInspectorBar(cesdk); // Contextual toolbar
  setupDock(cesdk); // Asset dock
}

export { setupCanvas, setupDock, setupInspectorBar, setupNavigationBar, setupPanels };
