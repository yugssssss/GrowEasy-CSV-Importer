import { useRef, useState } from 'react';

/**
 * Step 1 — Upload. Supports both drag & drop and click-to-browse.
 * Only accepts .csv; anything else raises an inline, actionable error.
 */
export default function Uploader({ onFile, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    const isCsv =
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel';
    if (!isCsv) {
      onFile(null, 'That file is not a CSV. Choose a file ending in .csv.');
      return;
    }
    onFile(file);
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Upload a CSV</h2>
        <p className="panel-desc">
          Drop any lead export — Facebook, Google Ads, a real-estate CRM, or a
          spreadsheet you made by hand. Column names do not need to match.
        </p>
      </div>

      <div
        className={`dropzone${dragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className="dropzone-icon" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0L7 9m5-5 5 5"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="dropzone-title">
          Drag &amp; drop your CSV here
          <span className="dropzone-or">or click to browse</span>
        </p>
        <p className="dropzone-note">.csv · up to 5 MB</p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="visually-hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="inline-error" role="alert">{error}</p>}
    </section>
  );
}
