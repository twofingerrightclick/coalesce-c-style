// Canon Time's value and keyboard model (docs/research/canon-time.md),
// framework-free so the components and the unit tests share it. Cells hold
// display values: a 12-hour clock's hour is 1–12 with a separate period
// (0 = AM, 1 = PM); the value the components emit is always 24-hour.

export type TimePart = "hour" | "minute" | "second" | "period";

/** A complete 24-hour time. */
export interface Time {
  hour: number;
  minute: number;
  second: number;
}

/** Cell values; `null` is an empty cell. */
export interface Parts {
  hour: number | null;
  minute: number | null;
  second: number | null;
  period: number | null;
}

export interface TimeConfig {
  /** 12-hour cells (1–12 and a period cell). */
  twelve: boolean;
  /** A seconds cell, and `HH:mm:ss` values. */
  seconds: boolean;
  /** Seconds per step, as `<input type="time" step>`: 900 steps minutes by 15, under 60 steps seconds. */
  step: number;
}

export type Allow = number[] | ((value: number) => boolean);

/** Values the cells may take; stepping skips the rest, typing them makes the time invalid. */
export interface Allowed {
  hours?: Allow;
  minutes?: Allow;
  seconds?: Allow;
}

export const emptyParts = (): Parts => ({ hour: null, minute: null, second: null, period: null });

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Reads `H:mm`, `HH:mm:ss`, `h:mm am` / `pm` (any case, optional space) or a
 * `Date`. Returns null for anything else, including out-of-range fields.
 */
export function parseTime(value: unknown): Time | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : { hour: value.getHours(), minute: value.getMinutes(), second: value.getSeconds() };
  }
  if (typeof value !== "string") return null;
  const match = /^\s*(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*([ap])?\.?m?\.?\s*$/i.exec(value);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  if (match[4]) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (/p/i.test(match[4]) ? 12 : 0);
  }
  if (hour > 23 || minute > 59 || second > 59) return null;
  return { hour, minute, second };
}

/** `HH:mm`, or `HH:mm:ss` with `seconds`. */
export function formatTime(time: Time, seconds: boolean): string {
  return `${pad(time.hour)}:${pad(time.minute)}${seconds ? `:${pad(time.second)}` : ""}`;
}

export const secondsOf = (time: Time) => time.hour * 3600 + time.minute * 60 + time.second;

/** The cells, in order: hour, minute, second (with `seconds`), period (with `twelve`). */
export function partsOf(config: TimeConfig): TimePart[] {
  return ["hour", "minute", ...(config.seconds ? ["second" as const] : []), ...(config.twelve ? ["period" as const] : [])];
}

/** A cell's lowest and highest value (its `aria-valuemin` / `max`). */
export function limitsOf(part: TimePart, config: TimeConfig): [number, number] {
  if (part === "hour") return config.twelve ? [1, 12] : [0, 23];
  if (part === "period") return [0, 1];
  return [0, 59];
}

/** How far one step moves each cell, from `step` in seconds (Canon: minutes and seconds carry nothing into the hour). */
export function stepsOf(step: number) {
  const s = step > 0 ? step : 60;
  return {
    hour: s >= 3600 && s % 3600 === 0 ? s / 3600 : 1,
    minute: s >= 60 && s < 3600 ? Math.max(1, Math.round(s / 60)) : 1,
    second: s < 60 ? Math.max(1, Math.round(s)) : 1,
    period: 1,
  };
}

/** A `Time` as cell values. */
export function splitTime(time: Time | null, config: TimeConfig): Parts {
  if (!time) return emptyParts();
  return {
    hour: config.twelve ? time.hour % 12 || 12 : time.hour,
    minute: time.minute,
    second: config.seconds ? time.second : null,
    period: config.twelve ? (time.hour >= 12 ? 1 : 0) : null,
  };
}

/** The cells as a `Time`, or null while any cell is empty. */
export function joinParts(parts: Parts, config: TimeConfig): Time | null {
  if (partsOf(config).some((part) => parts[part] == null)) return null;
  const hour = config.twelve ? (parts.hour! % 12) + (parts.period ? 12 : 0) : parts.hour!;
  return { hour, minute: parts.minute!, second: config.seconds ? parts.second! : 0 };
}

/** Some cells filled and some empty: leaving such a time makes it invalid. */
export function isPartial(parts: Parts, config: TimeConfig) {
  const types = partsOf(config);
  return types.some((part) => parts[part] != null) && types.some((part) => parts[part] == null);
}

