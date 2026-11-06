import { expect, test } from "vitest";
import { fillDays, shortLabel } from "./definitions";

const today = new Date(2026, 10, 5, 15, 30);

test("fillDays completa con cero los días sin reproducciones", () => {
  const rows = fillDays([{ bucket: "2026-11-03T00:00:00", plays: 4 }], 3, today);
  expect(rows).toEqual([
    { bucket: "2026-11-03T00:00:00", plays: 4 },
    { bucket: "2026-11-04T00:00:00", plays: 0 },
    { bucket: "2026-11-05T00:00:00", plays: 0 },
  ]);
});

test("fillDays cruza el cambio de mes", () => {
  const rows = fillDays([{ bucket: "2026-11-01T00:00:00", plays: 1 }], 7, today);
  expect(rows[0].bucket).toBe("2026-10-30T00:00:00");
  expect(rows).toHaveLength(7);
});

test("fillDays sin reproducciones deja el estado vacío", () => {
  expect(fillDays([], 30, today)).toEqual([]);
});

test("shortLabel recorta nombres largos del eje", () => {
  expect(shortLabel("Lado B")).toBe("Lado B");
  expect(shortLabel("Una canción con un nombre bastante largo")).toBe("Una canción con un nombre…");
});
