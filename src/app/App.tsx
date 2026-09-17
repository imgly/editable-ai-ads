/**
 * App shell: the editor on the left, the "Generate ad" panel on the right.
 *
 * Before the editor mounts, the app resolves both keys (pasted into the
 * app, or from .env), checks the license with IMG.LY's licensing server
 * and probes the AI gateway. A rejected license is left out so the editor
 * still starts, with a watermark. Without a working gateway key the
 * editor still runs and the panel offers sample parts.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import CreativeEditor from '@cesdk/cesdk-js/react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { Configuration } from '@cesdk/cesdk-js';

import { createAIProviders, initEditor } from '../imgly';
import { FORMATS } from '../formats';
import { AdPanel } from './AdPanel';
import { KeysPanel } from './KeysPanel';
import {
  getGatewayUrl,
  installAiCredentials,
  probeAiCredentials
} from './ai-credentials';
import {
  clearStoredKeys,
  getLicenseKey,
  saveStoredKeys,
  validateLicense,
  type LicenseStatus,
  type StoredKeys
} from './settings';
import styles from './App.module.css';

export type CredentialStatus =
  | 'checking'
  | 'ok'
  | 'missing'
  | 'invalid'
  | 'unreachable';

interface AppProps {
  config: Partial<Configuration>;
}

export default function App({ config }: AppProps) {
  const [credentials, setCredentials] = useState<CredentialStatus>('checking');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | 'checking'>('checking');
  const [editorConfig, setEditorConfig] = useState<Partial<Configuration> | null>(null);
  const [cesdk, setCesdk] = useState<CreativeEditorSDK | null>(null);

  // Bumped whenever the keys change, so the editor remounts with them.
  const [generation, setGeneration] = useState(0);

  // The init callback must not change identity, or the editor remounts.
  const credentialsRef = useRef<CredentialStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    setCesdk(null);
    setEditorConfig(null);
    setCredentials('checking');
    setLicenseStatus('checking');

    (async () => {
      const license = getLicenseKey();
      const status: LicenseStatus = license
        ? await validateLicense(license, config.userId ?? 'editable-ai-ads-user')
        : 'none';
      const probe = await probeAiCredentials();
      if (cancelled) return;

      credentialsRef.current = probe.status;
      setCredentials(probe.status);
      setLicenseStatus(status);
      setEditorConfig({
        ...config,
        // Only a key the server accepted goes to the engine. A rejected
        // key would stop the editor from loading at all.
        license: status === 'valid' ? license : undefined
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [config, generation]);

  const handleInit = useCallback(async (instance: CreativeEditorSDK) => {
    // The init callback swallows errors, so log them here.
    try {
      installAiCredentials(instance);

      const aiAvailable = credentialsRef.current === 'ok';
      const providers = aiAvailable
        ? createAIProviders({ gatewayUrl: getGatewayUrl() })
        : {};
      await initEditor(instance, providers);

      await instance.actions.run('scene.create', {
        page: {
          width: FORMATS.square.width,
          height: FORMATS.square.height,
          unit: 'Pixel'
        }
      });

      setCesdk(instance);

      // Handy in the browser console while following the article.
      if (import.meta.env.DEV) (window as any).cesdk = instance;
    } catch (error) {
      console.error('[editable-ai-ads] editor init failed:', error);
    }
  }, []);

  const applyKeys = (keys: StoredKeys) => {
    saveStoredKeys(keys);
    setGeneration((n) => n + 1);
  };

  const clearKeys = () => {
    clearStoredKeys();
    setGeneration((n) => n + 1);
  };

  return (
    <div className={styles.app}>
      <div className={styles.editorRow}>
        {editorConfig == null ? (
          <div className={styles.editor} aria-hidden="true" />
        ) : (
          <CreativeEditor
            key={generation}
            className={styles.editor}
            config={editorConfig}
            init={handleInit}
          />
        )}
        <AdPanel
          cesdk={cesdk}
          credentials={credentials}
          settings={
            <KeysPanel
              licenseStatus={licenseStatus}
              credentials={credentials}
              busy={editorConfig == null}
              onApply={applyKeys}
              onClear={clearKeys}
            />
          }
        />
      </div>
    </div>
  );
}
