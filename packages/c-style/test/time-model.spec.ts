import { describe, expect, it } from "vitest";
import {
  clockOf,
  emptyParts,
  erase,
  formatTime,
  isPartial,
  isRangeReversed,
  joinParts,
  jumpPart,
  largeStepSize,
  parsePasted,
  parseTime,
  partsOf,
  splitTime,
  stepPart,
  timeError,
  typeChar,
  type Parts,
  type TimeConfig,
  type TimePart,
  type TypingState,
} from "../src/components/time/model";

const h24: TimeConfig = { twelve: false, seconds: false, step: 60 };
const h12: TimeConfig = { twelve: true, seconds: false, step: 60 };
const withSeconds: TimeConfig = { twelve: false, seconds: true, step: 1 };
const now = { hour: 14, minute: 37, second: 12 };
const parts = (p: Partial<Parts>): Parts => ({ ...emptyParts(), ...p });

/** Types `keys` from the first cell, following the model's moves, as the components do. */
function typeAll(config: TimeConfig, keys: string, start: Parts = emptyParts()) {
  const order = partsOf(config);
  let index = 0;
  let state: TypingState = { parts: start, buffer: "" };
  for (const key of keys) {
    const result = typeChar(state, order[index], key, config);
    state = { parts: result.parts, buffer: result.buffer };
    index = Math.min(order.length - 1, Math.max(0, index + result.move));
  }
  return { ...state, part: order[index] };
}

describe("parse and format", () => {
  it.each([
    ["08:00", { hour: 8, minute: 0, second: 0 }],
    ["8:05", { hour: 8, minute: 5, second: 0 }],
    ["23:59:58", { hour: 23, minute: 59, second: 58 }],
    ["2:30 pm", { hour: 14, minute: 30, second: 0 }],
    ["12:00 AM", { hour: 0, minute: 0, second: 0 }],
    ["12:15pm", { hour: 12, minute: 15, second: 0 }],
    ["14.30.05", { hour: 14, minute: 30, second: 5 }],
  ])("parseTime(%s)", (input, expected) => expect(parseTime(input)).toEqual(expected));

  it.each(["", "24:00", "12:60", "13:00 pm", "0:00 am", "noon", "1230", null, undefined, 1230])("rejects %s", (input) => {
    expect(parseTime(input)).toBeNull();
  });

  it("reads a Date", () => expect(parseTime(new Date(2020, 0, 1, 9, 8, 7))).toEqual({ hour: 9, minute: 8, second: 7 }));

  it("formats HH:mm and HH:mm:ss", () => {
    expect(formatTime({ hour: 8, minute: 5, second: 9 }, false)).toBe("08:05");
    expect(formatTime({ hour: 8, minute: 5, second: 9 }, true)).toBe("08:05:09");
  });

  it("splits and joins 12-hour cells", () => {
    expect(splitTime({ hour: 0, minute: 5, second: 0 }, h12)).toEqual(parts({ hour: 12, minute: 5, period: 0 }));
    expect(splitTime({ hour: 12, minute: 5, second: 0 }, h12)).toEqual(parts({ hour: 12, minute: 5, period: 1 }));
    expect(splitTime({ hour: 21, minute: 5, second: 0 }, h12)).toEqual(parts({ hour: 9, minute: 5, period: 1 }));
    expect(joinParts(parts({ hour: 12, minute: 0, period: 0 }), h12)).toEqual({ hour: 0, minute: 0, second: 0 });
    expect(joinParts(parts({ hour: 9, minute: 30, period: 1 }), h12)).toEqual({ hour: 21, minute: 30, second: 0 });
    expect(joinParts(parts({ hour: 9, minute: 30 }), h12)).toBeNull();
  });

  it("orders cells: hour, minute, second, period", () => {
    expect(partsOf({ twelve: true, seconds: true, step: 1 })).toEqual(["hour", "minute", "second", "period"]);
    expect(partsOf(h24)).toEqual(["hour", "minute"]);
  });

  it("pasted text", () => {
    expect(parsePasted(" at 2:30 pm ")).toEqual({ hour: 14, minute: 30, second: 0 });
    expect(parsePasted("14:30")).toEqual({ hour: 14, minute: 30, second: 0 });
    expect(parsePasted("soon")).toBeNull();
  });

  it("partial times", () => {
    expect(isPartial(parts({ hour: 8 }), h24)).toBe(true);
    expect(isPartial(parts({}), h24)).toBe(false);
    expect(isPartial(parts({ hour: 8, minute: 0 }), h24)).toBe(false);
    expect(isPartial(parts({ hour: 8, minute: 0 }), h12)).toBe(true);
  });
});

