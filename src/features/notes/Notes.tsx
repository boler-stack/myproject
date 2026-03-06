import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  StickyNote,
  Sparkles,
  ChevronRight,
  Star,
  StarOff,
  MoreVertical
} from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAIResponse } from '../../services/ai';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Work' | 'Personal' | 'Idea' | 'General';
  pinned: boolean;
  updatedAt: number;
}

const CATEGORIES = ['General', 'Work', 'Personal', 'Idea'] as const;
const CATEGORY_COLORS = {
  General: 'bg-blue-500',
  Work: 'bg-purple-500',
  Personal: 'bg-emerald-500',
  Idea: 'bg-orange-500',
};

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('smart-dash-notes-v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isAISummarizing, setIsAISummarizing] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-cleanup: remove empty notes (except the active one)
  useEffect(() => {
    const hasEmptyNotes = notes.some(n => !n.title.trim() && !n.content.trim() && n.id !== activeNoteId);
    if (hasEmptyNotes) {
      setNotes(prev => prev.filter(n => n.title.trim() || n.content.trim() || n.id === activeNoteId));
    }
  }, [activeNoteId, notes]);

  useEffect(() => {
    localStorage.setItem('smart-dash-notes-v2', JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        n.content.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a.pinned === b.pinned) return b.updatedAt - a.updatedAt;
        return a.pinned ? -1 : 1;
      });
  }, [notes, search]);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId), 
    [notes, activeNoteId]
  );

  const handleAddNote = () => {
    // If active note is already empty, just keep focus there
    if (activeNote && !activeNote.title.trim() && !activeNote.content.trim()) {
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      category: 'General',
      pinned: false,
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    ));
  };

  const togglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ));
    setMenuOpenId(null);
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
    setMenuOpenId(null);
  };

  const handleAISummarize = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsAISummarizing(true);
    try {
      const summary = await getAIResponse(`Summarize this note in bullet points:\n\n${activeNote.content}`, []);
      updateNote(activeNote.id, { 
        content: activeNote.content + "\n\n---\n**AI Summary:**\n" + summary 
      });
    } catch {
      alert("AI Service unavailable.");
    } finally {
      setIsAISummarizing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row lg:gap-6 relative">
      
      {/* Sidebar List */}
      <div className={cn(
        "flex flex-col bg-[#050505] lg:bg-white/[0.02] lg:border lg:border-white/[0.05] lg:rounded-[2.5rem] transition-all overflow-hidden",
        isMobile ? "flex-1" : "w-80 shrink-0",
        isMobile && activeNoteId && "hidden"
      )}>
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Vault</h2>
            <button 
              onClick={handleAddNote}
              className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-90"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search concepts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar pb-32 lg:pb-4">
          {filteredNotes.map(note => (
            <div key={note.id} className="relative group">
              <button
                onClick={() => {
                  setActiveNoteId(note.id);
                  setMenuOpenId(null);
                }}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all relative border flex flex-col",
                  activeNoteId === note.id 
                    ? "bg-white/10 border-orange-500/20 shadow-xl" 
                    : "bg-white/[0.01] border-transparent hover:bg-white/[0.03] text-gray-500 hover:text-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-2 w-full">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", CATEGORY_COLORS[note.category])} />
                    {note.pinned && <Star className="w-3 h-3 text-orange-500 fill-orange-500" />}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                    {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white truncate mb-1 pr-6">
                  {note.title || <span className="italic opacity-30 font-medium">New Entry</span>}
                </h4>
                <p className="text-[11px] font-medium opacity-40 line-clamp-1">{note.content || "Ready for input..."}</p>
              </button>

              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === note.id ? null : note.id);
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    activeNoteId === note.id || menuOpenId === note.id || isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    "hover:bg-white/10 text-gray-400 hover:text-white bg-black/20 lg:bg-transparent"
                  )}
                >
                  <MoreVertical className="w-5 h-5 lg:w-4 lg:h-4" />
                </button>

                {menuOpenId === note.id && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[100] overflow-hidden py-1.5 backdrop-blur-xl">
                    <button 
                      onClick={(e) => togglePin(note.id, e)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 hover:text-orange-500 transition-all"
                    >
                      {note.pinned ? (
                        <><StarOff className="w-4 h-4" /> Unfavorite</>
                      ) : (
                        <><Star className="w-4 h-4" /> Favorite</>
                      )}
                    </button>
                    <button 
                      onClick={(e) => deleteNote(note.id, e)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all border-t border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#050505] lg:bg-white/[0.02] lg:border lg:border-white/[0.05] lg:rounded-[2.5rem] overflow-hidden relative shadow-2xl",
        isMobile && !activeNoteId && "hidden"
      )}>
        {activeNote ? (
          <div className="flex flex-col h-full">
            <div className="p-4 lg:px-8 border-b border-white/[0.05] flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveNoteId(null)}
                  className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-white"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <div className="flex items-center gap-2">
                  <select 
                    value={activeNote.category}
                    onChange={(e) => updateNote(activeNote.id, { category: e.target.value as Note['category'] })}
                    className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-orange-500 outline-none hover:bg-orange-500/20 transition-all cursor-pointer"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#0f0f0f]">{cat}</option>)}
                  </select>
                  <button 
                    onClick={handleAISummarize}
                    disabled={isAISummarizing}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-all"
                  >
                    <Sparkles className={cn("w-3 h-3", isAISummarizing && "animate-spin")} />
                    {isAISummarizing ? "Thinking..." : "AI Insight"}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => togglePin(activeNote.id)}
                  className={cn("p-2 rounded-xl transition-all", activeNote.pinned ? "text-orange-500 bg-orange-500/10" : "text-gray-600 hover:text-white")}
                >
                  {activeNote.pinned ? <Star className="w-5 h-5 fill-orange-500" /> : <Star className="w-5 h-5" />}
                </button>
                <button onClick={() => deleteNote(activeNote.id)} className="p-2 text-gray-600 hover:text-red-500 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 lg:p-12 overflow-y-auto custom-scrollbar pb-32 lg:pb-12">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Entry Label"
                className="w-full bg-transparent border-none outline-none text-3xl lg:text-6xl font-black text-white placeholder:text-white/[0.03] mb-8 tracking-tighter"
              />
              <textarea 
                value={activeNote.content}
                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                placeholder="Initialize concepts..."
                className="w-full h-full bg-transparent border-none outline-none text-base lg:text-xl font-medium text-gray-400 placeholder:text-white/[0.03] resize-none leading-relaxed"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10 flex items-center justify-center mb-8 shadow-inner">
              <StickyNote className="w-10 h-10 text-orange-500/40" />
            </motion.div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Knowledge Vault</h3>
            <p className="text-gray-600 font-bold text-sm max-w-xs leading-relaxed">Select a logic node or create a new entry.</p>
            <button onClick={handleAddNote} className="mt-8 px-10 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95">Initialize Node</button>
          </div>
        )}
      </div>

      {!activeNoteId && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={handleAddNote} className="lg:hidden fixed bottom-20 right-6 w-14 h-14 rounded-2xl bg-orange-500 text-white shadow-2xl shadow-orange-500/40 flex items-center justify-center z-40">
          <Plus className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default Notes;
