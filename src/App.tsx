/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Swords, Sparkles, ShieldAlert, Folder, BarChart3, User, Search, Volume2, VolumeX, Menu, X, ShieldCheck, BookOpen } from 'lucide-react';

import { Note, Mission, TrainingHistory, ChatMessage, UserState } from './types';
import { synth } from './utils/audio';

import RadarBackground from './components/RadarBackground';
import CommandPalette from './components/CommandPalette';
import DashboardView from './components/DashboardView';
import TrainingView from './components/TrainingView';
import AssistantView from './components/AssistantView';
import MissionsView from './components/MissionsView';
import DatabaseView from './components/DatabaseView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
import AboutBatcaveView from './components/AboutBatcaveView';

// Seed Initial Data
const SEED_NOTES: Note[] = [
  {
    id: 'note-01',
    title: 'CASE REPORT: BAROMETRIC RAD-SMOG',
    content: `[FORENSIC METEOROLOGICAL LOG]
Observed barometric smog density spikes exceeding 45 PPM in the south quadrant. Gas chromatography points to a synthetic halogen compound mixed with trace toxic ash. 
Action required: Set up a perimeter sensor in quadrant S-3, and cross-reference ventilation cycles of nearby pharmaceutical depots.`,
    folder: 'Forensic Reports',
    tags: ['FORENSIC', 'RAD_SMOG', 'CASE_01'],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'note-02',
    title: 'SUSPECT DOSSIER: THE CYCLER',
    content: `[TACTICAL INTELLIGENCE ARCHIVE]
Subject seen traversing the central pipeline corridor wearing heavy tactical filters. 
Height: ~185cm. Weight: ~90kg.
Sighted carrying a portable chemical synthesizer. Subject vanished near Grid Coordinate A-4 (Secure Vault C-1 entry point).`,
    folder: 'Suspect Profiles',
    tags: ['SUSPECT', 'DOSSIER', 'THE_CYCLER'],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  }
];

