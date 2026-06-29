/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'weekly' | 'custom';
}

export interface TrainingHistory {
  id: string;
  type: 'observation' | 'memory' | 'logic' | 'reaction' | 'workout';
  score: number; // For reaction it's ms (lower is better), for others it's raw score/percentage or reps completed
  timestamp: string;
  metadata?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardXp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  presetType?: string;
}

export interface UserState {
  level: number;
  xp: number;
  nextLevelXp: number;
  dailyStreak: number;
  weeklyStreak: number;
  lastActionDate: string | null;
  selectedTheme: 'specter' | 'vengeance' | 'tactical' | 'matrix';
  soundEnabled: boolean;
}

export interface ObservationGame {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  questions: {
    question: string;
    options: string[];
    answerIndex: number;
  }[];
}
