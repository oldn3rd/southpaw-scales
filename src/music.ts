export const CHROMATIC_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export type NoteName = (typeof CHROMATIC_SHARP)[number];
export type Handedness = "right" | "left";

export type Mode = {
  id: string;
  name: string;
  intervals: number[];
  parentOffset: number;
  color: string;
};

export type FretNote = {
  fret: number;
  note: NoteName;
  interval: number;
  inScale: boolean;
  role: "root" | "third" | "fifth" | "seventh" | "color" | "outside";
};

export type StringRow = {
  stringName: NoteName;
  notes: FretNote[];
};

export type SeventhChord = {
  degree: number;
  roman: string;
  root: NoteName;
  symbol: string;
  quality: string;
  notes: NoteName[];
};

export type TriadChord = {
  degree: number;
  roman: string;
  root: NoteName;
  symbol: string;
  quality: string;
  notes: NoteName[];
};

export type ParallelChordRow = {
  mode: Mode;
  chords: SeventhChord[];
};

export const MODES: Mode[] = [
  { id: "ionian", name: "Ionian", intervals: [0, 2, 4, 5, 7, 9, 11], parentOffset: 0, color: "#e85d75" },
  { id: "dorian", name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10], parentOffset: 2, color: "#10a37f" },
  { id: "phrygian", name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10], parentOffset: 4, color: "#ef7b45" },
  { id: "lydian", name: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11], parentOffset: 5, color: "#4f8cff" },
  { id: "mixolydian", name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10], parentOffset: 7, color: "#9d6cff" },
  { id: "aeolian", name: "Aeolian", intervals: [0, 2, 3, 5, 7, 8, 10], parentOffset: 9, color: "#db4cb2" },
  { id: "locrian", name: "Locrian", intervals: [0, 1, 3, 5, 6, 8, 10], parentOffset: 11, color: "#3fbbc4" }
];

export const STANDARD_TUNING: NoteName[] = ["E", "A", "D", "G", "B", "E"];

export function normalizeNote(input: string): NoteName {
  const normalized = input.trim().replace("♯", "#").replace("♭", "b");
  const flats: Record<string, NoteName> = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#"
  };
  const sharp = flats[normalized] ?? normalized;
  if (!CHROMATIC_SHARP.includes(sharp as NoteName)) {
    throw new Error(`Unsupported note: ${input}`);
  }
  return sharp as NoteName;
}

export function transpose(note: NoteName, semitones: number): NoteName {
  const index = CHROMATIC_SHARP.indexOf(note);
  return CHROMATIC_SHARP[(index + semitones + 1200) % 12];
}

export function getMode(id: string): Mode {
  const mode = MODES.find((candidate) => candidate.id === id);
  if (!mode) {
    throw new Error(`Unknown mode: ${id}`);
  }
  return mode;
}

export function getScaleNotes(root: NoteName, modeId: string): NoteName[] {
  const mode = getMode(modeId);
  return mode.intervals.map((interval) => transpose(root, interval));
}

export function getParentMajorKey(root: NoteName, modeId: string): NoteName {
  return transpose(root, -getMode(modeId).parentOffset);
}

export function getRelativeModes(root: NoteName, modeId: string) {
  const parent = getParentMajorKey(root, modeId);
  const triads = getDiatonicTriads(parent, "ionian");
  const sevenths = getDiatonicSeventhChords(parent, "ionian");
  return MODES.map((mode) => ({
    mode,
    root: transpose(parent, mode.parentOffset),
    notes: getScaleNotes(transpose(parent, mode.parentOffset), mode.id),
    triad: triads[MODES.indexOf(mode)],
    seventh: sevenths[MODES.indexOf(mode)]
  }));
}

export function getDiatonicTriads(root: NoteName, modeId: string): TriadChord[] {
  const scaleNotes = getScaleNotes(root, modeId);
  return scaleNotes.map((chordRoot, index) => {
    const notes = [
      scaleNotes[index],
      scaleNotes[(index + 2) % scaleNotes.length],
      scaleNotes[(index + 4) % scaleNotes.length]
    ];
    const quality = getTriadQuality(notes);
    return {
      degree: index + 1,
      roman: getTriadRoman(index, quality),
      root: chordRoot,
      symbol: `${chordRoot}${getTriadSuffix(quality)}`,
      quality,
      notes
    };
  });
}

export function getDiatonicSeventhChords(root: NoteName, modeId: string): SeventhChord[] {
  const scaleNotes = getScaleNotes(root, modeId);
  return scaleNotes.map((chordRoot, index) => {
    const notes = [
      scaleNotes[index],
      scaleNotes[(index + 2) % scaleNotes.length],
      scaleNotes[(index + 4) % scaleNotes.length],
      scaleNotes[(index + 6) % scaleNotes.length]
    ];
    const quality = getSeventhQuality(notes);
    return {
      degree: index + 1,
      roman: getRoman(index, quality),
      root: chordRoot,
      symbol: `${chordRoot}${getChordSuffix(quality)}`,
      quality,
      notes
    };
  });
}

