import React, { useEffect, useMemo, useState } from 'react';
import { fetchSummaryReport } from '../api/client';
import '../components/ui.css';

function Bar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--textMuted)', fontWeight: 800 }}>
        <span>{label}</span>
        <span>{value} ({pct}%)</span>
      </div>
      <div style={{ height: 10, background: 'rgba(241,245,249,0.9)', borderRadius: 999, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function ReportsPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  async function load() {
    setBusy(true);
    setError('');
    try {
      const data = await fetchSummaryReport();
      setSummary(data.summary);
    } catch (e) {
      setError(e.message || 'Failed to load report');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const total = summary ? summary.totalClaims : 0;
  const buckets = summary ? summary.riskBuckets : { low: 0, medium: 0, high: 0 };

  const top = useMemo(() => (summary && summary.topRisky ? summary.topRisky : []), [summary]);

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h1 className="h1">Reports</h1>
          <div className="subtext">High-level risk distribution and the most suspicious claims in your current dataset.</div>
        </div>
        <div className="btnRow">
          <button className="button" type="button" onClick={load} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? <div className="error"><strong>Error:</strong> {error}</div> : null}
      {!summary && busy ? <div className="notice">Loading…</div> : null}

      {summary ? (
        <div className="grid2">
          <div className="card">
            <div className="cardBody">
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Summary</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="card" style={{ boxShadow: 'none', borderRadius: 14 }}>
                  <div className="cardBody">
                    <div className="label">Total claims</div>
                    <div style={{ fontSize: 22, fontWeight: 950 }}>{summary.totalClaims}</div>
                  </div>
                </div>
                <div className="card" style={{ boxShadow: 'none', borderRadius: 14 }}>
                  <div className="cardBody">
                    <div className="label">Average score</div>
                    <div style={{ fontSize: 22, fontWeight: 950 }}>{summary.avgFraudScore}</div>
                  </div>
                </div>
                <div className="card" style={{ boxShadow: 'none', borderRadius: 14 }}>
                  <div className="cardBody">
                    <div className="label">High risk</div>
                    <div style={{ fontSize: 22, fontWeight: 950 }}>{buckets.high}</div>
                  </div>
                </div>
              </div>

              <div style={{ height: 12 }} />

              <Bar label="Low risk" value={buckets.low} total={total} color="rgba(100,116,139,0.55)" />
              <Bar label="Medium risk" value={buckets.medium} total={total} color="rgba(59,130,246,0.75)" />
              <Bar label="High risk" value={buckets.high} total={total} color="rgba(239,68,68,0.75)" />
            </div>
          </div>

          <div className="card">
            <div className="cardBody">
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Top risky claims</div>

              <div className="tableWrap">
                <table className="table" aria-label="Top risky claims">
                  <thead>
                    <tr>
                      <th className="th">Claimant</th>
                      <th className="th">Amount</th>
                      <th className="th">Score</th>
                      <th className="th">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top.length === 0 ? (
                      <tr>
                        <td className="td" colSpan={4} style={{ color: 'var(--textMuted)' }}>
                          No claims yet. Upload a CSV to generate report data.
                        </td>
                      </tr>
                    ) : (
                      top.map((c) => (
                        <tr key={c.id}>
                          <td className="td" style={{ fontWeight: 900 }}>{c.claimantName}</td>
                          <td className="td">${Number(c.claimAmount || 0).toLocaleString()}</td>
                          <td className="td" style={{ fontWeight: 900 }}>{c.fraudScore}</td>
                          <td className="td">{c.riskLevel}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
