/**
 * AI Apps plugin for the design editor.
 *
 * Adds IMG.LY's AI panels to the editor: an AI entry at the top of the
 * dock, AI actions in the canvas menu, and generated images in the image
 * library. The article's steps do not depend on these panels; they give
 * users the same models inside the editor as well.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/ai-integration/integrate-8e906c/
 */

import type { EditorPlugin, EditorPluginContext } from '@cesdk/cesdk-js';
import CreativeEditorSDK from '@cesdk/cesdk-js';
import AiApps from '@imgly/plugin-ai-apps-web';

import type { AiProviderMap } from './ai-providers';

export class AiAppsConfig implements EditorPlugin {
  name = 'cesdk-ai-apps';

  version = CreativeEditorSDK.version;

  private providers: AiProviderMap;

  constructor(providers: AiProviderMap) {
    this.providers = providers;
  }

  async initialize({ cesdk }: EditorPluginContext) {
    if (!cesdk) return;

    cesdk.ui.insertOrderComponent(
      { in: 'ly.img.dock', position: 'start' },
      { id: 'ly.img.ai/apps.dock' }
    );

    cesdk.ui.insertOrderComponent(
      {
        in: 'ly.img.canvas.menu',
        position: 'start',
        when: { editMode: 'Transform' }
      },
      [
        'ly.img.ai.text.canvasMenu',
        'ly.img.ai.image.canvasMenu',
        'ly.img.separator'
      ]
    );

    await cesdk.addPlugin(AiApps({ providers: this.providers }));

    cesdk.ui.updateAssetLibraryEntry('ly.img.image', {
      sourceIds: ({ currentIds }) => [
        ...currentIds,
        'ly.img.ai.image-generation.history'
      ]
    });
  }
}
