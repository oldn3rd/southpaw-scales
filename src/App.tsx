import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  CHROMATIC_SHARP,
  Handedness,
  MODES,
  NoteName,
  getFretboard,
  getDiatonicSeventhChords,
  getMode,
  getParallelChordRows,
  getParentMajorKey,
  getRelativeModes,
  getScaleNotes,
  intervalLabel,
  orderFrets
} from "./music";

const fretNumbers = Array.from({ length: 13 }, (_, fret) => fret);

export default function App() {
  const [root, setRoot] = useState<NoteName>("C");
  const [modeId, setModeId] = useState("ionian");
  const [handedness, setHandedness] = useState<Handedness>("right");

  const mode = getMode(modeId);
  const scaleNotes = useMemo(() => getScaleNotes(root, modeId), [root, modeId]);
  const parentMajor = useMemo(() => getParentMajorKey(root, modeId), [root, modeId]);
  const seventhChords = useMemo(() => getDiatonicSeventhChords(root, modeId), [root, modeId]);
  const selectedChordSymbols = useMemo(() => new Set(seventhChords.map((chord) => chord.symbol)), [seventhChords]);
  const parallelChordRows = useMemo(() => getParallelChordRows(root), [root]);
  const fretboard = useMemo(() => getFretboard(root, modeId), [root, modeId]);
  const relativeModes = useMemo(() => getRelativeModes(root, modeId), [root, modeId]);
  const orderedFrets = orderFrets(fretNumbers, handedness);

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Scale controls">
        <div>
          <p className="eyebrow">guitar.denley.nz</p>
          <h1>Guitar Scale Generator</h1>
        </div>

        <div className="controls">
          <div className="button-group key-buttons" aria-label="Key">
            <span className="control-label">Key</span>
            <div className="button-grid">
              {CHROMATIC_SHARP.map((note) => (
                <button
                  key={note}
                  className={root === note ? "active" : ""}
                  onClick={() => setRoot(note)}
                  type="button"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          <div className="button-group mode-buttons" aria-label="Mode">
            <span className="control-label">Mode</span>
            <div className="button-grid">
              {MODES.map((candidate) => (
                <button
                  key={candidate.id}
                  className={modeId === candidate.id ? "active" : ""}
                  onClick={() => setModeId(candidate.id)}
                  type="button"
                >
                  {candidate.name}
                </button>
              ))}
            </div>
          </div>

          <div className="handed-toggle" aria-label="Handedness">
            <button className={handedness === "right" ? "active" : ""} onClick={() => setHandedness("right")}>
              Right-handed
            </button>
            <button className={handedness === "left" ? "active" : ""} onClick={() => setHandedness("left")}>
              Left-handed
            </button>
          </div>
        </div>
      </section>

      <section className="summary-band">
        <div className="scale-card" style={{ "--accent": mode.color } as CSSProperties}>
          <div>
            <span className="card-label">Selected scale</span>
            <h2>
              {root} {mode.name}
            </h2>
          </div>
          <div className="note-strip">
            {scaleNotes.map((note, index) => (
              <button
                key={`${note}-${index}`}
                className={index === 0 ? "root-note" : ""}
                onClick={() => {
                  setRoot(note);
                  setModeId("ionian");
                }}
                type="button"
                title={`Show ${note} Ionian`}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
        <div className="key-context">
          <span className="card-label">Relative major key</span>
          <strong>{parentMajor} major</strong>
          <p>
            This view keeps modes inside their shared parent key, so the rows below show how the same notes
            reorganize around different roots.
          </p>
        </div>
      </section>

      <section className="chord-panel" aria-label={`${root} ${mode.name} seventh chords`}>
        <div className="panel-heading">
          <div>
            <span className="card-label">Diatonic seventh chords</span>
            <h2>{root} {mode.name} harmony</h2>
          </div>
        </div>
        <div className="chord-grid">
          {seventhChords.map((chord) => (
            <article className="chord-card" key={`${chord.degree}-${chord.symbol}`}>
              <span className="roman">{chord.roman}</span>
              <strong>{chord.symbol}</strong>
              <small>{chord.quality}</small>
              <div className="chord-notes">
                {chord.notes.map((note) => (
                  <span key={`${chord.symbol}-${note}`}>{note}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fretboard-panel" aria-label={`${root} ${mode.name} fretboard`}>
        <div className="panel-heading">
          <div>
            <span className="card-label">{handedness === "left" ? "Left-handed mirror" : "Right-handed view"}</span>
            <h2>Fretboard</h2>
          </div>
          <div className="legend">
            <span><i className="root"></i>Root</span>
            <span><i className="third"></i>Third</span>
            <span><i className="fifth"></i>Fifth</span>
            <span><i className="color"></i>Scale tone</span>
          </div>
        </div>

        <div className={`fretboard ${handedness}`}>
          <div className="string-label"></div>
          {orderedFrets.map((fret) => (
            <div className="fret-number" key={fret}>{fret}</div>
          ))}

          {fretboard.map((row) => (
            <div className="string-row" key={row.stringName}>
              <div className="string-label">{row.stringName}</div>
              {orderedFrets.map((fret) => {
                const cell = row.notes[fret];
                return (
                  <div className="fret-cell" key={`${row.stringName}-${fret}`}>
                    {cell.inScale && (
                      <span className={`note-dot ${cell.role}`} title={`${cell.note} ${intervalLabel(cell.interval)}`}>
                        <b>{cell.note}</b>
                        <small>{intervalLabel(cell.interval)}</small>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="relationship-panel">
        <div className="panel-heading">
          <div>
            <span className="card-label">Rows of related scales</span>
            <h2>Mode Relationship Map</h2>
          </div>
        </div>
        <div className="mode-grid">
          {relativeModes.map(({ mode: relativeMode, root: relativeRoot, notes }) => (
            <article
              className={relativeMode.id === modeId ? "mode-row selected" : "mode-row"}
              key={relativeMode.id}
              style={{ "--accent": relativeMode.color } as CSSProperties}
            >
              <button onClick={() => { setRoot(relativeRoot); setModeId(relativeMode.id); }}>
                <span>{relativeRoot}</span>
                <strong>{relativeMode.name}</strong>
              </button>
              <div className="mode-notes">
                {notes.map((note, index) => (
                  <span key={`${relativeMode.id}-${note}-${index}`} className={index === 0 ? "root-note" : ""}>
                    {note}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="borrow-panel">
        <div className="panel-heading">
          <div>
            <span className="card-label">Parallel colour</span>
            <h2>Borrowed Seventh Chords From {root} Parallel Modes</h2>
          </div>
        </div>
        <div className="parallel-grid">
          {parallelChordRows.map(({ mode: parallelMode, chords }) => (
            <article
              className={parallelMode.id === modeId ? "parallel-row selected" : "parallel-row"}
              key={parallelMode.id}
              style={{ "--accent": parallelMode.color } as CSSProperties}
            >
              <button onClick={() => setModeId(parallelMode.id)} type="button">
                {root} {parallelMode.name}
              </button>
              <div className="parallel-chords">
                {chords.map((chord) => (
                  <span
                    className={selectedChordSymbols.has(chord.symbol) ? "available" : "borrowed"}
                    key={`${parallelMode.id}-${chord.degree}-${chord.symbol}`}
                    title={`${chord.roman}: ${chord.notes.join(" ")}`}
                  >
                    {chord.symbol}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
