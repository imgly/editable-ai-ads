/**
 * Editor initialization.
 *
 * Wires the design editor configuration, the standard asset sources,
 * browser background removal and, when credentials exist, the AI Apps
 * plugin into a CE.SDK instance.
 *
 * The hosting application registers the `ly.img.ai.getToken` action
 * before calling `initEditor`; the gateway providers invoke it before
 * every generation request. See `app/ai-credentials`.
 *
 * @see https://img.ly/docs/cesdk/js/get-started/overview-e18f40/
 * @see https://img.ly/docs/cesdk/js/user-interface/ai-integration/integrate-8e906c/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';
import {
  BlurAssetSource,
  ImageColorsAssetSource,
  ColorPaletteAssetSource,
  CropPresetsAssetSource,
  DemoAssetSources,
  EffectsAssetSource,
  FiltersAssetSource,
  PagePresetsAssetSource,
  StickerAssetSource,
  TextAssetSource,
  TextComponentAssetSource,
  TypefaceAssetSource,
  UploadAssetSources,
  VectorShapeAssetSource
} from '@cesdk/cesdk-js/plugins';
import BackgroundRemovalPlugin from '@imgly/plugin-background-removal-web';

import { DesignEditorConfig } from './config/design-editor/plugin';
import { AiAppsConfig } from './plugins/ai-apps';
import type { AiProviderMap } from './plugins/ai-providers';

export { DesignEditorConfig } from './config/design-editor/plugin';
export { AiAppsConfig } from './plugins/ai-apps';
export { createAIProviders } from './plugins/ai-providers';
export type {
  AiCapability,
  AiProviderMap,
  GatewayProviderOptions
} from './plugins/ai-providers';

/**
 * @param cesdk     - The CreativeEditorSDK instance
 * @param providers - Provider map for `AiApps({ providers: … })`. Pass an
 *                    empty object to run the editor without AI panels,
 *                    for example when no gateway key is configured.
 */
export async function initEditor(
  cesdk: CreativeEditorSDK,
  providers: AiProviderMap
): Promise<void> {
  await cesdk.addPlugin(new DesignEditorConfig());
  cesdk.ui.setTheme('light');

  await Promise.all([
    cesdk.addPlugin(new ImageColorsAssetSource()),
    cesdk.addPlugin(new ColorPaletteAssetSource()),
    cesdk.addPlugin(new TypefaceAssetSource()),
    cesdk.addPlugin(new TextAssetSource()),
    cesdk.addPlugin(new TextComponentAssetSource()),
    cesdk.addPlugin(new VectorShapeAssetSource()),
    cesdk.addPlugin(new StickerAssetSource()),
    cesdk.addPlugin(new EffectsAssetSource()),
    cesdk.addPlugin(new FiltersAssetSource()),
    cesdk.addPlugin(new BlurAssetSource()),
    cesdk.addPlugin(new PagePresetsAssetSource()),
    cesdk.addPlugin(new CropPresetsAssetSource())
  ]);
  await cesdk.addPlugin(
    new UploadAssetSources({ include: ['ly.img.image.upload'] })
  );
  await cesdk.addPlugin(new DemoAssetSources({ include: ['ly.img.image.*'] }));

  // Runs in the browser; no model key involved.
  await cesdk.addPlugin(
    BackgroundRemovalPlugin({ ui: { locations: ['canvasMenu'] } })
  );

  if (Object.keys(providers).length > 0) {
    await cesdk.addPlugin(new AiAppsConfig(providers));
  }
}
