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

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    battery: { level: 0, charging: false, supported: false },
    network: { type: 'unknown', downlink: 0, rtt: 0, supported: false },
    storage: { usage: 0, quota: 0, supported: false },
    memory: { usedJSHeapSize: 0, totalJSHeapSize: 0, supported: false },
  });

  useEffect(() => {
    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
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
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
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

    // Storage API - Improved handling
    const updateStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          // Browsers often report 0 for usage if it's very small. 
          // We'll show a minimum of 1KB if usage exists but is tiny to avoid "0 B" confusion.
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

    // Memory API
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setStats(prev => ({
        ...prev,
        memory: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          supported: true
        }
      }));
    }

    // Poll storage occasionally as it doesn't have a listener
    const storageInterval = setInterval(updateStorage, 10000);
    return () => clearInterval(storageInterval);
  }, []);

  return stats;
};
