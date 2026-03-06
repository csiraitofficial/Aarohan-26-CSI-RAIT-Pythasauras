import { useEffect, useRef, useState } from "react";

type Props = {
  onFocus: (percent: number) => void;
};

export function CameraFeed({ onFocus }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cleanup: (() => void) | undefined;

    async function run() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!videoRef.current) return;
        
        // Set the stream first
        videoRef.current.srcObject = stream;
        
        // Wait for metadata to load before playing
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setReady(true);
          } catch (error) {
            console.warn('Video play failed:', error);
            setReady(false);
          }
        };

        // Placeholder for MediaPipe Face Landmarker.
        // This starter emits a synthetic focus % (replace with gaze/eye-contact calc).

        const id = window.setInterval(() => {
          onFocus(Math.round(60 + Math.random() * 40));
        }, 800);

        cleanup = () => {
          window.clearInterval(id);
        };

        return cleanup;
      } catch (error) {
        console.error('Camera access failed:', error);
        setReady(false);
      }
    }

    run();

    return () => {
      cleanup?.();
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
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
