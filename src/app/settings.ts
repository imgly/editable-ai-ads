/**
 * Where the two keys come from.
 *
 * Order of precedence:
 *   1. Keys the user pasted into the app. Stored in this browser's
 *      localStorage and sent only to IMG.LY's servers.
 *   2. `VITE_CESDK_LICENSE` and `VITE_AI_API_KEY` from `.env`, which Vite
 *      bakes into the bundle. Fine on your own machine; leave them empty
 *      when building a public deployment.
 *
 * With neither, the editor runs with a watermark and the AI buttons stay
 * off. Sample parts, compose, resize and export still work.
 */

const STORAGE_KEY = 'editable-ai-ads.keys';

export interface StoredKeys {
  license?: string;
  gatewayKey?: string;
}

export type KeySource = 'browser' | 'env' | 'none';

export function loadStoredKeys(): StoredKeys {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredKeys) : {};
  } catch {
    return {};
  }
}

export function saveStoredKeys(keys: StoredKeys): void {
  const clean: StoredKeys = {};
  if (keys.license?.trim()) clean.license = keys.license.trim();
  if (keys.gatewayKey?.trim()) clean.gatewayKey = keys.gatewayKey.trim();
  try {
    if (Object.keys(clean).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    }
  } catch {
    // Private browsing or a full quota: the keys just do not persist.
  }
}

export function clearStoredKeys(): void {
  saveStoredKeys({});
}

function envValue(name: 'VITE_CESDK_LICENSE' | 'VITE_AI_API_KEY'): string | undefined {
  const value = import.meta.env[name] as string | undefined;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function getLicenseKey(): string | undefined {
  return loadStoredKeys().license ?? envValue('VITE_CESDK_LICENSE');
}

export function getGatewayKey(): string | undefined {
  return loadStoredKeys().gatewayKey ?? envValue('VITE_AI_API_KEY');
}

export function licenseSource(): KeySource {
  if (loadStoredKeys().license) return 'browser';
  return envValue('VITE_CESDK_LICENSE') ? 'env' : 'none';
}

export function gatewayKeySource(): KeySource {
  if (loadStoredKeys().gatewayKey) return 'browser';
  return envValue('VITE_AI_API_KEY') ? 'env' : 'none';
}

export type LicenseStatus = 'none' | 'valid' | 'invalid' | 'expired' | 'unreachable';

/**
 * Asks IMG.LY's licensing server the same question the engine asks on
 * startup. Checking first means a rejected key (wrong hostname, typo,
 * expired) shows a message instead of a dead editor.
 */
export async function validateLicense(
  key: string,
  userId: string
): Promise<LicenseStatus> {
  try {
    const response = await fetch('https://api.img.ly/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key, userId })
    });
    if (!response.ok) return 'unreachable';
    const result = (await response.json()) as { status?: string };
    if (result.status === 'valid') return 'valid';
    if (result.status === 'expired') return 'expired';
    return 'invalid';
  } catch {
    return 'unreachable';
  }
}
