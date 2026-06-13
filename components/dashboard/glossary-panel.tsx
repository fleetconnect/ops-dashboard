"use client";

import { GLOSSARY_OVERVIEW, GLOSSARY_TERMS, GLOSSARY_TITLE } from "@/lib/copy";
import { X } from "lucide-react";

// Side panel opened from the header "?" icon (Addendum 13 §5). Explains the brand vocabulary in
// plain English plus a three-sentence overview of how the whole system works.
export function GlossaryPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground leading-snug">{GLOSSARY_TITLE}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <p className="text-sm leading-relaxed text-foreground/90">{GLOSSARY_OVERVIEW}</p>

          <div className="space-y-3">
            {GLOSSARY_TERMS.map((t) => (
              <div key={t.term} className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="text-sm font-semibold text-foreground">{t.term}</div>
                <div className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{t.plain}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
