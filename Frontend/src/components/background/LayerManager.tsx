import React, { useMemo, useState, useEffect } from 'react';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type LayerType = 
  | 'video'
  | '3d-scene'
  | 'neural-network'
  | 'particle-systems'
  | 'volumetric-lighting'
  | 'atmospheric-fog'
  | 'mouse-tracking'
  | 'scroll-parallax'
  | 'geometric-shapes'
  | 'holographic-overlays'
  | 'static-background'
  | 'basic-3d'
  | 'simplified-particles'
  | 'basic-lighting'
  | 'minimal-fog';

export interface LayerConfig {
  type: LayerType;
  priority: number;
  cost: 'low' | 'medium' | 'high';
  requiresMotion: boolean;
  requiresHighEnd: boolean;
  component: React.ComponentType<any>;
}

export const LayerManager: React.FC = () => {
  const deviceTier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const [isInBackground, setIsInBackground] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'battery' | 'low-power'>('normal');

  // Background tab detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsInBackground(document.hidden);
      // Auto-adjust performance based on battery API if available
      if ('getBattery' in navigator && (navigator as any).getBattery) {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level < 0.2) {
            setPerformanceMode('low-power');
          } else if (battery.level < 0.5) {
            setPerformanceMode('battery');
          } else {
            setPerformanceMode('normal');
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const activeLayers = useMemo(() => {
    const baseLayers: LayerType[] = [];
    
    // Always include basic background
    baseLayers.push('static-background');

    // Determine available layers based on device capabilities
    if (reducedMotion) {
      // Minimal motion for users who prefer it
      return ['static-background', 'basic-3d'] as LayerType[];
    }

    if (deviceTier === 'low' || performanceMode === 'low-power') {
      // Low-end device or battery saver
      return [
        'static-background',
        'basic-3d',
        'minimal-fog'
      ] as LayerType[];
    }

    if (deviceTier === 'mid' || performanceMode === 'battery') {
      // Mid-range device or battery saving
      return [
        'static-background',
        'basic-3d',
        'simplified-particles',
        'basic-lighting',
        'minimal-fog'
      ] as LayerType[];
    }

    // High-end device with full features
    if (isInBackground) {
      // Reduce effects when tab is in background
      return [
        'static-background',
        'basic-3d',
        'minimal-fog'
      ] as LayerType[];
    }

    return [
      'video',
      '3d-scene',
      'neural-network',
      'particle-systems',
      'volumetric-lighting',
      'atmospheric-fog',
      'mouse-tracking',
      'scroll-parallax',
      'geometric-shapes',
      'holographic-overlays'
    ] as LayerType[];
  }, [deviceTier, reducedMotion, isInBackground, performanceMode]);

  const layerConfigs: Record<LayerType, LayerConfig> = {
    'video': {
      type: 'video',
      priority: 1,
      cost: 'high',
      requiresMotion: true,
      requiresHighEnd: true,
      component: () => null // Will be replaced with actual component
    },
    '3d-scene': {
      type: '3d-scene',
      priority: 2,
      cost: 'high',
      requiresMotion: true,
      requiresHighEnd: true,
      component: () => null
    },
    'neural-network': {
      type: 'neural-network',
      priority: 3,
      cost: 'high',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'particle-systems': {
      type: 'particle-systems',
      priority: 4,
      cost: 'medium',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'volumetric-lighting': {
      type: 'volumetric-lighting',
      priority: 5,
      cost: 'medium',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'atmospheric-fog': {
      type: 'atmospheric-fog',
      priority: 6,
      cost: 'low',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'mouse-tracking': {
      type: 'mouse-tracking',
      priority: 7,
      cost: 'medium',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'scroll-parallax': {
      type: 'scroll-parallax',
      priority: 8,
      cost: 'medium',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'geometric-shapes': {
      type: 'geometric-shapes',
      priority: 9,
      cost: 'low',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'holographic-overlays': {
      type: 'holographic-overlays',
      priority: 10,
      cost: 'medium',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'static-background': {
      type: 'static-background',
      priority: 11,
      cost: 'low',
      requiresMotion: false,
      requiresHighEnd: false,
      component: () => null
    },
    'basic-3d': {
      type: 'basic-3d',
      priority: 12,
      cost: 'medium',
      requiresMotion: false,
      requiresHighEnd: false,
      component: () => null
    },
    'simplified-particles': {
      type: 'simplified-particles',
      priority: 13,
      cost: 'low',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'basic-lighting': {
      type: 'basic-lighting',
      priority: 14,
      cost: 'low',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    },
    'minimal-fog': {
      type: 'minimal-fog',
      priority: 15,
      cost: 'low',
      requiresMotion: true,
      requiresHighEnd: false,
      component: () => null
    }
  };

  const sortedLayers = useMemo(() => {
    return activeLayers
      .map((layerType: LayerType) => layerConfigs[layerType])
      .filter(Boolean)
      .sort((a, b) => a.priority - b.priority);
  }, [activeLayers]);

  return (
    <div className="absolute inset-0">
      {sortedLayers.map((config) => {
        const Component = config.component;
        return (
          <div
            key={config.type}
            className="absolute inset-0"
            data-layer={config.type}
            data-cost={config.cost}
            data-priority={config.priority}
          >
            <Component />
          </div>
        );
      })}
      
      {/* Performance indicator for debugging */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 left-4 text-xs text-white bg-black/50 p-2 rounded z-50">
          <div>Device: {deviceTier}</div>
          <div>Motion: {reducedMotion ? 'reduced' : 'normal'}</div>
          <div>Background: {isInBackground ? 'yes' : 'no'}</div>
          <div>Performance: {performanceMode}</div>
          <div>Active Layers: {activeLayers.length}</div>
        </div>
      )}
    </div>
  );
};

// Hook for background optimization
export const useBackgroundOptimization = () => {
  const [isInBackground, setIsInBackground] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'battery' | 'low-power'>('normal');

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsInBackground(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Check battery level if available
    if ('getBattery' in navigator && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        const updatePerformanceMode = () => {
          if (battery.level < 0.2) {
            setPerformanceMode('low-power');
          } else if (battery.level < 0.5) {
            setPerformanceMode('battery');
          } else {
            setPerformanceMode('normal');
          }
        };

        updatePerformanceMode();
        battery.addEventListener('levelchange', updatePerformanceMode);
        battery.addEventListener('chargingchange', updatePerformanceMode);

        return () => {
          battery.removeEventListener('levelchange', updatePerformanceMode);
          battery.removeEventListener('chargingchange', updatePerformanceMode);
        };
      });
    }
  }, []);

  return {
    shouldReduceEffects: isInBackground || performanceMode !== 'normal',
    shouldPauseAnimations: isInBackground,
    shouldLowerQuality: performanceMode === 'low-power',
    performanceMode
  };
};
