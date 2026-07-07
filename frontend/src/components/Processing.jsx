/**
 * Step 3 — Extract. Shown while the backend maps rows with the AI. We can't
 * stream true batch progress from a single request, so we surface an honest
 * indeterminate state with the row count in flight, plus a shimmering bar so
 * the wait feels alive rather than frozen.
 */
export default function Processing({ rowCount }) {
  return (
    <section className="panel processing">
      <div className="processing-orbit" aria-hidden="true">
        <span className="orbit-core" />
        <span className="orbit-ring" />
      </div>

      <h2 className="panel-title">Mapping your data</h2>
      <p className="panel-desc processing-desc">
        The model is reading {rowCount.toLocaleString()} row
        {rowCount === 1 ? '' : 's'}, figuring out which column means what, and
        converting everything into GrowEasy CRM format.
      </p>

      <div className="progress-bar" role="progressbar" aria-label="Extracting records">
        <span className="progress-fill" />
      </div>

      <ul className="processing-steps">
        <li>Detecting columns</li>
        <li>Mapping to CRM fields</li>
        <li>Validating &amp; de-duplicating</li>
      </ul>
    </section>
  );
}
