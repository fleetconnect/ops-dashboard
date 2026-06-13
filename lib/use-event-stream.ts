"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "./api";
import type { OpportunityEvent } from "./types";

export type StreamStatus = "connecting" | "live" | "reconnecting";

const CAP = 300;

// Subscribes to the backend SSE feed (GET /events/stream). The server first replays the most
// recent events (event: replay), signals end-of-backfill (event: ready), then pushes live
// frames (event: append). An idle backend yields an idle feed — no synthetic events are ever
// generated here. Newest-first, capped buffer.
export function useEventStream(backfill = 50) {
  const [events, setEvents] = useState<OpportunityEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const url = `${API_BASE}/events/stream?backfill=${backfill}`;
    const source = new EventSource(url);

    const push = (raw: string) => {
      try {
        const event = JSON.parse(raw) as OpportunityEvent;
        if (seen.current.has(event.id)) return;
        seen.current.add(event.id);
        setEvents((prev) => [event, ...prev].slice(0, CAP));
      } catch {
        // a malformed frame should not kill the stream
      }
    };

    source.addEventListener("replay", (e) => push((e as MessageEvent).data));
    source.addEventListener("append", (e) => push((e as MessageEvent).data));
    source.addEventListener("ready", () => setStatus("live"));
    source.onopen = () => setStatus("live");
    source.onerror = () => setStatus("reconnecting");

    return () => source.close();
  }, [backfill]);

  return { events, status };
}
