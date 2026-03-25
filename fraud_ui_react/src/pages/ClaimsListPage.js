import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchClaims } from '../api/client';
import '../components/ui.css';

function RiskBadge({ level }) {
  const l = String(level || 'Low');
  const cls = l === 'High' ? 'badgeHigh' : l === 'Medium' ? 'badgeMed' : 'badgeLow';
  return <span className={`badge ${cls}`}>{l} risk</span>;
}

// PUBLIC_INTERFACE
export default function ClaimsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const minScore = searchParams.get('minScore') || '';
  const status = searchParams.get('status') || '';

  const params = useMemo(() => {
    const p = {};
    if (minScore !== '') p.minScore = minScore;
    if (status !== '') p.status = status;
    p.sortBy = 'fraudScore';
    p.sortDir = 'desc';
    return p;
  }, [minScore, status]);

  async function load() {
    setBusy(true);
    setError('');
    try {
      const data = await fetchClaims(params);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load claims');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScore, status]);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined) next.delete(key);
    else next.set(key, String(value));
    setSearchParams(next, { replace: true });
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h1 className="h1">Claims</h1>
          <div className="subtext">
            Review uploaded claims, sorted by fraud score. Click a row to view full details and scoring reasons.
          </div>
        </div>
        <div className="btnRow">
          <button className="button" type="button" onClick={load} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cardBody" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label" htmlFor="minScore">Min fraud score</label>
            <input
              id="minScore"
              className="input"
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setParam('minScore', e.target.value)}
              placeholder="e.g., 40"
            />
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <input
              id="status"
              className="input"
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
              placeholder="e.g., Open"
            />
          </div>
        </div>
      </div>

      {error ? <div className="error"><strong>Error:</strong> {error}</div> : null}

      <div className="tableWrap">
        <table className="table" role="table" aria-label="Claims table">
          <thead>
            <tr>
              <th className="th">Claimant</th>
              <th className="th">Policy</th>
              <th className="th">Amount</th>
              <th className="th">Type</th>
              <th className="th">Score</th>
              <th className="th">Risk</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="td" colSpan={7} style={{ color: 'var(--textMuted)' }}>
                  {busy ? 'Loading…' : 'No claims found. Upload a CSV from the Upload page.'}
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr
                  key={c.id}
                  className="trHover"
                  onClick={() => navigate(`/claims/${c.id}`)}
                  role="row"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/claims/${c.id}`); }}
                >
                  <td className="td">
                    <div style={{ fontWeight: 900 }}>{c.claimantName}</div>
                    <div style={{ fontSize: 12, color: 'var(--textMuted)' }}>{c.externalId ? `External: ${c.externalId}` : `ID: ${c.id.slice(0, 8)}…`}</div>
                  </td>
                  <td className="td">{c.policyId}</td>
                  <td className="td">${Number(c.claimAmount || 0).toLocaleString()}</td>
                  <td className="td">{c.incidentType}</td>
                  <td className="td" style={{ fontWeight: 900 }}>{c.fraudScore}</td>
                  <td className="td"><RiskBadge level={c.riskLevel} /></td>
                  <td className="td">{c.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
