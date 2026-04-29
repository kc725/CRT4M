import { useCallback, useEffect, useState } from 'react';
import { X, Check, AlertTriangle, Monitor, Loader2 } from 'lucide-react';
import { API_BASE } from '../constants/api';

interface AppConfig {
  provider: string;
  active_model: string;
  available_providers: string[];
  available_models: Record<string, string>;
  api_key_status: Record<string, boolean>;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/config`);
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      setConfig(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchConfig();
  }, [isOpen, fetchConfig]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleProviderChange = async (provider: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/config/provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      await fetchConfig();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="frosted-vellum rounded-xl shadow-2xl w-full max-w-md mx-4 border border-outline-variant/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/10">
          <div>
            <h2 className="text-lg font-bold font-headline text-on-surface">Settings</h2>
            <p className="text-[10px] uppercase tracking-widest font-headline text-primary/60">
              AI Provider Configuration
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 text-outline/50 hover:text-on-surface transition-colors cursor-pointer rounded-lg hover:bg-surface-variant/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-primary/50">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm font-body p-3 bg-red-50 rounded-lg">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {config && !isLoading && (
            <>
              {/* Provider selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-headline text-outline block">
                  AI Provider
                </label>
                <select
                  value={config.provider}
                  onChange={e => handleProviderChange(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  {config.available_providers.map(p => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active model */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-headline text-outline block">
                  Active Model
                </label>
                <div className="bg-surface-variant/50 border border-outline-variant/20 rounded-md px-3 py-2.5 text-sm font-body text-on-surface/80">
                  {config.active_model}
                </div>
              </div>

              {/* API Key Status */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-headline text-outline block">
                  API Key Status
                </label>
                <div className="space-y-1.5">
                  {config.available_providers.map(p => (
                    <div
                      key={p}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-variant/30 border border-outline-variant/10"
                    >
                      <span className="text-sm font-body text-on-surface">
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </span>
                      {p === 'ollama' ? (
                        <span className="flex items-center gap-1.5 text-xs font-headline text-primary/70">
                          <Monitor size={12} />
                          Local
                        </span>
                      ) : config.api_key_status[p] ? (
                        <span className="flex items-center gap-1.5 text-xs font-headline text-green-600">
                          <Check size={12} />
                          Configured
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-headline text-amber-500">
                          <AlertTriangle size={12} />
                          Missing
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available models reference */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-headline text-outline block">
                  Default Models
                </label>
                <div className="space-y-1">
                  {Object.entries(config.available_models).map(([provider, model]) => (
                    <div key={provider} className="flex items-center justify-between text-xs font-body text-on-surface/60 px-1">
                      <span>{provider}</span>
                      <code className="font-mono text-[11px] text-primary/60">{model}</code>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/10">
          <button
            onClick={onClose}
            className="w-full bg-primary-container text-on-primary-container py-2.5 rounded-md font-headline text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-surface transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
