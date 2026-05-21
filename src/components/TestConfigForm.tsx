import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ExamType, Subject, TestConfig, Difficulty, InstituteStyle } from '../types';
import { Loader2 } from 'lucide-react';
import { SYLLABUS } from '../lib/syllabus';

interface TestConfigFormProps {
  isGenerating: boolean;
  onStart: (config: TestConfig) => void;
}

const ALL_SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Biology', 'Mathematics'];
const DIFFICULTIES: Difficulty[] = ['Foundational', 'Adaptive', 'Intense'];
const INSTITUTES: InstituteStyle[] = ['None', 'Allen', 'Aakash', 'Physics Wallah', 'Motion', 'Fiitjee', 'Arihant'];

const LOADING_TIPS = [
  "Analyzing previous year questions...",
  "Formatting subjective problems...",
  "Adapting difficulty levels...",
  "Generating targeted explanations...",
  "Simulating institute exam patterns...",
  "Finalizing your custom test..."
];

export function TestConfigForm({ isGenerating, onStart }: TestConfigFormProps) {
  const [examType, setExamType] = useState<ExamType>('NEET');
  const [mode, setMode] = useState<'Exam' | 'Practice'>('Exam');
  const [subjects, setSubjects] = useState<Subject[]>(['Physics', 'Chemistry', 'Biology']);
  const [chapters, setChapters] = useState<Partial<Record<Subject, string[]>>>({});
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('Adaptive');
  const [includePYQ, setIncludePYQ] = useState<boolean>(false);
  const [onlyPYQ, setOnlyPYQ] = useState<boolean>(false);
  const [includeSubjective, setIncludeSubjective] = useState<boolean>(false);
  const [instituteStyle, setInstituteStyle] = useState<InstituteStyle>('None');
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
      }, 2500);
    } else {
      setLoadingTipIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSubjectToggle = (subject: Subject) => {
    setSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };
  
  const handleChapterToggle = (subject: Subject, chapter: string) => {
    setChapters(prev => {
      const subjChapters = prev[subject] || [];
      if (subjChapters.includes(chapter)) {
        return { ...prev, [subject]: subjChapters.filter(c => c !== chapter) };
      } else {
        return { ...prev, [subject]: [...subjChapters, chapter] };
      }
    });
  };

  const handleAttemptStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjects.length > 0) {
      onStart({ mode, examType, subjects, difficulty, numberOfQuestions: numQuestions, includePYQ, onlyPYQ, includeSubjective, instituteStyle, chapters });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex-1 w-full"
    >
      <form onSubmit={handleAttemptStart} className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Subjects Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Select Subjects & Chapters</label>
            <div className="space-y-4">
              {ALL_SUBJECTS.map((subject) => {
                const isSelected = subjects.includes(subject);
                const subjChapters = chapters[subject] || [];
                const allSubjChapters = SYLLABUS[subject];

                return (
                  <div key={subject} className="flex flex-col gap-1">
                    <label 
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        isSelected ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-indigo-600 cursor-pointer"
                        checked={isSelected}
                        onChange={() => {
                          handleSubjectToggle(subject);
                          if (isSelected) {
                            setChapters(prev => {
                              const newChapters = { ...prev };
                              delete newChapters[subject];
                              return newChapters;
                            });
                          }
                        }}
                      />
                      <div className="flex-1">
                         <span className="font-bold text-slate-800">{subject}</span>
                         {isSelected && (
                           <span className="block text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                             {(subjChapters.length === 0 || subjChapters.length === allSubjChapters.length) ? 'Entire Syllabus' : `${subjChapters.length} Chapters Selected`}
                           </span>
                         )}
                      </div>
                    </label>
                    
                    {isSelected && (
                       <div className="pl-4 pr-2 py-2 max-h-48 overflow-y-auto mb-2 border-l-2 border-indigo-100 ml-4 space-y-1 scrollbar-thin">
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent">
                             <input 
                               type="checkbox" 
                               className="w-4 h-4 accent-indigo-500 cursor-pointer outline-none"
                               checked={subjChapters.length === 0 || subjChapters.length === allSubjChapters.length}
                               onChange={(e) => {
                                  if (e.target.checked) {
                                     setChapters(prev => ({ ...prev, [subject]: [] }));
                                  } else {
                                     setChapters(prev => ({ ...prev, [subject]: [] }));
                                  }
                               }}
                             />
                             <span className="text-xs font-bold uppercase tracking-wider text-slate-700">All Chapters (Full Syllabus)</span>
                          </label>
                          {allSubjChapters.map(chap => {
                             const isChapSelected = subjChapters.includes(chap);
                             // If no chapters selected explicitely, assume all are selected conceptually, 
                             // but we show them checked if 'All Chapters' is active
                             const isChecked = subjChapters.length === 0 ? true : isChapSelected;
                             return (
                               <label key={chap} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent">
                                 <input 
                                   type="checkbox" 
                                   className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                   checked={isChecked}
                                   onChange={(e) => {
                                      if (subjChapters.length === 0 && !e.target.checked) {
                                         // user deselected one chapter when all were selected -> switch to explicit list minus one
                                         setChapters(prev => ({ ...prev, [subject]: allSubjChapters.filter(c => c !== chap) }));
                                      } else if (subjChapters.length === 0 && e.target.checked) {
                                         // Shouldn't happen since it's already checked, but for completeness:
                                      } else {
                                         handleChapterToggle(subject, chap);
                                      }
                                   }}
                                 />
                                 <span className="text-sm font-medium text-slate-600 line-clamp-2" title={chap}>{chap}</span>
                               </label>
                             );
                          })}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
            {subjects.length === 0 && (
              <p className="text-sm text-red-500 mt-2 font-medium">Please select at least one subject.</p>
            )}
          </div>

          <div className="space-y-8">
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Test Mode</label>
              <div className="flex gap-2">
                {(['Exam', 'Practice'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      mode === m
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Select Exam</label>
              <div className="flex gap-2">
                {(['NEET', 'IAT'] as ExamType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setExamType(type);
                      if (type === 'NEET') setSubjects(['Physics', 'Chemistry', 'Biology']);
                      if (type === 'IAT') setSubjects(['Physics', 'Chemistry', 'Biology', 'Mathematics']);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      examType === type
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Difficulty Mode</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      difficulty === diff
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                Questions per Test: <span className="text-indigo-600">{numQuestions}</span>
              </label>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <input
                  type="range"
                  min="3"
                  max="180"
                  step="1"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 mb-2 cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Quick (3)</span>
                  <span>Full (180)</span>
                </div>
              </div>
            </div>
            
            {/* Include PYQs */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  checked={includePYQ}
                  onChange={(e) => {
                    setIncludePYQ(e.target.checked);
                    if (!e.target.checked) setOnlyPYQ(false);
                  }}
                />
                <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">Include Previous Year Questions (PYQs)</span>
              </label>

              {includePYQ && (
                <label className="flex items-center gap-3 p-4 ml-6 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                    checked={onlyPYQ}
                    onChange={(e) => setOnlyPYQ(e.target.checked)}
                  />
                  <span className="font-bold text-sm text-indigo-800 uppercase tracking-wide">Strictly Only PYQs</span>
                </label>
              )}

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  checked={includeSubjective}
                  onChange={(e) => setIncludeSubjective(e.target.checked)}
                />
                <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">Include Subjective Questions</span>
              </label>
            </div>

            {/* Institute Series Style Simulation */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Simulate Institute Test Series</label>
              <select
                value={instituteStyle}
                onChange={(e) => setInstituteStyle(e.target.value as InstituteStyle)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow transition-colors"
                title="Select Institute Test Series"
              >
                {INSTITUTES.map(inst => (
                  <option key={inst} value={inst}>
                    {inst === 'None' ? 'Standard Adaptive Pattern' : `${inst} Test Series Style`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={subjects.length === 0 || isGenerating}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold text-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-3 overflow-hidden relative"
        >
          {isGenerating ? (
            <motion.div 
              key={loadingTipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3"
            >
              <Loader2 size={24} className="animate-spin" />
              <span>{LOADING_TIPS[loadingTipIndex]}</span>
            </motion.div>
          ) : (
            <span>Generate & Start {mode}</span>
          )}
        </button>
      </form>
    </motion.div>
  );
}
