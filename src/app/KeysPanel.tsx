/**
 * Settings: the CE.SDK license and the AI gateway key.
 *
 * Keys typed here stay in this browser. Saving restarts the editor so
 * the new license and key take effect.
 */

import { useState } from 'react';

import type { CredentialStatus } from './App';
import {
  gatewayKeySource,
  licenseSource,
  loadStoredKeys,
  type KeySource,
  type LicenseStatus,
  type StoredKeys
} from './settings';
import styles from './AdPanel.module.css';

interface KeysPanelProps {
  licenseStatus: LicenseStatus | 'checking';
  credentials: CredentialStatus;
  busy: boolean;
  onApply: (keys: StoredKeys) => void;
  onClear: () => void;
}

export function KeysPanel({
  licenseStatus,
  credentials,
  busy,
  onApply,
  onClear
}: KeysPanelProps) {
  const [open, setOpen] = useState(false);
  const [license, setLicense] = useState(() => loadStoredKeys().license ?? '');
  const [gatewayKey, setGatewayKey] = useState(() => loadStoredKeys().gatewayKey ?? '');
  const [show, setShow] = useState(false);

  const licenseFrom = licenseSource();
  const gatewayFrom = gatewayKeySource();

  return (
    <section className={styles.section}>
      <div className={styles.keysHeader}>
        <h2 className={styles.heading}>Keys</h2>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setOpen(!open)}
        >
          {open ? 'Hide' : 'Change'}
        </button>
      </div>

      <p className={styles.hint}>
        License: {describeLicense(licenseStatus, licenseFrom)}
        <br />
        AI key: {describeGateway(credentials, gatewayFrom)}
      </p>

      {open && (
        <div>
          <label className={styles.field}>
            CE.SDK license key
            <input
              type={show ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              value={license}
              onChange={(event) => setLicense(event.target.value)}
              placeholder={licenseFrom === 'env' ? 'Using the key from .env' : ''}
            />
          </label>
          <label className={styles.field}>
            IMG.LY AI gateway key (sk_...)
            <input
              type={show ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              value={gatewayKey}
              onChange={(event) => setGatewayKey(event.target.value)}
              placeholder={gatewayFrom === 'env' ? 'Using the key from .env' : ''}
            />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={show}
              onChange={(event) => setShow(event.target.checked)}
            />
            Show keys
          </label>
          <div className={styles.buttons}>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onApply({ license, gatewayKey });
                setOpen(false);
              }}
            >
              Save and restart editor
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setLicense('');
                setGatewayKey('');
                onClear();
                setOpen(false);
              }}
            >
              Clear
            </button>
          </div>
          <p className={styles.hint}>
            Keys are stored in this browser only and sent only to IMG.LY's
            servers. Get both from{' '}
            <a href="https://img.ly/dashboard" target="_blank" rel="noreferrer">
              img.ly/dashboard
            </a>
            . The AI gateway bills each generation to the key's account.
          </p>
        </div>
      )}
    </section>
  );
}

function describeLicense(status: LicenseStatus | 'checking', from: KeySource): string {
  const where = from === 'browser' ? 'from this browser' : from === 'env' ? 'from .env' : '';
  switch (status) {
    case 'checking':
      return 'checking';
    case 'none':
      return 'none, running with a watermark';
    case 'valid':
      return `valid, ${where}`;
    case 'expired':
      return `expired (${where}), running with a watermark`;
    case 'invalid':
      return `rejected (${where}), likely not licensed for this hostname. Running with a watermark`;
    case 'unreachable':
      return 'could not be checked, running with a watermark';
  }
}

function describeGateway(status: CredentialStatus, from: KeySource): string {
  const where = from === 'browser' ? 'from this browser' : from === 'env' ? 'from .env' : '';
  switch (status) {
    case 'checking':
      return 'checking';
    case 'ok':
      return `connected, ${where}`;
    case 'missing':
      return 'none, AI buttons off';
    case 'invalid':
      return `rejected (${where}), AI buttons off`;
    case 'unreachable':
      return 'gateway unreachable, AI buttons off';
  }
}
