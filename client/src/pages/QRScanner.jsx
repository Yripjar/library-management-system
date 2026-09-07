import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../api';

export default function QRScanner() {
  const [mode, setMode] = useState('issue');
  const [borrowerName, setBorrowerName] = useState('');
  const [manualQr, setManualQr] = useState('');
  const [message, setMessage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [lastCode, setLastCode] = useState('');

  const scannerRef = useRef(null);
  const scannerRunningRef = useRef(false);

  const stopScanner = async () => {
    if (!scannerRef.current) {
      setScanning(false);
      return;
    }

    try {
      if (scannerRunningRef.current) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.clear();
    } catch (error) {
      console.error('Scanner cleanup failed:', error);
    }

    scannerRef.current = null;
    scannerRunningRef.current = false;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const processCode = async (code) => {
    if (!code?.trim()) return;

    const cleanCode = code.trim();

    setLastCode(cleanCode);
    setMessage(null);

    try {
      if (mode === 'issue') {
        if (!borrowerName.trim()) {
          setMessage({
            type: 'error',
            text: 'Enter the borrower name before issuing the book.',
          });
          return;
        }

        const response = await api.post('/transactions/issue', {
          qrCodeData: cleanCode,
          borrowerName: borrowerName.trim(),
        });

        setMessage({
          type: 'success',
          text:
            response.data?.book?.title
              ? `${response.data.book.title} issued successfully.`
              : 'Book issued successfully.',
        });

        setBorrowerName('');
      } else {
        const response = await api.post('/transactions/return', {
          qrCodeData: cleanCode,
        });

        setMessage({
          type: 'success',
          text:
            response.data?.book?.title
              ? `${response.data.book.title} returned successfully.`
              : 'Book returned successfully.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error.response?.data?.message ||
          'The transaction could not be completed.',
      });
    }
  };

  const startScanner = async () => {
    if (scanning) return;

    setMessage(null);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: {
            width: 240,
            height: 240,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await stopScanner();
          await processCode(decodedText);
        },
        () => {}
      );

      scannerRunningRef.current = true;
    } catch (error) {
      console.error('Camera start failed:', error);

      setMessage({
        type: 'error',
        text:
          'Camera could not start. Allow camera access or use manual QR entry.',
      });

      await stopScanner();
    }
  };

  const submitManual = async (event) => {
    event.preventDefault();

    if (!manualQr.trim()) return;

    await processCode(manualQr);
    setManualQr('');
  };

  const changeMode = async (nextMode) => {
    await stopScanner();

    setMode(nextMode);
    setMessage(null);
    setLastCode('');
  };

  return (
    <div className="tool-page">
      <section className="tool-intro">
        <div>
          <p className="eyebrow">
            Transaction instrument / 03
          </p>

          <h1>
            Scan the <em>moment.</em>
          </h1>

          <p className="tool-intro__lede">
            Scan a book QR identity to issue or return it and
            immediately update the library state.
          </p>
        </div>

        <div className="tool-intro__meta">
          <span className="mono">
            CAMERA / {scanning ? 'ACTIVE' : 'STANDBY'}
          </span>

          <Link
            to="/dashboard"
            className="text-link"
          >
            Control room ↗
          </Link>
        </div>
      </section>

      <section className="scanner-workspace">
        <div className="scanner-stage">
          <div className="scanner-stage__topline">
            <span className="mono">
              01 / OPTICAL INPUT
            </span>

            <span className="mono">
              {mode.toUpperCase()}
            </span>
          </div>

          <div
            className={`scanner-viewport ${
              scanning
                ? 'scanner-viewport--live'
                : ''
            }`}
          >
            <div id="qr-reader" />

            {!scanning && (
              <div className="scanner-placeholder">
                <div className="scanner-placeholder__target">
                  <ScanLine size={27} />
                </div>

                <span className="eyebrow">
                  Camera ready
                </span>

                <h2>
                  Frame the book label.
                </h2>

                <p>
                  Keep the QR code inside the square and
                  hold the device steady.
                </p>
              </div>
            )}

            {scanning && (
              <div className="scanner-beam" />
            )}
          </div>

          <div className="scanner-controls">
            <button
              type="button"
              className="control-link control-link--signal"
              onClick={
                scanning
                  ? stopScanner
                  : startScanner
              }
            >
              <Camera size={16} />

              {scanning
                ? 'Stop camera'
                : 'Start camera'}
            </button>

            <form
              className="manual-code"
              onSubmit={submitManual}
            >
              <input
                value={manualQr}
                onChange={(event) =>
                  setManualQr(event.target.value)
                }
                placeholder="Paste QR code data"
              />

              <button
                type="submit"
                aria-label="Submit QR code"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        <aside className="scanner-rail">
          <div className="scanner-rail__section">
            <span className="eyebrow">
              02 / TRANSACTION
            </span>

            <div
              className="mode-switch"
              role="tablist"
              aria-label="Transaction mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'issue'}
                className={
                  mode === 'issue'
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  changeMode('issue')
                }
              >
                Issue
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === 'return'}
                className={
                  mode === 'return'
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  changeMode('return')
                }
              >
                Return
              </button>
            </div>

            {mode === 'issue' && (
              <label className="field-line">
                <span>
                  Borrower name
                </span>

                <input
                  value={borrowerName}
                  onChange={(event) =>
                    setBorrowerName(
                      event.target.value
                    )
                  }
                  placeholder="Enter borrower"
                />
              </label>
            )}
          </div>

          <div className="scanner-rail__section">
            <span className="eyebrow">
              03 / RESULT
            </span>

            {message ? (
              <div
                className={`result-block result-block--${message.type}`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <RotateCcw size={20} />
                )}

                <p>{message.text}</p>
              </div>
            ) : (
              <p className="scanner-muted">
                Start the camera or enter QR data
                manually.
              </p>
            )}

            {lastCode && (
              <div className="last-code">
                <span className="mono">
                  LAST CODE
                </span>

                <code>
                  {lastCode}
                </code>
              </div>
            )}
          </div>

          <div className="scanner-rail__section">
            <span className="eyebrow">
              04 / WORKFLOW
            </span>

            <div className="shortcut-copy">
              <span>
                <kbd>01</kbd>
                Choose issue or return
              </span>

              <span>
                <kbd>02</kbd>
                Scan the QR identity
              </span>

              <span>
                <kbd>03</kbd>
                Transaction updates instantly
              </span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}