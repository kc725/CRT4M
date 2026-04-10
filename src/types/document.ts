export interface DocumentData {
  title: string;
  content: string[];
  totalPages: number;
  isPDF?: boolean; // Optional flag to indicate if the document is a PDF
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