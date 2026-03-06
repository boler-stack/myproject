import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Battery, 
  BatteryCharging, 
  Wifi, 
  HardDrive, 
  Cpu, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSystemStats } from '../../hooks/useSystemStats';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  progress?: number;
  color: string;
  status?: 'good' | 'warning' | 'alert';
}> = ({ title, value, subValue, icon: Icon, progress, color, status = 'good' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-6 lg:mb-8">
      <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg", color)}>
        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
      </div>
      <div className={cn(
        "px-2.5 py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest",
        status === 'good' ? "bg-emerald-500/10 text-emerald-400" : status === 'warning' ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"
      )}>
        {status === 'good' ? 'Optimal' : status === 'warning' ? 'Warning' : 'Critical'}
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-xs lg:text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight break-all lg:break-normal">{value}</h3>
        {subValue && <p className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-widest">{subValue}</p>}
      </div>

      {progress !== undefined && (
        <div className="pt-2">
          <div className="h-1.5 lg:h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={cn("h-full rounded-full", color.replace('opacity-', ''))}
            />
          </div>
          <div className="flex justify-between mt-2 text-[9px] lg:text-[10px] font-bold text-gray-700 uppercase tracking-widest">
            <span>Utilization</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

const SystemInfo: React.FC = () => {
  const stats = useSystemStats();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return 'Minimal'; // Browser often reports 0 for very small usage
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storageProgress = useMemo(() => {
    if (!stats.storage.quota) return 0;
    return Math.round((stats.storage.usage / stats.storage.quota) * 100);
  }, [stats.storage]);

  const memoryProgress = useMemo(() => {
    if (!stats.memory.totalJSHeapSize) return 0;
    return Math.round((stats.memory.usedJSHeapSize / stats.memory.totalJSHeapSize) * 100);
  }, [stats.memory]);

  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">System Diagnostics</h2>
          <p className="text-gray-400 text-sm lg:text-base">Real-time health monitoring and resource telemetry.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 w-fit">
          <Activity className="w-4 h-4" />
          Live Monitoring Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {/* Battery */}
        <MetricCard 
          title="Battery Status"
          value={stats.battery.supported ? `${stats.battery.level}%` : 'N/A'}
          subValue={stats.battery.charging ? 'Charging now' : 'On battery power'}
          icon={stats.battery.charging ? BatteryCharging : Battery}
          progress={stats.battery.supported ? stats.battery.level : 0}
          color="bg-emerald-600"
          status={stats.battery.level < 20 ? 'warning' : 'good'}
        />

        {/* Network */}
        <MetricCard 
          title="Network Speed"
          value={stats.network.supported ? `${stats.network.downlink} Mbps` : 'Offline'}
          subValue={`Lat: ${stats.network.rtt}ms • ${stats.network.type}`}
          icon={Wifi}
          color="bg-blue-600"
        />

        {/* Storage */}
        <MetricCard 
          title="Storage Usage"
          value={formatBytes(stats.storage.usage)}
          subValue={`Total: ${formatBytes(stats.storage.quota)}`}
          icon={HardDrive}
          progress={storageProgress}
          color="bg-purple-600"
        />

        {/* Memory */}
        <MetricCard 
          title="Memory (JS Heap)"
          value={formatBytes(stats.memory.usedJSHeapSize)}
          subValue={`Total: ${formatBytes(stats.memory.totalJSHeapSize)}`}
          icon={Cpu}
          progress={memoryProgress}
          color="bg-orange-600"
          status={memoryProgress > 80 ? 'warning' : 'good'}
        />
      </div>

      <div className="p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden lg:block">
          <ShieldCheck className="w-32 h-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Security Environment</h3>
          <p className="text-gray-400 text-sm lg:text-base leading-relaxed mb-6">
            Your system is operating within a sandbox environment. All data persists locally within your browser and is never transmitted to external servers.
          </p>
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] lg:text-xs font-bold text-gray-300 uppercase tracking-widest">HTTPS Encryption</span>
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] lg:text-xs font-bold text-gray-300 uppercase tracking-widest">Local-Only Storage</span>
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] lg:text-xs font-bold text-gray-300 uppercase tracking-widest">Sandboxed Runtime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
