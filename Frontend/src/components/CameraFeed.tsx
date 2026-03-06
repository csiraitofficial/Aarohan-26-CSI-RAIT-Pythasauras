import { useEffect, useRef, useState } from "react";

type Props = {
  onFocus: (percent: number) => void;
};

export function CameraFeed({ onFocus }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);


  useEffect(() => {
    let stream: MediaStream | null = null;

    async function run() {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setReady(true);

      // Placeholder for MediaPipe Face Landmarker.
      // This starter emits a synthetic focus % (replace with gaze/eye-contact calc).

      const id = window.setInterval(() => {
        onFocus(Math.round(60 + Math.random() * 40));
      }, 800);

      return () => window.clearInterval(id);
    }

    const cleanupPromise = run();

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onFocus]);

  return (
    <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur border border-white/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-700">Camera</div>
        <div className="text-xs text-zinc-500">{ready ? "Live" : "Initializing..."}</div>
      </div>
      <video ref={videoRef} className="aspect-video w-full rounded-xl bg-black ring-1 ring-zinc-200" playsInline muted />
    </div>
  );
}
