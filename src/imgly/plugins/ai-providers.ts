/**
 * AI providers for the editor's built-in AI panels.
 *
 * One gateway provider per capability the design editor uses. The model
 * IDs match `MODELS` in `src/generate.ts`, so the editor's AI panels and
 * the article's code-driven steps use the same models. Any ID returned by
 * `GET https://gateway.img.ly/v1/models` for the same capability works.
 *
 * The providers authenticate through the `ly.img.ai.getToken` action
 * registered in `src/app/ai-credentials`.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/ai-integration/gateway-provider-06df22/
 */

import { GatewayProvider as ImageGatewayProvider } from '@imgly/plugin-ai-image-generation-web/gateway';
import { GatewayProvider as TextGatewayProvider } from '@imgly/plugin-ai-text-generation-web/gateway';

import { MODELS } from '../../generate';

export type AiCapability = 'text2text' | 'text2image' | 'image2image';

/** Provider map in the shape `AiApps({ providers })` expects. */
export type AiProviderMap = Partial<Record<AiCapability, any[]>>;

export interface GatewayProviderOptions {
  /** Override the gateway URL. Leave unset for IMG.LY's production gateway. */
  gatewayUrl?: string;
}

export function createAIProviders(
  options: GatewayProviderOptions = {}
): AiProviderMap {
  const config = options.gatewayUrl ? { gatewayUrl: options.gatewayUrl } : {};
  return {
    text2text: [TextGatewayProvider(MODELS.text2text, config)],
    text2image: [ImageGatewayProvider(MODELS.text2image, config)],
    image2image: [ImageGatewayProvider(MODELS.image2image, config)]
  };
}
