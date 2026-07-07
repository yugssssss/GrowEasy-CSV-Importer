import { useState } from 'react';
import Papa from 'papaparse';
import { importCsvFile } from './api/client.js';
import { useTheme } from './hooks/useTheme.js';
import Header from './components/Header.jsx';
import Pipeline from './components/Pipeline.jsx';
import Uploader from './components/Uploader.jsx';
import PreviewTable from './components/PreviewTable.jsx';
import Processing from './components/Processing.jsx';
import ResultView from './components/ResultView.jsx';

/**
 * App is a small explicit state machine:
 *   upload -> preview -> processing -> result
 * Each stage owns one panel. CSV is parsed client-side for the preview only;
 * the actual file is re-sent to the backend on confirm so the server does its
 * own authoritative parse + AI extraction.
 */
export default function App() {
  const { theme, toggle } = useTheme();

  const [stage, setStage] = useState('upload');
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const reset = () => {
    setStage('upload');
    setFile(null);
    setHeaders([]);
    setRows([]);
    setResult(null);
    setError('');
  };

  /** Handle a chosen/dropped file: parse it locally for the preview. */
  const handleFile = (chosen, fileError) => {
    setError('');
    if (fileError) {
      setError(fileError);
      return;
    }
    if (!chosen) return;

    Papa.parse(chosen, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => (h || '').trim(),
      complete: (res) => {
        const parsed = (res.data || []).filter(
          (r) => r && Object.values(r).some((v) => String(v ?? '').trim() !== '')
        );
        if (parsed.length === 0) {
          setError('This CSV has no readable data rows.');
          return;
        }
        setFile(chosen);
        setHeaders(res.meta?.fields || Object.keys(parsed[0]));
        setRows(parsed);
        setStage('preview');
      },
      error: () => setError('Could not read that CSV. Please check the file.'),
    });
  };

  /** Confirm import: send file to backend for AI extraction. */
  const handleConfirm = async () => {
    setError('');
    setStage('processing');
    try {
      const data = await importCsvFile(file);
      setResult(data);
      setStage('result');
    } catch (err) {
      setError(err.message);
      setStage('preview');
    }
  };

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggle} />

      <main className="main">
        <div className="intro">
          <p className="eyebrow">CRM lead ingestion</p>
          <h1 className="headline">
            Turn <span className="accent">any CSV</span> into clean CRM leads.
          </h1>
          <p className="subhead">
            Upload a messy export. The AI figures out the columns and maps them
            to the GrowEasy schema — you just confirm.
          </p>
        </div>

        <Pipeline stage={stage} />

        {stage === 'upload' && <Uploader onFile={handleFile} error={error} />}

        {stage === 'preview' && (
          <>
            <PreviewTable fileName={file?.name} headers={headers} rows={rows} />
            {error && <p className="inline-error" role="alert">{error}</p>}
            <div className="action-row">
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Choose a different file
              </button>
              <button type="button" className="btn btn-solid" onClick={handleConfirm}>
                Confirm import
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14m0 0-6-6m6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </>
        )}

        {stage === 'processing' && <Processing rowCount={rows.length} />}

        {stage === 'result' && result && (
          <ResultView result={result} fileName={file?.name} onReset={reset} />
        )}
      </main>

      <footer className="footer">
        <span>Built for the GrowEasy assignment</span>
        <span className="dot">·</span>
        <span>React + Express + OpenAI</span>
      </footer>
    </div>
  );
}
