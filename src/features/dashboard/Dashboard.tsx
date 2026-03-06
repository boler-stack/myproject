import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Cloud
} from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="group relative p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 overflow-hidden"
  >
    <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 blur-3xl rounded-full", color)} />
    
    <div className="relative z-10">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</h3>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const stats = [
    { label: "System Load", value: "24%", trend: "+2.5%", icon: Activity, color: "bg-blue-600" },
    { label: "Storage Used", value: "128GB", trend: "Normal", icon: Cloud, color: "bg-purple-600" },
    { label: "Security Status", value: "Secure", icon: ShieldCheck, color: "bg-emerald-600" },
    { label: "Active Sessions", value: "3", icon: Zap, color: "bg-orange-600" },
  ];

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h2 className="text-2xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
            {greeting}, <span className="text-white/40 font-medium">Architect</span>
          </h2>
          <p className="text-gray-400 text-sm lg:text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Everything is running smoothly today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-full md:w-auto px-6 py-3 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            System Reboot
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={stat.label} {...stat} delay={idx * 0.1} />
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Feature Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h4 className="text-xl lg:text-2xl font-bold text-white mb-4">Core Performance</h4>
            <div className="h-32 lg:h-48 flex items-end gap-1.5 lg:gap-2 px-2 lg:px-4">
              {[40, 70, 45, 90, 65, 85, 30, 60, 95, 40, 50, 75].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-white/10 rounded-t-lg hover:bg-white/30 transition-all duration-300"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-6 flex justify-between text-[9px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">
              <span>08:00 AM</span>
              <span className="hidden sm:inline">12:00 PM</span>
              <span>04:00 PM</span>
              <span>08:00 PM</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions / Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-[#0f0f0f] border border-white/5"
        >
          <h4 className="text-lg lg:text-xl font-bold text-white mb-6">Recent Events</h4>
          <div className="space-y-6">
            {[
              { time: "2m ago", text: "New note saved", subtext: "Project Roadmap" },
              { time: "1h ago", text: "AI Response generated", subtext: "Optimization query" },
              { time: "4h ago", text: "Converter used", subtext: "Decimal to Hex" },
            ].map((event, i) => (
              <div key={i} className="flex gap-4 group cursor-default">
                <div className="w-1 h-10 rounded-full bg-white/10 group-hover:bg-white/40 transition-colors mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-semibold text-sm lg:text-base">{event.text}</span>
                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">{event.time}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500">{event.subtext}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-10 py-4 rounded-2xl border border-white/5 text-gray-400 text-sm font-bold hover:text-white hover:bg-white/5 transition-all">
            View All Logs
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
