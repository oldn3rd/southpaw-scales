import { describe, expect, it } from "vitest";
import {
  CIRCLE_OF_FIFTHS,
  getDiatonicSeventhChords,
  getDiatonicTriads,
  getFretboard,
  getParentMajorKey,
  getParallelChordRows,
  getRelativeModes,
  getScaleNotes,
  getScaleIntervals,
  getTwelveBarBlues,
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

  it("builds interval tables for the selected mode", () => {
    expect(getScaleIntervals("C", "lydian").map((item) => `${item.degree}:${item.note}:${item.name}`)).toEqual([
      "1:C:Perfect unison",
      "2:D:Major second",
      "3:E:Major third",
      "4:F#:Tritone",
      "5:G:Perfect fifth",
      "6:A:Major sixth",
      "7:B:Major seventh"
    ]);
  });

  it("keeps circle of fifths keys in fifth order", () => {
    expect(CIRCLE_OF_FIFTHS).toEqual(["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"]);
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

  it("builds a 12-bar blues progression in the selected key", () => {
    const bars = getTwelveBarBlues("B");
    expect(bars.map((bar) => `${bar.bar}:${bar.degree}:${bar.chord.symbol}`)).toEqual([
      "1:I7:B7",
      "2:I7:B7",
      "3:I7:B7",
      "4:I7:B7",
      "5:IV7:E7",
      "6:IV7:E7",
      "7:I7:B7",
      "8:I7:B7",
      "9:V7:F#7",
      "10:IV7:E7",
      "11:I7:B7",
      "12:V7:F#7"
    ]);
    expect(bars[0].chord.notes).toEqual(["B", "D#", "F#", "A"]);
  });
});
