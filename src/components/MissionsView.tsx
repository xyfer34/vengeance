/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Plus, CheckCircle2, Trophy, Clock, Star, Trash2 } from 'lucide-react';
import { Mission } from '../types';
import { synth } from '../utils/audio';

interface MissionsViewProps {
  missions: Mission[];
  onAddMission: (title: string, description: string, rewardXp: number, type: 'daily' | 'weekly' | 'custom') => void;
  onClaimMission: (id: string) => void;
  onDeleteMission: (id: string) => void;
  dailyStreak: number;
  weeklyStreak: number;
}

export default function MissionsView({
  missions,
  onAddMission,
  onClaimMission,
  onDeleteMission,
  dailyStreak,
  weeklyStreak,
}: MissionsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'custom'>('all');
  
  // Custom mission form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reward, setReward] = useState(100);

  const filteredMissions = missions.filter(m => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    synth.success();
    onAddMission(title, desc, Number(reward), 'custom');
    setTitle('');
    setDesc('');
    setReward(100);
    setShowAddForm(false);
  };

  const handleClaim = (id: string) => {
    synth.levelUp();
    onClaimMission(id);
  };

  const handleDelete = (id: string) => {
    synth.metalClick();
    onDeleteMission(id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-1">
      
      {/* Left Column: Mission Deck Selector & Streaks */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Streak Monitor */}
        <div className="glass-panel border border-white/5 rounded-lg p-5">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2 block">
            STREAK MONITOR
          </span>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white/5 rounded border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-display font-black text-white glow-text-specter">⚡ {dailyStreak}</span>
              <span className="text-[9px] font-mono text-white/40 uppercase mt-1">DAILY CHAIN</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-display font-black text-cyan-400">🔥 {weeklyStreak}</span>
              <span className="text-[9px] font-mono text-cyan-400 uppercase mt-1">WEEKLY CHAIN</span>
            </div>
          </div>
          <p className="text-[9px] font-mono text-white/35 mt-3 uppercase text-center leading-relaxed">
            Consistently log cognitive diagnostics to keep the logical network operational.
          </p>
        </div>

        {/* Mission Type Tabs */}
        <div className="glass-panel border border-white/5 rounded-lg p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-white/40 uppercase border-b border-white/5 pb-2 block">
            MISSION DIRECTORIES
          </span>
          {[
            { id: 'all', label: 'All Operations' },
            { id: 'daily', label: 'Daily Objectives' },
            { id: 'weekly', label: 'Weekly Assignments' },
            { id: 'custom', label: 'Custom Intel Directives' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { synth.click(); setActiveTab(tab.id as any); }}
              className={`w-full p-2 text-xs font-mono rounded text-left border transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 bg-cyan-500/10 text-white'
                  : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Custom Directive Trigger */}
        <button
          onClick={() => { synth.metalClick(); setShowAddForm(prev => !prev); }}
          className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs tracking-widest rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>DECLASSIFY CUSTOM DIRECTIVE</span>
        </button>

      </div>

      {/* Right Column: Mission cards viewport */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Create Form Modal overlay or slide-down */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel border border-cyan-400/20 rounded-lg p-5 overflow-hidden flex flex-col gap-4"
            >
              <h3 className="font-display text-xs text-white font-bold uppercase tracking-wider">
                DECLARE SECURE INTELLIGENCE DIRECTIVE (CUSTOM MISSION)
              </h3>
              <form onSubmit={handleSubmitCustom} className="flex flex-col gap-3 font-mono text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 uppercase text-[9px]">Directive Objective Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Code logical parser backend, Study forensic chemistry..."
                    className="bg-black border border-white/10 rounded px-3 py-1.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 uppercase text-[9px]">Directive Parameters Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe specific criteria required to achieve override clearance..."
                    className="bg-black border border-white/10 rounded px-3 py-1.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 uppercase text-[9px]">Assigned XP Reward</label>
                  <select
                    className="bg-black border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400/40"
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value))}
                  >
                    <option value={50}>50 XP (Minor action)</option>
                    <option value={100}>100 XP (Standard calibration)</option>
                    <option value={200}>200 XP (Significant breakthrough)</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => { synth.click(); setShowAddForm(false); }}
                    className="px-3 py-1.5 border border-white/10 text-white/50 hover:text-white rounded"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-500 text-black font-bold rounded"
                  >
                    DEPLOY DIRECTIVE
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission Deck */}
        <div className="flex flex-col gap-4">
          {filteredMissions.length === 0 ? (
            <div className="glass-panel border border-white/5 rounded-lg p-12 text-center text-white/30 font-mono">
              <ShieldAlert className="w-10 h-10 text-white/10 mb-3 mx-auto animate-pulse" />
              <h3 className="font-display text-sm text-white/50 font-bold uppercase mb-1">ALL REGIME DIRECTIVES RESOLVED</h3>
              <p className="text-[10px] uppercase">
                Initialize custom tasks or complete active streaks to populate the core operations ledger.
              </p>
            </div>
          ) : (
            filteredMissions.map(m => (
              <motion.div
                key={m.id}
                layout
                className={`glass-panel border rounded-lg p-5 flex flex-col justify-between transition-all ${
                  m.completed 
                    ? m.claimed 
                      ? 'border-white/5 bg-white/5 opacity-55'
                      : 'border-green-500/30 bg-green-500/5'
                    : 'border-white/5 hover:border-cyan-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase border ${
                        m.type === 'daily' 
                          ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400' 
                          : m.type === 'weekly' 
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                          : 'border-purple-500/20 bg-purple-500/10 text-purple-400'
                      }`}>
                        {m.type}
                      </span>
                      {m.completed && !m.claimed && (
                        <span className="text-[9px] font-mono text-green-400 font-bold uppercase animate-pulse">
                          ✔ CLUES UNLOCKED
                        </span>
                      )}
                    </div>
                    <h4 className={`font-display text-sm font-bold text-white uppercase ${m.completed && 'line-through text-white/40'}`}>
                      {m.title}
                    </h4>
                    <p className={`text-xs text-white/60 font-sans mt-1 leading-relaxed ${m.completed && 'text-white/30'}`}>
                      {m.description}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-cyan-400">+{m.rewardXp} XP</span>
                    {m.type === 'custom' && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="mt-2 text-white/20 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete directive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/5 pt-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[9px] font-mono text-white/30 mb-1">
                      <span>TACTICAL PARAMETER PROGRESS</span>
                      <span>{m.progress}/{m.maxProgress}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${m.completed ? 'bg-green-400' : 'bg-cyan-400'}`}
                        style={{ width: `${(m.progress / m.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>

                  {m.completed ? (
                    m.claimed ? (
                      <span className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-white/30 uppercase">
                        ARCHIVED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaim(m.id)}
                        className="px-4 py-1 bg-green-500 hover:bg-green-600 text-black font-display font-bold text-[10px] tracking-widest rounded transition-colors cursor-pointer"
                      >
                        CLAIM XP
                      </button>
                    )
                  ) : (
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-white/30 uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
