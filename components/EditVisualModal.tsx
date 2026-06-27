"use client";

import React, { useState } from "react";
import { X, Edit2, CheckCircle, Crown } from "lucide-react";
import { GRADES, SUBJECTS, TYPES, SYLLABUSES, MEDIUMS } from "@/lib/constants";

interface EditVisualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  
  editGrade: string;
  setEditGrade: (val: string) => void;
  editSubject: string;
  setEditSubject: (val: string) => void;
  editType: string;
  setEditType: (val: string) => void;
  editSyllabus: string;
  setEditSyllabus: (val: string) => void;
  editMedium: string;
  setEditMedium: (val: string) => void;
  
  editTags: string[];
  setEditTags: (val: string[]) => void;
  
  editIsPremium: boolean;
  setEditIsPremium: (val: boolean) => void;
}

export default function EditVisualModal({
  isOpen, onClose, onSubmit, isSaving,
  editTitle, setEditTitle,
  editDescription, setEditDescription,
  editGrade, setEditGrade,
  editSubject, setEditSubject,
  editType, setEditType,
  editSyllabus, setEditSyllabus,
  editMedium, setEditMedium,
  editTags, setEditTags,
  editIsPremium, setEditIsPremium
}: EditVisualModalProps) {
  const [tagInput, setTagInput] = useState("");

  if (!isOpen) return null;

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !editTags.includes(val)) {
        setEditTags([...editTags, val]);
        setTagInput('');
      }
    }
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !editTags.includes(val)) {
      setEditTags([...editTags, val]);
      setTagInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/20 backdrop-blur-sm">
      <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#f3f3f3] text-brand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl md:text-2xl font-black text-brand mb-6 flex items-center gap-2">
          <Edit2 className="w-6 h-6 text-emerald-500" /> Edit Visual Details
        </h2>
        
        <div className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Title *</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} 
              className="w-full bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none transition-all" />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Description</label>
            <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} 
              className="w-full bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none transition-all resize-none" />
          </div>

          {/* Categorization Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Grade Level</label>
              <select value={editGrade} onChange={(e) => setEditGrade(e.target.value)} 
                className="w-full bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none">
                <option value="">Any Grade</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Subject</label>
              <select value={editSubject} onChange={(e) => setEditSubject(e.target.value)} 
                className="w-full bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none">
                <option value="">Any Subject</option>
                {SUBJECTS.map(s => {
                  if (typeof s === "string") return <option key={s} value={s}>{s}</option>;
                  return (
                    <optgroup key={s.group} label={s.group}>
                      {s.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </optgroup>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Content Type</label>
              <select value={editType} onChange={(e) => setEditType(e.target.value)} 
                className="w-full bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none">
                <option value="">Any Type</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Syllabus</label>
              <select value={editSyllabus} onChange={(e) => setEditSyllabus(e.target.value)} 
                className="w-full bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none">
                <option value="">Any Syllabus</option>
                {SYLLABUSES.map(s => {
                  if (typeof s === "string") return <option key={s} value={s}>{s}</option>;
                  return (
                    <optgroup key={s.group} label={s.group}>
                      {s.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </optgroup>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Medium</label>
              <select value={editMedium} onChange={(e) => setEditMedium(e.target.value)} 
                className="w-full bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none">
                <option value="">Any Medium</option>
                {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Custom Tags */}
          <div>
            <label className="block text-[10px] font-black uppercase text-brand-muted mb-1.5 tracking-wider">Custom Tags</label>
            <div className="flex gap-2 mb-2">
              <input 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type and press enter..."
                className="flex-1 bg-[#f3f3f3] border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand focus:border-brand focus:bg-white outline-none" 
              />
              <button type="button" onClick={addTag} className="px-6 py-3 bg-brand text-white font-bold rounded-xl text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editTags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 bg-[#f3f3f3] border border-brand-border px-3 py-1.5 rounded-lg text-xs font-bold text-brand">
                  {tag} <button onClick={() => setEditTags(editTags.filter(t => t !== tag))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center gap-4 bg-[#f3f3f3] p-4 rounded-xl border border-brand-border">
            <div className="flex-1">
              <div className="flex items-center gap-2 font-black text-brand mb-1">
                <Crown className="w-4 h-4 text-emerald-600" /> Premium Visual
              </div>
              <p className="text-[10px] text-brand-muted">Only allow users with an active subscription to download this visual.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={editIsPremium} onChange={(e) => setEditIsPremium(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-brand-border">
            <button onClick={onClose} className="px-6 py-3 border border-brand-border text-brand font-bold rounded-xl hover:bg-[#f3f3f3]">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={isSaving || !editTitle.trim()} className="px-8 py-3 bg-brand text-white font-extrabold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {isSaving ? "Saving..." : "Save Changes"} <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
