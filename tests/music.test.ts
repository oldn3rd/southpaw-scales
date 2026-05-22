import { describe, expect, it } from "vitest";
import {
  getDiatonicSeventhChords,
  getDiatonicTriads,
  getFretboard,
  getParentMajorKey,
  getParallelChordRows,
  getRelativeModes,
  getScaleNotes,
  orderFrets
} from "../src/music";

describe("music theory helpers", () => {
  it("generates notes for common modes in their selected key", () => {
    expect(getScaleNotes("C", "ionian")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    expect(getScaleNotes("D", "dorian")).toEqual(["D", "E", "F", "G", "A", "B", "C"]);
    expect(getScaleNotes("G", "mixolydian")).toEqual(["G", "A", "B", "C", "D", "E", "F"]);
  });

  it("finds the parent major key for modal relationships", () => {
    expect(getParentMajorKey("D", "dorian")).toBe("C");
    expect(getParentMajorKey("E", "phrygian")).toBe("C");
    expect(getParentMajorKey("B", "locrian")).toBe("C");
  });

  it("keeps relative modes inside the same parent key", () => {
    const rows = getRelativeModes("D", "dorian");
    expect(rows.map((row) => `${row.root} ${row.mode.name}`)).toEqual([
      "C Ionian",
      "D Dorian",
      "E Phrygian",
      "F Lydian",
      "G Mixolydian",
      "A Aeolian",
      "B Locrian"
    ]);
  });

  it("marks scale tones on the fretboard", () => {
    const highE = getFretboard("C", "ionian")[0];
    expect(highE.stringName).toBe("E");
    expect(highE.notes[0].note).toBe("E");
    expect(highE.notes[0].inScale).toBe(true);
    expect(highE.notes[1].note).toBe("F");
    expect(highE.notes[1].inScale).toBe(true);
    expect(highE.notes[2].note).toBe("F#");
    expect(highE.notes[2].inScale).toBe(false);
  });

  it("mirrors fret order for left-handed rendering", () => {
    expect(orderFrets([0, 1, 2, 3], "right")).toEqual([0, 1, 2, 3]);
    expect(orderFrets([0, 1, 2, 3], "left")).toEqual([3, 2, 1, 0]);
  });

  it("builds diatonic seventh chords inside a major key", () => {
    expect(getDiatonicSeventhChords("B", "ionian").map((chord) => chord.symbol)).toEqual([
      "Bmaj7",
      "C#m7",
      "D#m7",
      "Emaj7",
      "F#7",
      "G#m7",
      "A#m7b5"
    ]);
  });

  it("builds available triads inside a major key", () => {
    expect(getDiatonicTriads("C", "ionian").map((chord) => chord.symbol)).toEqual([
      "C",
      "Dm",
      "Em",
      "F",
      "G",
      "Am",
      "Bdim"
    ]);
  });

  it("builds parallel chord rows from the selected root", () => {
    const rows = getParallelChordRows("C");
    expect(rows).toHaveLength(7);
    expect(rows.find((row) => row.mode.id === "aeolian")?.chords.map((chord) => chord.symbol)).toEqual([
      "Cm7",
      "Dm7b5",
      "D#maj7",
      "Fm7",
      "Gm7",
      "G#maj7",
      "A#7"
    ]);
  });
});
