import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hash, 
  Notebook, 
  Cpu,
  Bot,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', short: 'Home' },
    { to: '/converter', icon: Hash, label: 'Converter', short: 'Conv' },
    { to: '/notes', icon: Notebook, label: 'Notes', short: 'Notes' },
    { to: '/system', icon: Cpu, label: 'System Info', short: 'Sys' },
    { to: '/ai-chat', icon: Bot, label: 'AI Assistant', short: 'AI' },
    { to: '/terminal', icon: TerminalIcon, label: 'Terminal', short: 'CLI' },
  ];

  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div className="flex min-h-[100dvh] bg-[#050505] text-gray-200 selection:bg-orange-500/20 overflow-x-hidden flex-col md:flex-row">
      
      {/* Desktop Sidebar - Always visible on MD+ */}
      <aside className="hidden md:flex sticky top-0 left-0 h-screen w-64 lg:w-72 bg-[#0a0a0a] border-r border-white/[0.05] z-[70] flex-col transition-all">
        <div className="p-8 h-full flex flex-col">
          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-12 h-10 px-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <LayoutDashboard className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-black text-xl tracking-tighter text-white uppercase">
              Smart<span className="text-orange-500">Dash</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white/10 text-white shadow-xl shadow-black/20" 
                      : "hover:bg-white/[0.03] text-gray-500 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-transform", isActive && "scale-110")} />
                  <span className="font-bold text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveBar"
                      className="absolute left-0 w-1.5 h-6 bg-orange-500 rounded-full"
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto p-5 rounded-[2rem] bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] text-gray-600 text-center uppercase tracking-[0.2em] font-black">
              System v1.2.0 Stable
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header - Professional branding */}
      <header className="md:hidden h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-black text-white text-sm tracking-tighter uppercase">
            Smart<span className="text-orange-500">Dash</span>
          </h1>
        </div>
        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
          {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 p-4 lg:p-10 max-w-[1600px] w-full mx-auto pb-24 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation - HIDDEN ON DESKTOP (MD+) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 z-[60] px-4 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center gap-1 min-w-[56px] h-full transition-all"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/20" : "text-gray-500"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter transition-all",
                isActive ? "text-orange-500 opacity-100" : "text-gray-600 opacity-60"
              )}>
                {item.short}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;
