/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Folder, Tag, Plus, FileText, ChevronRight, Edit2, Trash2, Sparkles, Loader2, ClipboardCheck } from 'lucide-react';
import { Note } from '../types';
import { synth } from '../utils/audio';

interface DatabaseViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  selectedNoteIdFromPalette?: string | null;
  onClearSelectedNoteId?: () => void;
}

const PRESET_NOTE_TEMPLATES = [
  {
    title: 'SUSPECT DOSSIER: [NAME]',
    folder: 'Suspect Profiles',
    tags: ['SUSPECT', 'DOSSIER'],
    content: `[CONFIDENTIAL TACTICAL RECORD]
NAME: 
ALIAS: 
PHYSICAL PROFILE: 
KNOWN ASSOCIATIONS: 
CRIMINAL OVERVIEW: 
POTENTIAL MOTIVE: 
CURRENT LOCATION: `
  },
  {
    title: 'AUTOPSY FORENSIC SCAN: [ID]',
    folder: 'Forensic Reports',
    tags: ['FORENSIC', 'AUTOPSY'],
    content: `[CONFIDENTIAL MEDICAL FORENSIC REPORT]
SUBJECT ID: 
ESTIMATED TIME OF DEATH: 
PRIMARY CAUSE OF DEATH: 
TOXICOLOGY INDICES: 
UNUSUAL SUBSTANCE MARKERS: 
INVESTIGATING SCIENTIST: `
  },
  {
    title: 'CASE TIMELINE LOG',
    folder: 'Investigations',
    tags: ['TIMELINE', 'ACTIVE'],
    content: `[CHRONOLOGICAL RECORD OF INCIDENT]
- 08:30 | Incident reported at coordinate node [X]
- 09:12 | First responder units deployed
- 10:45 | Forensic toxic smog scan registered 45 PPM
- 12:15 | Primary suspect seen departing via South-West vector`
  }
];

