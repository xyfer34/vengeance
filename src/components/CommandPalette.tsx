/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Search, ShieldAlert, Sparkles, Folder, FileText, Swords, BarChart3, User, Moon, Volume2, VolumeX, Terminal } from 'lucide-react';
import { Note } from '../types';
import { synth } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onNavigate: (page: string) => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  onSelectTheme: (theme: 'specter' | 'vengeance' | 'tactical' | 'matrix') => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onNavigate,
  onToggleSound,
  soundEnabled,
  onSelectTheme,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      synth.metalClick();
    }
  }, [isOpen]);

  // Handle outside click to close
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Collect matching actions and files
  const actions = [
    { id: 'nav-dash', label: 'Navigate: Operations Dashboard', icon: Terminal, category: 'Navigation', action: () => onNavigate('dashboard') },
    { id: 'nav-train', label: 'Navigate: Detective Training Exercises', icon: Swords, category: 'Navigation', action: () => onNavigate('training') },
    { id: 'nav-assistant', label: 'Navigate: AI Tactical Assistant', icon: Sparkles, category: 'Navigation', action: () => onNavigate('assistant') },
    { id: 'nav-missions', label: 'Navigate: Mission Center', icon: ShieldAlert, category: 'Navigation', action: () => onNavigate('missions') },
    { id: 'nav-database', label: 'Navigate: Intelligence Database', icon: Folder, category: 'Navigation', action: () => onNavigate('database') },
    { id: 'nav-analytics', label: 'Navigate: Improvement Analytics', icon: BarChart3, category: 'Navigation', action: () => onNavigate('analytics') },
    { id: 'nav-profile', label: 'Navigate: Profile & Cyber-Ranks', icon: User, category: 'Navigation', action: () => onNavigate('profile') },
    
    { id: 'toggle-sound', label: soundEnabled ? 'Mute System Sounds' : 'Unmute System Sounds', icon: soundEnabled ? VolumeX : Volume2, category: 'System Settings', action: () => { onToggleSound(); onClose(); } },
    
    { id: 'theme-specter', label: 'Initialize UI Overlay: SPECTER (Cyan)', icon: Moon, category: 'Visual Theme', action: () => { onSelectTheme('specter'); onClose(); } },
    { id: 'theme-vengeance', label: 'Initialize UI Overlay: VENGEANCE (Crimson)', icon: Moon, category: 'Visual Theme', action: () => { onSelectTheme('vengeance'); onClose(); } },
    { id: 'theme-tactical', label: 'Initialize UI Overlay: TACTICAL (Amber)', icon: Moon, category: 'Visual Theme', action: () => { onSelectTheme('tactical'); onClose(); } },
    { id: 'theme-matrix', label: 'Initialize UI Overlay: NETRUNNER (Matrix Green)', icon: Moon, category: 'Visual Theme', action: () => { onSelectTheme('matrix'); onClose(); } },
  ];

  const filteredActions = actions.filter(act => 
    act.label.toLowerCase().includes(search.toLowerCase()) ||
    act.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase()) ||
    note.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const combinedItems = [
    ...filteredActions.map(act => ({ type: 'action', data: act, id: act.id, label: act.label, category: act.category, icon: act.icon })),
    ...filteredNotes.map(note => ({ type: 'note', data: note, id: `note-${note.id}`, label: note.title, category: `Database Entry (${note.folder || 'Notes'})`, icon: FileText }))
  ];

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % combinedItems.length);
        synth.click();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + combinedItems.length) % combinedItems.length);
        synth.click();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = combinedItems[selectedIndex];
        if (selected) {
          if (selected.type === 'action') {
            (selected.data as any).action();
          } else {
            onSelectNote(selected.data as Note);
            onClose();
          }
          synth.success();
        }
      } else if (e.key === 'Escape') {
        onClose();
        synth.click();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, combinedItems, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/75 backdrop-blur-sm">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-[#09090d] border border-white/10 rounded-lg shadow-2xl shadow-cyan-500/5 overflow-hidden flex flex-col"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-white/30 text-base focus:outline-none font-mono"
            placeholder="Type a command, note search, or system action (ESC to close)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/30 text-[10px] font-mono select-none">
            ESC
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[350px] overflow-y-auto p-2 flex flex-col gap-1">
          {combinedItems.length === 0 ? (
            <div className="py-8 px-4 text-center text-white/30 font-mono text-xs flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-8 h-8 text-white/10" />
              <span>NO INTELLIGENCE NODES MATCHED QUERY</span>
            </div>
          ) : (
            combinedItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'action') {
                      (item.data as any).action();
                    } else {
                      onSelectNote(item.data as Note);
                      onClose();
                    }
                    synth.success();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left flex items-center justify-between p-2.5 rounded transition-all font-mono text-xs ${
                    isSelected 
                      ? 'bg-white/5 border border-white/10 text-white' 
                      : 'border border-transparent text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-white/40'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                    isSelected ? 'text-cyan-400 bg-cyan-500/10' : 'text-white/20 bg-white/5'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30 font-mono">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <span className="bg-white/5 px-1 rounded border border-white/10 text-white/40">↑↓</span>
            <span>Select:</span>
            <span className="bg-white/5 px-1 rounded border border-white/10 text-white/40">Enter</span>
          </div>
          <div>
            <span>VENGEANCE INTEL UNIT v3.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
