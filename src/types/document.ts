export interface PageTextSpan {
  text: string;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  fontSizePct: number;
}

export interface PdfPageOverlay {
  width: number;
  height: number;
  spans: PageTextSpan[];
}

export interface DocumentData {
  title: string;
  content: string[];
  totalPages: number;
  isPdf?: boolean;
  pageOverlays?: PdfPageOverlay[];
}

export interface TranslationResult {
  literal: string;
  idiomatic: string;
  notes: string[];
}
 
export interface SummaryResult {
  summary: string;
  key_points: string[];
  themes: string[];
}
 
export interface VocabWord {
  word: string;
  definition: string;
  part_of_speech: string;
  example: string;
}
 
export interface VocabResult {
  words: VocabWord[];
}