const SEED_MISSIONS: Mission[] = [
  {
    id: 'm-01',
    title: 'CALIBRATE COGNITIVE REFLEXES',
    description: 'Resolve a Reaction Velocity Test under 300 milliseconds in the Training deck.',
    rewardXp: 100,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    type: 'daily',
  },
  {
    id: 'm-02',
    title: 'CRACK CIPHER CODES',
    description: 'Solve a logical Caesar-Shift or pattern decryption puzzle.',
    rewardXp: 150,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    type: 'daily',
  },
  {
    id: 'm-03',
    title: 'ARCHIVE CRITICAL INTELLIGENCE',
    description: 'Save a new investigative note or suspect dossier in the secure Database.',
    rewardXp: 100,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    type: 'daily',
  },
  {
    id: 'm-04',
    title: 'WEEKLY CORE STANDING',
    description: 'Solve at least 3 cognitive training rounds of any type.',
    rewardXp: 300,
    progress: 0,
    maxProgress: 3,
    completed: false,
    claimed: false,
    type: 'weekly',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'training' | 'assistant' | 'missions' | 'database' | 'analytics' | 'profile' | 'about_batcave'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  
  // Notification States
  const [notif, setNotif] = useState<{ show: boolean; msg: string } | null>(null);

  // Core Persisted States
  const [userState, setUserState] = useState<UserState>({
    level: 1,
    xp: 0,
    nextLevelXp: 500,
    dailyStreak: 3,
    weeklyStreak: 1,
    lastActionDate: null,
    selectedTheme: 'specter',
    soundEnabled: true,
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [history, setHistory] = useState<TrainingHistory[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Cross-view triggers/states
  const [challengeTriggerType, setChallengeTriggerType] = useState<'logic' | 'reaction' | 'memory' | 'observation' | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [presetQueryText, setPresetQueryText] = useState<string | null>(null);

  // Initialize and load from local storage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('v_user');
      const storedNotes = localStorage.getItem('v_notes');
      const storedMissions = localStorage.getItem('v_missions');
      const storedHistory = localStorage.getItem('v_history');
      const storedChat = localStorage.getItem('v_chat');

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserState(parsed);
        synth.setEnabled(parsed.soundEnabled);
      }
      
      setNotes(storedNotes ? JSON.parse(storedNotes) : SEED_NOTES);
      setMissions(storedMissions ? JSON.parse(storedMissions) : SEED_MISSIONS);
      setHistory(storedHistory ? JSON.parse(storedHistory) : []);
      setChatHistory(storedChat ? JSON.parse(storedChat) : []);
    } catch (e) {
      console.error('Failed to load local storage cache', e);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('v_user', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    localStorage.setItem('v_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('v_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('v_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('v_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Global hotkeys (Ctrl + K Command Palette)
  useEffect(() => {
    function handleGlobalKeys(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Custom trigger notification banner
  const triggerNotification = (msg: string) => {
    setNotif({ show: true, msg });
    setTimeout(() => {
      setNotif(null);
    }, 4500);
  };

  // XP progression engine
  const handleAwardXp = (xpAwarded: number, logMessage: string) => {
    setUserState(prev => {
      let newXp = prev.xp + xpAwarded;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;
      let leveledUp = false;

      while (newXp >= newNextXp) {
        leveledUp = true;
        newXp -= newNextXp;
        newLevel += 1;
        newNextXp = Math.round(newNextXp * 1.3);
      }

      if (leveledUp) {
        setTimeout(() => {
          synth.levelUp();
          triggerNotification(`🎉 CORE OVERRIDE LEVEL ${newLevel} SECURED!`);
        }, 600);
      } else {
        triggerNotification(`⚡ +${xpAwarded} XP LOADED // ${logMessage}`);
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        nextLevelXp: newNextXp,
      };
    });
  };

  // Add training runs to history & check progression of missions
  const handleLogHistory = (type: 'observation' | 'memory' | 'logic' | 'reaction' | 'workout', score: number, metadata?: string) => {
    const newRun: TrainingHistory = {
      id: Date.now().toString(),
      type,
      score,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setHistory(prev => [newRun, ...prev]);

    // Evaluate active missions
    setMissions(prevMissions => 
      prevMissions.map(m => {
        if (m.completed) return m;

        let newProgress = m.progress;
        
        // Mission 01: Reaction Under 300ms
        if (m.id === 'm-01' && type === 'reaction' && score < 300) {
          newProgress = 1;
        }
        // Mission 02: Crack logical puzzles
        if (m.id === 'm-02' && type === 'logic' && score > 0) {
          newProgress = 1;
        }
        // Mission 04: Weekly core training
        if (m.id === 'm-04') {
          newProgress = Math.min(m.maxProgress, m.progress + 1);
        }

        const isCompleted = newProgress >= m.maxProgress;
        if (isCompleted && !m.completed) {
          setTimeout(() => synth.success(), 100);
        }

        return {
          ...m,
          progress: newProgress,
          completed: isCompleted,
        };
      })
    );
  };

  // Add notes & update missions
  const handleAddNote = (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const noteObj: Note = {
      ...newNote,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [noteObj, ...prev]);

    triggerNotification('📝 INVESTIGATIVE NOTE DEPOSITED IN ARCHIVES');

    // Trigger Mission 3 (Database archive)
    setMissions(prevMissions => 
      prevMissions.map(m => {
        if (m.id === 'm-03' && !m.completed) {
          return { ...m, progress: 1, completed: true };
        }
        return m;
      })
    );
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    triggerNotification('📝 INVESTIGATIVE ARCHIVE OVERWRITTEN');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    triggerNotification('🗑️ SYSTEM INTELLIGENCE PURGED');
  };

  // Claim mission rewards
  const handleClaimMission = (id: string) => {
    const target = missions.find(m => m.id === id);
    if (!target) return;

    handleAwardXp(target.rewardXp, `Resolved Objective: ${target.title}`);
    setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m));
  };

  // Create Custom Mission
  const handleAddMission = (title: string, description: string, rewardXp: number, type: 'daily' | 'weekly' | 'custom') => {
    const newM: Mission = {
      id: `custom-m-${Date.now()}`,
      title,
      description,
      rewardXp,
      progress: 0,
      maxProgress: 1,
      completed: false,
      claimed: false,
      type,
    };
    setMissions(prev => [newM, ...prev]);
    triggerNotification('🎯 NEW STRATEGIC DIRECTIVE LOADED');
  };

  const handleDeleteMission = (id: string) => {
    setMissions(prev => prev.filter(m => m.id !== id));
    triggerNotification('🗑️ DIRECTIVE REMOVED FROM ACTIVE REGIME');
  };

  // Reset all local cache sandbox testing
  const handleResetAllData = () => {
    localStorage.clear();
    setUserState({
      level: 1,
      xp: 0,
      nextLevelXp: 500,
      dailyStreak: 3,
      weeklyStreak: 1,
      lastActionDate: null,
      selectedTheme: 'specter',
      soundEnabled: true,
    });
    setNotes(SEED_NOTES);
    setMissions(SEED_MISSIONS);
    setHistory([]);
    setChatHistory([]);
    setActiveTab('dashboard');
    triggerNotification('🚨 SECURITY PROFILE RE-INITIALIZED');
  };

  const handleToggleSound = () => {
    const nextVal = !userState.soundEnabled;
    synth.setEnabled(nextVal);
    setUserState(prev => ({ ...prev, soundEnabled: nextVal }));
    triggerNotification(nextVal ? '🔊 SYNTH DAEMON ACTIVATED' : '🔇 SYNTH DAEMON MUTED');
  };

  const handleNavigate = (tab: any) => {
    synth.click();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Quick dispatch triggers from Dashboard
  const handleDeployAssistantQuery = (query: string) => {
    setPresetQueryText(query);
    setActiveTab('assistant');
  };

  const handleStartDailyChallenge = () => {
    setChallengeTriggerType('logic');
    setActiveTab('training');
  };

  const handleSelectNoteFromPalette = (note: Note) => {
    setSelectedNoteId(note.id);
    setActiveTab('database');
  };

  // Sidebar navigations list
  const navItems = [
    { id: 'dashboard', label: 'Operations', icon: Terminal },
    { id: 'training', label: 'Training', icon: Swords },
    { id: 'assistant', label: 'AI Mainframe', icon: Sparkles },
    { id: 'missions', label: 'Directives', icon: ShieldAlert },
    { id: 'database', label: 'Database', icon: Folder },
    { id: 'analytics', label: 'Performance', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'about_batcave', label: 'About Bat Cave', icon: BookOpen },
  ];

  // Theme styles classes maps
  const themeClassesMap = {
    specter: {
      accentText: 'text-cyan-400',
      accentBorder: 'border-cyan-400',
      accentBg: 'bg-cyan-500/10',
      accentGlow: 'glow-text-specter',
      accentBoxGlow: 'border-glow-specter',
    },
    vengeance: {
      accentText: 'text-rose-500',
      accentBorder: 'border-rose-500',
      accentBg: 'bg-rose-500/10',
      accentGlow: 'glow-text-vengeance',
      accentBoxGlow: 'border-glow-vengeance',
    },
    tactical: {
      accentText: 'text-amber-500',
      accentBorder: 'border-amber-500',
      accentBg: 'bg-amber-500/10',
      accentGlow: 'glow-text-tactical',
      accentBoxGlow: 'border-glow-tactical',
    },
    matrix: {
      accentText: 'text-emerald-500',
      accentBorder: 'border-emerald-500',
      accentBg: 'bg-emerald-500/10',
      accentGlow: 'glow-text-matrix',
      accentBoxGlow: 'border-glow-matrix',
    },
  };

  const currentTheme = themeClassesMap[userState.selectedTheme] || themeClassesMap.specter;

  return (
    <div className="relative min-h-screen text-white bg-[#050505] overflow-x-hidden flex flex-col font-sans select-none selection:bg-cyan-500 selection:text-black">
      
      {/* Immersive CRT effects overlays */}
      <div className="scanlines pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />
      
      {/* Ambient glowing blurs from Artistic Flair */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>
      
      {/* Animated Radar Canvas Background */}
      <RadarBackground />

      {/* COMMAND PALETTE Ctrl+K SEARCH OVERLAY */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        notes={notes}
        onSelectNote={handleSelectNoteFromPalette}
        onNavigate={(page) => handleNavigate(page as any)}
        onToggleSound={handleToggleSound}
        soundEnabled={userState.soundEnabled}
        onSelectTheme={(theme) => setUserState(prev => ({ ...prev, selectedTheme: theme }))}
      />

      {/* NOTIFICATION FLUID BANNER */}
      <AnimatePresence>
        {notif?.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-4 py-2.5 bg-[#09090d] border border-cyan-400/30 rounded shadow-2xl flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider min-w-[280px]"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span>{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT STRUCTURE */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-cyan-950/40 bg-black/40 backdrop-blur-xl flex-shrink-0 relative">
          {/* Sidebar Top Header */}
          <div className="p-5 border-b border-cyan-950/40 flex flex-col gap-1 select-none">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 flex items-center justify-center border border-cyan-500/50 rotate-45 flex-shrink-0">
                <div className="w-4 h-4 bg-cyan-500 -rotate-45"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="font-mono tracking-tighter text-cyan-400 font-bold text-sm uppercase leading-none">
                  VENGEANCE OS
                </h1>
                <span className="text-[9px] text-white/40 font-mono mt-1">
                  v.4.0.2
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-3 flex flex-col gap-1.5 mt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as any)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded font-mono text-xs transition-all relative ${
                    isSelected 
                      ? 'text-white bg-white/5 border border-white/10' 
                      : 'text-white/45 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Selected side bar glow notch */}
                  {isSelected && (
                    <motion.div 
                      layoutId="activeSideIndicator"
                      className="absolute left-0 top-1/4 w-[2px] h-1/2 bg-cyan-400" 
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Console Info */}
          <div className="p-4 border-t border-white/5 font-mono text-[9px] text-white/20 uppercase flex flex-col gap-1">
            <button 
              onClick={() => setPaletteOpen(true)}
              className="flex items-center justify-between text-white/35 hover:text-white border border-white/5 hover:border-white/15 rounded bg-white/5 px-2.5 py-1.5 transition-all mb-2 w-full cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <Search className="w-3 h-3 text-cyan-400/80" />
                <span>Search mainframe</span>
              </div>
              <span className="bg-white/5 border border-white/10 px-1 rounded text-[8px]">Ctrl+K</span>
            </button>
            <div className="flex justify-between">
              <span>Host Node:</span>
              <span className="text-white/40">Secure_01</span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span>Security Standing:</span>
              <span className="text-green-500 font-bold">Clear</span>
            </div>
          </div>
        </aside>

        {/* MOBILE TOP NAVIGATION BAR */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-cyan-950/40 bg-black/60 backdrop-blur-xl relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center border border-cyan-500/50 rotate-45 flex-shrink-0">
              <div className="w-3.5 h-3.5 bg-cyan-500 -rotate-45"></div>
            </div>
            <div>
              <h1 className="font-mono tracking-tighter text-cyan-400 font-bold text-xs uppercase leading-none">
                VENGEANCE OS
              </h1>
              <span className="text-[8px] font-mono text-white/40 mt-1 block">
                Node SECURE_01
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { synth.metalClick(); setPaletteOpen(true); }}
              className="p-1 border border-white/5 hover:border-white/15 bg-white/5 rounded text-white/60"
            >
              <Search className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => { synth.click(); setMobileMenuOpen(prev => !prev); }}
              className="p-1 text-white hover:bg-white/5 rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* MOBILE SLIDE-DOWN MENU NAV */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden fixed top-[57px] left-0 w-full bg-[#09090e]/95 border-b border-white/10 z-40 p-4 font-mono text-xs flex flex-col gap-2.5"
            >
              {navItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as any)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded border ${
                      isSelected 
                        ? 'border-cyan-400 bg-cyan-500/10 text-white' 
                        : 'border-transparent text-white/50 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN DISPLAY VIEWPORT */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-60px)] lg:max-h-screen relative z-10">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  userState={userState}
                  missions={missions}
                  history={history}
                  onNavigate={(page) => handleNavigate(page as any)}
                  onDeployAssistantQuery={handleDeployAssistantQuery}
                  onStartDailyChallenge={handleStartDailyChallenge}
                />
              )}

              {activeTab === 'training' && (
                <TrainingView
                  onAwardXp={handleAwardXp}
                  onLogHistory={handleLogHistory}
                  history={history}
                  triggerChallengeType={challengeTriggerType}
                  onClearChallengeTrigger={() => setChallengeTriggerType(null)}
                />
              )}

              {activeTab === 'assistant' && (
                <AssistantView
                  chatHistory={chatHistory}
                  onAddChatMessage={(msg) => setChatHistory(prev => [...prev, msg])}
                  onClearChatHistory={() => setChatHistory([])}
                  presetText={presetQueryText || undefined}
                  onClearPresetText={() => setPresetQueryText(null)}
                />
              )}

              {activeTab === 'missions' && (
                <MissionsView
                  missions={missions}
                  onAddMission={handleAddMission}
                  onClaimMission={handleClaimMission}
                  onDeleteMission={handleDeleteMission}
                  dailyStreak={userState.dailyStreak}
                  weeklyStreak={userState.weeklyStreak}
                />
              )}

              {activeTab === 'database' && (
                <DatabaseView
                  notes={notes}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  selectedNoteIdFromPalette={selectedNoteId}
                  onClearSelectedNoteId={() => setSelectedNoteId(null)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView history={history} />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  userState={userState}
                  history={history}
                  missions={missions}
                  notes={notes}
                  onToggleSound={handleToggleSound}
                  onSelectTheme={(theme) => setUserState(prev => ({ ...prev, selectedTheme: theme }))}
                  onResetData={handleResetAllData}
                />
              )}

              {activeTab === 'about_batcave' && (
                <AboutBatcaveView />
              )}
            </motion.div>
          </AnimatePresence>

        </main>

      </div>
    </div>
  );
}