export function getParallelChordRows(root: NoteName): ParallelChordRow[] {
  return MODES.map((mode) => ({
    mode,
    chords: getDiatonicSeventhChords(root, mode.id)
  }));
}

export function getFretboard(root: NoteName, modeId: string, fretCount = 12): StringRow[] {
  const scaleNotes = new Set(getScaleNotes(root, modeId));
  return STANDARD_TUNING.slice()
    .reverse()
    .map((stringName) => ({
      stringName,
      notes: Array.from({ length: fretCount + 1 }, (_, fret) => {
        const note = transpose(stringName, fret);
        const interval = (CHROMATIC_SHARP.indexOf(note) - CHROMATIC_SHARP.indexOf(root) + 12) % 12;
        return {
          fret,
          note,
          interval,
          inScale: scaleNotes.has(note),
          role: getRole(interval, scaleNotes.has(note))
        };
      })
    }));
}

export function orderFrets(frets: number[], handedness: Handedness): number[] {
  return handedness === "left" ? frets.slice().reverse() : frets;
}

export function intervalLabel(interval: number): string {
  const labels: Record<number, string> = {
    0: "1",
    1: "b2",
    2: "2",
    3: "b3",
    4: "3",
    5: "4",
    6: "#4",
    7: "5",
    8: "b6",
    9: "6",
    10: "b7",
    11: "7"
  };
  return labels[interval] ?? "";
}

function getRole(interval: number, inScale: boolean): FretNote["role"] {
  if (!inScale) return "outside";
  if (interval === 0) return "root";
  if (interval === 3 || interval === 4) return "third";
  if (interval === 6 || interval === 7) return "fifth";
  if (interval === 10 || interval === 11) return "seventh";
  return "color";
}

function getSeventhQuality(notes: NoteName[]): string {
  const rootIndex = CHROMATIC_SHARP.indexOf(notes[0]);
  const intervals = notes.slice(1).map((note) => (CHROMATIC_SHARP.indexOf(note) - rootIndex + 12) % 12);
  const signature = intervals.join("-");
  const qualities: Record<string, string> = {
    "4-7-11": "major seventh",
    "4-7-10": "dominant seventh",
    "3-7-10": "minor seventh",
    "3-6-10": "half-diminished seventh",
    "3-6-9": "diminished seventh",
    "4-8-11": "augmented major seventh",
    "4-8-10": "augmented seventh",
    "3-7-11": "minor major seventh"
  };
  return qualities[signature] ?? "seventh";
}

function getTriadQuality(notes: NoteName[]): string {
  const rootIndex = CHROMATIC_SHARP.indexOf(notes[0]);
  const intervals = notes.slice(1).map((note) => (CHROMATIC_SHARP.indexOf(note) - rootIndex + 12) % 12);
  const signature = intervals.join("-");
  const qualities: Record<string, string> = {
    "4-7": "major",
    "3-7": "minor",
    "3-6": "diminished",
    "4-8": "augmented"
  };
  return qualities[signature] ?? "triad";
}

function getTriadSuffix(quality: string): string {
  const suffixes: Record<string, string> = {
    major: "",
    minor: "m",
    diminished: "dim",
    augmented: "aug",
    triad: ""
  };
  return suffixes[quality] ?? "";
}

function getChordSuffix(quality: string): string {
  const suffixes: Record<string, string> = {
    "major seventh": "maj7",
    "dominant seventh": "7",
    "minor seventh": "m7",
    "half-diminished seventh": "m7b5",
    "diminished seventh": "dim7",
    "augmented major seventh": "maj7#5",
    "augmented seventh": "7#5",
    "minor major seventh": "mMaj7",
    seventh: "7"
  };
  return suffixes[quality] ?? "7";
}

function getTriadRoman(index: number, quality: string): string {
  const major = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const minor = ["i", "ii", "iii", "iv", "v", "vi", "vii"];
  if (quality === "major") return major[index];
  if (quality === "minor") return minor[index];
  if (quality === "diminished") return `${minor[index]}°`;
  if (quality === "augmented") return `${major[index]}+`;
  return major[index];
}

function getRoman(index: number, quality: string): string {
  const major = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const minor = ["i", "ii", "iii", "iv", "v", "vi", "vii"];
  if (quality === "major seventh") return `${major[index]}maj7`;
  if (quality === "dominant seventh") return `${major[index]}7`;
  if (quality === "minor seventh") return `${minor[index]}7`;
  if (quality === "half-diminished seventh") return `${minor[index]}ø7`;
  if (quality === "diminished seventh") return `${minor[index]}°7`;
  if (quality.includes("augmented")) return `${major[index]}+7`;
  return `${major[index]}7`;
}
