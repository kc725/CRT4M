import { useState } from 'react';
import { TranslationResult, SummaryResult, VocabResult } from '../types/document';
import { API_BASE } from '../constants/api';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface AnalysisState<T> {
  data: T | null;
  status: Status;
  error: string | null;
}

function initial<T>(): AnalysisState<T> {
  return { data: null, status: 'idle', error: null };
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export function useAnalysis() {
  const [translation, setTranslation] = useState<AnalysisState<TranslationResult>>(initial());
  const [summary, setSummary] = useState<AnalysisState<SummaryResult>>(initial());
  const [vocab, setVocab] = useState<AnalysisState<VocabResult>>(initial());

  const analyze = async (
    tab: 'translation' | 'notes' | 'vocab',
    text: string
  ) => {
    if (!text.trim()) return;

    if (tab === 'translation') {
      setTranslation({ data: null, status: 'loading', error: null });
      try {
        const data = await post<TranslationResult>('/api/analyze/translate', {
          text,
          target_language: 'English',
        });
        setTranslation({ data, status: 'success', error: null });
      } catch (e) {
        setTranslation({ data: null, status: 'error', error: e instanceof Error ? e.message : String(e) });
      }
    } else if (tab === 'notes') {
      setSummary({ data: null, status: 'loading', error: null });
      try {
        const data = await post<SummaryResult>('/api/analyze/summarize', { text });
        setSummary({ data, status: 'success', error: null });
      } catch (e) {
        setSummary({ data: null, status: 'error', error: e instanceof Error ? e.message : String(e) });
      }
    } else if (tab === 'vocab') {
      setVocab({ data: null, status: 'loading', error: null });
      try {
        const data = await post<VocabResult>('/api/analyze/vocabulary', { text });
        setVocab({ data, status: 'success', error: null });
      } catch (e) {
        setVocab({ data: null, status: 'error', error: e instanceof Error ? e.message : String(e) });
      }
    }
  };

  const reset = () => {
    setTranslation(initial());
    setSummary(initial());
    setVocab(initial());
  };

  return { translation, summary, vocab, analyze, reset };
}