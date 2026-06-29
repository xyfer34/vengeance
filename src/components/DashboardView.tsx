/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, Shield, Swords, Calendar, Clock, CloudAlert, Sparkles, Plus, Play, History, ArrowRight, Newspaper, Rss, ArrowUpRight, Activity, Globe, Cpu } from 'lucide-react';
import { Mission, TrainingHistory, UserState } from '../types';
import { synth } from '../utils/audio';

interface DashboardViewProps {
  userState: UserState;
  missions: Mission[];
  history: TrainingHistory[];
  onNavigate: (page: string) => void;
  onDeployAssistantQuery: (query: string) => void;
  onStartDailyChallenge: () => void;
}

export default function DashboardView({
  userState,
  missions,
  history,
  onNavigate,
  onDeployAssistantQuery,
  onStartDailyChallenge,
}: DashboardViewProps) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [fastQuery, setFastQuery] = useState('');

  // Times of India News Feed States
  const [newsCategory, setNewsCategory] = useState<'technology' | 'crimes' | 'stocks' | 'world'>('world');
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Live news synchronizer
  useEffect(() => {
    let active = true;
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await fetch(`/api/news?category=${newsCategory}`);
        if (!res.ok) throw new Error('Failed to fetch news from local API');
        const data = await res.json();
        if (active && data.success) {
          setNewsArticles(data.articles || []);
        }
      } catch (err) {
        console.error('[Dashboard News] Error synchronizing news:', err);
        if (active) {
          setNewsError('Mainframe link disrupted. Failed to synchronize real-time TOI dispatch feeds.');
        }
      } finally {
        if (active) setNewsLoading(false);
      }
    };
    fetchNews();
    return () => {
      active = false;
    };
  }, [newsCategory]);

  // Live futuristic clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const activeMissions = missions.filter(m => !m.completed);
  const completedMissionsCount = missions.filter(m => m.completed).length;
  const missionProgressPercent = missions.length > 0 ? (completedMissionsCount / missions.length) * 100 : 0;

  // Compute skill averages from history
  const getAverage = (type: string) => {
    const typeRuns = history.filter(h => h.type === type);
    if (typeRuns.length === 0) return 30; // base progress
    if (type === 'reaction') {
      // reaction: lower is better. 400ms is 0%, 150ms is 100%
      const best = Math.min(...typeRuns.map(r => r.score));
      const score = Math.max(0, Math.min(100, Math.round(((400 - best) / 250) * 100)));
      return score;
    } else {
      const avg = typeRuns.reduce((sum, r) => sum + r.score, 0) / typeRuns.length;
      return Math.round(avg);
    }
  };

  const skills = [
    { name: 'Observation', val: getAverage('observation'), desc: 'Pattern and structural detection' },
    { name: 'Memory Match', val: getAverage('memory'), desc: 'Working retention visual latency' },
    { name: 'Deduction Logic', val: getAverage('logic'), desc: 'Cipher parsing and rational sequence' },
    { name: 'Reaction Velocity', val: getAverage('reaction'), desc: 'Cognitive reflex trigger speed' },
  ];

  const handleQuickAction = (page: string) => {
    synth.metalClick();
    onNavigate(page);
  };

  const handleSendFastQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastQuery.trim()) return;
    synth.metalClick();
    onDeployAssistantQuery(fastQuery);
    setFastQuery('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-1 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: GREETINGS & CENTRAL TIMELINE */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Welcome Tactical Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-white/5 rounded-lg p-6 relative overflow-hidden"
          >
            {/* Subtle neon glowing horizontal strip */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right bg-cyan-400" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">
                  <Terminal className="w-3.5 h-3.5 animate-pulse" />
                  <span>SECURE TERMINAL NODE ACTIVATED</span>
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white mb-2">
                  WELCOME BACK, AGENT
                </h1>
                <p className="text-white/60 text-sm max-w-md font-sans">
                  The intelligence grid is active. Daily training is available, and local database archives are synced. Start your diagnostic run.
                </p>
              </div>

              {/* Futuristic Clock Widget */}
              <div className="glass-panel border border-white/10 rounded-md p-4 flex flex-col items-end justify-center min-w-[170px]">
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono uppercase mb-1">
                  <Clock className="w-3 h-3" />
                  <span>SYSTEM TIME</span>
                </div>
                <div className="font-display font-bold text-xl text-white tracking-widest glow-text-specter">
                  {timeStr || '00:00:00'}
                </div>
                <div className="text-[10px] text-cyan-400/80 font-mono uppercase mt-1 tracking-wider flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{dateStr || 'Retrieving...'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Analytics & Progress Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* XP & Progression */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider">AGENT STANDING</span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  CLASS: MASTER DETECTIVE
                </span>
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-xs text-white/40 font-mono">LEVEL</div>
                  <div className="text-3xl font-display font-black text-white">{userState.level}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/40 font-mono">STREAK</div>
                  <div className="text-sm font-display font-bold text-cyan-400">
                    ⚡ {userState.dailyStreak} DAYS ACTIVE
                  </div>
                </div>
              </div>

              {/* XP progress bar */}
              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5 p-[1px] mb-2">
                <motion.div 
                  className="bg-cyan-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(userState.xp / userState.nextLevelXp) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>XP: {userState.xp}</span>
                <span>NEXT LEVEL: {userState.nextLevelXp} XP</span>
              </div>
            </motion.div>

            {/* Missions Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider">MISSION CONTROL</span>
                <span className="text-xs font-mono text-white/30">
                  {completedMissionsCount}/{missions.length} SOLVED
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-white/5 fill-transparent" strokeWidth="4" />
                    <motion.circle 
                      cx="28" cy="28" r="24" 
                      className="stroke-cyan-400 fill-transparent" 
                      strokeWidth="4"
                      strokeDasharray={150.7}
                      initial={{ strokeDashoffset: 150.7 }}
                      animate={{ strokeDashoffset: 150.7 - (150.7 * missionProgressPercent) / 100 }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <span className="absolute text-xs font-display text-white font-bold">
                    {Math.round(missionProgressPercent)}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-white/80 font-bold mb-0.5 truncate">
                    {activeMissions.length > 0 ? activeMissions[0].title : 'All Clear'}
                  </div>
                  <div className="text-[10px] text-white/40 truncate">
                    {activeMissions.length > 0 ? activeMissions[0].description : 'No active operations'}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleQuickAction('missions')}
                className="mt-3 text-left flex items-center justify-between text-[10px] font-mono text-cyan-400/80 hover:text-cyan-400 group transition-all"
              >
                <span>ACCESS DEPLOYED MISSIONS</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

          </div>

          {/* Skill Diagnostic Bars */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel border border-white/5 rounded-lg p-5"
          >
            <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
              COGNITIVE DIAGNOSTICS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {skills.map((sk) => (
                <div key={sk.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/80 font-bold">{sk.name}</span>
                    <span className="text-cyan-400 font-bold">{sk.val}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded overflow-hidden p-[1px]">
                    <motion.div 
                      className="bg-cyan-400/70 h-full rounded-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${sk.val}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-[9px] text-white/30 font-mono uppercase">{sk.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: CYBERNETIC FEEDS & QUICK ACTIONS */}
        <div className="flex flex-col gap-6">

          {/* Environmental Atmospheric Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel border border-white/5 rounded-lg p-5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">ATMOSPHERE ARCHIVE</span>
                <h4 className="font-display text-sm font-bold text-white tracking-wide uppercase">OVERCAST SMOG</h4>
                <div className="text-[9px] font-mono text-cyan-400 mt-1 uppercase tracking-wider">COORDS: 29.882832° N, 77.884408° E</div>
              </div>
              <CloudAlert className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
              <div>
                <div className="text-[9px] font-mono text-white/30 uppercase">THERMAL RESISTANCE</div>
                <div className="text-sm font-display font-bold text-white">11.4 °C</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-white/30 uppercase">BAROMETRIC PRESSURE</div>
                <div className="text-sm font-display font-bold text-white">1009 hPa</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-white/30 uppercase">WIND INDEX</div>
                <div className="text-sm font-display font-bold text-white">NW 14.8 km/h</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-white/30 uppercase">TOXIC PARTICULATES</div>
                <div className="text-sm font-display font-bold text-cyan-400">42 PPM (STABLE)</div>
              </div>
            </div>
          </motion.div>

          {/* Daily Challenge Card */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel border border-white/5 rounded-lg p-5 bg-gradient-to-br from-cyan-500/5 to-transparent relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">RECOMMENDED DEPLOYMENT</h4>
            <h3 className="font-display text-sm font-bold text-white mb-2 uppercase">DAILY INTELLIGENCE CHIP</h3>
            <p className="text-xs text-white/60 mb-4 font-mono">
              Crack a security encryption cipher in the Logic trainer to maintain your active streak. (Reward: +100 XP)
            </p>
            <button 
              onClick={() => {
                synth.success();
                onStartDailyChallenge();
              }}
              className="w-full py-2 border border-cyan-400/30 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400/20" />
              <span>DEPLOY COGNITIVE SUITE</span>
            </button>
          </motion.div>

          {/* Fast Tactical Prompt Terminal */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel border border-white/5 rounded-lg p-5"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-white/40 uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>DIRECT INTEL ASSISTANT</span>
            </div>
            <form onSubmit={handleSendFastQuery} className="flex gap-2">
              <input
                type="text"
                placeholder="Query tactical mainframe..."
                value={fastQuery}
                onChange={(e) => setFastQuery(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-cyan-400/40"
              />
              <button 
                type="submit"
                className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold p-1.5 rounded flex items-center justify-center cursor-pointer transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-[9px] text-white/30 font-mono leading-relaxed">
              Direct interface to the neural mainframe. Formulate inquiries, cross-reference data nodes, or trigger quick analyses instantly.
            </div>
          </motion.div>

          {/* Recent Activity Log */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel border border-white/5 rounded-lg p-5 flex-1 flex flex-col min-h-[180px]"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-white/40 uppercase mb-3 border-b border-white/5 pb-2">
              <History className="w-3.5 h-3.5" />
              <span>SECURE SYSTEM LOGS</span>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 max-h-[220px]">
              {history.length === 0 ? (
                <div className="text-[10px] text-white/30 font-mono py-8 text-center italic">
                  NO RECENT DIAGNOSTICS REGISTERED
                </div>
              ) : (
                history.slice(0, 5).map((log, idx) => (
                  <div key={log.id || idx} className="flex gap-2 font-mono text-[10px] leading-snug">
                    <span className="text-cyan-400/70 select-none">[{new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                    <div className="flex-1 text-white/70">
                      <span className="text-white font-bold capitalize">{log.type}</span> diagnostic completed. Score logged:{' '}
                      <span className="text-cyan-300 font-bold">
                        {log.type === 'reaction' ? `${log.score}ms` : `${log.score}%`}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div className="flex gap-2 font-mono text-[10px] leading-snug">
                <span className="text-white/30 select-none">[02:39]</span>
                <span className="text-white/40">Vengeance OS core daemon sync completed. Host safe.</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* WORLD INTELLIGENCE WIRE (TIMES OF INDIA) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden"
      >
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-transparent" />

        {/* Header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>WORLD INTELLIGENCE WIRE</span>
              </span>
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                THE TIMES OF INDIA DISPATCH
              </h3>
            </div>
          </div>

          {/* Categories Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            {[
              { id: 'world', label: 'WORLD', icon: Globe },
              { id: 'technology', label: 'TECHNOLOGY', icon: Cpu },
              { id: 'crimes', label: 'CRIME DEPT', icon: Shield },
              { id: 'stocks', label: 'STOCKS / STX', icon: Activity }
            ].map((cat) => {
              const CatIcon = cat.icon;
              const isSelected = newsCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    synth.metalClick();
                    setNewsCategory(cat.id as any);
                  }}
                  className={`px-3 py-1 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400'
                      : 'bg-black/40 border-white/5 text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CatIcon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable News Content Area */}
        <div className="min-h-[250px] max-h-[400px] overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {newsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10" />
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              </div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest animate-pulse">
                SYNCHRONIZING SECURE WIRE FEEDS...
              </span>
            </div>
          ) : newsError ? (
            <div className="text-center py-12 px-4 border border-red-500/10 bg-red-500/5 rounded flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-red-400 uppercase">{newsError}</span>
              <button
                onClick={() => setNewsCategory(newsCategory)}
                className="mt-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase rounded hover:bg-red-500/20 transition-colors"
              >
                RE-ESTABLISH CONNECTION
              </button>
            </div>
          ) : newsArticles.length === 0 ? (
            <div className="text-center py-16 text-white/30 font-mono text-xs italic">
              NO DISPATCHES AVAILABLE IN THIS DEPLOYMENT NODE
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newsArticles.map((art, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded border border-white/5 bg-black/30 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Small ambient highlight */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start text-[9px] font-mono text-white/40 uppercase">
                      <span className="flex items-center gap-1 text-cyan-400/80">
                        <Rss className="w-2.5 h-2.5" />
                        <span>TOI • {newsCategory}</span>
                      </span>
                      <span>{art.pubDate}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                      {art.title}
                    </h4>

                    <p className="text-[11px] text-white/60 font-sans leading-relaxed line-clamp-3">
                      {art.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-end">
                    <a
                      href={art.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-cyan-400/80 hover:text-cyan-400 flex items-center gap-1 tracking-wider uppercase transition-all"
                    >
                      <span>READ FULL ARTICLE</span>
                      <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wire Footer */}
        <div className="text-[9px] font-mono text-white/20 border-t border-white/5 pt-3 flex justify-between uppercase">
          <span>SOURCE MODEL: TIMES_OF_INDIA_RSS_MAIN</span>
          <span>SYNC INTERVAL: COGNITIVE REAL-TIME LOOP</span>
        </div>
      </motion.div>

    </div>
  );
}
