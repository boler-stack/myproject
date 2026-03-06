import React, { useState, useRef, useEffect } from 'react';

import { 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Command,
  Zap,
  Info
} from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface LogEntry {
  id: string;
  type: 'command' | 'response' | 'error';
  content: string;
}

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', type: 'response', content: 'SmartDash Terminal [Version 1.0.0]' },
    { id: '2', type: 'response', content: 'Type "help" to see available commands.' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type: LogEntry['type'], content: string) => {
    setLogs(prev => [...prev, { id: crypto.randomUUID(), type, content }]);
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const [base, ...args] = trimmed.split(' ');

    addLog('command', `> ${cmd}`);

    switch (base) {
      case 'help':
        addLog('response', 'Available commands:\n  help      - Show this help menu\n  clear     - Clear terminal history\n  status    - View system health summary\n  echo [msg]- Print message to terminal\n  whoami    - Display user information\n  date      - Show current date and time');
        break;
      case 'clear':
        setLogs([]);
        break;
      case 'status':
        addLog('response', 'SYSTEM STATUS: OPTIMAL\nCPU: Tracking...\nNET: Connected\nSEC: Secure');
        break;
      case 'echo':
        addLog('response', args.join(' ') || 'Usage: echo [message]');
        break;
      case 'whoami':
        addLog('response', 'User: Architect\nRole: Senior System Administrator\nAccess: Root');
        break;
      case 'date':
        addLog('response', new Date().toLocaleString());
        break;
      case '':
        break;
      default:
        addLog('error', `Command not found: ${base}. Type "help" for options.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        processCommand(input);
        setHistory(prev => [input, ...prev]);
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="h-[calc(100dvh-10rem)] lg:h-[calc(100vh-12rem)] flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <TerminalIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">System Terminal</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">v1.0.0-stable / root access</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <Zap className="w-3 h-3 text-yellow-500" />
            High Performance
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <Command className="w-3 h-3 text-blue-500" />
            CLI Mode
          </div>
        </div>
      </div>

      <div 
        className="flex-1 bg-[#050505] border border-white/5 rounded-2xl lg:rounded-3xl overflow-hidden flex flex-col font-mono shadow-2xl relative group"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-20" />
        
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10" />

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-1 relative z-0"
        >
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={cn(
                "whitespace-pre-wrap break-all leading-relaxed transition-colors text-xs lg:text-sm",
                log.type === 'command' ? "text-white font-bold" : 
                log.type === 'error' ? "text-red-400" : "text-emerald-400/80"
              )}
            >
              {log.content}
            </div>
          ))}
          
          <div className="flex items-start lg:items-center gap-2 text-white pt-2 text-xs lg:text-sm">
            <div className="flex flex-col sm:flex-row sm:gap-1">
              <span className="text-emerald-400 font-bold whitespace-nowrap">architect@smartdash</span>
              <span className="hidden sm:inline text-gray-600">:</span>
              <span className="text-blue-400 font-bold">~</span>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 -ml-1 mt-0.5 sm:mt-0 animate-pulse flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent border-none outline-none text-white caret-emerald-400"
            />
          </div>
        </div>

        <div className="p-3 lg:p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[8px] lg:text-[10px] font-bold text-gray-700 uppercase tracking-widest px-6 lg:px-8">
          <div className="flex gap-4">
            <span>Encoding: UTF-8</span>
            <span className="hidden sm:inline">Shell: zsh-modern</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {[
          { icon: Info, label: "Tab to Autocomplete", color: "text-blue-500", hiddenOnMobile: true },
          { icon: Command, label: "Up/Down for History", color: "text-purple-500" },
          { icon: Zap, label: "Instant Execution", color: "text-emerald-500" },
        ].map((item, i) => (
          <div key={i} className={cn(
            "flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5",
            item.hiddenOnMobile && "hidden sm:flex"
          )}>
            <item.icon className={cn("w-3.5 h-3.5 lg:w-4 lg:h-4", item.color)} />
            <span className="text-[9px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
