import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Props = {
  title?: string;
  questions: string[];
};

export function SectionTranscript({ title = "Section transcript", questions }: Props) {
  const [index, setIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioUrlRef = useRef<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [questions]);

  const total = questions.length;
  const current = useMemo(() => {
    if (total === 0) return null;
    return questions[Math.max(0, Math.min(total - 1, index))] ?? null;
  }, [questions, index, total]);

  const canNext = total > 0 && index < total - 1;
  const canRestart = total > 0 && index !== 0;

  const playTts = useCallback(async () => {
    if (!current) return;
    setTtsLoading(true);
    setTtsError(null);

    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/tts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: current }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `TTS request failed (${res.status})`);
      }

      const blob = await res.blob();
      const nextUrl = URL.createObjectURL(blob);

      if (lastAudioUrlRef.current) {
        URL.revokeObjectURL(lastAudioUrlRef.current);
      }
      lastAudioUrlRef.current = nextUrl;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = nextUrl;

      try {
        await audioRef.current.play();
      } catch {
        setTtsError("Click Replay to hear the question.");
      }
    } catch (e) {
      setTtsError(e instanceof Error ? e.message : "Failed to generate audio");
    } finally {
      setTtsLoading(false);
    }
  }, [current]);

  useEffect(() => {
    void playTts();
  }, [playTts]);

  useEffect(() => {
    return () => {
      if (lastAudioUrlRef.current) {
        URL.revokeObjectURL(lastAudioUrlRef.current);
        lastAudioUrlRef.current = null;
      }
    };
  }, []);

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-700">{title}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-violet-700">Question</div>
              <div className="mt-2 text-sm text-violet-900">{current ?? "No questions available for this section."}</div>
            </div>
            {total > 0 ? (
              <div className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                {Math.min(total, index + 1)} / {total}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={!current || ttsLoading} onClick={playTts}>
              {ttsLoading ? "Speaking..." : "Replay"}
            </Button>
            <Button variant="secondary" size="sm" disabled={!canRestart} onClick={() => setIndex(0)}>
              Restart
            </Button>
            <Button variant="primary" size="sm" disabled={!canNext} onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
              Next
            </Button>
          </div>

          {ttsError ? (
            <div className="mt-3 text-xs font-semibold text-zinc-600">{ttsError}</div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
