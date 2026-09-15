/**
 * AI gateway credentials.
 *
 * Every AI call in this app, from the editor's AI panels and from the
 * code in `src/generate.ts`, gets its credential from one place: the
 * `ly.img.ai.getToken` action registered here.
 *
 * Local development only: this file reads `VITE_AI_API_KEY` from `.env`
 * and hands the raw key to the browser as `{ dangerouslyExposeApiKey }`.
 * Vite bakes `VITE_` variables into the bundle, so never build a public
 * deployment with the key set. For production, mint a short-lived token
 * on your backend and return that string from `resolveAiToken` instead:
 * https://img.ly/docs/cesdk/js/user-interface/ai-integration/gateway-provider-06df22/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

const DEFAULT_GATEWAY_URL = 'https://gateway.img.ly';

function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_AI_API_KEY as string | undefined;
  return typeof key === 'string' && key.length > 0 ? key : undefined;
}

/**
 * What the `ly.img.ai.getToken` action returns:
 *   - a string: a short-lived token minted by your backend (production)
 *   - `{ dangerouslyExposeApiKey }`: the raw dashboard key (local development)
 */
export type AiTokenResult = string | { dangerouslyExposeApiKey: string };

export async function resolveAiToken(): Promise<AiTokenResult> {
  const apiKey = getApiKey();
  if (apiKey != null) {
    return { dangerouslyExposeApiKey: apiKey };
  }
  throw new Error(
    'No AI credentials configured. Set VITE_AI_API_KEY to an API key from ' +
      'the IMG.LY dashboard (https://img.ly/dashboard).'
  );
}

/** The bearer string for an `Authorization` header. */
export function bearerFromTokenResult(token: AiTokenResult): string {
  return typeof token === 'string' ? token : token.dangerouslyExposeApiKey;
}

/** Call once, right after the editor is created and before the AI plugins load. */
export function installAiCredentials(cesdk: CreativeEditorSDK): void {
  cesdk.actions.register('ly.img.ai.getToken', resolveAiToken);
}

/** `VITE_AI_GATEWAY_URL` if set, otherwise IMG.LY's production gateway. */
export function getGatewayUrl(): string {
  const fromEnv = import.meta.env.VITE_AI_GATEWAY_URL as string | undefined;
  return typeof fromEnv === 'string' && fromEnv.length > 0
    ? fromEnv
    : DEFAULT_GATEWAY_URL;
}

export type AiCredentialProbe =
  | { status: 'ok' }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'unreachable'; message: string };

/**
 * Checks the credential before the editor mounts, by listing the models
 * the key can use. Never throws: the result tells the app whether to
 * enable the AI buttons.
 */
export async function probeAiCredentials(): Promise<AiCredentialProbe> {
  if (getApiKey() == null) return { status: 'missing' };

  let res: Response;
  try {
    const token = await resolveAiToken();
    res = await fetch(`${getGatewayUrl()}/v1/models`, {
      headers: { Authorization: `Bearer ${bearerFromTokenResult(token)}` }
    });
  } catch (error) {
    return {
      status: 'unreachable',
      message: error instanceof Error ? error.message : String(error)
    };
  }

  if (res.status === 401 || res.status === 403) return { status: 'invalid' };
  if (!res.ok) {
    return {
      status: 'unreachable',
      message: `Gateway returned ${res.status} ${res.statusText}`
    };
  }
  return { status: 'ok' };
}