function allows(rule: Allow | undefined, value: number) {
  if (!rule) return true;
  return Array.isArray(rule) ? rule.includes(value) : rule(value);
}

/** Whether `value` in `part` is allowed, given the other cells (a 12-hour hour checks both periods while the period is empty). */
export function isPartAllowed(part: TimePart, value: number, parts: Parts, config: TimeConfig, allowed: Allowed = {}) {
  if (part === "minute") return allows(allowed.minutes, value);
  if (part === "second") return allows(allowed.seconds, value);
  if (part === "period") return parts.hour == null || allows(allowed.hours, (parts.hour % 12) + (value ? 12 : 0));
  if (!config.twelve) return allows(allowed.hours, value);
  const periods = parts.period == null ? [0, 1] : [parts.period];
  return periods.some((period) => allows(allowed.hours, (value % 12) + (period ? 12 : 0)));
}

/**
 * Up (+1) or Down (−1) on a cell: by the cell's step, wrapping, an off-step
 * value snapping to the next step that way, an empty cell starting from `now`
 * (minutes and seconds rounded down to the step). `size` steps at once is
 * PageUp / PageDown. Disallowed values are skipped.
 */
export function stepPart(
  parts: Parts,
  part: TimePart,
  direction: 1 | -1,
  config: TimeConfig,
  now: Time,
  allowed: Allowed = {},
  size = 1,
): Parts {
  const next = { ...parts };
  if (parts[part] == null) {
    const start = splitTime(now, { ...config, seconds: true, twelve: config.twelve })[part]!;
    const by = stepsOf(config.step)[part];
    next[part] = part === "minute" || part === "second" ? start - (start % by) : start;
    return isPartAllowed(part, next[part]!, next, config, allowed) ? next : stepPart(next, part, direction, config, now, allowed);
  }
  if (part === "period") {
    next.period = 1 - parts.period!;
    return next;
  }
  const [low, high] = limitsOf(part, config);
  const span = high - low + 1;
  const by = stepsOf(config.step)[part];
  const wrap = (v: number) => ((((v - low) % span) + span) % span) + low;
  let value = parts[part]!;
  // Off-step values first snap to the step in that direction (Canon).
  const off = value % by;
  value = off ? (direction > 0 ? value - off + by : value - off) + direction * by * (size - 1) : value + direction * by * size;
  for (let tries = 0; tries < span; tries++) {
    value = wrap(value);
    if (isPartAllowed(part, value, next, config, allowed)) break;
    value += direction * by;
  }
  next[part] = value;
  return next;
}

/** PageUp / PageDown size, in steps: hours 6, minutes and seconds the first multiple of the step that is at least 10. */
export function largeStepSize(part: TimePart, config: TimeConfig) {
  if (part === "hour") return Math.max(1, Math.round(6 / stepsOf(config.step).hour));
  if (part === "period") return 1;
  const by = stepsOf(config.step)[part];
  return Math.ceil(10 / by);
}

/** Home (`'start'`) / End (`'end'`): the cell's first or last allowed value on its step. */
export function jumpPart(parts: Parts, part: TimePart, to: "start" | "end", config: TimeConfig, allowed: Allowed = {}): Parts {
  const [low, high] = limitsOf(part, config);
  const by = part === "hour" || part === "period" ? 1 : stepsOf(config.step)[part];
  const values: number[] = [];
  for (let v = low; v <= high; v++) if (part === "hour" || part === "period" || v % by === 0) values.push(v);
  if (to === "end") values.reverse();
  const value = values.find((v) => isPartAllowed(part, v, parts, config, allowed)) ?? values[0];
  return { ...parts, [part]: value };
}

/** Typing state of the focused cell: its cells and the digits typed into it so far. */
export interface TypingState {
  parts: Parts;
  buffer: string;
}

export interface TypingResult extends TypingState {
  /** Move to the next cell (+1), the previous one (−1), or stay (0). */
  move: 1 | -1 | 0;
}

/**
 * One typed character in `part` (Canon): digits fill and move on once the cell
 * can't take more, a digit that would overflow starts over, `:` `.` or a
 * space moves on from a filled cell, A / P choose the period.
 */
