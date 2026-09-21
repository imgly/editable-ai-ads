/**
 * The "Generate ad" panel.
 *
 * One button per step of the article, in order. Every step logs what it
 * did, how long it took and how many model calls it made, so the
 * one-edit-versus-four-regenerations comparison can be read off the
 * screen.
 */

import { useCallback, useState, type ReactNode } from 'react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';

import { BRAND, type LogoVariant } from '../brand';
import {
  download,
  downloadAll,
  exportAllFormats,
  exportPdf,
  exportPng,
  saveArchive
} from '../export';
import { FORMATS, type AdFormat } from '../formats';
import { getGatewayClient, modelCallCount } from '../gateway';
import { generateParts, type AdParts } from '../generate';
import { regenerateBackground } from '../regenerate-layer';
import { resizeTo } from '../resize';
import { composeScene, swapLogo } from '../scene';
import type { CredentialStatus } from './App';
import { sampleParts, SAMPLE_PRODUCT_URL } from './samples';
import styles from './AdPanel.module.css';

interface AdPanelProps {
  cesdk: CreativeEditorSDK | null;
  credentials: CredentialStatus;
  /** The keys section, rendered at the top of the panel. */
  settings?: ReactNode;
}

interface LogEntry {
  label: string;
  ms: number;
  modelCalls: number;
}

const DEFAULT_BRIEF = {
  productName: `${BRAND.name} over-ear headphones`,
  audience: 'commuters who want quiet',
  backgroundPrompt:
    'Empty photography studio backdrop, plain wall lit with a warm amber gradient, soft shadows, no objects, no props, no text'
};

