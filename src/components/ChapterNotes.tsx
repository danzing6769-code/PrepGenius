import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject } from '../types';
import { SYLLABUS } from '../lib/syllabus';
import { Loader2, BookOpen, AlertCircle, Quote } from 'lucide-react';

interface NotesData {
  title: string;
  topics: {
    heading: string;
    explanation: string;
    points: string[];
    examples?: string[];
    commonPitfalls?: string;
    importantFormula?: string;
  }[];
}

export function ChapterNotes() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | "">("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [notesStyle, setNotesStyle] = useState<string>("Detailed (General)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NotesData | null>(null);

  const ALL_SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Biology', 'Mathematics'];
  const chapters = selectedSubject ? SYLLABUS[selectedSubject] : [];

  const fetchNotes = async () => {
    if (!selectedSubject || !selectedChapter) return;
    
    setLoading(true);
    setError(null);
    setNotes(null);

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject, chapter: selectedChapter, notesStyle }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notes');
      }

      setNotes(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
           <BookOpen size={20} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Last Minute Revision Notes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 shrink-0">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value as Subject);
              setSelectedChapter("");
              setNotes(null);
            }}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
          >
            <option value="" disabled>Select a subject</option>
            {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Chapter</label>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            disabled={!selectedSubject}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:opacity-50 appearance-none"
          >
            <option value="" disabled>Select a chapter</option>
            {chapters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Notes Style</label>
          <select
            value={notesStyle}
            onChange={(e) => setNotesStyle(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
          >
            <option value="Detailed (General)">Detailed (General)</option>
            <option value="Arihant Short Notes">Arihant Short Notes</option>
          </select>
        </div>

        <div className="md:col-span-3 mt-2">
          <button
            onClick={fetchNotes}
            disabled={!selectedSubject || !selectedChapter || loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Retrieving Notes...
              </>
            ) : (
              'Generate High-Yield Notes'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-start gap-3 shrink-0">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
        <AnimatePresence mode="wait">
          {notes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="border-b border-slate-100 pb-4">
                 <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{notes.title}</h3>
                 <p className="text-indigo-600 font-semibold mt-1 flex items-center gap-2">
                   <Quote size={14} /> Quick Review Matrix
                 </p>
              </div>

              <div className="space-y-6">
                {notes.topics.map((topic, i) => (
                  <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">{topic.heading}</h4>
                    <p className="text-slate-700 font-medium leading-relaxed mb-4">{topic.explanation}</p>
                    
                    <ul className="space-y-3 mb-5 pl-1">
                      {topic.points.map((pt, j) => (
                        <li key={j} className="flex items-start text-sm text-slate-700 leading-relaxed font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 mr-3 shrink-0"></span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    {topic.examples && topic.examples.length > 0 && (
                      <div className="mb-4 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 block">Examples & Applications</span>
                        <ul className="space-y-2">
                          {topic.examples.map((ex, k) => (
                            <li key={k} className="flex items-start text-sm text-emerald-800 font-medium">
                               <span className="text-emerald-500 mr-2">›</span> {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {topic.commonPitfalls && (
                      <div className="mb-4 bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                        <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-1"><AlertCircle size={10} className="mr-1" /> Common Pitfalls / Exceptions</span>
                        <p className="text-sm font-medium text-rose-800 mt-1">{topic.commonPitfalls}</p>
                      </div>
                    )}

                    {topic.importantFormula && (
                      <div className="mt-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 block">Key Formula / Mnemonic</span>
                        <code className="text-sm font-bold text-indigo-700 font-mono tracking-wide">{topic.importantFormula}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-8 pb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">End of Notes</p>
              </div>
            </motion.div>
          )}

          {!notes && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
              <BookOpen size={48} className="mb-4 text-slate-200" />
              <p className="font-semibold">Select a subject and chapter to generate revision notes.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
