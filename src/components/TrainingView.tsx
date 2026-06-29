/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Eye, Brain, Zap, Play, CheckCircle2, RotateCcw, HelpCircle, Key, ShieldAlert, Dumbbell } from 'lucide-react';
import { TrainingHistory } from '../types';
import { synth } from '../utils/audio';
import ExerciseRegimenView from './ExerciseRegimenView';

interface TrainingViewProps {
  onAwardXp: (xp: number, message: string) => void;
  onLogHistory: (type: 'observation' | 'memory' | 'logic' | 'reaction' | 'workout', score: number, metadata?: string) => void;
  history: TrainingHistory[];
  triggerChallengeType?: 'logic' | 'reaction' | 'memory' | 'observation' | null;
  onClearChallengeTrigger?: () => void;
}

// 1. Observation Blueprints Data
const BLUEPRINTS = [
  {
    id: 'intel-blueprint-01',
    title: 'SECURE CYBERNETIC NEURAL CORE',
    description: 'Analyze security node frequencies, sub-grid terminals, and IP access ranges.',
    questions: [
      { question: 'What was the specific label of the orange alarm sensor in the southern quadrant?', options: ['NODE-X2', 'NODE-B4', 'CORE-S3', 'SIG-04'], answerIndex: 1 },
      { question: 'What was the exact primary subnet IP range visible on the core monitor?', options: ['192.168.8.1', '10.0.4.12', '172.16.88.1', '192.168.1.1'], answerIndex: 0 },
      { question: 'How many security camera terminals (labeled CAM) were active in the compound?', options: ['Two (CAM-01 & CAM-02)', 'Three (CAM-01, CAM-02 & CAM-03)', 'Four', 'None'], answerIndex: 1 },
    ],
  },
  {
    id: 'intel-blueprint-02',
    title: 'TACTICAL BASEMENT HQ LAYOUT',
    description: 'Meticulously scan ventilation ports, server columns, and emergency escape vectors.',
    questions: [
      { question: 'Which quadrant contained the primary power supply transformer?', options: ['North-West', 'South-East', 'South-West', 'Center Core'], answerIndex: 2 },
      { question: 'What chemical formula was labeled on the active ventilation canisters?', options: ['CO2', 'N2O-Gas', 'C4-H10', 'HFC-R134a'], answerIndex: 1 },
      { question: 'What color was the active status indicator of Server Column B?', options: ['Neon Cyan', 'Crimson Red', 'Toxic Yellow', 'Emerald Green'], answerIndex: 0 },
    ],
  }
];