describe("Up / Down", () => {
  const step = (p: Partial<Parts>, part: TimePart, dir: 1 | -1, config = h24) => stepPart(parts(p), part, dir, config, now)[part];

  it("wraps", () => {
    expect(step({ hour: 23 }, "hour", 1)).toBe(0);
    expect(step({ hour: 0 }, "hour", -1)).toBe(23);
    expect(step({ minute: 59 }, "minute", 1)).toBe(0);
    expect(step({ minute: 0 }, "minute", -1)).toBe(59);
    expect(step({ hour: 12 }, "hour", 1, h12)).toBe(1);
    expect(step({ hour: 1 }, "hour", -1, h12)).toBe(12);
    expect(step({ period: 0 }, "period", 1, h12)).toBe(1);
    expect(step({ period: 1 }, "period", 1, h12)).toBe(0);
  });

  it("minutes carry nothing into the hour", () => {
    expect(stepPart(parts({ hour: 8, minute: 59 }), "minute", 1, h24, now)).toEqual(parts({ hour: 8, minute: 0 }));
  });

  it("starts an empty cell from now, rounded down to the step", () => {
    expect(step({}, "hour", 1)).toBe(14);
    expect(step({}, "hour", 1, h12)).toBe(2);
    expect(step({}, "period", 1, h12)).toBe(1);
    expect(step({}, "minute", 1)).toBe(37);
    expect(step({}, "minute", 1, { ...h24, step: 900 })).toBe(30);
    expect(step({}, "second", 1, withSeconds)).toBe(12);
  });

  it("steps by step and snaps off-step values in the direction pressed", () => {
    const quarter = { ...h24, step: 900 };
    expect(step({ minute: 30 }, "minute", 1, quarter)).toBe(45);
    expect(step({ minute: 45 }, "minute", 1, quarter)).toBe(0);
    expect(step({ minute: 7 }, "minute", 1, quarter)).toBe(15);
    expect(step({ minute: 7 }, "minute", -1, quarter)).toBe(0);
    expect(step({ second: 30 }, "second", 1, { ...withSeconds, step: 15 })).toBe(45);
    expect(step({ hour: 4 }, "hour", 1, { ...h24, step: 7200 })).toBe(6);
  });

  it("skips disallowed values", () => {
    const allowed = { hours: [9, 10, 11, 17], minutes: (m: number) => m % 10 === 0 };
    expect(stepPart(parts({ hour: 11 }), "hour", 1, h24, now, allowed).hour).toBe(17);
    expect(stepPart(parts({ hour: 17 }), "hour", 1, h24, now, allowed).hour).toBe(9);
    expect(stepPart(parts({ minute: 50 }), "minute", 1, h24, now, allowed).minute).toBe(0);
    expect(stepPart(parts({}), "hour", 1, h24, now, allowed).hour).toBe(17);
    // A 12-hour hour is checked against the period chosen.
    expect(stepPart(parts({ hour: 11, period: 0 }), "hour", 1, h12, now, allowed).hour).toBe(9);
    expect(stepPart(parts({ hour: 9, period: 1 }), "hour", 1, h12, now, allowed).hour).toBe(5);
  });

  it("PageUp / PageDown take a larger step", () => {
    expect(largeStepSize("hour", h24)).toBe(6);
    expect(largeStepSize("minute", h24)).toBe(10);
    expect(largeStepSize("minute", { ...h24, step: 900 })).toBe(1);
    expect(largeStepSize("minute", { ...h24, step: 300 })).toBe(2);
    expect(stepPart(parts({ hour: 20 }), "hour", 1, h24, now, {}, 6).hour).toBe(2);
    expect(stepPart(parts({ minute: 55 }), "minute", 1, h24, now, {}, 10).minute).toBe(5);
    expect(stepPart(parts({ minute: 0 }), "minute", -1, h24, now, {}, 10).minute).toBe(50);
  });

  it("Home / End jump to the first and last allowed value on the step", () => {
    expect(jumpPart(parts({ hour: 9 }), "hour", "start", h24).hour).toBe(0);
    expect(jumpPart(parts({ hour: 9 }), "hour", "end", h24).hour).toBe(23);
    expect(jumpPart(parts({ hour: 9 }), "hour", "end", h12).hour).toBe(12);
    expect(jumpPart(parts({}), "minute", "end", { ...h24, step: 900 }).minute).toBe(45);
    expect(jumpPart(parts({}), "hour", "start", h24, { hours: [8, 9, 17] }).hour).toBe(8);
    expect(jumpPart(parts({}), "period", "end", h12).period).toBe(1);
  });
});

