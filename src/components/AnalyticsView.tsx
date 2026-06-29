/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Target, Zap, Brain, Eye } from 'lucide-react';
import { TrainingHistory } from '../types';
import { synth } from '../utils/audio';

interface AnalyticsViewProps {
  history: TrainingHistory[];
}

export default function AnalyticsView({ history }: AnalyticsViewProps) {
  
  // Calculate metric aggregates
  const observationRuns = history.filter(h => h.type === 'observation');
  const memoryRuns = history.filter(h => h.type === 'memory');
  const logicRuns = history.filter(h => h.type === 'logic');
  const reactionRuns = history.filter(h => h.type === 'reaction' && h.score < 999); // filter misfires

  const totalRounds = history.length;
  
  const bestReaction = reactionRuns.length > 0 ? Math.min(...reactionRuns.map(r => r.score)) : null;
  const avgMemory = memoryRuns.length > 0 ? Math.round(memoryRuns.reduce((sum, r) => sum + r.score, 0) / memoryRuns.length) : null;
  const avgLogic = logicRuns.length > 0 ? Math.round(logicRuns.reduce((sum, r) => sum + r.score, 0) / logicRuns.length) : null;
  const avgObservation = observationRuns.length > 0 ? Math.round(observationRuns.reduce((sum, r) => sum + r.score, 0) / observationRuns.length) : null;

  // 1. Skill Radar Profile data
  // Observation, Memory, Logic, Reaction, Deduction, Intelligence Analysis
  const getRadarScore = (type: string, base: number) => {
    const runs = history.filter(h => h.type === type);
    if (runs.length === 0) return base;
    if (type === 'reaction') {
      const best = Math.min(...runs.map(r => r.score));
      return Math.max(30, Math.min(100, Math.round(((400 - best) / 250) * 100)));
    } else {
      return Math.round(runs.reduce((sum, r) => sum + r.score, 0) / runs.length);
    }
  };

  const radarData = [
    { subject: 'Observation', A: getRadarScore('observation', 40), fullMark: 100 },
    { subject: 'Memory', A: getRadarScore('memory', 35), fullMark: 100 },
    { subject: 'Logic', A: getRadarScore('logic', 50), fullMark: 100 },
    { subject: 'Reaction', A: getRadarScore('reaction', 30), fullMark: 100 },
    { subject: 'Deduction', A: Math.round((getRadarScore('logic', 50) + getRadarScore('observation', 40)) / 2), fullMark: 100 },
    { subject: 'Analysis', A: Math.round((getRadarScore('observation', 40) + getRadarScore('memory', 35) + getRadarScore('logic', 50)) / 3), fullMark: 100 },
  ];

  // 2. Trajectory Progression line chart data
  // Combine runs chronologically or just create a combined list of runs mapped to index 1..N
  const lineChartData = history
    .slice(-10) // show last 10 runs
    .map((run, idx) => {
      const date = new Date(run.timestamp);
      const timeLabel = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      // Calculate normalized score (0-100) for line chart compatibility
      let normScore = run.score;
      if (run.type === 'reaction') {
        normScore = Math.max(0, Math.min(100, Math.round(((400 - run.score) / 250) * 100)));
      }

      return {
        name: `R-${idx + 1}`,
        score: normScore,
        type: run.type.toUpperCase(),
        time: timeLabel,
      };
    });

  const handleRefresh = () => {
    synth.metalClick();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1 max-w-7xl mx-auto">
      
      {/* Left Column: Aggregates list */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Total Diagnostics Header */}
        <div className="glass-panel border border-white/5 rounded-lg p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
            <BarChart3 className="w-4 h-4 animate-pulse" />
            <span>METRIC AGGREGATES</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-white">{totalRounds}</span>
            <span className="text-xs font-mono text-white/40 uppercase">DIAGNOSTIC RUNS RESOLVED</span>
          </div>
        </div>

        {/* Categories breakdown cards */}
        <div className="grid grid-cols-2 gap-4">
          
          <div className="glass-panel border border-white/5 rounded p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-white/40 uppercase">REFLEX LATENCY</span>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-display font-black text-lg text-white">
              {bestReaction ? `${bestReaction}ms` : '---'}
            </div>
            <span className="text-[8px] font-mono text-cyan-400/80 uppercase mt-1">BEST VELOCITY</span>
          </div>

          <div className="glass-panel border border-white/5 rounded p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-white/40 uppercase">MEMORY ARRAY</span>
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-display font-black text-lg text-white">
              {avgMemory ? `${avgMemory}%` : '---'}
            </div>
            <span className="text-[8px] font-mono text-cyan-400/80 uppercase mt-1">AVG EFFICIENCY</span>
          </div>

          <div className="glass-panel border border-white/5 rounded p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-white/40 uppercase">DEDUCTIVE CORE</span>
              <Target className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-display font-black text-lg text-white">
              {avgLogic ? `${avgLogic}%` : '---'}
            </div>
            <span className="text-[8px] font-mono text-cyan-400/80 uppercase mt-1">AVG SOLVE RATE</span>
          </div>

          <div className="glass-panel border border-white/5 rounded p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-white/40 uppercase">OBSERVATION COMP</span>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-display font-black text-lg text-white">
              {avgObservation ? `${avgObservation}%` : '---'}
            </div>
            <span className="text-[8px] font-mono text-cyan-400/80 uppercase mt-1">AVG COMPREHENSION</span>
          </div>

        </div>

        {/* Skill description logs */}
        <div className="glass-panel border border-white/5 rounded-lg p-5 font-mono text-[10px] uppercase leading-relaxed flex-1">
          <span className="text-white/40 border-b border-white/5 pb-2 block mb-2 font-bold">TACTICAL METRIC FEED</span>
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
            <p className="text-white/60">
              - <span className="text-cyan-400">Deduction Index</span> measures mathematical sequence validation and Caesar-Shift decoding speeds.
            </p>
            <p className="text-white/60">
              - <span className="text-cyan-400">Reaction Index</span> records microseconds of tactile trigger delays. Lower ms increases precision standings.
            </p>
            <p className="text-white/60">
              - <span className="text-cyan-400">Observation Index</span> measures recall and grid component memory efficiency.
            </p>
          </div>
        </div>

      </div>

      {/* Middle & Right: Radar Profile and Trajectory Line chart */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Radar & Line Chart side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Radar Skill Profile */}
          <div className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest border-b border-white/5 pb-2 block w-full mb-4 text-center">
              COGNITIVE SKILL SPECTRUM
            </span>
            <div className="w-full h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: 'rgba(255, 255, 255, 0.3)', fontSize: 8 }}
                    axisLine={false} 
                  />
                  <Radar
                    name="Skill Score"
                    dataKey="A"
                    stroke="#00f0ff"
                    fill="#00f0ff"
                    fillOpacity={0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Line Chart trajectory */}
          <div className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest border-b border-white/5 pb-2 block w-full mb-4 text-center">
              IMPROVEMENT TRAJECTORY
            </span>
            
            {lineChartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-white/30 font-mono text-[10px] uppercase">
                <span>Awaiting diagnostic runs to build trajectory graphs</span>
              </div>
            ) : (
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 9, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 9, fontFamily: 'monospace' }} 
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09090d', borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'monospace', fontSize: '10px' }}
                      itemStyle={{ color: '#00f0ff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#00f0ff" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#00f0ff', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

        {/* Growth analysis card */}
        <div className="glass-panel border border-white/5 rounded-lg p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/20" />
          <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/20 text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display text-xs text-white font-bold uppercase tracking-wider mb-1">
              Mainframe Performance Assessment
            </h4>
            <p className="text-xs text-white/60 font-sans leading-relaxed">
              {totalRounds === 0 
                ? "Complete cognitive diagnostics in the Training deck to map your performance vectors. Current index: Uncalibrated."
                : `Active analysis indicates positive cognitive adaptation. Average logic decoder rates exceed ${avgLogic || 50}%. Keep resolving daily objectives to solidify master standing.`}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
