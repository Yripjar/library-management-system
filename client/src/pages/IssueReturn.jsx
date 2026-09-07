import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { Html5Qrcode } from 'html5-qrcode';

function IssueReturn() {
  const [mode, setMode] = useState('issue');
  const [borrowerName, setBorrowerName] = useState('');
  const [manualQr, setManualQr] = useState('');
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    setScanning(true);
    setMessage('');
    try {
      html5QrCodeRef.current = new Html5Qrcode("reader");
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanning(false);
          stopScanner();
          handleTransaction(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      alert('Unable to start camera. Please use manual entry.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error(err);
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleTransaction = async (qrData) => {
    try {
      if (mode === 'issue') {
        if (!borrowerName) {
          alert('Please enter borrower name before scanning');
          return;
        }
        const res = await api.post('/transactions/issue', { qrCodeData: qrData, borrowerName });
        setMessage(`Book issued to ${res.data.borrowerName}`);
      } else {
        const res = await api.post('/transactions/return', { qrCodeData: qrData });
        setMessage('Book returned successfully');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualQr.trim()) {
      handleTransaction(manualQr.trim());
      setManualQr('');
    }
  };

  return (
    <div>
      <h2 className="mb-4">Issue / Return Book</h2>
      <div className="btn-group mb-4" role="group">
        <button
          className={`btn ${mode === 'issue' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setMode('issue')}
        >
          Issue Book
        </button>
        <button
          className={`btn ${mode === 'return' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setMode('return')}
        >
          Return Book
        </button>
      </div>

      {mode === 'issue' && (
        <div className="mb-3">
          <label className="form-label">Borrower Name</label>
          <input
            className="form-control"
            style={{ maxWidth: '400px' }}
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
          />
        </div>
      )}

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={startScanner} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Start Camera Scan'}
        </button>
        <button className="btn btn-secondary" onClick={stopScanner} disabled={!scanning}>
          Stop Scan
        </button>
      </div>

      <div id="reader" className="border rounded p-2 mb-3" style={{ width: '300px' }}></div>

      <div className="card p-3">
        <h5>Manual Entry</h5>
        <form onSubmit={handleManualSubmit} className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="QR Code Data"
            value={manualQr}
            onChange={(e) => setManualQr(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-primary">Submit</button>
        </form>
      </div>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

export default IssueReturn;