import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Plus,
  MessageSquare,
  History,
  X,
  Settings2,
  Sparkles,
  MoreVertical,
  Edit2,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAIResponse } from '../../services/ai';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const STORAGE_KEY = 'smart-dash-conversations-v2';

const AIChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved conversations", e);
      }
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed[0].id : null;
      } catch (e) { return null; }
    }
    return null;
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeId), 
    [conversations, activeId]
  );

  useEffect(() => {
    const hasEmptyChats = conversations.some(c => c.messages.length <= 1 && c.id !== activeId);
    if (hasEmptyChats) {
      setConversations(prev => prev.filter(c => c.messages.length > 1 || c.id === activeId));
    }
  }, [activeId]);

  useEffect(() => {
    if (conversations.length === 0) {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isTyping]);

  const createNewChat = () => {
    if (activeConversation && activeConversation.messages.length <= 1) {
      setIsHistoryOpen(false);
      return;
    }

    const newChat: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your SmartDash Assistant. How can I assist you today?",
        timestamp: Date.now()
      }],
      updatedAt: Date.now()
    };
    setConversations(prev => [newChat, ...prev]);
    setActiveId(newChat.id);
    setIsHistoryOpen(false);
  };

  const deleteChat = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeId === id) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    setMenuOpenId(null);
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
    setMenuOpenId(null);
  };

  const saveRename = () => {
    if (editingId && editTitle.trim()) {
      setConversations(prev => prev.map(c => 
        c.id === editingId ? { ...c, title: editTitle.trim() } : c
      ));
    }
    setEditingId(null);
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
      setConversations([]);
      setActiveId(null);
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => createNewChat(), 0);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || !activeId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    const currentInput = input;
    setInput('');
    setIsTyping(true);

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeId) {
        const isFirstUserMessage = conv.messages.filter(m => m.role === 'user').length === 0;
        const newTitle = isFirstUserMessage ? currentInput.slice(0, 30) + (currentInput.length > 30 ? '...' : '') : conv.title;
        return {
          ...conv,
          title: newTitle,
          messages: [...conv.messages, userMessage],
          updatedAt: Date.now()
        };
      }
      return conv;
    }));

    const history = (activeConversation?.messages || [])
      .slice(-10)
      .map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }));

    try {
      const response = await getAIResponse(currentInput, history);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage],
            updatedAt: Date.now()
          };
        }
        return conv;
      }));
    } catch (error: any) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error.message || "Failed to connect to Groq."}`,
        timestamp: Date.now(),
      };
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
            updatedAt: Date.now()
          };
        }
        return conv;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed md:static inset-x-0 bottom-16 md:bottom-auto top-14 md:top-auto h-[calc(100dvh-7.5rem)] md:h-[calc(100vh-5rem)] lg:h-[calc(100vh-12rem)] flex bg-[#050505] md:bg-transparent z-40 md:z-0 overflow-hidden md:gap-6">
      
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(!isMobile || isHistoryOpen) && (
          <motion.aside
            key="sidebar"
            initial={isMobile ? { x: -300, opacity: 0 } : { x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -300, opacity: 0 } : { x: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed md:static inset-y-0 left-0 w-[280px] lg:w-72 bg-[#0a0a0a] md:bg-[#0a0a0a]/50 md:backdrop-blur-xl border-r border-white/5 z-[80] md:z-50 flex flex-col transition-all duration-300 shadow-2xl md:shadow-none md:rounded-[2rem] lg:rounded-[2.5rem] md:border overflow-hidden",
              isMobile && !isHistoryOpen && "hidden"
            )}
          >
            <div className="p-4 lg:p-6 flex flex-col h-full relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-500" />
                  History
                </h3>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button 
                onClick={createNewChat}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 mb-6 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                New Chat
              </button>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide pb-32 lg:pb-10">
                {conversations.map((conv) => (
                  <div key={conv.id} className="relative group">
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                          onBlur={saveRename}
                          className="bg-transparent border-none outline-none text-white text-sm w-full font-medium"
                        />
                        <button onClick={saveRename} className="text-orange-500 hover:text-orange-400">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveId(conv.id);
                          if (isMobile) setIsHistoryOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative text-left",
                          activeId === conv.id 
                            ? "bg-white/10 text-white shadow-lg shadow-black/20" 
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        )}
                      >
                        <MessageSquare className={cn("w-4 h-4 flex-shrink-0", activeId === conv.id ? "text-orange-500" : "text-gray-500")} />
                        <span className="truncate text-sm font-medium flex-1 pr-6">{conv.title}</span>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                            }}
                            className={cn(
                              "p-1 rounded-lg transition-all",
                              activeId === conv.id || menuOpenId === conv.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                              "hover:bg-white/10 text-gray-500 hover:text-white"
                            )}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {menuOpenId === conv.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[90] overflow-hidden py-1">
                              <button 
                                onClick={(e) => startRename(conv.id, conv.title, e)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                                Rename
                              </button>
                              <button 
                                onClick={(e) => deleteChat(conv.id, e)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                ))}

                {/* Clear All History - Inline at end of list */}
                <button 
                  onClick={clearAllHistory}
                  className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-dashed border-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Clear All History</span>
                </button>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 hidden lg:block">
                <div className="flex items-center gap-3 px-2 text-gray-600">
                  <Settings2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Config Active</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f] lg:bg-[#0f0f0f]/50 lg:border lg:border-white/5 lg:rounded-[2.5rem] overflow-hidden relative lg:shadow-2xl lg:backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-b border-white/5 bg-[#0f0f0f]/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <History className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm lg:text-base font-bold text-white truncate max-w-[150px] lg:max-w-md">
                {activeConversation?.title || "AI Chat"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] lg:text-xs text-gray-400 font-medium">System Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Llama 3.3</span>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pb-32 lg:pb-10">
          <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8">
            <AnimatePresence initial={false}>
              {activeConversation?.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col max-w-[95%] lg:max-w-[80%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2 mb-2 px-1",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shadow-lg",
                      msg.role === 'assistant' ? "bg-orange-500 text-white" : "bg-white/10 text-white"
                    )}>
                      {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {msg.role === 'assistant' ? 'SmartDash AI' : 'You'}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "px-4 py-3 lg:px-6 lg:py-4 rounded-[1.25rem] lg:rounded-[1.5rem] text-sm lg:text-base leading-relaxed shadow-xl",
                    msg.role === 'assistant' 
                      ? "bg-white/[0.03] text-gray-200 rounded-tl-none border border-white/5" 
                      : "bg-white text-black rounded-tr-none font-medium"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="mt-2 px-2 text-[9px] text-gray-600 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Bot className="w-4 h-4 text-orange-500 animate-pulse" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-500/80">Analysing with Llama 3.3</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/90 to-transparent lg:from-black/60 lg:to-transparent backdrop-blur-sm z-10">
          <div className="relative max-w-4xl mx-auto">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-white/[0.05] lg:bg-white/[0.03] border border-white/10 rounded-2xl lg:rounded-[2rem] pl-6 lg:pl-8 pr-16 lg:pr-20 py-4 lg:py-6 text-sm lg:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/40 transition-all shadow-2xl"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-[1.25rem] bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/40 group"
            >
              <Send className="w-4 h-4 lg:w-6 lg:h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-gray-500 font-medium tracking-wide">
            Powered by Groq Llama 3.3 • System Status: Optimized
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
