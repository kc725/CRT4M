// ── Overlay types (kept for potential future use / text-layer extensions) ────

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

// ── Core document model ───────────────────────────────────────────────────────

export interface DocumentData {
  title: string;
  /**
   * For plain-text documents: array of paragraph strings.
   * For PDFs: empty array — use `fileUrl` instead.
   */
  content: string[];
  totalPages: number;
  isPdf?: boolean;
  /**
   * Blob URL pointing to the original, unmodified PDF bytes.
   * Created by URL.createObjectURL() in useDocumentUpload.
   * Must be revoked when the document is replaced.
   */
  fileUrl?: string;
}

// ── AI analysis result types ──────────────────────────────────────────────────

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