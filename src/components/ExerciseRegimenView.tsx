/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, Play, Pause, RotateCcw, Flame, Trophy, CheckCircle, 
  Activity, Sparkles, Heart, ShieldAlert, Plus, Minus, Timer, 
  ChevronRight, Dumbbell as WorkoutIcon, Swords
} from 'lucide-react';
import { TrainingHistory } from '../types';
import { synth } from '../utils/audio';

interface ExerciseRegimenViewProps {
  onAwardXp: (xp: number, message: string) => void;
  onLogHistory: (type: 'observation' | 'memory' | 'logic' | 'reaction' | 'workout', score: number, metadata?: string) => void;
  history: TrainingHistory[];
}

interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'combat' | 'core';
  target: string;
  muscleGroups: string[];
  description: string;
  formGuide: string[];
  caloriesPerRep: number;
  xpReward: number;
}

const EXERCISES: Exercise[] = [
  {
    id: 'pushups',
    name: 'Vigilante Pushups',
    category: 'strength',
    target: '3 Sets of 25 Reps',
    muscleGroups: ['Chest', 'Triceps', 'Anterior Deltoids', 'Core'],
    description: 'Build explosive upper-body pushing power essential for close-quarters hand-to-hand combat deflection.',
    formGuide: [
      'Keep elbows tucked at a 45-degree angle to protect rotator cuffs.',
      'Maintain a rigid plank posture with glutes and core fully engaged.',
      'Lower until your chest is 1 inch from the floor, then explode upward.'
    ],
    caloriesPerRep: 0.6,
    xpReward: 3
  },
  {
    id: 'pullups',
    name: 'Gargoyle Pullups',
    category: 'strength',
    target: '3 Sets of 10 Reps',
    muscleGroups: ['Latissimus Dorsi', 'Biceps', 'Rhomboids', 'Grip Strength'],
    description: 'Develop maximum vertical pulling forces crucial for climbing high-elevation structures and rooftop grappling hook ascents.',
    formGuide: [
      'Initiate the lift by depressing your shoulder blades (scapular pull).',
      'Pull your chest fully to the bar; do not crane your neck or swing.',
      'Execute a controlled 3-second lowering phase for maximum muscle tension.'
    ],
    caloriesPerRep: 1.2,
    xpReward: 8
  },
  {
    id: 'crunches',
    name: 'Vengeance Abdominal Crunches',
    category: 'core',
    target: '3 Sets of 30 Reps',
    muscleGroups: ['Rectus Abdominis', 'Transverse Abdominis'],
    description: 'Construct a bulletproof core shield to withstand ballistic impact forces and deliver high-torque rotation.',
    formGuide: [
      'Avoid pulling your head or neck; let your abdominal wall perform the squeeze.',
      'Exhale completely at the peak crunch to force maximum core contraction.',
      'Keep lower back pressed flat into the training mat throughout.'
    ],
    caloriesPerRep: 0.3,
    xpReward: 2
  },
  {
    id: 'situps',
    name: 'Wayne Manor Sit-Ups',
    category: 'core',
    target: '3 Sets of 20 Reps',
    muscleGroups: ['Lower Abs', 'Hip Flexors', 'Obliques'],
    description: 'Build complete core flexor strength, enhancing midsection resilience and rotational kinetic transfer.',
    formGuide: [
      'Cross your arms over your chest or place fingertips gently near ears.',
      'Roll up smoothly bone-by-bone rather than jerking your torso up.',
      'Control the descent to keep muscle fiber activation consistent.'
    ],
    caloriesPerRep: 0.4,
    xpReward: 3
  },
  {
    id: 'run',
    name: 'Sovereign Rooftop Run',
    category: 'cardio',
    target: '15 Minutes Interval Sprint',
    muscleGroups: ['Quads', 'Hamstrings', 'Calves', 'Cardiovascular System'],
    description: 'High-intensity tactical cardio sprint intervals to simulate chasing targets or evading detection across high-altitude terrain.',
    formGuide: [
      'Perform 30-second near-maximal speed sprints followed by 60 seconds jogging.',
      'Focus on driving elbows straight back to maintain aerodynamic posture.',
      'Maintain quick, active foot turnover and land light on midfoot.'
    ],
    caloriesPerRep: 12.0, // measured in calories per minute here
    xpReward: 15 // per minute
  },
  {
    id: 'shadow_boxing',
    name: 'Shadow Boxing Combat Drill',
    category: 'combat',
    target: '5 Minutes Continuous Striking',
    muscleGroups: ['Shoulders', 'Rotator Cuff', 'Calves', 'Speed-Reflexes'],
    description: 'Fluid integration of strikes, ducks, and slips. Simulates close-range tactical engagements with imaginary assailants.',
    formGuide: [
      'Snap punches back to guard position instantly to keep defensive gates closed.',
      'Maintain active footwork, moving off-center after every combo.',
      'Breathe sharply on every strike to maintain oxygen saturation.'
    ],
    caloriesPerRep: 8.5, // measured in calories per minute here
    xpReward: 10 // per minute
  }
];

