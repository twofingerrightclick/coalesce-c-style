// Canon values the app specs assert, with their canon.md sections.

export const zinc = {
  50: "rgb(250, 250, 250)",
  900: "rgb(24, 24, 27)",
  950: "rgb(9, 9, 11)",
};

export const white = "rgb(255, 255, 255)";

/** canon §2.7, as Chrome serialises them (colour first). */
export const shadows = {
  light: {
    edge: "rgba(0, 0, 0, 0.12) 0px 0px 0px 1px",
    raised: ["rgba(0, 0, 0, 0.06) 0px 1px 2px 0px", "rgba(0, 0, 0, 0.04) 0px 1px 3px 0px"],
    overlay: ["rgba(0, 0, 0, 0.18) 0px 24px 48px -12px", "rgba(0, 0, 0, 0.06) 0px 4px 12px 0px"],
  },
  dark: {
    edge: "rgba(255, 255, 255, 0.12) 0px 0px 0px 1px",
    raised: ["rgba(0, 0, 0, 0.3) 0px 1px 2px 0px", "rgba(0, 0, 0, 0.2) 0px 1px 3px 0px"],
    overlay: ["rgba(0, 0, 0, 0.6) 0px 24px 48px -12px", "rgba(0, 0, 0, 0.3) 0px 4px 12px 0px"],
  },
};
