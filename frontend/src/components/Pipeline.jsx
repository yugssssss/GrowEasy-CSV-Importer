const STEPS = [
  { key: 'upload', label: 'Upload', hint: 'Any CSV' },
  { key: 'preview', label: 'Preview', hint: 'Verify rows' },
  { key: 'processing', label: 'Extract', hint: 'AI mapping' },
  { key: 'result', label: 'Result', hint: 'CRM records' },
];

const ORDER = STEPS.map((s) => s.key);

/**
 * The signature element: a four-node pipeline that literally traces the data's
 * journey Upload -> Preview -> Extract -> Result. The active node glows; passed
 * nodes are marked done. This is the mental model of the whole app.
 */
export default function Pipeline({ stage }) {
  const activeIndex = ORDER.indexOf(stage);

  return (
    <nav className="pipeline" aria-label="Import progress">
      {STEPS.map((step, i) => {
        const state =
          i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'todo';
        return (
          <div className="pipeline-node" key={step.key} data-state={state}>
            <div className="pipeline-dot">
              {state === 'done' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span className="pipeline-index">{String(i + 1).padStart(2, '0')}</span>
              )}
            </div>
            <div className="pipeline-meta">
              <span className="pipeline-label">{step.label}</span>
              <span className="pipeline-hint">{step.hint}</span>
            </div>
            {i < STEPS.length - 1 && <span className="pipeline-link" aria-hidden="true" />}
          </div>
        );
      })}
    </nav>
  );
}
