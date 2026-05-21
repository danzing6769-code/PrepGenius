import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Question } from '../types';
import { CheckCircle2, XCircle, ArrowRight, Award, MessageSquare, Loader2, Sparkles } from 'lucide-react';

interface TestResultsProps {
  questions: Question[];
  answers: Record<string, number | string>;
  onHome: () => void;
}

export function TestResults({ questions, answers, onHome }: TestResultsProps) {
  const [evaluations, setEvaluations] = useState<Record<string, { grade: string; feedback: string; loading?: boolean; error?: string }>>({});

  const evaluateAnswer = async (questionId: string, questionText: string, userAnswer: string, correctAnswerText: string) => {
    setEvaluations(prev => ({ ...prev, [questionId]: { grade: '', feedback: '', loading: true } }));
    try {
      const response = await fetch('/api/evaluate-subjective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText, userAnswer, correctAnswerText }),
      });
      if (!response.ok) throw new Error('Failed to evaluate');
      const data = await response.json();
      setEvaluations(prev => ({ ...prev, [questionId]: { grade: data.grade, feedback: data.feedback, loading: false } }));
    } catch (error) {
      setEvaluations(prev => ({ ...prev, [questionId]: { grade: '', feedback: '', loading: false, error: 'Evaluation failed.' } }));
    }
  };

  let score = 0;
  let correctAnswersCount = 0;
  let objectiveCount = 0;

  questions.forEach((q) => {
    if (!q.type || q.type === 'Objective') {
      objectiveCount++;
      if (answers[q.id] !== undefined && answers[q.id] !== '') {
        if (answers[q.id] === q.correctAnswerIndex) {
          score += 4; // Typical marking: +4 for correct, -1 for wrong.
          correctAnswersCount++;
        } else {
          score -= 1;
        }
      }
    }
  });

  const maxScore = objectiveCount * 4;
  const percentage = maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;

  // Subject-wise breakdown for Objective
  const subjectStats: Record<string, { total: number; correct: number }> = {};
  questions.forEach((q) => {
    if (!q.type || q.type === 'Objective') {
      if (!subjectStats[q.subject]) {
        subjectStats[q.subject] = { total: 0, correct: 0 };
      }
      subjectStats[q.subject].total++;
      if (answers[q.id] === q.correctAnswerIndex) {
        subjectStats[q.subject].correct++;
      }
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-800 text-center text-white"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-emerald-400 mb-6">
          <Award size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Test Completed</h2>
        <p className="text-slate-400 mb-10">Here is your objective score breakdown. (Subjective questions are not auto-graded)</p>
        
        <div className="flex justify-center flex-wrap gap-12">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-mono font-bold text-white">{score}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">/ {maxScore} Marks</span>
          </div>
          <div className="w-px bg-slate-800 mx-2 hidden sm:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-mono font-bold text-indigo-400">{percentage}%</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Accuracy</span>
          </div>
          <div className="w-px bg-slate-800 mx-2 hidden sm:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-mono font-bold text-white">{correctAnswersCount}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Correct</span>
          </div>
        </div>
      </motion.div>

      {Object.keys(subjectStats).length > 0 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Objective Subject Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(subjectStats).map(([subj, stats]) => {
               if (stats.total === 0) return null;
               const subjAcc = Math.round((stats.correct / stats.total) * 100);
               return (
                 <div key={subj} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{subj}</span>
                    <span className={`text-2xl font-bold mb-1 ${subjAcc >= 80 ? 'text-emerald-600' : subjAcc >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {subjAcc}%
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {stats.correct} / {stats.total} correct
                    </span>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 px-2">Detailed Analysis</h3>
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isObjective = !q.type || q.type === 'Objective';
          const isCorrect = isObjective && userAnswer === q.correctAnswerIndex;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={q.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 uppercase tracking-wider">
                    {q.subject}
                  </span>
                  {q.chapter && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-600 uppercase tracking-widest truncate max-w-[200px]">
                      {q.chapter}
                    </span>
                  )}
                  {!isObjective && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 uppercase tracking-widest">
                      Subjective
                    </span>
                  )}
                </div>
                <div>
                  {isObjective ? (
                    isCorrect ? (
                      <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                        <CheckCircle2 size={14} className="mr-1.5" /> Correct (+4)
                      </span>
                    ) : userAnswer === undefined || userAnswer === '' ? (
                      <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                        <ArrowRight size={14} className="mr-1.5" /> Unattempted (0)
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                        <XCircle size={14} className="mr-1.5" /> Incorrect (-1)
                      </span>
                    )
                  ) : (
                    <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      <MessageSquare size={14} className="mr-1.5" /> Self Graded
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-slate-900 font-bold mb-6 mt-2 leading-relaxed">{q.text}</h4>

              {isObjective && q.options ? (
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {q.options.map((opt, optIdx) => {
                    let style = "border-slate-200 text-slate-600 font-medium";
                    if (optIdx === q.correctAnswerIndex) {
                      style = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500";
                    } else if (optIdx === userAnswer && !isCorrect) {
                      style = "border-red-300 bg-red-50 text-red-800 font-medium";
                    }

                    return (
                      <div key={optIdx} className={`p-4 rounded-xl border text-sm ${style}`}>
                        <span className="mr-3 opacity-50">{String.fromCharCode(65 + optIdx)}.</span>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Your Answer</span>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">
                      {userAnswer || <span className="text-slate-400 italic">No answer provided.</span>}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Correct Answer Structure / Points</span>
                    <p className="text-sm font-medium text-emerald-800 whitespace-pre-wrap">{q.correctAnswerText || q.explanation}</p>
                  </div>
                  
                  {userAnswer && (
                    <div className="mt-2">
                       {evaluations[q.id] ? (
                         <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
                           <div className="flex items-center gap-2 mb-3">
                             <Sparkles size={16} className="text-indigo-600" />
                             <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">AI Evaluation</span>
                             {evaluations[q.id].loading && <Loader2 size={12} className="animate-spin text-indigo-400 ml-2" />}
                           </div>
                           
                           {evaluations[q.id].error ? (
                             <p className="text-sm text-red-500">{evaluations[q.id].error}</p>
                           ) : !evaluations[q.id].loading ? (
                             <>
                               <div className="mb-2">
                                 <span className={`inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${
                                   evaluations[q.id].grade === 'Correct' ? 'bg-emerald-100 text-emerald-700' :
                                   evaluations[q.id].grade === 'Incorrect' ? 'bg-red-100 text-red-700' :
                                   'bg-amber-100 text-amber-700'
                                 }`}>
                                   {evaluations[q.id].grade}
                                 </span>
                               </div>
                               <p className="text-sm text-indigo-900 leading-relaxed font-medium whitespace-pre-wrap">
                                 {evaluations[q.id].feedback}
                               </p>
                             </>
                           ) : (
                              <p className="text-sm text-indigo-400 animate-pulse">Analyzing your answer...</p>
                           )}
                         </div>
                       ) : (
                         <button
                           onClick={() => evaluateAnswer(q.id, q.text, userAnswer as string, q.correctAnswerText || q.explanation)}
                           className="flex items-center justify-center w-full py-3 px-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-colors uppercase tracking-widest text-xs"
                         >
                           <Sparkles size={14} className="mr-2" /> Get AI Evaluation
                         </button>
                       )}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Explanation</span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{q.explanation}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center p-6">
        <button
          onClick={onHome}
          className="flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 uppercase tracking-widest text-sm"
        >
          Return to Dashboard <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
