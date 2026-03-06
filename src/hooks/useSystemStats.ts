import { useState, useEffect } from 'react';

interface SystemStats {
  battery: {
    level: number;
    charging: boolean;
    supported: boolean;
  };
  network: {
    type: string;
    downlink: number;
    rtt: number;
    supported: boolean;
  };
  storage: {
    usage: number;
    quota: number;
    supported: boolean;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    supported: boolean;
  };
}

// Add interfaces for non-standard APIs
interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: EventListener | null;
  onlevelchange: EventListener | null;
}

interface NetworkInformation extends EventTarget {
  readonly type?: string;
  readonly effectiveType?: string;
  readonly downlink?: number;
  readonly rtt?: number;
  onchange: EventListener | null;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedNavigator extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    battery: { level: 0, charging: false, supported: false },
    network: { type: 'unknown', downlink: 0, rtt: 0, supported: false },
    storage: { usage: 0, quota: 0, supported: false },
    memory: { usedJSHeapSize: 0, totalJSHeapSize: 0, supported: false },
  });

  useEffect(() => {
    // Battery API
    const nav = navigator as ExtendedNavigator;
    
    if ('getBattery' in navigator && nav.getBattery) {
      nav.getBattery().then((battery: BatteryManager) => {
        const updateBattery = () => {
          setStats(prev => ({
            ...prev,
            battery: { 
              level: Math.round(battery.level * 100), 
              charging: battery.charging, 
              supported: true 
            }
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    // Network API
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      const updateNetwork = () => {
        setStats(prev => ({
          ...prev,
          network: {
            type: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            supported: true
          }
        }));
      };
      updateNetwork();
      connection.addEventListener('change', updateNetwork);
    }

    // Storage API
    const updateStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const realUsage = estimate.usage || 0;
          setStats(prev => ({
            ...prev,
            storage: {
              usage: realUsage,
              quota: estimate.quota || 0,
              supported: true
            }
          }));
        } catch (e) {
          console.warn("Storage estimate failed", e);
        }
      }
    };
    updateStorage();

    // Memory API (Chrome specific)
    const updateMemory = () => {
      if ('memory' in performance) {
        const perf = performance as ExtendedPerformance;
        if (perf.memory) {
          const memory = perf.memory;
          setStats(prev => ({
            ...prev,
            memory: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              supported: true
            }
          }));
        }
      }
    };
    updateMemory();

    // Polling for storage and memory
    const intervalId = setInterval(() => {
      updateStorage();
      updateMemory();
    }, 5000); // Poll every 5s

    return () => clearInterval(intervalId);
  }, []);

  return stats;
};
