import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  CHROMATIC_SHARP,
  CIRCLE_OF_FIFTHS,
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
  getScaleIntervals,
  getTwelveBarBlues,
  intervalLabel,
  orderFrets
} from "./music";

const fretNumbers = Array.from({ length: 13 }, (_, fret) => fret);
const handednessStorageKey = "guitar-scale-generator-handedness";
const chordToneLabels = ["R", "3", "5", "7"] as const;
const bluesBpm = 68;
const bluesBarMs = (60_000 / bluesBpm) * 4;
const flatDisplayNames: Record<NoteName, string> = {
  C: "C",
  "C#": "Db",
  D: "D",
  "D#": "Eb",
  E: "E",
  F: "F",
  "F#": "Gb",
  G: "G",
  "G#": "Ab",
  A: "A",
  "A#": "Bb",
  B: "B"
};

function getStoredHandedness(): Handedness {
  if (typeof window === "undefined") return "right";
  return window.localStorage.getItem(handednessStorageKey) === "left" ? "left" : "right";
}

function getAudioContext(): AudioContext {
  const AudioContextClass =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new AudioContextClass();
}

function noteFrequency(note: NoteName, chordRoot: NoteName): number {
  const rootIndex = CHROMATIC_SHARP.indexOf(chordRoot);
  const noteIndex = CHROMATIC_SHARP.indexOf(note);
  const semitonesAboveRoot = (noteIndex - rootIndex + 12) % 12;
  const midi = 48 + rootIndex + semitonesAboveRoot;
  return 440 * 2 ** ((midi - 69) / 12);
}

function displayDominantChordNote(note: NoteName, index: number): string {
  return index === 3 ? flatDisplayNames[note] : note;
}

