/**
 * Step 2 — Preview. Renders the raw parsed CSV exactly as uploaded, so the user
 * can verify before any AI runs. Sticky header + both-axis scrolling handle
 * wide and tall files. We cap visible rows for performance and label the cap.
 */
const MAX_PREVIEW_ROWS = 100;

export default function PreviewTable({ fileName, headers, rows }) {
  const visible = rows.slice(0, MAX_PREVIEW_ROWS);
  const hiddenCount = rows.length - visible.length;

  return (
    <section className="panel">
      <div className="panel-head panel-head--row">
        <div>
          <h2 className="panel-title">Preview</h2>
          <p className="panel-desc">
            <span className="file-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 3v5h5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              {fileName}
            </span>
          </p>
        </div>
        <div className="preview-counts">
          <span className="count-pill">
            <b>{rows.length.toLocaleString()}</b> rows
          </span>
          <span className="count-pill">
            <b>{headers.length}</b> columns
          </span>
        </div>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-idx">#</th>
              {headers.map((h) => (
                <th key={h}>{h || <span className="muted">(unnamed)</span>}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i}>
                <td className="col-idx mono">{i + 1}</td>
                {headers.map((h) => (
                  <td key={h} title={row[h]}>
                    {row[h] || <span className="muted">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hiddenCount > 0 && (
        <p className="table-foot">
          Showing first {MAX_PREVIEW_ROWS} rows · {hiddenCount.toLocaleString()} more
          will be processed on import.
        </p>
      )}
    </section>
  );
}
