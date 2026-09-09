/**
 * IMG.LY AI Gateway client for code-driven generation.
 *
 * The editor's AI panels talk to the gateway through `GatewayProvider`
 * instances. This file gives the app the same connection for generation
 * that happens outside the editor UI (see `generate.ts` and
 * `regenerate-layer.ts`). Both paths use the credential registered in
 * `app/ai-credentials`, so there is exactly one place a key lives.
 */

import {
  createGatewayClient,
  type GatewayClient
} from '@imgly/plugin-ai-generation-web';

import {
  bearerFromTokenResult,
  getGatewayUrl,
  resolveAiToken
} from './app/ai-credentials';

let client: GatewayClient | null = null;

export function getGatewayClient(): GatewayClient {
  if (client == null) {
    client = createGatewayClient(getGatewayUrl(), async () =>
      bearerFromTokenResult(await resolveAiToken())
    );
  }
  return client;
}

/**
 * Keep only the input fields a model declares in its schema.
 *
 * Gateway models take different field names for the same idea (one model
 * wants `image_url`, another `image_urls`). Instead of hardcoding one
 * model's shape, callers pass every field they can offer and the schema
 * decides which ones go through. Throws if a required field is missing,
 * so a mismatch fails at the call site rather than at the gateway.
 */
export async function buildInput(
  client: GatewayClient,
  modelId: string,
  candidate: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const schema = await client.fetchSchema(modelId);
  const allowed = new Set(Object.keys(schema.input_schema.properties));

  const input: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (allowed.has(key)) input[key] = value;
  }

  const missing = schema.input_schema.required.filter((key) => !(key in input));
  if (missing.length > 0) {
    throw new Error(
      `Model ${modelId} requires fields this app does not provide: ${missing.join(', ')}`
    );
  }
  return input;
}
