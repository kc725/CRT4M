export interface DocumentData {
  title: string;
  content: string[];
  totalPages: number;
  isPDF?: boolean; // Optional flag to indicate if the document is a PDF
}