export function AdPanel({ cesdk, credentials, settings }: AdPanelProps) {
  const [brief, setBrief] = useState(DEFAULT_BRIEF);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState(
    'Same backdrop, cooler blue tones, evening light'
  );
  const [parts, setParts] = useState<AdParts | null>(null);
  const [composed, setComposed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const aiAvailable = credentials === 'ok';
  const ready = cesdk != null;

  /**
   * Runs one step, times it, and counts the model calls it actually made
   * by reading the gateway client's counter before and after.
   */
  const run = useCallback(async (label: string, step: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    const started = performance.now();
    const callsBefore = modelCallCount();
    try {
      await step();
      setLog((entries) => [
        {
          label,
          ms: Math.round(performance.now() - started),
          modelCalls: modelCallCount() - callsBefore
        },
        ...entries
      ]);
    } catch (cause) {
      console.error(`[editable-ai-ads] ${label} failed:`, cause);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(null);
    }
  }, []);

  const productImage = async (): Promise<Blob> =>
    productFile ?? (await fetch(SAMPLE_PRODUCT_URL)).blob();

  // Step 1, AI path: background + headline are model calls, cutout is local.
  const onGenerate = () =>
    run('Generate parts', async () => {
      const generated = await generateParts(getGatewayClient(), {
        ...brief,
        productImage: await productImage()
      });
      setParts(generated);
      setComposed(false);
    });

  // Step 1, no-key path: stock background, fixed headline, real cutout.
  const onSample = () =>
    run('Sample parts', async () => {
      setParts(await sampleParts());
      setComposed(false);
    });

  // Step 2
  const onCompose = () =>
    run('Compose scene', async () => {
      if (cesdk == null || parts == null) return;
      await composeScene(cesdk, parts);
      setComposed(true);
    });

  // Step 3: the only change the logo block accepts, and only from the app.
  const onSwapLogo = (variant: LogoVariant) =>
    run(`Swap logo (${variant.label})`, async () => {
      if (cesdk == null) return;
      swapLogo(cesdk.engine, variant);
    });

  // Step 4
  const onRegenerate = () =>
    run('Regenerate background only', async () => {
      if (cesdk == null) return;
      await regenerateBackground(cesdk, getGatewayClient(), regeneratePrompt);
    });

  // Step 5
  const onResize = (format: AdFormat) =>
    run(`Resize to ${format.label}`, async () => {
      if (cesdk == null) return;
      await resizeTo(cesdk, format);
    });

  // Step 6
  const onExportPng = () =>
    run('Export PNG', async () => {
      if (cesdk == null) return;
      download(await exportPng(cesdk), 'image/png', 'ad.png');
    });

  const onExportPdf = () =>
    run('Export PDF', async () => {
      if (cesdk == null) return;
      download(await exportPdf(cesdk), 'application/pdf', 'ad.pdf');
    });

  const onExportAll = () =>
    run('Export 1:1, 9:16, 16:9', async () => {
      if (cesdk == null) return;
      const blobs = await exportAllFormats(cesdk);
      await downloadAll(
        Object.values(FORMATS).map((format) => ({
          data: blobs[format.id],
          mimeType: 'image/png',
          filename: `ad-${format.id}.png`
        }))
      );
    });

  // Archive, not a bare scene: it embeds the images, so the file still
  // opens after the blob: URLs behind the generated parts are gone.
  const onSave = () =>
    run('Save archive', async () => {
      if (cesdk == null) return;
      download(await saveArchive(cesdk), 'application/zip', 'ad.zip');
    });

  const totalCalls = log.reduce((sum, entry) => sum + entry.modelCalls, 0);

  return (
    <aside className={styles.panel}>
      <h1 className={styles.title}>Generate ad</h1>

      <p className={styles.status} data-status={credentials}>
        {credentialLabel(credentials)}
      </p>

      {settings}

      <section className={styles.section}>
        <h2 className={styles.heading}>1. Generate the parts</h2>
        <label className={styles.field}>
          Product
          <input
            value={brief.productName}
            onChange={(event) =>
              setBrief({ ...brief, productName: event.target.value })
            }
          />
        </label>
        <label className={styles.field}>
          Audience
          <input
            value={brief.audience}
            onChange={(event) =>
              setBrief({ ...brief, audience: event.target.value })
            }
          />
        </label>
        <label className={styles.field}>
          Background prompt
          <textarea
            rows={3}
            value={brief.backgroundPrompt}
            onChange={(event) =>
              setBrief({ ...brief, backgroundPrompt: event.target.value })
            }
          />
        </label>
        <label className={styles.field}>
          Product photo (optional, defaults to the sample)
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setProductFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!ready || !aiAvailable || busy != null}
            onClick={onGenerate}
          >
            Generate parts (2 model calls)
          </button>
          <button
            type="button"
            disabled={!ready || busy != null}
            onClick={onSample}
          >
            Use sample parts (no AI)
          </button>
        </div>
        {parts && <PartsPreview parts={parts} />}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>2. Compose into an editable scene</h2>
        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!ready || parts == null || busy != null}
            onClick={onCompose}
          >
            Compose scene
          </button>
        </div>
        <p className={styles.hint}>
          Then edit on the canvas: click the headline to change the words,
          drag the product. The logo is locked.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>3. Swap the logo (approved variants only)</h2>
        <div className={styles.buttons}>
          {BRAND.logos.map((variant) => (
            <button
              key={variant.id}
              type="button"
              disabled={!composed || busy != null}
              onClick={() => onSwapLogo(variant)}
            >
              {variant.label}
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          The user cannot move, resize, delete or replace the logo. The app
          can swap it for another brand kit variant.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>4. Regenerate one layer only</h2>
        <label className={styles.field}>
          New background prompt
          <textarea
            rows={2}
            value={regeneratePrompt}
            onChange={(event) => setRegeneratePrompt(event.target.value)}
          />
        </label>
        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!composed || !aiAvailable || busy != null}
            onClick={onRegenerate}
          >
            Regenerate background (1 model call)
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>5. Resize</h2>
        <div className={styles.buttons}>
          {Object.values(FORMATS).map((format) => (
            <button
              key={format.id}
              type="button"
              disabled={!composed || busy != null}
              onClick={() => onResize(format)}
            >
              {format.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>6. Export and save</h2>
        <div className={styles.buttons}>
          <button type="button" disabled={!composed || busy != null} onClick={onExportPng}>
            PNG
          </button>
          <button type="button" disabled={!composed || busy != null} onClick={onExportPdf}>
            PDF
          </button>
          <button type="button" disabled={!composed || busy != null} onClick={onExportAll}>
            All three formats
          </button>
          <button type="button" disabled={!composed || busy != null} onClick={onSave}>
            Save archive
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Log</h2>
        {busy && <p className={styles.hint}>Working: {busy}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.hint}>Model calls so far: {totalCalls}</p>
        <ul className={styles.log}>
          {log.map((entry, index) => (
            <li key={index}>
              {entry.label}: {entry.ms} ms, {entry.modelCalls} model call
              {entry.modelCalls === 1 ? '' : 's'}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function PartsPreview({ parts }: { parts: AdParts }) {
  return (
    <div className={styles.parts}>
      <figure>
        <img src={parts.background.uri} alt="Generated background" />
        <figcaption>background</figcaption>
      </figure>
      <figure>
        <img src={parts.product.uri} alt="Product cutout" />
        <figcaption>product (cutout)</figcaption>
      </figure>
      <figure>
        <div className={styles.headlinePreview}>{parts.headline}</div>
        <figcaption>headline (text)</figcaption>
      </figure>
      <figure>
        <img src={parts.logo.uri} alt="Brand logo" />
        <figcaption>logo (locked)</figcaption>
      </figure>
    </div>
  );
}

function credentialLabel(status: CredentialStatus): string {
  switch (status) {
    case 'checking':
      return 'Checking AI credentials';
    case 'ok':
      return 'AI gateway connected';
    case 'missing':
      return 'No AI key. Add one under Keys, or use sample parts.';
    case 'invalid':
      return 'The gateway rejected the AI key. Fix it under Keys, or use sample parts.';
    case 'unreachable':
      return 'AI gateway unreachable. Sample parts still work.';
  }
}