export default function DatabaseView({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  selectedNoteIdFromPalette,
  onClearSelectedNoteId,
}: DatabaseViewProps) {
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  
  // Edit / Creation states
  const [isEditing, setIsEditing] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteFolder, setNoteFolder] = useState('Investigations');
  const [noteContent, setNoteContent] = useState('');
  const [noteTagsString, setNoteTagsString] = useState('');

  // AI Summary states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Parse directories/folders and tags dynamically from notes
  const folders = Array.from(new Set(notes.map(n => n.folder || 'Notes')));
  const tags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.folder.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesFolder = selectedFolder ? n.folder === selectedFolder : true;
    const matchesTag = selectedTag ? n.tags.includes(selectedTag) : true;

    return matchesSearch && matchesFolder && matchesTag;
  });

  // Handle Note selection from palette trigger
  if (selectedNoteIdFromPalette) {
    const note = notes.find(n => n.id === selectedNoteIdFromPalette);
    if (note) {
      setActiveNote(note);
      setIsEditing(false);
      setAiSummary(null);
    }
    if (onClearSelectedNoteId) onClearSelectedNoteId();
  }

  const handleSelectNote = (note: Note) => {
    synth.metalClick();
    setActiveNote(note);
    setIsEditing(false);
    setAiSummary(null);
  };

  const handleCreateNew = () => {
    synth.metalClick();
    setActiveNote(null);
    setNoteTitle('');
    setNoteFolder('Investigations');
    setNoteContent('');
    setNoteTagsString('');
    setIsEditing(true);
    setAiSummary(null);
  };

  const handleEditExisting = () => {
    if (!activeNote) return;
    synth.metalClick();
    setNoteTitle(activeNote.title);
    setNoteFolder(activeNote.folder);
    setNoteContent(activeNote.content);
    setNoteTagsString(activeNote.tags.join(', '));
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!noteTitle.trim()) return;
    synth.success();

    const parsedTags = noteTagsString
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0);

    if (activeNote) {
      // Update
      const updated: Note = {
        ...activeNote,
        title: noteTitle,
        folder: noteFolder,
        content: noteContent,
        tags: parsedTags,
        updatedAt: new Date().toISOString(),
      };
      onUpdateNote(updated);
      setActiveNote(updated);
    } else {
      // Create
      onAddNote({
        title: noteTitle,
        folder: noteFolder,
        content: noteContent,
        tags: parsedTags,
      });
      // Select the newly added note by searching for title in next render or just clear editor
      setActiveNote(null);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    synth.error();
    onDeleteNote(id);
    setActiveNote(null);
    setIsEditing(false);
  };

  const handleApplyTemplate = (temp: typeof PRESET_NOTE_TEMPLATES[0]) => {
    synth.success();
    setNoteTitle(temp.title);
    setNoteFolder(temp.folder);
    setNoteTagsString(temp.tags.join(', '));
    setNoteContent(temp.content);
  };

  // Summarize Note Content via server Gemini proxy
  const handleAISummarize = async () => {
    if (!activeNote) return;
    synth.click();
    setAiLoading(true);
    setAiSummary(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeNote.content,
          mode: 'summarize',
        }),
      });

      if (!res.ok) {
        throw new Error('Server connection failed.');
      }

      const data = await res.json();
      setAiSummary(data.content);
      synth.success();
    } catch (e) {
      synth.error();
      setAiSummary('Error: Mainframe summary offline. Check connection logs.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-1">
      
      {/* Left Column: Directories & Tags Filters */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Folders */}
        <div className="glass-panel border border-white/5 rounded-lg p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2 block">
            DIRECTORIES (FOLDERS)
          </span>
          <button
            onClick={() => { synth.click(); setSelectedFolder(null); }}
            className={`w-full p-2 text-xs font-mono rounded text-left flex items-center justify-between ${
              selectedFolder === null ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>[ALL DIRECTORIES]</span>
            <span>{notes.length}</span>
          </button>
          {folders.map(fold => (
            <button
              key={fold}
              onClick={() => { synth.click(); setSelectedFolder(fold); }}
              className={`w-full p-2 text-xs font-mono rounded text-left flex items-center justify-between ${
                selectedFolder === fold ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20' : 'text-white/50 hover:text-white'
              }`}
            >
              <span className="truncate flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fold}</span>
              </span>
              <span>{notes.filter(n => n.folder === fold).length}</span>
            </button>
          ))}
        </div>

        {/* Tags cloud */}
        <div className="glass-panel border border-white/5 rounded-lg p-4">
          <span className="text-[10px] font-mono text-white/40 uppercase border-b border-white/5 pb-2 block mb-3">
            SECURE META TAGS
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { synth.click(); setSelectedTag(null); }}
              className={`px-2.5 py-1 text-[9px] font-mono rounded border uppercase transition-colors cursor-pointer ${
                selectedTag === null
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                  : 'border-white/5 bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              #ALL
            </button>
            {tags.map(t => (
              <button
                key={t}
                onClick={() => { synth.click(); setSelectedTag(t); }}
                className={`px-2.5 py-1 text-[9px] font-mono rounded border uppercase transition-colors cursor-pointer ${
                  selectedTag === t
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                    : 'border-white/5 bg-white/5 text-white/40 hover:text-white'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Middle Column: Files/Notes Deck List */}
      <div className="lg:col-span-1.5 flex flex-col gap-4">
        
        {/* Search & Add Bar */}
        <div className="flex gap-2">
          <div className="flex-1 bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/30 font-mono flex items-center gap-2 focus-within:border-cyan-400/40">
            <Search className="w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search intelligence cache..."
              className="bg-transparent border-none outline-none text-xs flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handleCreateNew}
            className="p-2 bg-cyan-400 hover:bg-cyan-500 text-black rounded font-bold cursor-pointer transition-colors"
            title="Create New Note Entry"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Notes Listing Deck */}
        <div className="overflow-y-auto max-h-[60vh] flex flex-col gap-3">
          {filteredNotes.length === 0 ? (
            <div className="glass-panel border border-white/5 rounded-lg p-8 text-center text-white/30 font-mono text-xs">
              <span>NO FILES FOUND IN ARCHIVE</span>
            </div>
          ) : (
            filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`w-full text-left glass-panel border rounded-lg p-3.5 transition-all flex flex-col gap-2 ${
                  activeNote?.id === note.id
                    ? 'border-cyan-400 bg-cyan-500/5 shadow-lg shadow-cyan-400/5'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-display text-xs text-white font-bold uppercase truncate flex-1">
                    {note.title}
                  </h4>
                  <span className="text-[9px] font-mono text-white/30 uppercase flex-shrink-0">
                    {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-sans line-clamp-2 leading-relaxed">
                  {note.content}
                </p>
                <div className="flex items-center gap-2 mt-1 border-t border-white/5 pt-2">
                  <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                    <Folder className="w-3 h-3 text-cyan-500/60" />
                    <span>{note.folder}</span>
                  </span>
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[8px] font-mono bg-white/5 border border-white/5 text-white/40 px-1 py-0.2 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

      </div>

      {/* Right Column: Note Viewer / Editor Panel */}
      <div className="lg:col-span-1.5 flex flex-col gap-4">
        {isEditing ? (
          // Note Creation / Editor panel
          <div className="glass-panel border border-cyan-400/20 rounded-lg p-5 flex flex-col gap-4">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2 block">
              {activeNote ? 'EDIT CLUE DATA' : 'WRITE SECURITY ARCHIVE'}
            </span>

            {/* Template shortcuts if creating new */}
            {!activeNote && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-mono text-white/30 uppercase">Apply Forensic Templates:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_NOTE_TEMPLATES.map(temp => (
                    <button
                      key={temp.title}
                      onClick={() => handleApplyTemplate(temp)}
                      className="px-2 py-1 bg-white/5 hover:bg-cyan-500/5 border border-white/5 hover:border-cyan-400/20 text-[9px] font-mono text-white/60 hover:text-cyan-400 rounded transition-all cursor-pointer"
                    >
                      {temp.folder}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-white/40 uppercase">Clue / Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Suspect interrogation files, autopsy notes..."
                  className="bg-black border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400/40"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/40 uppercase">Directory (Folder)</label>
                  <select
                    className="bg-black border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400/40"
                    value={noteFolder}
                    onChange={(e) => setNoteFolder(e.target.value)}
                  >
                    <option value="Investigations">Active Investigations</option>
                    <option value="Suspect Profiles">Suspect Profiles</option>
                    <option value="Forensic Reports">Forensic Reports</option>
                    <option value="Research Archives">Research Archives</option>
                    <option value="Notes">General Notes</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/40 uppercase">Meta Tags (Comma split)</label>
                  <input
                    type="text"
                    placeholder="SUSPECT, SECURE, CASE_01"
                    className="bg-black border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400/40 placeholder-white/10 uppercase"
                    value={noteTagsString}
                    onChange={(e) => setNoteTagsString(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-white/40 uppercase">Intelligence Log Content</label>
                <textarea
                  rows={10}
                  placeholder="Write clear, objective observations, timelines, and rational deduction traces..."
                  className="bg-black border border-white/10 rounded px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-cyan-400/40"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-white/5 mt-2">
                <button
                  type="button"
                  onClick={() => { synth.click(); setIsEditing(false); }}
                  className="px-3 py-1.5 border border-white/10 text-white/50 hover:text-white rounded"
                >
                  ABORT
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-500 text-black font-bold rounded cursor-pointer"
                >
                  SAVE CLUE
                </button>
              </div>
            </div>
          </div>
        ) : activeNote ? (
          // File / Note Viewer Panel
          <div className="glass-panel border border-white/5 rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/20" />
            
            {/* Header toolbar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>SECURE DATABASE CARD</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleEditExisting}
                  className="p-1.5 border border-white/10 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Modify Entry"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(activeNote.id)}
                  className="p-1.5 border border-red-500/20 rounded text-red-400/50 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                  title="Delete Entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note details */}
            <div>
              <span className="text-[9px] font-mono text-white/30 uppercase">{activeNote.folder}</span>
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wide mt-0.5">
                {activeNote.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeNote.tags.map(tag => (
                  <span key={tag} className="text-[8px] font-mono bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Main content body */}
            <div className="font-sans text-xs text-white/80 whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded border border-white/5 max-h-[300px] overflow-y-auto">
              {activeNote.content}
            </div>

            {/* AI Summary Utility Section */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/40 uppercase">AI REASONING TOOL</span>
                {!aiSummary && (
                  <button
                    onClick={handleAISummarize}
                    disabled={aiLoading}
                    className="px-3 py-1 bg-cyan-400 hover:bg-cyan-500 disabled:bg-white/5 disabled:text-white/25 disabled:cursor-not-allowed text-black font-display font-bold text-[9px] tracking-widest rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>SUMMARIZE NOTE</span>
                  </button>
                )}
              </div>

              {aiSummary && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-cyan-500/5 border border-cyan-500/10 rounded font-mono text-[10px] text-white/90 leading-relaxed max-h-[220px] overflow-y-auto relative"
                >
                  <div className="absolute top-2 right-2 text-cyan-400/30 flex items-center gap-1">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-bold text-cyan-400 border-b border-cyan-400/20 pb-1.5 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>INTELLIGENCE Executive brief</span>
                  </div>
                  {aiSummary}
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          // No active note selected placeholder
          <div className="glass-panel border border-white/5 rounded-lg p-12 text-center text-white/20 font-mono text-xs flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <FileText className="w-10 h-10 text-white/5 mb-3 animate-pulse" />
            <span>SELECT COGNITIVE FILE FOR EXPANSION</span>
          </div>
        )}
      </div>

    </div>
  );
}
