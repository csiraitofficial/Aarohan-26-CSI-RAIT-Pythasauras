import Lenis from "lenis";

export type LenisInstance = Lenis;

export function createLenis(params: { reducedMotion: boolean }) {
  const { reducedMotion } = params;

  const lenis = new Lenis({
    smoothWheel: !reducedMotion,
    syncTouch: true,
    lerp: reducedMotion ? 1 : 0.09,
    wheelMultiplier: 1,
    touchMultiplier: 1,
  });

  return lenis;
}