export default function ExerciseRegimenView({ onAwardXp, onLogHistory, history }: ExerciseRegimenViewProps) {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  
  // Active workout session states
  const [sessionReps, setSessionReps] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Metronome States
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const metronomeRef = useRef<NodeJS.Timeout | null>(null);

  // Training routine generator states
  const [routineFocus, setRoutineFocus] = useState<'all' | 'strength' | 'combat' | 'core'>('all');
  const [routineList, setRoutineList] = useState<any[]>([]);
  const [completedRoutineIds, setCompletedRoutineIds] = useState<string[]>([]);
  
  // General Stats calculated from history
  const [todaysReps, setTodaysReps] = useState<number>(0);
  const [todaysCalories, setTodaysCalories] = useState<number>(0);
  const [todaysXpGained, setTodaysXpGained] = useState<number>(0);

  // Read historical workout logs to compile today's stats
  useEffect(() => {
    const workouts = history.filter(h => h.type === 'workout');
    let reps = 0;
    let calories = 0;
    let xp = 0;
    
    // Check for workouts completed today (within last 24h or calendar day)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    workouts.forEach(w => {
      const wDate = new Date(w.timestamp);
      if (wDate >= startOfToday) {
        // metadata holds "reps_completed:X|exercise_id:Y|calories:Z"
        reps += w.score;
        if (w.metadata) {
          const parts = w.metadata.split('|');
          parts.forEach(p => {
            if (p.startsWith('calories:')) {
              calories += parseFloat(p.split(':')[1]) || 0;
            }
            if (p.startsWith('xp:')) {
              xp += parseInt(p.split(':')[1]) || 0;
            }
          });
        }
      }
    });

    setTodaysReps(reps);
    setTodaysCalories(Math.round(calories));
    setTodaysXpGained(xp);
  }, [history]);

  // Handle active countdown timer ticking
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Handle Metronome Beats (plays a tone every 1.5 seconds)
  useEffect(() => {
    if (isMetronomeActive && isTimerRunning) {
      metronomeRef.current = setInterval(() => {
        synth.click(); // short mechanical click
      }, 1500);
    } else {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
    }
    return () => {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
    };
  }, [isMetronomeActive, isTimerRunning]);

  const handleStartExercise = (ex: Exercise) => {
    synth.metalClick();
    setActiveExercise(ex);
    setSessionReps(ex.category === 'cardio' || ex.category === 'combat' ? 0 : 10);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setIsMetronomeActive(false);
  };

  const handleStopExercise = () => {
    synth.metalClick();
    setIsTimerRunning(false);
    setIsMetronomeActive(false);
    setActiveExercise(null);
  };

  const handleSaveSet = () => {
    if (!activeExercise) return;
    
    setIsTimerRunning(false);
    setIsMetronomeActive(false);

    // Calculate score (reps or duration minutes)
    const isTimeBased = activeExercise.category === 'cardio' || activeExercise.category === 'combat';
    const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
    const finalScore = isTimeBased ? durationMinutes : sessionReps;
    
    // Calculate burned calories and earned XP
    const calculatedCalories = isTimeBased 
      ? activeExercise.caloriesPerRep * durationMinutes 
      : activeExercise.caloriesPerRep * sessionReps;
      
    const calculatedXp = isTimeBased
      ? activeExercise.xpReward * durationMinutes
      : activeExercise.xpReward * sessionReps;

    const metadataString = `exercise_id:${activeExercise.id}|exercise_name:${activeExercise.name}|calories:${calculatedCalories.toFixed(1)}|xp:${calculatedXp}|duration_sec:${timerSeconds}`;

    // Log to secure mainframe history
    onLogHistory('workout', finalScore, metadataString);
    
    // Award XP
    onAwardXp(calculatedXp, `Completed workout set of ${activeExercise.name}: ${finalScore} ${isTimeBased ? 'mins' : 'reps'}`);
    
    // Check if part of generated blueprint
    if (routineList.some(r => r.id === activeExercise.id)) {
      setCompletedRoutineIds(prev => {
        const next = [...prev, activeExercise.id];
        if (next.length === routineList.length) {
          // Entire circuit completed! Award bonus
          const bonusXp = 100;
          onAwardXp(bonusXp, `Mastered Batman circuit blueprint! Complete athletic routine synced!`);
          synth.success();
        }
        return next;
      });
    }

    synth.success();
    setActiveExercise(null);
  };

  // Routine Blueprint Generator
  const handleGenerateRoutine = (focus: typeof routineFocus) => {
    synth.metalClick();
    let filtered = EXERCISES;
    if (focus !== 'all') {
      filtered = EXERCISES.filter(ex => ex.category === focus);
    }
    
    // Pick 3 random exercises
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 3).map((ex, idx) => {
      let recommendedGoal = '';
      if (ex.category === 'cardio') {
        recommendedGoal = '10 minutes interval run';
      } else if (ex.category === 'combat') {
        recommendedGoal = '4 minutes relentless speed punches';
      } else if (ex.id === 'pullups') {
        recommendedGoal = '3 sets of 8 strict deadhangs';
      } else if (ex.id === 'pushups') {
        recommendedGoal = '3 sets of 20 chest-to-ground reps';
      } else {
        recommendedGoal = '3 sets of 25 crunch compressions';
      }
      return {
        ...ex,
        recommendedGoal,
        order: idx + 1
      };
    });

    setRoutineList(picked);
    setCompletedRoutineIds([]);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Upper Grid: Physical Stats Telemetry & Blueprint Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Physical Stats Display */}
        <div className="lg:col-span-1 glass-panel border border-white/5 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>BIOMECHANICAL STATUS</span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Reps */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <div className="text-[9px] font-mono text-white/40 uppercase">REPS LOGGED TODAY</div>
                <div className="text-xl font-display font-bold text-white tracking-wide">
                  {todaysReps} <span className="text-xs font-mono text-white/30 uppercase">Reps</span>
                </div>
              </div>
              <Dumbbell className="w-5 h-5 text-cyan-400" />
            </div>

            {/* Calories */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <div className="text-[9px] font-mono text-white/40 uppercase">ESTIMATED ENERGETIC BURN</div>
                <div className="text-xl font-display font-bold text-white tracking-wide">
                  {todaysCalories} <span className="text-xs font-mono text-white/30 uppercase">Kcal</span>
                </div>
              </div>
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>

            {/* XP */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono text-white/40 uppercase">CONDITIONING EXPERTISE GAINED</div>
                <div className="text-xl font-display font-bold text-cyan-400 tracking-wide">
                  +{todaysXpGained} <span className="text-xs font-mono text-cyan-400/50 uppercase">XP</span>
                </div>
              </div>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[9px] font-mono text-white/30 uppercase text-center leading-relaxed">
            All biomechanics coordinates match standard Wayne combat armor calibration specs.
          </div>
        </div>

        {/* Batman Workout Routine Generator */}
        <div className="lg:col-span-2 glass-panel border border-white/5 rounded-lg p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BAT-ATHLETIC BLUEPRINT GENERATOR</span>
              </span>
              <span className="text-[9px] font-mono text-white/30 uppercase">TAILORED CONDITIONING CIRCUITS</span>
            </div>

            <p className="text-xs text-white/60 font-sans leading-relaxed mb-4">
              Construct high-intensity training circuits tailored for specific crime-fighting requirements. Complete all three exercises in sequence to sync a heavy 100 XP performance bonus to the mainframe database.
            </p>

            {/* Select Focus Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'all', label: 'FULL ATHLETIC' },
                { id: 'strength', label: 'COMBAT STRENGTH' },
                { id: 'core', label: 'CORE INTENSITY' },
                { id: 'combat', label: 'SPEED & STRIKING' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setRoutineFocus(item.id as any)}
                  className={`px-3 py-1 text-[10px] font-mono border rounded cursor-pointer transition-all ${
                    routineFocus === item.id
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400'
                      : 'bg-black/20 border-white/5 text-white/55 hover:text-white hover:border-white/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleGenerateRoutine(routineFocus)}
                className="px-4 py-1 text-[10px] font-mono font-bold uppercase rounded bg-cyan-400 hover:bg-cyan-500 text-black ml-auto cursor-pointer transition-all"
              >
                GENERATE CIRCUIT
              </button>
            </div>
          </div>

          {/* Routine List rendering */}
          {routineList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {routineList.map((item, idx) => {
                const isCompleted = completedRoutineIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isCompleted) handleStartExercise(item);
                    }}
                    className={`p-3 rounded border font-mono text-[11px] flex flex-col justify-between cursor-pointer transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        : 'bg-black/30 border-white/5 text-white hover:border-cyan-500/20 hover:bg-cyan-500/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] text-cyan-400/80">CIRCUIT TASK {idx + 1}</span>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold uppercase truncate mb-0.5">{item.name}</div>
                      <div className="text-[10px] text-white/45 uppercase truncate">{item.recommendedGoal}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 border border-dashed border-white/10 rounded-lg text-center text-white/30 font-mono text-xs italic">
              SELECT CONDITIONING INTENSITY LEVEL AND INITIATE GENERATOR
            </div>
          )}
        </div>

      </div>

      {/* Main active workout dashboard overlay when exercise is active */}
      <AnimatePresence mode="wait">
        {activeExercise && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-panel border-2 border-cyan-400/30 rounded-lg p-6 bg-gradient-to-br from-cyan-950/20 to-black relative"
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Active Exercise status / controls */}
              <div className="flex-1 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>ACTIVE TRAINING HUD STATE</span>
                  </div>
                  <h2 className="font-display text-2xl font-black text-white uppercase tracking-wide">
                    {activeExercise.name}
                  </h2>
                  <p className="text-xs text-white/70 font-sans leading-relaxed max-w-lg mt-2">
                    {activeExercise.description}
                  </p>
                </div>

                {/* Form Guideline Boxes */}
                <div className="bg-black/40 border border-white/5 rounded p-4">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>FORM GUARD AND BIOMECHANIC DIRECTIVES</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-white/60 font-sans">
                    {activeExercise.formGuide.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                {/* Cadence Helper toggler */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      synth.metalClick();
                      setIsMetronomeActive(!isMetronomeActive);
                    }}
                    className={`px-4 py-2 border rounded font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                      isMetronomeActive 
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' 
                        : 'bg-black/20 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    ⚡ CADENCE METRONOME: {isMetronomeActive ? 'ACTIVE (90 BPM)' : 'OFF'}
                  </button>
                  <span className="text-[10px] font-mono text-white/30 uppercase">
                    Rhythmic beats assist pacing for peak physical contraction.
                  </span>
                </div>
              </div>

              {/* Workout Session Interface counters */}
              <div className="w-full md:w-[320px] bg-black/40 border border-white/10 rounded-lg p-5 flex flex-col justify-between gap-6">
                
                {/* Visualizer and clock */}
                <div className="text-center">
                  <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">ELAPSED CLOCK</span>
                  <div className="font-display text-3xl font-black text-white tracking-widest flex items-center justify-center gap-2">
                    <Timer className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <span>{formatTimer(timerSeconds)}</span>
                  </div>
                </div>

                {/* Interactive Reps or Sprint counters */}
                {activeExercise.category === 'cardio' || activeExercise.category === 'combat' ? (
                  // Sprint based layout
                  <div className="text-center py-4 border-t border-b border-white/5">
                    <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">INTENSITY LEVEL</span>
                    <div className="font-display text-2xl font-bold text-amber-500 animate-pulse uppercase tracking-widest">
                      RELENTLESS COMBAT
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-white/50">
                      Minutes calculated on timer count. Keep training!
                    </div>
                  </div>
                ) : (
                  // Rep-based layout
                  <div className="flex flex-col items-center gap-3 py-4 border-t border-b border-white/5">
                    <span className="text-[9px] font-mono text-white/40 uppercase block">REPS TO SYNC IN THIS SET</span>
                    
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => {
                          synth.metalClick();
                          setSessionReps(prev => Math.max(1, prev - 1));
                        }}
                        className="w-10 h-10 border border-white/10 hover:border-cyan-400/50 bg-black/50 text-white rounded flex items-center justify-center hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <div className="font-display text-5xl font-black text-white w-20 text-center glow-text-specter">
                        {sessionReps}
                      </div>

                      <button
                        onClick={() => {
                          synth.metalClick();
                          setSessionReps(prev => prev + 1);
                        }}
                        className="w-10 h-10 border border-white/10 hover:border-cyan-400/50 bg-black/50 text-white rounded flex items-center justify-center hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[9px] font-mono text-white/30 uppercase text-center mt-1">
                      Touch reps display above to manually increment, or use keyboard arrows.
                    </span>
                  </div>
                )}

                {/* Primary Hud buttons */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        synth.metalClick();
                        setIsTimerRunning(!isTimerRunning);
                      }}
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-500" />
                          <span>PAUSE</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-cyan-400" />
                          <span>RESUME</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        synth.metalClick();
                        setTimerSeconds(0);
                        if (activeExercise.category !== 'cardio' && activeExercise.category !== 'combat') {
                          setSessionReps(10);
                        }
                      }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded flex items-center justify-center cursor-pointer transition-colors"
                      title="Reset stats"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleSaveSet}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-500 text-black font-display font-black text-xs rounded tracking-widest transition-colors uppercase cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>RECORD & SYNC TO MAINFRAME</span>
                  </button>

                  <button
                    onClick={handleStopExercise}
                    className="w-full py-1.5 border border-red-500/20 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-mono text-[9px] uppercase rounded cursor-pointer transition-all"
                  >
                    ABORT CURRENT SET
                  </button>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises Registry Grid */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase mb-4 tracking-widest border-b border-white/5 pb-2">
          <WorkoutIcon className="w-4 h-4 text-cyan-400" />
          <span>CONDITIONING EXERCISE REGISTRY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXERCISES.map((ex) => (
            <div 
              key={ex.id}
              className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col justify-between hover:border-cyan-500/20 transition-all group relative overflow-hidden"
            >
              {/* Category indicator tag */}
              <div className="absolute top-2 right-2 text-[8px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 uppercase tracking-widest">
                {ex.category}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 text-cyan-400">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wide">
                      {ex.name}
                    </h3>
                    <span className="text-[10px] font-mono text-white/40">TARGET: {ex.target}</span>
                  </div>
                </div>

                <p className="text-xs text-white/60 font-sans leading-relaxed mb-4">
                  {ex.description}
                </p>

                {/* Muscle Groups badges */}
                <div className="flex flex-wrap gap-1 mb-5">
                  {ex.muscleGroups.map(m => (
                    <span 
                      key={m} 
                      className="text-[8px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded uppercase"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleStartExercise(ex)}
                className="w-full py-2 border border-cyan-400/30 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-400/25" />
                <span>DEPLOY TRAINING NODE</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
