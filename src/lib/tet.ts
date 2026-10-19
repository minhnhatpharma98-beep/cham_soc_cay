import { isoDate } from "./data";

// Lunar New Year (Tết Nguyên Đán) dates; extend the table as years pass.
const TET = ["2027-02-06", "2028-01-26", "2029-02-13", "2030-02-03", "2031-01-23"];

/** Days before Tết we suggest picking mai leaves (around the 15th of the 12th lunar month). */
export const LEAF_PICK_DAYS_BEFORE = 28;

const DAY = 86400000;
const at = (s: string) => new Date(s + "T00:00:00").getTime();

export type LeafPick = {
  tetYear: number;
  tet: string;
  pickDate: string;
  daysToPick: number; // negative once the suggested date has passed
  daysToTet: number;
};

/** The upcoming Tết (today counts until Tết day passes) and its leaf-picking date. */
export function nextLeafPick(today: string): LeafPick | null {
  const t = at(today);
  const tet = TET.find((d) => at(d) >= t);
  if (!tet) return null;
  const pick = at(tet) - LEAF_PICK_DAYS_BEFORE * DAY;
  return {
    tetYear: Number(tet.slice(0, 4)),
    tet,
    pickDate: isoDate(new Date(pick)),
    daysToPick: Math.round((pick - t) / DAY),
    daysToTet: Math.round((at(tet) - t) / DAY),
  };
}

export const fmtDate = (iso: string) => iso.split("-").reverse().join("/");
