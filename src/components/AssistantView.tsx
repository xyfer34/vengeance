/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, ShieldAlert, Image, Trash2, FileText, ChevronRight, User, Terminal, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { synth } from '../utils/audio';

interface AssistantViewProps {
  chatHistory: ChatMessage[];
  onAddChatMessage: (msg: ChatMessage) => void;
  onClearChatHistory: () => void;
  presetText?: string;
  onClearPresetText?: () => void;
}

export default function AssistantView({
  chatHistory,
  onAddChatMessage,
  onClearChatHistory,
  presetText,
  onClearPresetText,
}: AssistantViewProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Image attachment states
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (presetText) {
      setInput(presetText);
      if (onClearPresetText) onClearPresetText();
    }
  }, [presetText]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      synth.error();
      setErrorMsg('Invalid attachment. Must be an image file.');
      return;
    }

    synth.metalClick();
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract pure base64 representation
      const base64Data = result.split(',')[1];
      setAttachedImage(base64Data);
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    synth.click();
    setAttachedImage(null);
    setImageMime(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query && !attachedImage) return;

    synth.click();
    setErrorMsg(null);
    setLoading(true);

    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query || '[Attached Intelligence Image Analysis]',
      timestamp: new Date().toISOString(),
    };
    onAddChatMessage(userMsg);
    setInput('');

    try {
      let responseText = '';

      if (attachedImage) {
        // Use analysis route for image + prompt
        const res = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: query || 'Identify suspect markers, forensic targets, or geographic details in this intelligence photo.',
            mode: 'custom',
            imageBase64: attachedImage,
            imageMimeType: imageMime,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Server rejected visual analysis request.');
        }

        const data = await res.json();
        responseText = data.content;
        
        // Remove image after send completes
        setAttachedImage(null);
        setImageMime(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        // Regular conversation chat route (supports context history)
        // package up history + new message
        const payloadHistory = [
          ...chatHistory.map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: query },
        ];

        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payloadHistory }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Server rejected connection handshake.');
        }

        const data = await res.json();
        responseText = data.content;
      }

      synth.success();
      onAddChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      synth.error();
      console.error('Gemini proxy error:', err);
      setErrorMsg(err.message || 'Mainframe connection severed. Ensure process is online.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetTrigger = (presetMode: 'summarize' | 'hypothesis' | 'leads' | 'decrypt', title: string) => {
    synth.metalClick();
    let promptText = '';
    switch (presetMode) {
      case 'summarize':
        promptText = 'SUMMARIZE FORENSIC DATA:\n[Enter clues, suspect notes, or timelines here]';
        break;
      case 'hypothesis':
        promptText = 'FORMULATE CASE HYPOTHESES:\n[Enter clues and cross-references to synthesize]';
        break;
      case 'leads':
        promptText = 'BRAINSTORM ACTIONABLE LEADS:\n[Enter objective or unsolved target parameters]';
        break;
      case 'decrypt':
        promptText = 'DECONSTRUCT FORENSIC METHODOLOGIES:\n[Enter unfamiliar technical concepts, chemicals, or procedures]';
        break;
    }
    setInput(promptText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-1">
      
      {/* Left Presets Pane */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="glass-panel border border-white/5 rounded-lg p-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">
            TACTICAL TEMPLATES
          </span>
          <p className="text-[10px] text-white/55 font-mono leading-relaxed uppercase">
            Initialize specific directive models to pre-format inputs for high-probability reasoning outputs.
          </p>

          <div className="flex flex-col gap-2 mt-2">
            {[
              { mode: 'summarize', label: 'Summarize Evidence', desc: 'Distill critical files' },
              { mode: 'hypothesis', label: 'Formulate Hypotheses', desc: 'Synthesize clues' },
              { mode: 'leads', label: 'Brainstorm Leads', desc: 'Actionable targets' },
              { mode: 'decrypt', label: 'Methodology Study', desc: 'Explain complex ciphers' },
            ].map(preset => (
              <button
                key={preset.mode}
                onClick={() => handlePresetTrigger(preset.mode as any, preset.label)}
                className="w-full p-2.5 rounded border border-white/5 bg-white/5 hover:bg-cyan-500/5 hover:border-cyan-400/30 text-left transition-all flex flex-col gap-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white group">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{preset.label}</span>
                </div>
                <span className="text-[9px] text-white/40 font-mono ml-5 uppercase">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={() => { synth.metalClick(); onClearChatHistory(); }}
            className="w-full py-2 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400/80 hover:text-red-400 text-xs font-mono rounded transition-colors cursor-pointer"
          >
            PURGE ACTIVE SESSION LOGS
          </button>
        )}
      </div>

      {/* Right Chat Terminal Interface */}
      <div className="lg:col-span-3 flex flex-col h-[70vh] bg-[#09090d] border border-white/10 rounded-lg overflow-hidden relative shadow-2xl">
        
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">TACTICAL MAIN FRAME</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 border border-cyan-400/20 rounded">
            SYS: GEMINI-3.5-FLASH
          </span>
        </div>

        {/* Chat messages viewport */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {chatHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/30 font-mono">
              <Terminal className="w-10 h-10 text-white/10 mb-3 animate-pulse" />
              <h3 className="font-display text-sm text-white/50 font-bold uppercase mb-1">INTEL MAIN FRAME SECURE</h3>
              <p className="text-[10px] uppercase max-w-sm leading-relaxed">
                Awaiting commands. Formulate suspect queries, request evidence summaries, or attach photographic components for visual analysis.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 font-mono text-xs ${
                  msg.role === 'user'
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                    : 'border-white/10 bg-white/5 text-white/60'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                </div>

                {/* Content Card */}
                <div className={`p-3 rounded border text-xs font-mono whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'border-cyan-500/20 bg-cyan-500/5 text-white'
                    : 'border-white/5 bg-[#0d0d12] text-white/85'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 self-start max-w-[85%]">
              <div className="w-8 h-8 rounded border border-white/10 bg-white/5 flex items-center justify-center text-white/40">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
              <div className="p-3 rounded border border-white/5 bg-[#0d0d12] text-white/40 font-mono text-xs italic flex items-center gap-2">
                <span>RECONSTRUCTING COGNITIVE DATA CHUNKS...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-bounce" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic visual preview of attached file */}
        {attachedImage && (
          <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <FileText className="w-4 h-4" />
              <span>Image attachment cached (Base64)</span>
            </div>
            <button
              onClick={handleRemoveImage}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-white/5 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
          {/* File input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => { synth.metalClick(); fileInputRef.current?.click(); }}
            className="p-2 border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-500/5 rounded text-white/50 hover:text-cyan-400 transition-all cursor-pointer flex-shrink-0"
            title="Attach Suspect Photo / Intelligence Map"
          >
            <Image className="w-4 h-4" />
          </button>

          <input
            type="text"
            className="flex-1 bg-black border border-white/10 focus:border-cyan-400/40 rounded px-3 py-2 text-xs text-white placeholder-white/30 font-mono focus:outline-none"
            placeholder={attachedImage ? "Provide context for this attached layout..." : "Formulate intelligence query, analyze clues, summarize case files..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            type="submit"
            disabled={(!input.trim() && !attachedImage) || loading}
            className="p-2 bg-cyan-400 hover:bg-cyan-500 text-black rounded font-bold cursor-pointer disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
