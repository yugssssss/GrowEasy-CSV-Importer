import { useMemo, useState } from 'react';
import { CRM_FIELDS } from '../api/client.js';

/** Turn CRM records into a valid CSV string for download. */
function toCsv(records) {
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = CRM_FIELDS.join(',');
  const body = records.map((r) => CRM_FIELDS.map((f) => escape(r[f])).join(',')).join('\n');
  return `${header}\n${body}`;
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, tone }) {
  return (
    <div className="stat-card" data-tone={tone}>
      <span className="stat-value mono">{value.toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/**
 * Step 4 — Result. Shows totals, the AI-extracted CRM records, and any skipped
 * rows with their reason. Records can be exported as CSV or JSON.
 */
export default function ResultView({ result, fileName, onReset }) {
  const { imported, skipped, totalImported, totalSkipped, totalRows } = result;
  const [tab, setTab] = useState('imported');

  const baseName = useMemo(
    () => (fileName ? fileName.replace(/\.csv$/i, '') : 'leads'),
    [fileName]
  );

  return (
    <section className="panel">
      <div className="panel-head panel-head--row">
        <div>
          <h2 className="panel-title">Import result</h2>
          <p className="panel-desc">
            Mapped with <code className="mono">{result.model}</code>. Review below,
            then export.
          </p>
        </div>
        <div className="result-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              download(`${baseName}-crm.csv`, toCsv(imported), 'text/csv')
            }
            disabled={totalImported === 0}
          >
            Download CSV
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              download(
                `${baseName}-crm.json`,
                JSON.stringify(imported, null, 2),
                'application/json'
              )
            }
            disabled={totalImported === 0}
          >
            Download JSON
          </button>
          <button type="button" className="btn btn-solid" onClick={onReset}>
            Import another
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total rows" value={totalRows} tone="neutral" />
        <StatCard label="Imported" value={totalImported} tone="good" />
        <StatCard label="Skipped" value={totalSkipped} tone="warn" />
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'imported'}
          className={`tab${tab === 'imported' ? ' is-active' : ''}`}
          onClick={() => setTab('imported')}
        >
          Parsed records
          <span className="tab-count">{totalImported}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'skipped'}
          className={`tab${tab === 'skipped' ? ' is-active' : ''}`}
          onClick={() => setTab('skipped')}
          disabled={totalSkipped === 0}
        >
          Skipped
          <span className="tab-count">{totalSkipped}</span>
        </button>
      </div>

      {tab === 'imported' &&
        (totalImported === 0 ? (
          <p className="empty-state">
            No records had an email or mobile number, so nothing was imported.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-idx">#</th>
                  {CRM_FIELDS.map((f) => (
                    <th key={f} className="mono-head">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {imported.map((rec, i) => (
                  <tr key={i}>
                    <td className="col-idx mono">{i + 1}</td>
                    {CRM_FIELDS.map((f) => (
                      <td key={f} title={rec[f]}>
                        {f === 'crm_status' && rec[f] ? (
                          <span className={`badge badge--status`}>{rec[f]}</span>
                        ) : f === 'data_source' && rec[f] ? (
                          <span className="badge badge--source">{rec[f]}</span>
                        ) : (
                          rec[f] || <span className="muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'skipped' && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-idx">Row</th>
                <th>Reason</th>
                <th>Original data</th>
              </tr>
            </thead>
            <tbody>
              {skipped.map((s, i) => (
                <tr key={i}>
                  <td className="col-idx mono">{s.row}</td>
                  <td>
                    <span className="badge badge--warn">{s.reason}</span>
                  </td>
                  <td className="mono muted small">
                    {Object.entries(s.original || {})
                      .filter(([, v]) => String(v ?? '').trim())
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('  ·  ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