export default function TrainingView({
  onAwardXp,
  onLogHistory,
  history,
  triggerChallengeType,
  onClearChallengeTrigger,
}: TrainingViewProps) {
  const [activeTab, setActiveTab] = useState<'selection' | 'observation' | 'memory' | 'logic' | 'reaction'>('selection');
  const [trainingBranch, setTrainingBranch] = useState<'cognitive' | 'exercise'>('cognitive');

  useEffect(() => {
    if (triggerChallengeType) {
      setTrainingBranch('cognitive');
      setActiveTab(triggerChallengeType);
      if (onClearChallengeTrigger) onClearChallengeTrigger();
    }
  }, [triggerChallengeType]);

  const handleSelectTab = (tab: typeof activeTab) => {
    synth.metalClick();
    setActiveTab(tab);
  };

  return (
    <div className="max-w-6xl mx-auto p-1 flex flex-col gap-6">
      
      {/* Tab Navigation header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">TRAINING MATRIX</span>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-cyan-400" />
            <span>BAT-TRAINING SANCTUM</span>
          </h1>
        </div>
        
        {trainingBranch === 'cognitive' && activeTab !== 'selection' && (
          <button
            onClick={() => handleSelectTab('selection')}
            className="px-3 py-1.5 border border-white/15 hover:border-white/40 text-white/70 text-xs font-mono rounded bg-white/5 transition-all cursor-pointer"
          >
            ← BACK TO COGNITIVE REGISTRY
          </button>
        )}
      </div>

      {/* 1. Cognitive vs 2. Exercise Branches Selector */}
      <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-lg max-w-md">
        <button
          onClick={() => {
            synth.metalClick();
            setTrainingBranch('cognitive');
          }}
          className={`flex-1 py-2 px-4 rounded text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            trainingBranch === 'cognitive'
              ? 'bg-cyan-500/15 border border-cyan-400 text-cyan-400'
              : 'border border-transparent text-white/55 hover:text-white hover:bg-white/5'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>1. COGNITIVE SUITE</span>
        </button>
        
        <button
          onClick={() => {
            synth.metalClick();
            setTrainingBranch('exercise');
          }}
          className={`flex-1 py-2 px-4 rounded text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            trainingBranch === 'exercise'
              ? 'bg-cyan-500/15 border border-cyan-400 text-cyan-400'
              : 'border border-transparent text-white/55 hover:text-white hover:bg-white/5'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>2. EXERCISE REGIMEN</span>
        </button>
      </div>

      {trainingBranch === 'cognitive' ? (
        <AnimatePresence mode="wait">
          {activeTab === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Observation Card */}
              <div className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/20 text-cyan-400">
                      <Eye className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-white/40">DIFFICULTY: HIGH</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    TACTICAL OBSERVATION
                  </h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
                    You are given 15 seconds to scrutinize a highly detailed intelligence blueprint containing coordinates, cameras, networks, and alarm systems. Test your short-term visual recollection and situational awareness.
                  </p>
                </div>
                <button
                  onClick={() => handleSelectTab('observation')}
                  className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs rounded tracking-widest transition-colors cursor-pointer"
                >
                  DEPLOY COMPREHENSION STUDY (+150 XP)
                </button>
              </div>

              {/* Memory Card */}
              <div className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/20 text-cyan-400">
                      <Brain className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-white/40">DIFFICULTY: MEDIUM</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    MEMORY ARRAY MATCH
                  </h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
                    Challenge your spatial recollection. Uncover and pair identical tactical symbols. Complete the grid in minimal moves and time. Choose between Standard (12 Tiles) or Master (16 Tiles) difficulty.
                  </p>
                </div>
                <button
                  onClick={() => handleSelectTab('memory')}
                  className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs rounded tracking-widest transition-colors cursor-pointer"
                >
                  DEPLOY MEMORY MATRIX (+100 XP)
                </button>
              </div>

              {/* Logic Card */}
              <div className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/20 text-cyan-400">
                      <Key className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-white/40">DIFFICULTY: EXPERT</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    DEDUCTION LOGIC PUZZLES
                  </h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
                    Engage rational logic processors. Crack dynamic cipher codes, identify numerical mathematical progressions, and solve security node equations. Correct ciphers award significant prestige.
                  </p>
                </div>
                <button
                  onClick={() => handleSelectTab('logic')}
                  className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs rounded tracking-widest transition-colors cursor-pointer"
                >
                  DEPLOY LOGICAL MATRIX (+200 XP)
                </button>
              </div>

              {/* Reaction Card */}
              <div className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/20 text-cyan-400">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-white/40">DIFFICULTY: LOW</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    REACTION VELOCITY TEST
                  </h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
                    Measure cognitive reflexes. Click as fast as humanly possible when the terminal switches from Amber Warning to Neon Strike. Any premature click results in failure and a system warning.
                  </p>
                </div>
                <button
                  onClick={() => handleSelectTab('reaction')}
                  className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs rounded tracking-widest transition-colors cursor-pointer"
                >
                  DEPLOY REFLEX SENSORS (+100 XP)
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. OBSERVATION TRAINING GAME */}
          {activeTab === 'observation' && <ObservationGameView onAwardXp={onAwardXp} onLogHistory={onLogHistory} />}

          {/* 3. MEMORY GAME */}
          {activeTab === 'memory' && <MemoryGameView onAwardXp={onAwardXp} onLogHistory={onLogHistory} />}

          {/* 4. LOGIC ENGINE */}
          {activeTab === 'logic' && <LogicGameView onAwardXp={onAwardXp} onLogHistory={onLogHistory} />}

          {/* 5. REACTION VELOCITY */}
          {activeTab === 'reaction' && <ReactionGameView onAwardXp={onAwardXp} onLogHistory={onLogHistory} history={history} />}
        </AnimatePresence>
      ) : (
        <ExerciseRegimenView
          onAwardXp={onAwardXp}
          onLogHistory={onLogHistory}
          history={history}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   OBSERVATION GAME ENGINE
   ========================================================================== */
function ObservationGameView({ onAwardXp, onLogHistory }: { onAwardXp: any; onLogHistory: any }) {
  const [gameState, setGameState] = useState<'intro' | 'studying' | 'questions' | 'results'>('intro');
  const [bpIndex, setBpIndex] = useState(0);
  const [studyTimeLeft, setStudyTimeLeft] = useState(15);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submittedAnswers, setSubmittedAnswers] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);

  const activeBlueprint = BLUEPRINTS[bpIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'studying' && studyTimeLeft > 0) {
      timer = setTimeout(() => {
        setStudyTimeLeft(prev => prev - 1);
        if (studyTimeLeft % 4 === 0) synth.pulse();
      }, 1000);
    } else if (gameState === 'studying' && studyTimeLeft === 0) {
      handleFinishedStudying();
    }
    return () => clearTimeout(timer);
  }, [gameState, studyTimeLeft]);

  const handleStartStudy = () => {
    synth.accessGranted();
    setGameState('studying');
    setStudyTimeLeft(15);
  };

  const handleFinishedStudying = () => {
    synth.success();
    setGameState('questions');
    setSelectedAnswers(new Array(activeBlueprint.questions.length).fill(-1));
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    synth.click();
    const copy = [...selectedAnswers];
    copy[qIdx] = oIdx;
    setSelectedAnswers(copy);
  };

  const handleSubmitQuestions = () => {
    synth.success();
    let correctCount = 0;
    const validation = activeBlueprint.questions.map((q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.answerIndex;
      if (isCorrect) correctCount++;
      return isCorrect;
    });

    const finalScore = Math.round((correctCount / activeBlueprint.questions.length) * 100);
    setScore(finalScore);
    setSubmittedAnswers(validation);
    setGameState('results');

    // Award XP
    const awardedXp = correctCount * 50;
    if (awardedXp > 0) {
      onAwardXp(awardedXp, `Completed Tactical Observation Diagnostic with ${correctCount}/3 correct answers!`);
    }
    onLogHistory('observation', finalScore, `Blueprint: ${activeBlueprint.title}`);
  };

  const handleRestart = () => {
    synth.metalClick();
    setBpIndex((bpIndex + 1) % BLUEPRINTS.length);
    setGameState('intro');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">TACTICAL OBSERVER</h2>
        <span className="text-xs font-mono text-cyan-400">OBJECT: SITUATIONAL RECALL</span>
      </div>

      {gameState === 'intro' && (
        <div className="text-center py-10 flex flex-col items-center justify-center max-w-lg mx-auto">
          <Eye className="w-12 h-12 text-cyan-400 mb-4 animate-pulse" />
          <h3 className="font-display text-base font-bold text-white mb-2">{activeBlueprint.title}</h3>
          <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
            You will be shown an advanced blueprint structure containing complex node logs, coordinates, server codes, and status colors. You have <strong>15 seconds</strong> to capture every detail.
          </p>
          <button
            onClick={handleStartStudy}
            className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs tracking-widest rounded transition-colors cursor-pointer"
          >
            INITIALIZE INTEL LOAD
          </button>
        </div>
      )}

      {gameState === 'studying' && (
        <div className="flex flex-col gap-6">
          {/* Blueprint Display */}
          <div className="relative border border-cyan-400/20 bg-black rounded p-4 font-mono text-xs flex flex-col items-center justify-center select-none overflow-hidden min-h-[300px]">
            {/* Countdown timer */}
            <div className="absolute top-3 right-3 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-sm font-bold animate-pulse">
              ANALYZING GRID: {studyTimeLeft}s
            </div>

            {/* Custom SVG Blueprint Illustration based on index */}
            {bpIndex === 0 ? (
              <svg className="w-full max-w-[480px] h-[240px] text-cyan-400/80" viewBox="0 0 400 200">
                <rect x="10" y="10" width="380" height="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                
                {/* Cameras */}
                <text x="30" y="30" fill="#f59e0b" className="font-bold text-[10px]">CAM-01 [S_PASSAGE]</text>
                <text x="320" y="30" fill="#f59e0b" className="font-bold text-[10px]">CAM-02 [N_VENT]</text>
                <text x="170" y="180" fill="#f59e0b" className="font-bold text-[10px]">CAM-03 [CORE_E]</text>

                {/* Subnet range */}
                <text x="30" y="165" fill="#00f0ff" className="font-bold text-[11px]">NET RANGE: 192.168.8.1</text>
                <text x="30" y="180" fill="#00f0ff" className="text-[9px]">GATEWAY: 192.168.8.254</text>

                {/* Neural Core Center Grid */}
                <circle cx="200" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse" />
                <text x="165" y="103" fill="#ffffff" className="font-bold text-[11px]">NEURAL CORE</text>
                
                {/* Specific Alarm Node */}
                <circle cx="90" cy="110" r="12" fill="none" stroke="#f43f5e" strokeWidth="2" />
                <text x="80" y="113" fill="#f43f5e" className="font-bold text-[8px]">NODE-B4</text>
                <text x="65" y="132" fill="#ef4444" className="text-[7px]">WARNING: AMBER SECTOR</text>

                {/* Secure vault coordinates */}
                <rect x="290" y="110" width="60" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <text x="295" y="125" fill="#ffffff" className="font-bold text-[9px]">VAULT C-1</text>
                <text x="295" y="140" fill="#00ff66" className="text-[8px]">COORD: [A-4]</text>
              </svg>
            ) : (
              <svg className="w-full max-w-[480px] h-[240px] text-cyan-400/80" viewBox="0 0 400 200">
                <rect x="10" y="10" width="380" height="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                
                {/* Transformer power */}
                <rect x="30" y="110" width="70" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <text x="35" y="125" fill="#f59e0b" className="font-bold text-[9px]">POWER TRANSFORM</text>
                <text x="35" y="140" fill="#00f0ff" className="text-[8px]">SECTOR: SOUTH-WEST</text>

                {/* Ventilation Gas canisters */}
                <circle cx="200" cy="45" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <text x="183" y="48" fill="#ffffff" className="font-bold text-[9px]">VENT-A</text>
                <text x="165" y="75" fill="#e11d48" className="font-bold text-[9px]">CANISTER: N2O-GAS</text>

                {/* Server Column B */}
                <rect x="290" y="40" width="80" height="110" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <text x="295" y="55" fill="#ffffff" className="font-bold text-[9px]">SERVER PANEL</text>
                <text x="295" y="80" fill="#00f0ff" className="font-bold text-[9px]">COLUMN B: CYAN</text>
                <text x="295" y="95" fill="#00ff66" className="text-[8px]">STATUS: OK</text>
                <text x="295" y="110" fill="#ef4444" className="text-[8px]">COLUMN A: ERROR</text>
              </svg>
            )}

            <div className="mt-2 text-[10px] text-white/40 tracking-wider">
              {activeBlueprint.description}
            </div>
          </div>

          <button
            onClick={handleFinishedStudying}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-mono text-xs rounded transition-all cursor-pointer"
          >
            I HAVE MEMORIZED THE GRID - COMMENCE RECALL QUESTIONS
          </button>
        </div>
      )}

      {gameState === 'questions' && (
        <div className="flex flex-col gap-6">
          <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded text-cyan-400 font-mono text-xs">
            ⚠️ COMPREHENSION RECALL INITIATED. SPECULATIVE GUESSES REDUCE INTEGRITY.
          </div>

          <div className="flex flex-col gap-6">
            {activeBlueprint.questions.map((q, qIdx) => (
              <div key={qIdx} className="glass-panel border border-white/5 rounded p-4 flex flex-col gap-3">
                <h4 className="font-display text-xs text-white font-bold flex gap-2">
                  <span className="text-cyan-400 font-mono">Q{qIdx + 1}:</span>
                  <span>{q.question}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(qIdx, oIdx)}
                      className={`p-2.5 border rounded text-xs font-mono text-left transition-all ${
                        selectedAnswers[qIdx] === oIdx
                          ? 'border-cyan-400 bg-cyan-500/10 text-white'
                          : 'border-white/5 bg-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitQuestions}
            disabled={selectedAnswers.some(a => a === -1)}
            className={`w-full py-2.5 font-display font-bold text-xs tracking-widest rounded transition-colors ${
              selectedAnswers.some(a => a === -1)
                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                : 'bg-cyan-400 hover:bg-cyan-500 text-black cursor-pointer'
            }`}
          >
            SUBMIT ANALYSIS TO DECRYPTOR
          </button>
        </div>
      )}

      {gameState === 'results' && (
        <div className="text-center py-6 flex flex-col items-center justify-center max-w-lg mx-auto">
          <CheckCircle2 className="w-12 h-12 text-cyan-400 mb-4 animate-bounce" />
          <h3 className="font-display text-lg font-bold text-white mb-2">RECALL DIAGNOSTIC LOGGED</h3>
          
          <div className="my-4 p-4 bg-white/5 rounded border border-white/5 w-full">
            <div className="text-3xl font-display font-black text-cyan-400 mb-1">{score}%</div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">COMPREHENSION SCORE</div>
            
            <div className="flex flex-col gap-2 mt-4 text-xs font-mono border-t border-white/5 pt-4 text-left">
              {activeBlueprint.questions.map((q, idx) => (
                <div key={idx} className="flex justify-between items-center gap-4">
                  <span className="text-white/60 truncate">Question {idx + 1}</span>
                  <span className={submittedAnswers[idx] ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {submittedAnswers[idx] ? '✔ CORRECT' : '✘ ERROR'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs tracking-widest rounded transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>LOAD SUB-ARRAY Blueprints</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ==========================================================================
   MEMORY MATCH GAME
   ========================================================================== */
const CARD_SYMBOLS = [
  'Eye', 'Zap', 'ShieldAlert', 'Swords', 'Key', 'Brain', 'Terminal', 'Cpu'
];

interface CardState {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function MemoryGameView({ onAwardXp, onLogHistory }: { onAwardXp: any; onLogHistory: any }) {
  const [difficulty, setDifficulty] = useState<'standard' | 'master'>('standard');
  const [cards, setCards] = useState<CardState[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initGame = (mode: 'standard' | 'master') => {
    synth.accessGranted();
    setDifficulty(mode);
    setIsCompleted(false);
    setMoves(0);
    setTime(0);
    setSelectedIndices([]);
    setGameStarted(true);

    // standard = 12 cards (6 pairs), master = 16 cards (8 pairs)
    const pairsCount = mode === 'standard' ? 6 : 8;
    const symbols = CARD_SYMBOLS.slice(0, pairsCount);
    const combined = [...symbols, ...symbols]
      .map((sym, idx) => ({
        id: idx,
        symbol: sym,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(combined);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  const handleCardClick = (idx: number) => {
    if (cards[idx].isFlipped || cards[idx].isMatched || selectedIndices.length >= 2) return;
    synth.click();

    const updated = [...cards];
    updated[idx].isFlipped = true;
    setCards(updated);

    const newSelected = [...selectedIndices, idx];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;

      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // MATCH
        setTimeout(() => {
          synth.success();
          const matchUpdated = [...cards];
          matchUpdated[firstIdx].isMatched = true;
          matchUpdated[secondIdx].isMatched = true;
          setCards(matchUpdated);
          setSelectedIndices([]);

          // Check Win Condition
          if (matchUpdated.every(c => c.isMatched)) {
            handleWin(modeScore(difficulty, moves, time));
          }
        }, 300);
      } else {
        // NO MATCH
        setTimeout(() => {
          synth.metalClick();
          const unflipUpdated = [...cards];
          unflipUpdated[firstIdx].isFlipped = false;
          unflipUpdated[secondIdx].isFlipped = false;
          setCards(unflipUpdated);
          setSelectedIndices([]);
        }, 800);
      }
    }
  };

  const modeScore = (mode: 'standard' | 'master', mv: number, tm: number) => {
    // Score based on efficiency. Base standard 100%, subtract small penalties
    const baseMoves = mode === 'standard' ? 12 : 20;
    const penalty = Math.max(0, (mv - baseMoves) * 3) + Math.max(0, (tm - 40) * 0.5);
    return Math.max(25, Math.round(100 - penalty));
  };

  const handleWin = (finalScore: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCompleted(true);
    synth.levelUp();

    const xpReward = difficulty === 'standard' ? 100 : 150;
    onAwardXp(xpReward, `Completed Memory Array Match (${difficulty.toUpperCase()}) in ${moves} moves!`);
    onLogHistory('memory', finalScore, `Moves: ${moves}, Time: ${time}s, Mode: ${difficulty}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">MEMORY MATRIX</h2>
        <span className="text-xs font-mono text-cyan-400">OBJECT: SPATIAL DECAY SENSORS</span>
      </div>

      {!gameStarted ? (
        <div className="text-center py-10 flex flex-col items-center justify-center max-w-lg mx-auto">
          <Brain className="w-12 h-12 text-cyan-400 mb-4 animate-pulse" />
          <h3 className="font-display text-base font-bold text-white mb-2">CALIBRATE MEMORY ARRAY</h3>
          <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
            Train your neural memory cache. Flip tiles and pair identical tactical markers. Overloading your moves decreases diagnostic efficiency.
          </p>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => initGame('standard')}
              className="flex-1 py-2.5 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400 text-white hover:text-cyan-400 text-xs font-mono rounded tracking-widest transition-all cursor-pointer"
            >
              STANDARD REGIME (12 NODES)
            </button>
            <button
              onClick={() => initGame('master')}
              className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black text-xs font-display font-bold rounded tracking-widest transition-all cursor-pointer"
            >
              MASTER REGIME (16 NODES)
            </button>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="text-center py-6 flex flex-col items-center justify-center max-w-lg mx-auto">
          <CheckCircle2 className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="font-display text-lg font-bold text-white mb-2">ARRAY SYNC COMPLETED</h3>
          
          <div className="my-4 p-4 bg-white/5 rounded border border-white/5 w-full font-mono text-xs text-left flex flex-col gap-3">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">CALIBRATION SCORE</span>
              <span className="text-cyan-400 font-bold">{modeScore(difficulty, moves, time)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">TOTAL MOVES LOGGED</span>
              <span className="text-white font-bold">{moves}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">ELAPSED CLOCK CYCLE</span>
              <span className="text-white font-bold">{time} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">GRID RESOLUTION</span>
              <span className="text-white font-bold uppercase">{difficulty}</span>
            </div>
          </div>

          <button
            onClick={() => setGameStarted(false)}
            className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs tracking-widest rounded transition-colors cursor-pointer"
          >
            CHOOSE ANOTHER PROFILE
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center font-mono text-xs text-white/60">
            <span>MOVES: <strong className="text-white">{moves}</strong></span>
            <span>TIME: <strong className="text-cyan-400">{time}s</strong></span>
          </div>

          {/* Cards Grid */}
          <div className={`grid gap-4 mx-auto w-full max-w-[420px] ${
            difficulty === 'standard' ? 'grid-cols-4' : 'grid-cols-4'
          }`}>
            {cards.map((card, idx) => {
              const flipped = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square rounded border relative transition-all overflow-hidden cursor-pointer ${
                    flipped
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/5'
                      : 'bg-white/5 border-white/5 hover:border-white/10 text-white/0 hover:bg-white/10'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center font-mono">
                    {flipped ? (
                      <span className="text-[10px] font-bold uppercase">{card.symbol.slice(0, 5)}</span>
                    ) : (
                      <span className="text-[10px] text-white/20 select-none">??</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => initGame(difficulty)}
            className="mt-4 py-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white/80 font-mono text-[10px] tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET MEMORY RUN</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ==========================================================================
   DEDUCTION LOGIC ENGINE (CIPHERS)
   ========================================================================== */
interface LogicPuzzle {
  type: 'sequence' | 'cipher';
  prompt: string;
  solution: string;
  hint: string;
}

const LOGIC_PUZZLES: LogicPuzzle[] = [
  { type: 'sequence', prompt: 'Decrypt the mainframe sequence: 2, 6, 12, 20, 30, [?]', solution: '42', hint: 'The differences between consecutive numbers are 4, 6, 8, 10, ...' },
  { type: 'sequence', prompt: 'Solve the secure node progression: 3, 5, 9, 17, 33, [?]', solution: '65', hint: 'Each term is (previous * 2) - 1' },
  { type: 'cipher', prompt: 'Crack the Julius-Shift security code. Plaintext "INTEL" shifted by 3 becomes [?]', solution: 'LQWHO', hint: 'Use standard Caesar cipher. Shift each letter forward in the alphabet by 3.' },
  { type: 'cipher', prompt: 'Solve the modular logical binary XOR gate chain: 1101 XOR 1011 = [?]', solution: '0110', hint: 'Compare matching bits. 1 XOR 1 = 0, 0 XOR 1 = 1, 1 XOR 0 = 1, 0 XOR 0 = 0.' },
];

function LogicGameView({ onAwardXp, onLogHistory }: { onAwardXp: any; onLogHistory: any }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [solvedCount, setSolvedCount] = useState(0);

  const activePuzzle = LOGIC_PUZZLES[puzzleIndex];

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    if (userAnswer.trim().toUpperCase() === activePuzzle.solution.toUpperCase()) {
      synth.success();
      setFeedback('success');
      setSolvedCount(prev => prev + 1);
      
      // Award XP
      onAwardXp(150, 'Masterfully solved logical core equation! +150 XP');
      onLogHistory('logic', 100, `Equation #${puzzleIndex + 1}: Solved`);
    } else {
      synth.error();
      setFeedback('error');
      // log history as failure
      onLogHistory('logic', 0, `Equation #${puzzleIndex + 1}: Missed`);
    }
  };

  const handleNext = () => {
    synth.metalClick();
    setUserAnswer('');
    setShowHint(false);
    setFeedback('idle');
    setPuzzleIndex((puzzleIndex + 1) % LOGIC_PUZZLES.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">LOGICAL PROCESSOR</h2>
        <span className="text-xs font-mono text-cyan-400">OBJECT: CRYPTOGRAPHY & DECRYPTION</span>
      </div>

      <div className="glass-panel border border-white/5 rounded p-5 bg-black/40 font-mono text-xs flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] text-white/40">CIPHER NODE STATUS: DEPLOYED</span>
          <span className="text-[10px] text-cyan-400">SUCCESSFUL CORES: {solvedCount}</span>
        </div>

        <div className="text-white text-sm font-bold py-3">
          {activePuzzle.prompt}
        </div>

        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded"
          >
            🔒 INTEL RETRIEVED: {activePuzzle.hint}
          </motion.div>
        )}

        <form onSubmit={handleVerify} className="flex gap-2 border-t border-white/5 pt-4">
          <input
            type="text"
            className="flex-1 bg-black border border-white/10 focus:border-cyan-400/40 rounded px-3 py-2 text-white focus:outline-none placeholder-white/20 uppercase"
            placeholder="Input deciphered coordinate/text..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={feedback === 'success'}
          />
          <button
            type="submit"
            disabled={feedback === 'success'}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-bold text-xs tracking-wider rounded cursor-pointer disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed"
          >
            CRACK CIPHER
          </button>
        </form>

        {feedback === 'success' && (
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-center font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACCESS GRANTED: SECURITY OVERRIDE COMPLETED</span>
          </motion.div>
        )}

        {feedback === 'error' && (
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-center font-bold flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>ACCESS DENIED: INTEGRITY FAULT DETECTED</span>
          </motion.div>
        )}

        <div className="flex gap-4 justify-between pt-2 border-t border-white/5 mt-2">
          <button
            onClick={() => { synth.click(); setShowHint(prev => !prev); }}
            className="text-[10px] text-amber-400/80 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'HIDE INTEL PACK' : 'REQUEST INTEL DECRYPTION (HINT)'}</span>
          </button>

          {feedback !== 'idle' && (
            <button
              onClick={handleNext}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>NEXT CIPHER NODE →</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
   REACTION TRIGGER VELOCITY
   ========================================================================== */
function ReactionGameView({ onAwardXp, onLogHistory, history }: { onAwardXp: any; onLogHistory: any; history: TrainingHistory[] }) {
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'trigger' | 'misfire' | 'done'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startTest = () => {
    synth.metalClick();
    setReactionState('waiting');
    setReactionTime(null);

    const randomDelay = 2000 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      synth.success();
      setReactionState('trigger');
      startTimeRef.current = performance.now();
    }, randomDelay);
  };

  const handleTriggerClick = () => {
    if (reactionState === 'waiting') {
      // Early click - MISFIRE!
      if (timerRef.current) clearTimeout(timerRef.current);
      synth.error();
      setReactionState('misfire');
      onLogHistory('reaction', 999, 'Misfire (Early Trigger)');
    } else if (reactionState === 'trigger') {
      // Success!
      const endTime = performance.now();
      const difference = Math.round(endTime - startTimeRef.current);
      setReactionTime(difference);
      setReactionState('done');
      synth.levelUp();

      // Compute score and award XP
      // reaction: less than 200ms = Outstanding, less than 280ms = Good, over 350ms = average
      let xpAward = 50;
      let review = 'Cognitive reflex nominal.';
      if (difference < 200) {
        xpAward = 120;
        review = 'Outstanding reflex latency! Elite Operator.';
      } else if (difference < 280) {
        xpAward = 80;
        review = 'Highly responsive reflex pattern.';
      }
      onAwardXp(xpAward, `Reflex velocity locked at ${difference}ms. ${review}`);
      onLogHistory('reaction', difference, `Latency: ${difference}ms`);
    }
  };

  // Best latency score
  const reactionRuns = history.filter(h => h.type === 'reaction' && h.score < 999);
  const bestLatency = reactionRuns.length > 0 ? Math.min(...reactionRuns.map(r => r.score)) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel border border-white/5 rounded-lg p-6 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">REFLEX VELOCITY</h2>
        <span className="text-xs font-mono text-cyan-400">OBJECT: COGNITIVE LATENCY FEED</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Trigger Box */}
        <div className="flex-1">
          <button
            onClick={reactionState === 'idle' || reactionState === 'done' || reactionState === 'misfire' ? startTest : handleTriggerClick}
            className={`w-full min-h-[250px] border rounded-lg flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-all ${
              reactionState === 'idle'
                ? 'border-white/5 bg-white/5 text-white/55 hover:bg-white/10 hover:border-white/10'
                : reactionState === 'waiting'
                ? 'border-amber-500/20 bg-amber-500/5 text-amber-500 shadow-lg shadow-amber-500/5 animate-pulse'
                : reactionState === 'trigger'
                ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-lg shadow-cyan-400/10'
                : reactionState === 'misfire'
                ? 'border-red-500/20 bg-red-500/5 text-red-400'
                : 'border-green-500/20 bg-green-500/5 text-green-400'
            }`}
          >
            {reactionState === 'idle' && (
              <>
                <Zap className="w-10 h-10 text-white/30 mb-3" />
                <span className="font-display font-bold text-sm tracking-widest text-white uppercase mb-2">INITIALIZE REFLEX SENSOR</span>
                <span className="text-[10px] font-mono max-w-xs text-white/40 uppercase leading-relaxed">
                  Click inside this container to initiate countdown, then click IMMEDIATELY when frame flashes cyan.
                </span>
              </>
            )}

            {reactionState === 'waiting' && (
              <>
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping mb-4" />
                <span className="font-display font-bold text-base tracking-widest uppercase">STANDBY FOR MATRIX FLUIDITY...</span>
                <span className="text-[9px] font-mono text-amber-500/60 uppercase mt-2">PREMATURE TRIGGER DISCONNECTS CACHE</span>
              </>
            )}

            {reactionState === 'trigger' && (
              <>
                <div className="w-4 h-4 rounded-full bg-white animate-ping mb-4" />
                <span className="font-display font-black text-2xl tracking-widest glow-text-specter animate-bounce uppercase">STRIKE TERMINAL NOW!</span>
              </>
            )}

            {reactionState === 'misfire' && (
              <>
                <ShieldAlert className="w-10 h-10 text-red-500 mb-3 animate-pulse" />
                <span className="font-display font-bold text-sm text-red-400 uppercase tracking-widest mb-1">PREMATURE MISFIRE</span>
                <span className="text-[10px] font-mono text-red-500/60 uppercase">TRIGGER FAILED: EXERCISE TERMINATED</span>
                <span className="text-[10px] font-mono text-white/40 uppercase mt-4 underline decoration-white/10 hover:text-white transition-colors">INITIALIZE RECALIBRATION</span>
              </>
            )}

            {reactionState === 'done' && (
              <>
                <CheckCircle2 className="w-10 h-10 text-cyan-400 mb-3" />
                <span className="font-display font-black text-3xl text-white tracking-widest">{reactionTime}ms</span>
                <span className="text-[9px] font-mono text-cyan-400 uppercase mt-1 tracking-widest">TRIGGER LATENCY REPORTED</span>
                <span className="text-[10px] font-mono text-white/40 uppercase mt-4 underline decoration-white/10 hover:text-white transition-colors">START NEW REGIME RUN</span>
              </>
            )}
          </button>
        </div>

        {/* Sidebar History Stats */}
        <div className="w-full md:w-[220px] flex flex-col gap-4 font-mono text-xs">
          <div className="glass-panel border border-white/5 rounded p-4 flex flex-col gap-3">
            <span className="text-[10px] text-white/40 uppercase border-b border-white/5 pb-1.5">REACTION ARCHIVE</span>
            
            <div className="flex justify-between items-center">
              <span className="text-white/40">BEST COGNITIVE:</span>
              <span className="text-cyan-400 font-bold">{bestLatency ? `${bestLatency}ms` : 'NONE'}</span>
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-2">
              <span className="text-white/40">LAST RUN:</span>
              <span className="text-white font-bold">
                {reactionRuns.length > 0 ? `${reactionRuns[reactionRuns.length - 1].score}ms` : 'NONE'}
              </span>
            </div>
          </div>

          <div className="glass-panel border border-white/5 rounded p-4 flex flex-col gap-2 flex-1">
            <span className="text-[10px] text-white/40 uppercase border-b border-white/5 pb-1.5">HISTORIC LATENCY FEEDS</span>
            <div className="overflow-y-auto max-h-[140px] flex flex-col gap-1.5">
              {reactionRuns.length === 0 ? (
                <span className="text-[9px] text-white/30 italic">No telemetry logged</span>
              ) : (
                reactionRuns.slice(-5).reverse().map((run, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="text-white/30">{new Date(run.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-cyan-400/80 font-bold">{run.score}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
