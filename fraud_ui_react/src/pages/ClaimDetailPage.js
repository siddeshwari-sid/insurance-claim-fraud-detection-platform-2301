import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchClaimById } from '../api/client';
import '../components/ui.css';

function RiskBadge({ level }) {
  const l = String(level || 'Low');
  const cls = l === 'High' ? 'badgeHigh' : l === 'Medium' ? 'badgeMed' : 'badgeLow';
  return <span className={`badge ${cls}`}>{l} risk</span>;
}

// PUBLIC_INTERFACE
export default function ClaimDetailPage() {
  const { id } = useParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [claim, setClaim] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setBusy(true);
      setError('');
      try {
        const data = await fetchClaimById(id);
        if (!mounted) return;
        setClaim(data.claim);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load claim');
      } finally {
        if (mounted) setBusy(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h1 className="h1">Claim detail</h1>
          <div className="subtext">
            <Link to="/claims" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 800 }}>
              ← Back to claims
            </Link>
          </div>
        </div>
        {claim ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RiskBadge level={claim.riskLevel} />
            <div className="badge" title="Fraud score (0-100)">Score: {claim.fraudScore}</div>
          </div>
        ) : null}
      </div>

      {error ? <div className="error"><strong>Error:</strong> {error}</div> : null}
      {busy && !claim ? <div className="notice">Loading…</div> : null}

      {claim ? (
        <div className="grid2">
          <div className="card">
            <div className="cardBody">
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Overview</div>

              <div className="kv">
                <div className="k">Claimant</div>
                <div className="v">{claim.claimantName}</div>
              </div>
              <div className="kv">
                <div className="k">Policy</div>
                <div className="v">{claim.policyId}</div>
              </div>
              <div className="kv">
                <div className="k">Amount</div>
                <div className="v">${Number(claim.claimAmount || 0).toLocaleString()}</div>
              </div>
              <div className="kv">
                <div className="k">Incident type</div>
                <div className="v">{claim.incidentType}</div>
              </div>
              <div className="kv">
                <div className="k">Incident date</div>
                <div className="v">{claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Filed date</div>
                <div className="v">{claim.filedDate ? new Date(claim.filedDate).toLocaleDateString() : '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Age</div>
                <div className="v">{claim.claimantAge || '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Prior claims</div>
                <div className="v">{claim.priorClaims || 0}</div>
              </div>
              <div className="kv">
                <div className="k">Status</div>
                <div className="v">{claim.status}</div>
              </div>

              {claim.description ? (
                <div style={{ marginTop: 12 }}>
                  <div className="k" style={{ marginBottom: 6 }}>Description</div>
                  <div style={{ color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>{claim.description}</div>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="cardBody">
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Scoring reasons</div>
                {Array.isArray(claim.reasons) && claim.reasons.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text)', lineHeight: 1.6, fontWeight: 650 }}>
                    {claim.reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                  </ul>
                ) : (
                  <div style={{ color: 'var(--textMuted)', fontSize: 13 }}>No reasons recorded (score likely low).</div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="cardBody">
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Raw record</div>
                <pre style={{
                  margin: 0,
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(241,245,249,0.8)',
                  border: '1px solid var(--border)',
                  overflow: 'auto',
                  fontSize: 12,
                }}>
                  {JSON.stringify(claim.raw || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
