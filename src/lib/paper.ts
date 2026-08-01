export const paperSizes = {
  A1: { widthMm: 594, heightMm: 841 },
  A2: { widthMm: 420, heightMm: 594 },
  A3: { widthMm: 297, heightMm: 420 },
} as const;

export type PaperSize = keyof typeof paperSizes;
export type Orientation = "portrait" | "landscape";

export function getPaperDimensions(size: PaperSize, orientation: Orientation) {
  const dimensions = paperSizes[size];

  return orientation === "portrait"
    ? dimensions
    : { widthMm: dimensions.heightMm, heightMm: dimensions.widthMm };
}