describe("typing", () => {
  it("two digits fill a cell and move on", () => {
    expect(typeAll(h24, "0830")).toMatchObject({ parts: parts({ hour: 8, minute: 30 }), part: "minute", buffer: "" });
  });

  it("a first digit that can't take a second is the whole value", () => {
    expect(typeAll(h24, "3")).toMatchObject({ parts: parts({ hour: 3 }), part: "minute" });
    expect(typeAll(h24, "2")).toMatchObject({ parts: parts({ hour: 2 }), part: "hour", buffer: "2" });
    expect(typeAll(h24, "23")).toMatchObject({ parts: parts({ hour: 23 }), part: "minute" });
    expect(typeAll(h12, "2")).toMatchObject({ parts: parts({ hour: 2 }), part: "minute" });
    expect(typeAll(h12, "1")).toMatchObject({ parts: parts({ hour: 1 }), part: "hour", buffer: "1" });
    expect(typeAll(h24, "07")).toMatchObject({ parts: parts({ hour: 7 }), part: "minute" });
  });

  it("a digit that would overflow starts over", () => {
    // 1 then 5 in 12-hour: 15 > 12, so 5.
    expect(typeAll(h12, "15")).toMatchObject({ parts: parts({ hour: 5 }), part: "minute" });
    expect(typeAll(h24, "1")).toMatchObject({ buffer: "1" });
    expect(typeAll(h24, "4").parts.hour).toBe(4);
  });

  it("12-hour 0 waits for a second digit; A and P choose the period", () => {
    expect(typeAll(h12, "0")).toMatchObject({ parts: parts({}), buffer: "0", part: "hour" });
    expect(typeAll(h12, "0930p")).toMatchObject({ parts: parts({ hour: 9, minute: 30, period: 1 }), part: "period" });
    expect(typeAll(h12, "0930A").parts.period).toBe(0);
  });

  it("separators move on from a filled cell only", () => {
    expect(typeAll(h24, "8:")).toMatchObject({ parts: parts({ hour: 8 }), part: "minute" });
    expect(typeAll(h24, ":")).toMatchObject({ part: "hour" });
    expect(typeAll(h24, "8 4")).toMatchObject({ parts: parts({ hour: 8, minute: 4 }) });
  });

  it("letters other than A / P are ignored", () => {
    expect(typeAll(h24, "x")).toMatchObject({ parts: parts({}), part: "hour" });
    expect(typeAll(h12, "0930z").parts.period).toBeNull();
  });

  it("seconds", () => {
    expect(typeAll(withSeconds, "000437")).toMatchObject({ parts: parts({ hour: 0, minute: 4, second: 37 }) });
  });

  it("Backspace drops a typed digit, then clears, then goes back; Delete never goes back", () => {
    const typing = { parts: parts({ hour: 1 }), buffer: "1" };
    expect(erase(typing, "hour", true, h24)).toEqual({ parts: parts({}), buffer: "", move: 0 });
    const filled = { parts: parts({ hour: 8, minute: 30 }), buffer: "" };
    expect(erase(filled, "minute", true, h24)).toEqual({ parts: parts({ hour: 8 }), buffer: "", move: 0 });
    const empty = { parts: parts({ hour: 8 }), buffer: "" };
    expect(erase(empty, "minute", true, h24)).toMatchObject({ move: -1 });
    expect(erase(empty, "minute", false, h24)).toMatchObject({ move: 0 });
  });
});

describe("validity", () => {
  const t = (s: string) => parseTime(s)!;

  it("min and max, in the browser's words", () => {
    expect(timeError(t("04:59"), { min: "05:00" })).toBe("Value must be 05:00 or later.");
    expect(timeError(t("17:01"), { max: "17:00" })).toBe("Value must be 17:00 or earlier.");
    expect(timeError(t("05:00"), { min: "05:00", max: "17:00" })).toBeNull();
  });

  it("step, counted from min", () => {
    expect(timeError(t("08:07"), { step: 900 })).toBe("Enter a time in steps of 15 minutes.");
    expect(timeError(t("08:15"), { step: 900 })).toBeNull();
    expect(timeError(t("08:05"), { step: 900, min: "07:50" })).toBeNull();
    expect(timeError(t("08:00:30"), {})).toBe("Enter a time in steps of 1 minute.");
    expect(timeError(t("08:00:30"), { step: 1 })).toBeNull();
  });

  it("allowed hours, minutes and seconds", () => {
    expect(timeError(t("08:00"), { hours: [9, 10] })).toBe("Choose an allowed time.");
    expect(timeError(t("09:00"), { hours: [9, 10] })).toBeNull();
  });

  it("a range's end before its start, unless overnight", () => {
    expect(isRangeReversed(t("22:00"), t("06:00"), false)).toBe(true);
    expect(isRangeReversed(t("22:00"), t("06:00"), true)).toBe(false);
    expect(isRangeReversed(t("08:00"), t("16:30"), false)).toBe(false);
    expect(isRangeReversed(null, t("06:00"), false)).toBe(false);
  });
});

describe("clockOf", () => {
  it("12 hours in en-US, 24 in en-GB and de", () => {
    expect(clockOf("en-US")).toEqual({ twelve: true, periods: ["AM", "PM"] });
    expect(clockOf("en-GB").twelve).toBe(false);
    expect(clockOf("de").twelve).toBe(false);
  });

  it("an unknown tag falls back without throwing", () => expect(() => clockOf("not a locale!")).not.toThrow());
});