export default function App() {
  const [root, setRoot] = useState<NoteName>("C");
  const [modeId, setModeId] = useState("ionian");
  const [handedness, setHandedness] = useState<Handedness>(getStoredHandedness);
  const [isBluesPlaying, setIsBluesPlaying] = useState(false);
  const [currentBluesBar, setCurrentBluesBar] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const mode = getMode(modeId);
  const scaleNotes = useMemo(() => getScaleNotes(root, modeId), [root, modeId]);
  const scaleIntervals = useMemo(() => getScaleIntervals(root, modeId), [root, modeId]);
  const parentMajor = useMemo(() => getParentMajorKey(root, modeId), [root, modeId]);
  const seventhChords = useMemo(() => getDiatonicSeventhChords(root, modeId), [root, modeId]);
  const selectedChordSymbols = useMemo(() => new Set(seventhChords.map((chord) => chord.symbol)), [seventhChords]);
  const parallelChordRows = useMemo(() => getParallelChordRows(root), [root]);
  const fretboard = useMemo(() => getFretboard(root, modeId), [root, modeId]);
  const relativeModes = useMemo(() => getRelativeModes(root, modeId), [root, modeId]);
  const bluesProgression = useMemo(() => getTwelveBarBlues(root), [root]);
  const activeBluesBar = bluesProgression[currentBluesBar];
  const relativeModeByRoot = useMemo(
    () => new Map(relativeModes.map((row) => [row.root, row.mode])),
    [relativeModes]
  );
  const orderedFrets = orderFrets(fretNumbers, handedness);

  useEffect(() => {
    window.localStorage.setItem(handednessStorageKey, handedness);
  }, [handedness]);

  useEffect(() => {
    if (!isBluesPlaying) return undefined;
    const chord = bluesProgression[currentBluesBar].chord;
    const audioContext = audioContextRef.current;
    if (audioContext) {
      const startTime = audioContext.currentTime + 0.02;
      chord.notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = index === 0 ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(noteFrequency(note, chord.root), startTime);
        gain.gain.setValueAtTime(0, startTime + index * 0.035);
        gain.gain.linearRampToValueAtTime(0.045, startTime + 0.12 + index * 0.035);
        gain.gain.linearRampToValueAtTime(0.018, startTime + 1.7);
        gain.gain.linearRampToValueAtTime(0, startTime + 3.15);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startTime + index * 0.035);
        oscillator.stop(startTime + 3.2);
      });
    }

    const timer = window.setTimeout(() => {
      setCurrentBluesBar((bar) => (bar + 1) % bluesProgression.length);
    }, bluesBarMs);
    return () => window.clearTimeout(timer);
  }, [bluesProgression, currentBluesBar, isBluesPlaying]);

  async function startBlues() {
    if (!audioContextRef.current) {
      audioContextRef.current = getAudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    setIsBluesPlaying(true);
  }

  function pauseBlues() {
    setIsBluesPlaying(false);
  }

  function stopBlues() {
    setIsBluesPlaying(false);
    setCurrentBluesBar(0);
  }

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Scale controls">
        <div>
          <p className="eyebrow">guitar.denley.nz</p>
          <h1>Southpaw Scales</h1>
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

      <section className="blues-panel" aria-label={`${root} twelve-bar blues practice`}>
        <div className="panel-heading">
          <div>
            <span className="card-label">Practice loop</span>
            <h2>{root} 12-Bar Blues</h2>
          </div>
          <div className="blues-controls">
            <span>{bluesBpm} BPM</span>
            <button onClick={isBluesPlaying ? pauseBlues : startBlues} type="button">
              {isBluesPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={stopBlues} type="button">Stop</button>
          </div>
        </div>
        <div className="blues-now" style={{ "--accent": mode.color } as CSSProperties}>
          <span>Bar {activeBluesBar.bar}</span>
          <strong>{activeBluesBar.chord.symbol}</strong>
          <small>
            {activeBluesBar.degree} · {activeBluesBar.chord.notes.map(displayDominantChordNote).join(" ")}
          </small>
        </div>
        <div className="blues-grid">
          {bluesProgression.map((bar, index) => (
            <button
              className={index === currentBluesBar ? "active" : ""}
              key={`${bar.bar}-${bar.degree}`}
              onClick={() => setCurrentBluesBar(index)}
              style={{ "--accent": mode.color } as CSSProperties}
              type="button"
            >
              <span>{bar.bar}</span>
              <strong>{bar.chord.symbol}</strong>
              <small>{bar.degree}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="theory-layout">
        <section className="interval-panel" aria-label={`${root} ${mode.name} intervals`}>
          <div className="panel-heading">
            <div>
              <span className="card-label">Intervals</span>
              <h2>{root} {mode.name}</h2>
            </div>
          </div>
          <div className="interval-table">
            <div className="interval-heading">Degree</div>
            <div className="interval-heading">Note</div>
            <div className="interval-heading">Interval name</div>
            <div className="interval-heading">Steps</div>
            {scaleIntervals.map((item) => (
              <div className="interval-row" key={`${item.degree}-${item.note}`}>
                <span>{item.degree}</span>
                <strong>{item.note}</strong>
                <span>{item.name}</span>
                <span>{item.semitones}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="circle-panel" aria-label="Circle of fifths">
          <div className="panel-heading">
            <div>
              <span className="card-label">Circle of fifths</span>
              <h2>Key Wheel</h2>
            </div>
          </div>
          <div className="fifths-wheel">
            {CIRCLE_OF_FIFTHS.map((note, index) => {
              const relatedMode = relativeModeByRoot.get(note);
              return (
                <button
                  className={`${root === note ? "active" : ""} ${relatedMode ? "in-key" : ""}`}
                  key={note}
                  onClick={() => setRoot(note)}
                  style={{
                    "--slot": index,
                    "--key-color": relatedMode?.color ?? "#eef3fa"
                  } as CSSProperties}
                  title={relatedMode ? `${note} ${relatedMode.name}` : `${note} outside ${parentMajor} major`}
                  type="button"
                >
                  {note}
                </button>
              );
            })}
          </div>
        </section>
      </div>

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
                {chord.notes.map((note, noteIndex) => (
                  <span
                    className={`tone-${chordToneLabels[noteIndex].toLowerCase()}`}
                    key={`${chord.symbol}-${note}`}
                  >
                    <b>{note}</b>
                    <small>{chordToneLabels[noteIndex]}</small>
                  </span>
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

      <div className="harmony-layout">
        <section className="relationship-panel">
          <div className="panel-heading">
            <div>
              <span className="card-label">Rows of related scales</span>
              <h2>Mode Relationship Map</h2>
            </div>
          </div>
          <div className="mode-grid">
            {relativeModes.map(({ mode: relativeMode, root: relativeRoot, notes, triad, seventh }) => (
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
                <div className="available-chords">
                  <span className="triad" title={`${triad.roman}: ${triad.notes.join(" ")}`}>
                    {triad.symbol}
                  </span>
                  <span className="seventh" title={`${seventh.roman}: ${seventh.notes.join(" ")}`}>
                    {seventh.symbol}
                  </span>
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
      </div>
    </main>
  );
}
