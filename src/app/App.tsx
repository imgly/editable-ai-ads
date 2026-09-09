/**
 * App shell: the editor on the left, the "Generate ad" panel on the right.
 *
 * The credential probe runs once before the editor mounts. With a valid
 * gateway key the editor gets the AI panels and the "Generate parts"
 * button works. Without one the editor still runs and the panel offers
 * sample parts, so every step after generation can be tried.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import CreativeEditor from '@cesdk/cesdk-js/react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { Configuration } from '@cesdk/cesdk-js';

import { createAIProviders, initEditor } from '../imgly';
import { FORMATS } from '../formats';
import { AdPanel } from './AdPanel';
import {
  getGatewayUrl,
  installAiCredentials,
  probeAiCredentials
} from './ai-credentials';
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
  const [cesdk, setCesdk] = useState<CreativeEditorSDK | null>(null);

  // The init callback must not change identity, or the editor remounts.
  const credentialsRef = useRef<CredentialStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    probeAiCredentials().then((result) => {
      if (cancelled) return;
      credentialsRef.current = result.status;
      setCredentials(result.status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleInit = useCallback(async (instance: CreativeEditorSDK) => {
    // The init callback swallows errors, so log them here.
    try {
      installAiCredentials(instance);

      const aiAvailable = credentialsRef.current === 'ok';
      const providers = aiAvailable
        ? createAIProviders('Design', { gatewayUrl: getGatewayUrl() })
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

  return (
    <div className={styles.app}>
      <div className={styles.editorRow}>
        {credentials === 'checking' ? (
          <div className={styles.editor} aria-hidden="true" />
        ) : (
          <CreativeEditor
            className={styles.editor}
            config={config}
            init={handleInit}
          />
        )}
        <AdPanel cesdk={cesdk} credentials={credentials} />
      </div>
    </div>
  );
}