export function typeChar(state: TypingState, part: TimePart, char: string, config: TimeConfig): TypingResult {
  const parts = { ...state.parts };
  if (part === "period") {
    if (/^[ap]$/i.test(char)) return { parts: { ...parts, period: /a/i.test(char) ? 0 : 1 }, buffer: "", move: 0 };
    if (/^[:.\s]$/.test(char) && parts.period != null) return { parts, buffer: "", move: 1 };
    return { ...state, move: 0 };
  }
  if (/^\d$/.test(char)) {
    const [low, high] = limitsOf(part, config);
    let buffer = state.buffer + char;
    if (Number(buffer) > high) buffer = char;
    parts[part] = Number(buffer) >= low ? Number(buffer) : null;
    if (buffer.length >= 2 || Number(buffer + "0") > high) return { parts, buffer: "", move: 1 };
    return { parts, buffer, move: 0 };
  }
  if (/^[:.\s]$/.test(char) && parts[part] != null) return { parts, buffer: "", move: 1 };
  return { ...state, move: 0 };
}

/**
 * Backspace (`backward`) or Delete: drops the last typed digit, else clears
 * the cell; Backspace on an empty cell moves back.
 */
export function erase(state: TypingState, part: TimePart, backward: boolean, config: TimeConfig): TypingResult {
  const parts = { ...state.parts };
  if (state.buffer) {
    const buffer = state.buffer.slice(0, -1);
    parts[part] = buffer && Number(buffer) >= limitsOf(part, config)[0] ? Number(buffer) : null;
    return { parts, buffer, move: 0 };
  }
  if (parts[part] != null) {
    parts[part] = null;
    return { parts, buffer: "", move: 0 };
  }
  return { parts, buffer: "", move: backward ? -1 : 0 };
}

/** A pasted time (`14:30`, `2:30 pm`, `14.30.05`) found anywhere in `text`. */
export function parsePasted(text: string): Time | null {
  const match = /(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*([ap])?/i.exec(text.trim());
  return match ? parseTime(`${match[1]}:${match[2]}${match[3] ? `:${match[3]}` : ""}${match[4] ? ` ${match[4]}m` : ""}`) : null;
}

export interface TimeRules extends Allowed {
  min?: string | null;
  max?: string | null;
  step?: number;
}

/**
 * Why a complete `time` is invalid, in the browser's words for `min`, `max`
 * and `step` (Canon leaves those checks to the browser), or null.
 */
export function timeError(time: Time, rules: TimeRules): string | null {
  const min = parseTime(rules.min);
  const max = parseTime(rules.max);
  const seconds = secondsOf(time);
  const label = (t: Time) => formatTime(t, t.second !== 0);
  if (min && seconds < secondsOf(min)) return `Value must be ${label(min)} or later.`;
  if (max && seconds > secondsOf(max)) return `Value must be ${label(max)} or earlier.`;
  const step = rules.step && rules.step > 0 ? rules.step : 60;
  if ((seconds - (min ? secondsOf(min) : 0)) % step !== 0) {
    return step % 60 === 0
      ? `Enter a time in steps of ${step / 60} minute${step === 60 ? "" : "s"}.`
      : `Enter a time in steps of ${step} second${step === 1 ? "" : "s"}.`;
  }
  if (!allows(rules.hours, time.hour) || !allows(rules.minutes, time.minute) || !allows(rules.seconds, time.second)) {
    return "Choose an allowed time.";
  }
  return null;
}

/** Whether a range's end is before its start; `overnight` allows it (the next day). */
export const isRangeReversed = (start: Time | null, end: Time | null, overnight: boolean) =>
  !overnight && !!start && !!end && secondsOf(end) < secondsOf(start);

/** The locale's clock: 12 or 24 hours and its day-period names (AM / PM). */
export function clockOf(locale: string | undefined): { twelve: boolean; periods: [string, string] } {
  let twelve = false;
  try {
    const resolved = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();
    twelve = resolved.hourCycle ? /h1[12]/.test(resolved.hourCycle) : !!resolved.hour12;
  } catch {
    // An unknown locale tag: 24 hours.
  }
  const period = (hour: number) => {
    try {
      return (
        new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true })
          .formatToParts(new Date(2000, 0, 1, hour))
          .find((part) => part.type === "dayPeriod")?.value ?? (hour < 12 ? "AM" : "PM")
      );
    } catch {
      return hour < 12 ? "AM" : "PM";
    }
  };
  return { twelve, periods: [period(9), period(21)] };
}
