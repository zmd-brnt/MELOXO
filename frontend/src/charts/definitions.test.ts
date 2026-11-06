import { expect, test } from "vitest";
import { errorRows, fillDays, fillHours, formatDay, heatmapChart, heatRows, rankChart, shortLabel } from "./definitions";

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

test("fillHours completa las horas sin reproducciones", () => {
  const rows = fillHours([{ bucket: "2026-11-05T14:00:00", plays: 2 }], 3, today);
  expect(rows).toEqual([
    { bucket: "2026-11-05T13:00:00", plays: 0 },
    { bucket: "2026-11-05T14:00:00", plays: 2 },
    { bucket: "2026-11-05T15:00:00", plays: 0 },
  ]);
});

test("formatDay no retrocede un día con fechas sin hora", () => {
  expect(formatDay("2026-11-05")).toContain("5");
  expect(formatDay("2026-11-05T00:00:00")).toBe(formatDay("2026-11-05"));
});

test("heatRows llena la semana completa y deja vacío sin datos", () => {
  expect(heatRows({ items: [] })).toEqual([]);
  const rows = heatRows({ items: [{ dow: 2, hour: 14, plays: 5 }] });
  expect(rows).toHaveLength(168);
  expect(rows.find((r) => r.dow === 2 && r.hour === 14)?.plays).toBe(5);
  expect(rows.find((r) => r.dow === 1 && r.hour === 0)?.plays).toBe(0);
});

test("errorRows suma errores por módulo", () => {
  const rows = errorRows({
    items: [
      { module: "catalog", errors: 1 },
      { module: "catalog", errors: 2 },
      { module: "users", errors: 0 },
    ],
  });
  expect(rows).toEqual([{ label: "catalog", count: 3 }, { label: "users", count: 0 }]);
});

test("el mapa de calor empieza la semana arriba", () => {
  const options = heatmapChart([{ dow: 1, hour: 0, plays: 1 }]).options as { scales: { y: { reverse?: boolean } } };
  // Un eje vertical de categorías ya pone la primera arriba; chartjs-chart-matrix lo invierte por defecto.
  expect(options.scales.y.reverse).toBe(false);
});

test("las barras por nombre recortan para caber en una tarjeta angosta", () => {
  const config = rankChart("Reproducciones", "label", "plays")([{ label: "x", plays: 1 }]);
  const ticks = (config.options as { scales: { y: { ticks: { callback: (this: unknown, value: number) => string } } } }).scales.y.ticks;
  const label = ticks.callback.call({ getLabelForValue: () => "Una canción con un nombre bastante largo" }, 0);
  expect(label.length).toBeLessThanOrEqual(19);
});
