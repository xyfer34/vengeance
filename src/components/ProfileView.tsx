/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { User, Volume2, VolumeX, Moon, Trash2, ShieldAlert, Award, Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { UserState, TrainingHistory, Mission, Note } from '../types';
import { synth } from '../utils/audio';

interface ProfileViewProps {
  userState: UserState;
  history: TrainingHistory[];
  missions: Mission[];
  notes: Note[];
  onToggleSound: () => void;
  onSelectTheme: (theme: 'specter' | 'vengeance' | 'tactical' | 'matrix') => void;
  onResetData: () => void;
}

export default function ProfileView({
  userState,
  history,
  missions,
  notes,
  onToggleSound,
  onSelectTheme,
  onResetData,
}: ProfileViewProps) {

  // Dynamic achievement checking
  const achievementsList = [
    {
      id: 'ach-first',
      title: 'NEURAL CONSTRUCT LINKED',
      description: 'Complete your first cognitive training diagnostic.',
      requirement: '1 training run completed',
      unlocked: history.length > 0,
      xp: 100,
    },
    {
      id: 'ach-logic',
      title: 'CRYPTOGRAPHIC MASTER',
      description: 'Crack at least 3 logical decryption equations.',
      requirement: '3 logic runs completed',
      unlocked: history.filter(h => h.type === 'logic' && h.score > 0).length >= 3,
      xp: 150,
    },
    {
      id: 'ach-reaction',
      title: 'TRIGGER VELOCITY',
      description: 'Log an elite reflex trigger score under 250ms.',
      requirement: 'Reaction time < 250ms',
      unlocked: history.some(h => h.type === 'reaction' && h.score < 250),
      xp: 200,
    },
    {
      id: 'ach-database',
      title: 'INTELLIGENCE COMPENDIUM',
      description: 'Save at least 3 intelligence entries in the secure database.',
      requirement: '3 database entries saved',
      unlocked: notes.length >= 3,
      xp: 150,
    },
    {
      id: 'ach-missions',
      title: 'DIRECTIVE OVERRIDE',
      description: 'Complete and claim 5 tactical missions.',
      requirement: '5 missions resolved',
      unlocked: missions.filter(m => m.completed && m.claimed).length >= 5,
      xp: 200,
    },
  ];

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;

  const handleThemeChange = (theme: 'specter' | 'vengeance' | 'tactical' | 'matrix') => {
    synth.accessGranted();
    onSelectTheme(theme);
  };

  const handleResetClick = () => {
    if (window.confirm('⚠️ WARNING: This will permanently purge your local cognitive cache, history, notes, and level status. Proceed?')) {
      synth.error();
      onResetData();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1 max-w-7xl mx-auto">
      
      {/* Left Column: standing, level, system control settings */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Profile standing block */}
        <div className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/20" />
          
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-400/10">
            <User className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            ELITE AGENT PROFILE
          </span>
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider mt-1.5">
            OPERATIVE DE-890
          </h2>

          <div className="w-full grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4">
            <div className="text-center font-mono">
              <span className="text-[9px] text-white/30 uppercase block">XP RANK</span>
              <span className="text-sm font-bold text-white uppercase mt-0.5 block">LEVEL {userState.level}</span>
            </div>
            <div className="text-center font-mono">
              <span className="text-[9px] text-white/30 uppercase block">UNLOCKED ARCHIVES</span>
              <span className="text-sm font-bold text-cyan-400 uppercase mt-0.5 block">{unlockedCount} BADGES</span>
            </div>
          </div>
        </div>

        {/* System parameters / Theme selector */}
        <div className="glass-panel border border-white/5 rounded-lg p-5">
          <span className="text-[10px] font-mono text-white/40 uppercase border-b border-white/5 pb-2 block mb-4">
            UI MODULE THEMES
          </span>
          
          <div className="flex flex-col gap-2.5">
            {[
              { id: 'specter', label: 'SPECTER BLUE (DEFAULT)', color: 'bg-[#00f0ff]' },
              { id: 'vengeance', label: 'VENGEANCE CRIMSON', color: 'bg-[#ff0055]' },
              { id: 'tactical', label: 'TACTICAL AMBER', color: 'bg-[#ff9900]' },
              { id: 'matrix', label: 'NETRUNNER EMERALD', color: 'bg-[#00ff66]' },
            ].map(theme => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id as any)}
                className={`w-full p-2.5 border rounded text-xs font-mono text-left flex items-center justify-between transition-all cursor-pointer ${
                  userState.selectedTheme === theme.id
                    ? 'border-cyan-400 bg-cyan-500/5 text-white'
                    : 'border-white/5 bg-white/5 text-white/55 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{theme.label}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${theme.color} shadow-sm`} />
              </button>
            ))}
          </div>
        </div>

        {/* Settings block */}
        <div className="glass-panel border border-white/5 rounded-lg p-5">
          <span className="text-[10px] font-mono text-white/40 uppercase border-b border-white/5 pb-2 block mb-4">
            SYSTEM PARAMETERS
          </span>

          <div className="flex flex-col gap-3 font-mono text-xs">
            <button
              onClick={() => { synth.click(); onToggleSound(); }}
              className="w-full p-2.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded text-left flex items-center justify-between text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <span>SYSTEM SYNTH SOUNDS</span>
              {userState.soundEnabled ? (
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <Volume2 className="w-4 h-4" /> ON
                </span>
              ) : (
                <span className="text-white/30 flex items-center gap-1">
                  <VolumeX className="w-4 h-4" /> MUTED
                </span>
              )}
            </button>

            <button
              onClick={handleResetClick}
              className="w-full p-2.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>PURGE CACHED COGNITIVE PROFILE</span>
              <Trash2 className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>

      </div>

      {/* Right Column: Achievements & Badges Grid */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Achievements list */}
        <div className="glass-panel border border-white/5 rounded-lg p-5 flex-1 flex flex-col">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2 block mb-4">
            INTELLIGENCE ACCREDITATIONS (BADGES)
          </span>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px]">
            {achievementsList.map(ach => (
              <div
                key={ach.id}
                className={`glass-panel border rounded-lg p-4 flex items-center gap-4 transition-all ${
                  ach.unlocked
                    ? 'border-cyan-400/30 bg-cyan-500/5'
                    : 'border-white/5 opacity-40'
                }`}
              >
                {/* Badge Trophy Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  ach.unlocked
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-400/5'
                    : 'border-white/10 bg-white/5 text-white/20'
                }`}>
                  {ach.unlocked ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <Award className="w-6 h-6" />
                  )}
                </div>

                {/* Achievement descriptions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-xs text-white font-bold uppercase truncate">
                      {ach.title}
                    </h4>
                    {ach.unlocked && (
                      <span className="text-[8px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-400/20">
                        + {ach.xp} XP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 font-sans mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>
                  <span className="text-[9px] font-mono text-white/30 uppercase mt-1 block">
                    REQUIREMENT: {ach.requirement}
                  </span>
                </div>

                {/* Lock indicator */}
                <div className="flex-shrink-0 text-right">
                  <span className={`text-[10px] font-mono uppercase font-bold ${
                    ach.unlocked ? 'text-cyan-400' : 'text-white/20'
                  }`}>
                    {ach.unlocked ? 'UNLOCKED' : 'SECURE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
