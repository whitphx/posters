export const paperSizes = {
  A1: { widthMm: 594, heightMm: 841 },
  A2: { widthMm: 420, heightMm: 594 },
  A3: { widthMm: 297, heightMm: 420 },
} as const;

export type PaperSize = keyof typeof paperSizes;
export type Orientation = "portrait" | "landscape";

export type Paper =
  | { size: PaperSize; orientation: Orientation }
  | { widthMm: number; heightMm: number };

export function getPaperDimensions(paper: Paper) {
  if ("widthMm" in paper) {
    return { widthMm: paper.widthMm, heightMm: paper.heightMm };
  }

  const dimensions = paperSizes[paper.size];

  return paper.orientation === "portrait"
    ? dimensions
    : { widthMm: dimensions.heightMm, heightMm: dimensions.widthMm };
}
