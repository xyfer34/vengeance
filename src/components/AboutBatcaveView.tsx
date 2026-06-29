/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Swords, Sparkles, ShieldAlert, Folder, BarChart3, User, BookOpen, 
  HelpCircle, ChevronRight, Award, Play, CheckCircle2, Cpu, Zap, Info, Key, Flame
} from 'lucide-react';
import { synth } from '../utils/audio';

interface TabDetail {
  id: string;
  name: string;
  icon: any;
  purpose: string;
  features: string[];
  masteryTips: string[];
  complexity: 'Standard' | 'Tactical' | 'Classified';
}

export default function AboutBatcaveView() {
  const [selectedTabId, setSelectedTabId] = useState<string>('dashboard');
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const systemTabs: TabDetail[] = [
    {
      id: 'dashboard',
      name: 'Operations',
      icon: Terminal,
      purpose: 'The central nerve center of Vengeance OS. Provides real-time atmospheric diagnostics, user standing (XP and streak progression), immediate mainframe prompt shortcuts, and secure system event logs.',
      features: [
        'Welcome Greeting Card: Displays security node activation alerts and central instructions.',
        'Environmental Atmospheric Widget: Monitors overcast smog and toxic particulates synced at custom coordinates (29.882832° N, 77.884408° E).',
        'Standing Monitor: Tracks your level progress bar, total accumulated XP, and consecutive active day streak.',
        'Recommended Deployment: One-click launcher to immediate daily cognitive challenge goals for +100 bonus XP.',
        'Direct Intel Assistant: Simple input bar bypassing subviews to post immediate requests to the AI mainframe.',
        'Secure System Logs: Audit trails tracking recent training runs, latency milestones, and daemon status.'
      ],
      masteryTips: [
        "Check the Environmental Widget coordinates—they are pinned to Roorkee, India, serving as the system's core weather anchor.",
        "Deploy the Daily Intelligence Chip at least once every 24 hours to preserve your active streak multiplier."
      ],
      complexity: 'Standard'
    },
    {
      id: 'training',
      name: 'Cognitive',
      icon: Swords,
      purpose: 'The tactical neural gym designed to refine core intelligence matrices: logic parsing, visual comprehension, quick cipher resolution, and motor-reflex reaction speeds.',
      features: [
        'Sequence Lock (Logic): A dynamic matrix puzzle. Crack sequence intervals or arithmetic progressions against a countdown timer.',
        'Target Reticle (Observation): Rapid visual grid matching. Memorize flashed dots or shapes and select the correct target locations.',
        'Cipher Decryption (Memory): Solve complex numeric caesar-shifts and alphanumeric substitutions under pressure.',
        'Reflex Latency (Reaction): Measures physical delay. Click on rapidly changing vector signals to record microsecond latency stats.'
      ],
      masteryTips: [
        'Reflex training logs scores under 200ms with a special "Tactical" grading badge. Minimize peripheral distractions before starting.',
        'If stuck on Logic numeric sequences, try finding common differences between adjacent terms first. Speed increases raw multiplier score.'
      ],
      complexity: 'Tactical'
    },
    {
      id: 'assistant',
      name: 'AI Mainframe',
      icon: Sparkles,
      purpose: 'Secure uplink connection to the Vengeance OS Tactical Intelligence Unit. Powered by Gemini, this module acts as your personal master detective consultant.',
      features: [
        'Structured Report Generators: Auto-format outputs into summarizing grids, threat hierarchies, or action maps.',
        'Tactical Hypotheses: Solicit up to three mathematically graded threat hypotheses based on raw investigative transcripts.',
        'Vision Scanner (Image Support): Upload suspect photos, forensic slides, or raw sketches to analyze structural clues in real-time.',
        'Historical Threading: Context-aware memory preservation lets you build deep conversational theory maps.'
      ],
      masteryTips: [
        'Use the preset macro modes (Summarize, Brainstorm, Explain) to instantly get perfectly structured intelligence layouts.',
        'You can drop base64 image data directly into the mainframe to run visual threat-level cross-references.'
      ],
      complexity: 'Classified'
    },
    {
      id: 'missions',
      name: 'Directives',
      icon: ShieldAlert,
      purpose: 'Operational ledger keeping track of active directives, recurring weekly protocols, and highly sensitive, high-XP campaign achievements.',
      features: [
        'Directives Queue: Tracks active short-term intelligence tasks (e.g., complete reaction tests).',
        'Weekly Protocols: High-level weekly tasks requiring sustained operational consistency.',
        'Instant Database Updates: Dynamically updates completion percentages based on system activity (e.g., adding clues to the Database).',
        'Manual Custom Directives: Define custom operations with custom title, details, and XP payloads to tailormake your training plan.'
      ],
      masteryTips: [
        'Custom directives can be logged manually. Use this to track external physical field operations or study sessions.',
        'Claim completed directive rewards immediately by clicking the glowing "SECURE PAYLOAD" trigger to deposit the XP.'
      ],
      complexity: 'Standard'
    },
    {
      id: 'database',
      name: 'Database',
      icon: Folder,
      purpose: 'The secure intelligence repository. Allows operatives to record, catalog, organize, and perform advanced AI evaluations on active clues, dossiers, and forensic writeups.',
      features: [
        'Document Presets: Quick templates for "Suspect Dossier", "Autopsy Forensic Scan", and "Case Timeline Log".',
        'Tagging & Folders: Group intel under folders like "Investigations", "Suspect Profiles", or "Forensic Reports" and custom search tags.',
        'AI Clue Synthesizer: Run a specialized Gemini-powered deduction model on selected notes to draw hidden correlations.',
        'Mainframe Syncing: Highlighted database notes can be ported back into the direct AI chat context at will.'
      ],
      masteryTips: [
        "Use the template injector to format consistent suspect profile folders. A neat database yields better searchable navigation.",
        "Don't forget to write descriptive tag keys. They enable rapid search-palette filtering in high-intensity scenarios."
      ],
      complexity: 'Tactical'
    },
    {
      id: 'analytics',
      name: 'Performance',
      icon: BarChart3,
      purpose: 'The telemetry center visualizing cognitive strengths and long-term diagnostic histories through modern charting structures.',
      features: [
        'Cognitive Radar Grid: Interactive radar showing active capabilities (Observation, Deduction, Analysis, Memory, Reaction).',
        'Diagnostic Timelines: Line charts displaying XP velocity, test records, and scores over time.',
        'Sub-Millisecond Stat Counters: Fast visual trackers for minimum latency and average comprehension metrics.',
        'Live Biometric Feed: An authentic mock-telemetry loop reporting current processor temperature and core frequencies.'
      ],
      masteryTips: [
        'The Radar Grid updates instantly after completing any exercise in the Cognitive gym. Aim to equalize the polygon for complete balance.',
        'Keep an eye on the Biometric loop—it is linked to actual dev server responsiveness, reflecting live core execution.'
      ],
      complexity: 'Tactical'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      purpose: 'Personal operative credentials hub. Handles global environment variables, sound synthesizer modules, aesthetic custom skins, and unlocked achievement badges.',
      features: [
        'Aesthetic Custom Themes: Toggle between Specter Cyan, Vengeance Rose (high-threat), and Tactical Amber core colors.',
        'Audio Synthesizer Controls: Adjust the multi-oscillator audio engine toggle providing interactive soundscapes.',
        'Achievement Badge Registry: Lists high-level medals (e.g., "Mainframe Link", "Super Reflexes") unlocked through active achievements.',
        'Emergency Purge Trigger: Reset local system variables, cleaning the local storage buffer instantly.'
      ],
      masteryTips: [
        'Unlocking all badges takes continuous dedication. Some badges require high levels or long daily streaks.',
        'Toggle themes depending on room lighting: Specter Cyan is optimized for twilight operations, while Tactical Amber minimizes eye stress.'
      ],
      complexity: 'Standard'
    }
  ];

  const handleTabSelect = (tabId: string) => {
    synth.metalClick();
    setSelectedTabId(tabId);
  };

  const activeTabDetails = systemTabs.find(t => t.id === selectedTabId) || systemTabs[0];
  const ActiveIcon = activeTabDetails.icon;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-1 font-sans">
      
      {/* Top Welcome Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-cyan-400/20 rounded-lg p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
              <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
              <span>VENGEANCE OS OPERATIONS MANUAL</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white uppercase">
              ABOUT THE BAT CAVE
            </h1>
            <p className="text-white/60 text-xs mt-1 font-mono max-w-xl">
              Welcome, Operative. This directory acts as the authoritative knowledge base for Vengeance OS.
              Browse through the systems below to achieve immediate operational mastery.
            </p>
          </div>
          
          <button 
            onClick={() => {
              synth.success();
              setShowCheatSheet(prev => !prev);
            }}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-black text-xs font-mono font-bold rounded tracking-wider flex items-center gap-2 transition-colors cursor-pointer self-stretch md:self-auto text-center justify-center"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showCheatSheet ? "CLOSE SPECIFICATIONS" : "SYSTEM CHEAT SHEET"}</span>
          </button>
        </div>
      </motion.div>

      {/* Cheat Sheet Section */}
      <AnimatePresence>
        {showCheatSheet && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel border border-cyan-400/20 rounded-lg p-5 bg-cyan-950/10 font-mono text-xs text-white/80 flex flex-col gap-3">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">VENGEANCE OS SYSTEM SPECIFICATIONS</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-cyan-500/10 pt-3">
                <div>
                  <span className="text-white/40 block uppercase text-[10px]">OS Environment</span>
                  <span className="text-white">Full-Stack Cloud Node v4.0.2</span>
                </div>
                <div>
                  <span className="text-white/40 block uppercase text-[10px]">Server Engine</span>
                  <span className="text-white">Express API + Vite Middleware</span>
                </div>
                <div>
                  <span className="text-white/40 block uppercase text-[10px]">Database Layer</span>
                  <span className="text-white">Secured Client-Side Cache + Persistence</span>
                </div>
                <div>
                  <span className="text-white/40 block uppercase text-[10px]">Primary AI Core</span>
                  <span className="text-white">Google Gemini 3.5 Flash Model</span>
                </div>
                <div>
                  <span className="text-white/40 block uppercase text-[10px]">Sound Synthesis</span>
                  <span className="text-white">Web Audio Custom Synth Osc</span>
                </div>
                <div>
                  <span className="text-white/40 block uppercase text-[10px]">Thermal Status</span>
                  <span className="text-green-400">NOMINAL (38°C)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Guide Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Nav column - App Directory */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest px-2 mb-1">
            OS MODULE DIRECTORY
          </div>
          
          {systemTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = tab.id === selectedTabId;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected 
                    ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-500/5' 
                    : 'bg-black/30 border-white/5 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40'}`}>
                    <TabIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider">{tab.name}</span>
                    <span className="text-[9px] font-mono opacity-50 capitalize">{tab.complexity} Level</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-cyan-400' : 'text-white/20'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Detail columns (Spans 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main Info Tab Card */}
          <motion.div
            key={selectedTabId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col justify-between h-full relative"
          >
            <div className="absolute top-2 right-3 font-mono text-[9px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
              {activeTabDetails.complexity} Core
            </div>

            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">
                    {activeTabDetails.name} Tab
                  </h3>
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                    SYSTEM COMPONENT: {activeTabDetails.id.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Purpose */}
              <div className="mb-6">
                <h4 className="text-[10px] font-mono text-white/40 uppercase mb-2 tracking-wider flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-cyan-400/60" />
                  <span>OPERATIONAL PURPOSE</span>
                </h4>
                <p className="text-xs text-white/80 font-mono leading-relaxed bg-white/5 p-3.5 rounded border border-white/5">
                  {activeTabDetails.purpose}
                </p>
              </div>

              {/* Inside the Tab Features */}
              <div className="mb-6">
                <h4 className="text-[10px] font-mono text-white/40 uppercase mb-2.5 tracking-wider flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400/60" />
                  <span>WHAT'S INSIDE THE TAB</span>
                </h4>
                <div className="flex flex-col gap-2.5">
                  {activeTabDetails.features.map((feat, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 mt-1.5 flex-shrink-0" />
                      <span className="font-sans leading-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mastery Tips */}
              <div>
                <h4 className="text-[10px] font-mono text-white/40 uppercase mb-2.5 tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>TACTICAL MASTERY SECRETS</span>
                </h4>
                <div className="flex flex-col gap-2.5">
                  {activeTabDetails.masteryTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-amber-300/90 bg-amber-500/5 p-3 rounded border border-amber-500/10 font-mono">
                      <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-8 border-t border-white/5 pt-4 flex justify-between items-center text-[9px] font-mono text-white/30">
              <span>VENGEANCE OS SECURE MANUAL</span>
              <span>NODE: SECURE_KNOWLEDGE_BASE</span>
            </div>
          </motion.div>
          
        </div>

      </div>

      {/* Mastery Badge Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-white/5 rounded-lg p-5 bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">CRACK THE CIPHER STREAKS</h4>
            <p className="text-[11px] text-white/60 font-mono leading-relaxed mt-0.5">
              Reviewing the system guide increases tactical efficacy. Test your fresh understanding by launching a Decryption sequence or logic solver!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 border border-cyan-400/30 bg-cyan-500/5 px-3 py-1.5 rounded uppercase select-none flex-shrink-0">
          <span>COGNITIVE ACCURACY +20%</span>
        </div>
      </motion.div>

    </div>
  );
}
