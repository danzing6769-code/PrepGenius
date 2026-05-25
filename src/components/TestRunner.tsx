import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { ChevronLeft, ChevronRight, Save, Clock, Flag, Map, ShieldAlert, WifiOff } from 'lucide-react';

interface TestRunnerProps {
  questions: Question[];
  onFinish: (answers: Record<string, number | string>) => void;
  mode?: 'Exam' | 'Practice';
}

export function TestRunner({ questions, onFinish, mode = 'Exam' }: TestRunnerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [showOverview, setShowOverview] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | string>>(() => {
    try {
      const saved = localStorage.getItem('testAnswers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('testReview');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const saved = localStorage.getItem('testTimeLeft');
      return saved ? parseInt(saved) : questions.length * 60;
    } catch {
      return questions.length * 60;
    }
  });

  useEffect(() => {
    localStorage.setItem('testAnswers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('testReview', JSON.stringify(markedForReview));
  }, [markedForReview]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [offlineWarningModal, setOfflineWarningModal] = useState(false);

  const handleFinishClick = useCallback(() => {
    if (!isOnline) {
      setOfflineWarningModal(true);
      return;
    }
    setShowConfirmModal(true);
  }, [isOnline]);

  const handleFinishConfirm = useCallback(() => {
    if (!isOnline) {
      setOfflineWarningModal(true);
      return;
    }
    setShowConfirmModal(false);
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('testTimeLeft');
    localStorage.removeItem('testReview');
    onFinish(answers);
  }, [answers, onFinish, isOnline]);
  
  const handleFinishCancel = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  useEffect(() => {
    if (mode === 'Practice') return;

    const handleCheat = () => {
      setWarnings(prev => {
        const newWarnings = prev + 1;
        if (newWarnings >= 5) {
          return newWarnings;
        }
        setShowWarningModal(true);
        return newWarnings;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleCheat();
    };

    const handleBlur = () => {
      handleCheat();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [mode]);

  useEffect(() => {
    if (warnings >= 5) {
      handleFinishConfirm();
    }
  }, [warnings, handleFinishConfirm]);

  useEffect(() => {
    if (mode === 'Practice') return;

    if (timeLeft <= 0) {
      if (!isOnline) {
         setOfflineWarningModal(true);
         return;
      }
      localStorage.removeItem('testAnswers');
      localStorage.removeItem('testTimeLeft');
      localStorage.removeItem('testReview');
      onFinish(answers);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        localStorage.setItem('testTimeLeft', newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, answers, onFinish, mode]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (index: number) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: index });
  };
  
  const handleSubjectiveInput = (text: string) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: text });
  };

  const toggleReview = () => {
    const qid = questions[currentIndex].id;
    setMarkedForReview(prev => ({ ...prev, [qid]: !prev[qid] }));
  };

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'f') toggleReview();
      
      const q = questions[currentIndex];
      if ((!q.type || q.type === 'Objective') && e.key >= '1' && e.key <= '4') {
        handleSelectOption(parseInt(e.key) - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, handleNext, handlePrev, questions]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  const subjectChaptersCount: Record<string, { total: number, answered: number }> = {};
  questions.forEach(q => {
    const key = `${q.subject} - ${q.chapter || 'Overview'}`;
    if (!subjectChaptersCount[key]) subjectChaptersCount[key] = { total: 0, answered: 0 };
    subjectChaptersCount[key].total++;
    if (answers[q.id] !== undefined && answers[q.id] !== '') subjectChaptersCount[key].answered++;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {!isOnline && (
        <div className="w-full max-w-6xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff size={20} className="text-amber-600" />
            <div>
              <p className="font-bold">You are currently offline</p>
              <p className="text-xs font-medium text-amber-700">Don't worry, your test progress is being saved locally. Please restore your connection before submitting.</p>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar Overview */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
           {mode === 'Exam' ? (
             <div className={`flex items-center justify-between mb-4 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                <div className="flex items-center space-x-2">
                  <Clock size={18} />
                  <span className="font-bold tracking-wider">{formatTime(timeLeft)}</span>
                </div>
                <span className="text-xs font-bold uppercase text-slate-400">Remaining</span>
             </div>
           ) : (
             <div className="flex items-center justify-between mb-4 text-indigo-600">
                <div className="flex items-center space-x-2">
                  <Flag size={18} />
                  <span className="font-bold tracking-wider">PRACTICE MODE</span>
                </div>
             </div>
           )}
           
           <div className="space-y-4">
             {/* Progress Bar */}
             <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
               <div style={{ width: `${(answeredCount / questions.length) * 100}%` }} className="bg-emerald-500 h-full"></div>
             </div>
             
             <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wide">
               <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl text-center">
                 <div className="text-lg">{answeredCount}</div>
                 Answered
               </div>
               <div className="bg-amber-50 text-amber-700 p-2 rounded-xl text-center">
                 <div className="text-lg">{reviewCount}</div>
                 Review
               </div>
               <div className="bg-slate-100 text-slate-500 p-2 rounded-xl text-center col-span-2">
                 <div className="text-lg">{unansweredCount}</div>
                 Unanswered
               </div>
             </div>
             
             <button
               onClick={() => setShowOverview(!showOverview)}
               className="w-full mt-2 flex items-center justify-center p-3 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest"
             >
               <Map size={14} className="mr-2" /> Topic Mastery
             </button>
           </div>
        </div>
        
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex-grow">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAns = answers[q.id] !== undefined && answers[q.id] !== '';
              const isRev = markedForReview[q.id];
              const isCur = idx === currentIndex;
              
              let bg = 'bg-slate-100 text-slate-500 border-transparent';
              if (isAns) bg = 'bg-emerald-100 text-emerald-700 border-transparent';
              if (isRev) bg = 'bg-amber-100 text-amber-700 border-amber-300 border-2';
              if (isCur) bg += ' ring-2 ring-indigo-400 ring-offset-2';
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex items-center justify-center h-10 w-full rounded-xl text-sm font-bold border transition-all ${bg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden min-h-[500px]">
        {showOverview && (
          <div className="absolute inset-0 z-20 bg-white p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Topic Completion Map</h2>
              <button 
                onClick={() => setShowOverview(false)}
                className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl uppercase tracking-wider"
              >
                Back to Test
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(subjectChaptersCount).map(([topic, stats]) => (
                <div key={topic} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                    <span className="truncate pr-4">{topic}</span>
                    <span className="text-slate-400">{stats.answered} / {stats.total}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div style={{ width: `${(stats.answered / stats.total) * 100}%` }} className="bg-indigo-500 h-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 md:p-10 flex-grow pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 flex justify-between items-start">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
                    {currentQuestion.subject}
                  </span>
                  {currentQuestion.type === 'Subjective' && (
                    <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
                      Subjective
                    </span>
                  )}
                  {selectedAnswer !== undefined && selectedAnswer !== '' && (
                    <button
                      onClick={() => {
                        const newAnswers = { ...answers };
                        delete newAnswers[currentQuestion.id];
                        setAnswers(newAnswers);
                      }}
                      className="px-3 py-1 bg-slate-100 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
                
                <button
                  onClick={toggleReview}
                  className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                    markedForReview[currentQuestion.id] 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Flag size={14} className="mr-1.5" />
                  {markedForReview[currentQuestion.id] ? 'Reviewed' : 'Review'}
                </button>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed mb-8 flex">
                <span className="text-slate-400 mr-3">{currentIndex + 1}.</span>
                <span>{currentQuestion.text}</span>
              </h3>
              
              {currentQuestion.type === 'Subjective' ? (
                 <div className="w-full">
                   <textarea
                     value={(selectedAnswer as string) || ''}
                     onChange={(e) => handleSubjectiveInput(e.target.value)}
                     disabled={mode === 'Practice' && showExplanation[currentQuestion.id]}
                     placeholder="Type your detailed answer here..."
                     className="w-full h-48 p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 resize-none disabled:opacity-75 disabled:bg-slate-100"
                   />
                   {mode === 'Practice' && !showExplanation[currentQuestion.id] && (
                     <button
                       onClick={() => setShowExplanation(prev => ({ ...prev, [currentQuestion.id]: true }))}
                       disabled={!selectedAnswer}
                       className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:bg-slate-300"
                     >
                       Check Answer
                     </button>
                   )}
                 </div>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctAnswerIndex;
                    
                    let bgStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700';
                    let circleStyle = 'border-slate-300 text-slate-500';

                    if (mode === 'Practice' && showExplanation[currentQuestion.id]) {
                      if (isCorrect) {
                        bgStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500';
                        circleStyle = 'border-emerald-600 bg-emerald-600 text-white';
                      } else if (isSelected) {
                        bgStyle = 'border-red-300 bg-red-50 text-red-900 ring-1 ring-red-300';
                        circleStyle = 'border-red-500 bg-red-500 text-white';
                      }
                    } else if (isSelected) {
                      bgStyle = 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600';
                      circleStyle = 'border-indigo-600 bg-indigo-600 text-white';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSelectOption(idx);
                          if (mode === 'Practice') {
                            setShowExplanation(prev => ({ ...prev, [currentQuestion.id]: true }));
                          }
                        }}
                        disabled={mode === 'Practice' && showExplanation[currentQuestion.id] && !isSelected}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${bgStyle}`}
                      >
                        <div className="flex items-start">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold mr-3 flex-shrink-0 ${circleStyle}`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className={`text-sm md:text-base font-medium`}>
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {mode === 'Practice' && showExplanation[currentQuestion.id] && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-slate-50 border border-slate-200 p-6 rounded-2xl"
                >
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Explanation & Verification</h4>
                  {currentQuestion.type === 'Subjective' && (
                    <div className="mb-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block">Correct Key Points</span>
                      <p className="text-sm font-medium text-emerald-800">{currentQuestion.correctAnswerText || currentQuestion.explanation}</p>
                    </div>
                  )}
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-slate-200 flex justify-between items-center z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center px-4 py-2 text-sm font-bold text-slate-500 disabled:opacity-30 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={16} className="mr-1" /> Prev
          </button>
          
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-widest shadow-sm"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleFinishClick}
              className="flex items-center px-6 py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors uppercase tracking-widest shadow-lg shadow-indigo-200"
            >
              <Save size={16} className="mr-2" /> {mode === 'Practice' ? 'Finish Practice' : 'Submit Test'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-red-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-100 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ShieldAlert size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Warning ({warnings}/5)</h3>
              <p className="text-slate-600 mb-8 font-medium">Please do not minimize the window or switch tabs. The test will automatically submit after 5 warnings.</p>
              
              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {offlineWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-amber-200 text-center"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                 <WifiOff size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">No Connection</h3>
              <p className="text-slate-600 font-medium mb-6">You are currently offline. Your progress is being safely stored locally, but you cannot submit the test until your connection is restored.</p>
              
              <button
                onClick={() => setOfflineWarningModal(false)}
                className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                Continue Testing Offline
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Submit Test?</h3>
              <p className="text-slate-600 mb-8 font-medium">Are you sure you want to {mode === 'Practice' ? 'finish' : 'submit'} the test? You won't be able to change your answers.</p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleFinishCancel}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishConfirm}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
