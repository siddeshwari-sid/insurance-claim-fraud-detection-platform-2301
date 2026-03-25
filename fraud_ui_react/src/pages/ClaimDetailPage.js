import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchClaimById } from '../api/client';
import '../components/ui.css';

function RiskBadge({ level }) {
  const l = String(level || 'Low');
  const cls = l === 'High' ? 'badgeHigh' : l === 'Medium' ? 'badgeMed' : 'badgeLow';
  return <span className={`badge ${cls}`}>{l} risk</span>;
}

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return `$${n.toLocaleString()}`;
}

function formatDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  // Invalid date guard
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

/**
 * Picks a small set of "extra" fields from the raw record without dumping the whole JSON.
 * We filter out keys that are already displayed in the overview to avoid duplication.
 */
function pickAdditionalSignals(raw) {
  if (!raw || typeof raw !== 'object') return [];

  const excluded = new Set([
    'claimId',
    'claimantName',
    'policyId',
    'claimAmount',
    'incidentType',
    'incidentDate',
    'filedDate',
    'claimantAge',
    'priorClaims',
    'description',
    'status',
  ]);

  const entries = Object.entries(raw)
    .filter(([k, v]) => !excluded.has(k) && v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]);

  // keep the UI readable: show only a handful
  return entries.slice(0, 8);
}

// PUBLIC_INTERFACE
export default function ClaimDetailPage() {
  /** Claim detail view: loads a single claim, renders overview + scoring reasons + additional signals. */
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

  const signals = useMemo(() => pickAdditionalSignals(claim && claim.raw), [claim]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <RiskBadge level={claim.riskLevel} />
            <div className="badge" title="Fraud score (0-100)">Score: {claim.fraudScore}</div>
            {claim.externalId ? <div className="badge" title="Source system ID">External: {claim.externalId}</div> : null}
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
                <div className="v">{claim.claimantName || '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Policy</div>
                <div className="v">{claim.policyId || '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Amount</div>
                <div className="v">{formatMoney(claim.claimAmount)}</div>
              </div>
              <div className="kv">
                <div className="k">Incident type</div>
                <div className="v">{claim.incidentType || '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Incident date</div>
                <div className="v">{formatDate(claim.incidentDate)}</div>
              </div>
              <div className="kv">
                <div className="k">Filed date</div>
                <div className="v">{formatDate(claim.filedDate)}</div>
              </div>
              <div className="kv">
                <div className="k">Age</div>
                <div className="v">{claim.claimantAge || '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Prior claims</div>
                <div className="v">{claim.priorClaims ?? 0}</div>
              </div>
              <div className="kv">
                <div className="k">Status</div>
                <div className="v">{claim.status || '—'}</div>
              </div>

              {claim.description ? (
                <div style={{ marginTop: 12 }}>
                  <div className="k" style={{ marginBottom: 6 }}>Description</div>
                  <div style={{ color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>
                    {claim.description}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="cardBody">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>Scoring reasons</div>
                  <div style={{ fontSize: 12, color: 'var(--textMuted)', fontWeight: 800 }}>
                    Why this claim scored {claim.fraudScore}
                  </div>
                </div>

                <div style={{ height: 10 }} />

                {Array.isArray(claim.reasons) && claim.reasons.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text)', lineHeight: 1.6, fontWeight: 650 }}>
                    {claim.reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                  </ul>
                ) : (
                  <div style={{ color: 'var(--textMuted)', fontSize: 13 }}>
                    No reasons recorded (score likely low).
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="cardBody">
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Additional signals</div>
                {signals.length ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {signals.map(([k, v]) => (
                      <div key={k} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                        <div style={{ fontSize: 12, color: 'var(--textMuted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          {k}
                        </div>
                        <div style={{ marginTop: 6, fontWeight: 650, color: 'var(--text)', wordBreak: 'break-word' }}>
                          {v}
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: 12, color: 'var(--textMuted)' }}>
                      Showing a small set of extra fields provided in the upload (without displaying the full raw record).
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--textMuted)', fontSize: 13 }}>
                    No extra signals available for this claim.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
