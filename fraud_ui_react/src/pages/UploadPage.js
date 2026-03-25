import React, { useMemo, useState } from 'react';
import { fetchQueue, uploadClaims } from '../api/client';
import '../components/ui.css';

function exampleCsv() {
  return [
    'claimId,claimantName,policyId,claimAmount,incidentType,incidentDate,filedDate,claimantAge,priorClaims,description,status',
    'C-1001,Ada Lovelace,P-9001,12000,Theft,2025-01-12,2025-01-12,34,2,"Vehicle stolen overnight",Open',
    'C-1002,Grace Hopper,P-9002,1800,Collision,2025-01-05,2025-01-10,66,0,"Rear-end accident",Open',
  ].join('\n');
}

// PUBLIC_INTERFACE
export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => !!(csvText && csvText.trim().length > 0), [csvText]);

  async function refreshQueue() {
    const data = await fetchQueue();
    setQueue(data.items || []);
  }

  async function onPickFile(e) {
    const f = e.target.files && e.target.files[0];
    setError('');
    setResult(null);
    setFile(f || null);
    if (!f) return;

    const text = await f.text();
    setCsvText(text);
  }

  async function onUseExample() {
    setError('');
    setResult(null);
    setFile(null);
    setCsvText(exampleCsv());
  }

  async function onUpload() {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const data = await uploadClaims({
        csvText,
        filename: file ? file.name : 'example.csv',
      });
      setResult(data);
      await refreshQueue();
    } catch (e) {
      setError(e.message || 'Upload failed');
      try {
        await refreshQueue();
      } catch {
        // ignore
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h1 className="h1">Upload Claims</h1>
          <div className="subtext">
            Upload a CSV file to run rule-based fraud scoring. Claims are stored in memory for this server session.
          </div>
        </div>
        <div className="btnRow">
          <button className="button" onClick={onUseExample} type="button">
            Use example CSV
          </button>
          <button className="button buttonPrimary" onClick={onUpload} type="button" disabled={!canSubmit || busy}>
            {busy ? 'Uploading…' : 'Upload & score'}
          </button>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardBody">
            <label className="label" htmlFor="file">Choose CSV file</label>
            <input id="file" className="input" type="file" accept=".csv,text/csv" onChange={onPickFile} />

            <div style={{ height: 12 }} />

            <label className="label" htmlFor="csv">Or paste CSV text</label>
            <textarea
              id="csv"
              className="textarea"
              rows={12}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="claimId,claimantName,policyId,claimAmount,..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error ? <div className="error"><strong>Error:</strong> {error}</div> : null}

          {result ? (
            <div className="notice">
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Upload complete</div>
              <div>Inserted: <strong>{result.inserted}</strong></div>
              <div>Total rows: <strong>{result.totalRows}</strong></div>
              <div>Queue ID: <strong>{result.queueId}</strong></div>
            </div>
          ) : (
            <div className="notice">
              <div style={{ fontWeight: 900, marginBottom: 6 }}>CSV headers</div>
              <div style={{ fontSize: 13, color: 'var(--textMuted)' }}>
                Recommended columns: <code>claimId, claimantName, policyId, claimAmount, incidentType, incidentDate, filedDate, claimantAge, priorClaims, description, status</code>.
                Other headers are accepted and stored under <code>raw</code>.
              </div>
            </div>
          )}

          <div className="card">
            <div className="cardBody">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ fontWeight: 900 }}>Upload Queue</div>
                <button className="button" type="button" onClick={refreshQueue}>Refresh</button>
              </div>
              <div style={{ height: 10 }} />
              {queue.length === 0 ? (
                <div style={{ color: 'var(--textMuted)', fontSize: 13 }}>No uploads yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {queue.slice(0, 5).map((q) => (
                    <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontWeight: 800 }}>{q.filename}</div>
                        <div style={{ fontSize: 12, color: 'var(--textMuted)' }}>#{q.id}</div>
                      </div>
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        Status: <strong>{q.status}</strong> · Rows: <strong>{q.totalRows}</strong>
                      </div>
                      {q.error ? <div style={{ marginTop: 6, fontSize: 12, color: '#b91c1c' }}>{q.error}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
