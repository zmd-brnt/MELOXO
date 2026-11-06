import type { ChartConfiguration, Scale } from "chart.js";
import { barStyle, baseOptions, lineStyle, noGridX, SERIES } from "./index";
import type { Column, Row } from "./ChartCard";

const dayFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
const hourFormat = new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" });

/** `bucket` llega sin zona porque ya viene en la del navegador. */
export const formatDay = (value: string) => dayFormat.format(new Date(value));
export const formatMinute = (value: string) => hourFormat.format(new Date(value));

export const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const pad = (value: number) => String(value).padStart(2, "0");
const localDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`;

/** El backend solo devuelve días con actividad; sin ceros, la línea uniría días lejanos como si fueran seguidos. */
export function fillDays(items: Row[], days: number, today = new Date()): Row[] {
  if (!items.length) return [];
  const plays = new Map(items.map((item) => [String(item.bucket).slice(0, 10), item.plays]));
  return Array.from({ length: days }, (_, index) => {
    const bucket = localDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - index)));
    return { bucket, plays: plays.get(bucket.slice(0, 10)) ?? 0 };
  });
}

export const playsRows = (body: { items: Row[] }) => fillDays(body.items, 30);

export const shortLabel = (label: string, max = 25) =>
  label.length > max ? `${label.slice(0, max).trimEnd()}…` : label;

/** El eje recorta; el tooltip y la tabla conservan el nombre completo. */
const namedAxis = {
  grid: { display: false },
  ticks: {
    callback(this: Scale, value: string | number) {
      return shortLabel(this.getLabelForValue(Number(value)));
    },
  },
};

export const playsColumns: Column[] = [
  { key: "bucket", label: "Día", format: formatDay as never },
  { key: "plays", label: "Reproducciones" },
];

export function playsChart(rows: Row[]): ChartConfiguration {
  return {
    type: "line",
    data: {
      labels: rows.map((r) => formatDay(r.bucket as string)),
      datasets: [{ label: "Reproducciones", data: rows.map((r) => r.plays as number), ...lineStyle(SERIES[0]), fill: { target: "origin", above: "rgba(240,66,138,.1)" } }],
    },
    options: {
      ...baseOptions(1),
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 24 } },
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  };
}

/** Barras horizontales: nombres largos y orden por magnitud. */
export function rankChart(label: string, labelKey: string, valueKey: string) {
  return (rows: Row[]): ChartConfiguration => ({
    type: "bar",
    data: {
      labels: rows.map((r) => String(r[labelKey])),
      datasets: [{ label, data: rows.map((r) => r[valueKey] as number), ...barStyle(SERIES[0]) }],
    },
    options: {
      ...baseOptions(1),
      indexAxis: "y",
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: namedAxis },
    },
  });
}

export const retentionColumns: Column[] = [
  { key: "title", label: "Pista" },
  { key: "at_10s", label: "Llegan a 10 s" },
  { key: "at_50", label: "Llegan a la mitad" },
  { key: "at_100", label: "Llegan al final" },
];

export function retentionChart(rows: Row[]): ChartConfiguration {
  const series = retentionColumns.slice(1);
  return {
    type: "bar",
    data: {
      labels: rows.map((r) => String(r.title)),
      datasets: series.map((s, index) => ({
        label: s.label,
        data: rows.map((r) => r[s.key] as number),
        ...barStyle(SERIES[index]),
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      })),
    },
    options: {
      ...baseOptions(3),
      indexAxis: "y",
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: namedAxis },
    },
  };
}

export const retentionHeight = (rows: Row[]) => Math.max(220, rows.length * 62 + 50);

export const releaseRows = (body: { scheduled: number; published: number }): Row[] =>
  body.scheduled + body.published === 0
    ? []
    : [
        { label: "Programados", count: body.scheduled },
        { label: "Publicados", count: body.published },
      ];

export const releaseColumns: Column[] = [
  { key: "label", label: "Estado" },
  { key: "count", label: "Pistas" },
];

export function countChart(label: string) {
  return (rows: Row[]): ChartConfiguration => ({
    type: "bar",
    data: {
      labels: rows.map((r) => String(r.label)),
      datasets: [{ label, data: rows.map((r) => r.count as number), ...barStyle(SERIES[0]) }],
    },
    options: { ...baseOptions(1), scales: { ...noGridX, y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
}
