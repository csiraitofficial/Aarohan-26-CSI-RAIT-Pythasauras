import type { CinematicTheme, TimeOfDay } from "../CinematicBackground";

export type VideoQualityTier = "4K" | "1080p" | "720p";
export type VideoFormat = "MP4" | "WebM";

export type ProfessionalVideoAsset = {
  id: string;
  theme: CinematicTheme;
  timeOfDay: TimeOfDay;
  quality: VideoQualityTier;
  format: VideoFormat;
  source: string;
  metadata: {
    duration: number;
    loopPoints: [number, number];
    dominantColors: string[];
    motionIntensity: number;
  };
};

export type ProfessionalVideoAssets = Record<CinematicTheme, Record<TimeOfDay, Partial<Record<VideoQualityTier, { mp4?: string; webm?: string }>>>>;

export const professionalVideoAssets: ProfessionalVideoAssets = {
  study: {
    day: {
      "4K": { mp4: "/videos/study/study-day-4k.mp4" },
      "1080p": { mp4: "/videos/study/study-day-1080p.mp4" },
      "720p": { webm: "/videos/study/study-day-720p.webm" },
    },
    dawn: {
      "4K": { mp4: "/videos/study/study-dawn-4k.mp4" },
      "1080p": { mp4: "/videos/study/study-dawn-1080p.mp4" },
      "720p": { webm: "/videos/study/study-dawn-720p.webm" },
    },
    dusk: {
      "4K": { mp4: "/videos/study/study-dusk-4k.mp4" },
      "1080p": { mp4: "/videos/study/study-dusk-1080p.mp4" },
      "720p": { webm: "/videos/study/study-dusk-720p.webm" },
    },
    night: {
      "4K": { mp4: "/videos/study/study-night-4k.mp4" },
      "1080p": { mp4: "/videos/study/study-night-1080p.mp4" },
      "720p": { webm: "/videos/study/study-night-720p.webm" },
    },
  },
  practice: {
    day: {
      "4K": { mp4: "/videos/practice/practice-day-4k.mp4" },
      "1080p": { mp4: "/videos/practice/practice-day-1080p.mp4" },
      "720p": { webm: "/videos/practice/practice-day-720p.webm" },
    },
    dawn: {
      "4K": { mp4: "/videos/practice/practice-dawn-4k.mp4" },
      "1080p": { mp4: "/videos/practice/practice-dawn-1080p.mp4" },
      "720p": { webm: "/videos/practice/practice-dawn-720p.webm" },
    },
    dusk: {
      "4K": { mp4: "/videos/practice/practice-dusk-4k.mp4" },
      "1080p": { mp4: "/videos/practice/practice-dusk-1080p.mp4" },
      "720p": { webm: "/videos/practice/practice-dusk-720p.webm" },
    },
    night: {
      "4K": { mp4: "/videos/practice/practice-night-4k.mp4" },
      "1080p": { mp4: "/videos/practice/practice-night-1080p.mp4" },
      "720p": { webm: "/videos/practice/practice-night-720p.webm" },
    },
  },
  analytics: {
    day: {
      "4K": { mp4: "/videos/analytics/analytics-day-4k.mp4" },
      "1080p": { mp4: "/videos/analytics/analytics-day-1080p.mp4" },
      "720p": { webm: "/videos/analytics/analytics-day-720p.webm" },
    },
    dawn: {
      "4K": { mp4: "/videos/analytics/analytics-dawn-4k.mp4" },
      "1080p": { mp4: "/videos/analytics/analytics-dawn-1080p.mp4" },
      "720p": { webm: "/videos/analytics/analytics-dawn-720p.webm" },
    },
    dusk: {
      "4K": { mp4: "/videos/analytics/analytics-dusk-4k.mp4" },
      "1080p": { mp4: "/videos/analytics/analytics-dusk-1080p.mp4" },
      "720p": { webm: "/videos/analytics/analytics-dusk-720p.webm" },
    },
    night: {
      "4K": { mp4: "/videos/analytics/analytics-night-4k.mp4" },
      "1080p": { mp4: "/videos/analytics/analytics-night-1080p.mp4" },
      "720p": { webm: "/videos/analytics/analytics-night-720p.webm" },
    },
  },
  community: {
    day: {
      "4K": { mp4: "/videos/community/community-day-4k.mp4" },
      "1080p": { mp4: "/videos/community/community-day-1080p.mp4" },
      "720p": { webm: "/videos/community/community-day-720p.webm" },
    },
    dawn: {
      "4K": { mp4: "/videos/community/community-dawn-4k.mp4" },
      "1080p": { mp4: "/videos/community/community-dawn-1080p.mp4" },
      "720p": { webm: "/videos/community/community-dawn-720p.webm" },
    },
    dusk: {
      "4K": { mp4: "/videos/community/community-dusk-4k.mp4" },
      "1080p": { mp4: "/videos/community/community-dusk-1080p.mp4" },
      "720p": { webm: "/videos/community/community-dusk-720p.webm" },
    },
    night: {
      "4K": { mp4: "/videos/community/community-night-4k.mp4" },
      "1080p": { mp4: "/videos/community/community-night-1080p.mp4" },
      "720p": { webm: "/videos/community/community-night-720p.webm" },
    },
  },
};

export function getPreferredQuality(deviceTier: "low" | "mid" | "high"): VideoQualityTier {
  if (deviceTier === "high") return "4K";
  if (deviceTier === "mid") return "1080p";
  return "720p";
}

export function pickVideoSources(params: {
  theme: CinematicTheme;
  timeOfDay: TimeOfDay;
  quality: VideoQualityTier;
}): { mp4?: string; webm?: string } {
  const { theme, timeOfDay, quality } = params;
  const themeAssets = professionalVideoAssets[theme]?.[timeOfDay];
  if (!themeAssets) return {};

  return (
    themeAssets[quality] ??
    themeAssets["1080p"] ??
    themeAssets["720p"] ??
    themeAssets["4K"] ??
    {}
  );
}
