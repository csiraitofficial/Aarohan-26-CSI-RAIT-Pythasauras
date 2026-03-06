import { useCallback, useState } from "react";
import { CameraFeed } from "@/components/CameraFeed";
import { FocusMeter } from "@/components/FocusMeter";
import { SpeechStats } from "@/components/SpeechStats";
import { useSpeechWebSocket } from "@/lib/useSpeechWebSocket";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";

export function PracticePage() {
  const [focusPercent, setFocusPercent] = useState(0);

  const { status, transcript, metrics, start, stop } = useSpeechWebSocket();

  const running = status === "running";

  const onFocus = useCallback((p: number) => {
    setFocusPercent(p);
  }, []);

  return (
    <AppShell title="Practice">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="primary" size="md" onClick={start} disabled={running}>
            Start
          </Button>
          <Button variant="secondary" size="md" onClick={stop} disabled={!running}>
            Stop
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CameraFeed onFocus={onFocus} />
        </div>
        <div className="space-y-5 lg:col-span-5">
          <FocusMeter value={focusPercent} />
          <SpeechStats status={status} transcript={transcript} metrics={metrics} />
        </div>
      </div>
    </AppShell>
  );
}
