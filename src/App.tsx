import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { TestConfigForm } from './components/TestConfigForm';
import { TestRunner } from './components/TestRunner';
import { TestResults } from './components/TestResults';
import { ChapterNotes } from './components/ChapterNotes';
import { Dashboard } from './components/Dashboard';
import { ExamType, Question, TestConfig, AttemptRecord } from './types';
import { BookOpen, LogOut, History, ShieldAlert, FileText, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<'tests' | 'notes' | 'dashboard'>('tests');
  const [testStatus, setTestStatus] = useState<'IDLE' | 'GENERATING' | 'IN_PROGRESS' | 'COMPLETED'>('IDLE');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecking(false);
      if (u) {
        fetchHistory(u.uid);
      } else {
        setHistory([]);
      }
    });
    return unsub;
  }, []);

  const fetchHistory = async (uid: string) => {
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'attempts'),
        where('userId', '==', uid)
      );
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        // safely parse timestamp
        date: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toLocaleDateString() : 'Recent'
      })) as AttemptRecord[];
      // Sort locally since we didn't create a composite index for orderBy createdAt
      records.sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.() || 0);
      setHistory(records);
    } catch (e) {
      // In a real app we'd handle the unverified email error silently or with a prompt
      console.warn("Could not fetch history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setTestStatus('IDLE');
  };

  const generateTest = async (config: TestConfig) => {
    if (!user) {
      setError("Please sign in to generate tests.");
      return;
    }
    setTestStatus('GENERATING');
    setError(null);
    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate test');
      }

      setQuestions(data.questions);
      setAnswers({});
      
      // Clear previous test session state
      sessionStorage.removeItem('testAnswers');
      sessionStorage.removeItem('testTimeLeft');
      sessionStorage.removeItem('testReview');

      setTestStatus('IN_PROGRESS');
      
      // Store current config temporarily to use when saving
      sessionStorage.setItem('currentConfig', JSON.stringify(config));
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setTestStatus('IDLE');
    }
  };

  const finishTest = async (finalAnswers: Record<string, number | string>) => {
    setAnswers(finalAnswers);
    setTestStatus('COMPLETED');
    
    // Save to Firestore
    const isEmailProvider = user?.providerData.some(p => p.providerId === 'password');
    if (user && (!isEmailProvider || user.emailVerified)) {
      try {
        let score = 0;
        let correctAnswersCount = 0;
        let objectiveCount = 0;
        questions.forEach((q) => {
          if (!q.type || q.type === 'Objective') {
            objectiveCount++;
            if (finalAnswers[q.id] !== undefined && finalAnswers[q.id] !== '') {
              if (finalAnswers[q.id] === q.correctAnswerIndex) {
                score += 4;
                correctAnswersCount++;
              } else {
                score -= 1;
              }
            }
          }
        });
        
        const configStr = sessionStorage.getItem('currentConfig');
        const config: TestConfig | null = configStr ? JSON.parse(configStr) : null;
        
        if (config?.mode === 'Practice') {
           // Skip saving to Firestore for Practice mode
           return;
        }

        const accuracy = objectiveCount > 0 ? Math.round((correctAnswersCount / objectiveCount) * 100) : 0;

        const attemptData = {
          userId: user.uid,
          examType: config?.examType || 'NEET',
          score,
          totalQuestions: questions.length,
          accuracy,
          subjects: config?.subjects || [],
          chapters: config?.chapters || {},
          difficulty: config?.difficulty || 'Adaptive',
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'attempts'), attemptData);
        // Refresh history
        fetchHistory(user.uid);
      } catch (e: any) {
         console.error("Failed to save attempt:", e);
      }
    }
  };

  const goHome = () => {
    setTestStatus('IDLE');
    setQuestions([]);
    setAnswers({});
  };

  if (authChecking) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans tracking-widest text-slate-400 font-bold uppercase">Loading...</div>;
  }

  if (!user) {
    return <AuthScreen onLogin={() => {}} />;
  }

  const isEmailAuth = user.providerData.some(p => p.providerId === 'password');
  const needsVerification = isEmailAuth && !user.emailVerified;
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">NEET<span className="text-indigo-600">IAT</span></span>
            </div>
            
            {testStatus === 'IDLE' && (
              <nav className="hidden md:flex gap-1">
                <button
                  onClick={() => setCurrentView('tests')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${currentView === 'tests' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <CheckCircle2 size={16} /> Tests
                </button>
                <button
                  onClick={() => setCurrentView('notes')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${currentView === 'notes' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <FileText size={16} /> Revision Notes
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-3 hidden sm:block">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</p>
              <p className="text-sm font-bold text-slate-700">{user.displayName || user.email?.split('@')[0]}</p>
            </div>
            <div 
              className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-indigo-600 font-bold relative group cursor-pointer"
              onClick={handleLogout} 
              title="Logout"
            >
              <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold group-hover:hidden">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-red-500 hidden items-center justify-center group-hover:flex transition-opacity">
                 <LogOut size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col overflow-y-auto">
        {testStatus === 'IDLE' && (
          <div className="md:hidden flex gap-2 mb-6 w-full">
            <button
              onClick={() => setCurrentView('tests')}
              className={`flex-1 py-3 px-1 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 ${currentView === 'tests' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              <CheckCircle2 size={16} /> Tests
            </button>
            <button
              onClick={() => setCurrentView('notes')}
              className={`flex-1 py-3 px-1 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 ${currentView === 'notes' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              <FileText size={16} /> Notes
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex-1 py-3 px-1 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 ${currentView === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              <LayoutDashboard size={16} /> Insights
            </button>
          </div>
        )}

        {needsVerification && (
           <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex items-center shrink-0">
             <ShieldAlert size={20} className="mr-3 flex-shrink-0 text-amber-600" />
             <p className="text-sm font-medium">Please verify your email address to enable saving mock test progress. Check your inbox.</p>
           </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex justify-between items-start shrink-0">
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
          </div>
        )}

        {testStatus === 'IDLE' && currentView === 'dashboard' ? (
          <div className="w-full h-full pb-8 items-start">
            <Dashboard history={history} loading={loadingHistory} />
          </div>
        ) : testStatus === 'IDLE' && currentView === 'notes' ? (
          <div className="w-full h-full pb-8">
            <ChapterNotes />
          </div>
        ) : (testStatus === 'IDLE' || testStatus === 'GENERATING') ? (
          <div className="grid grid-cols-1 gap-8 w-full h-full pb-8 relative lg:max-w-4xl lg:mx-auto">
            <div className="flex flex-col">
              <div className="mb-8 w-full shrink-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                  Custom Test Generator
                </h1>
                <p className="text-base text-slate-500 max-w-2xl">
                  Configure your mock exam parameters for NEET or IAT preparation.
                </p>
              </div>
              <div className="w-full flex-1">
                <TestConfigForm
                  isGenerating={testStatus === 'GENERATING'}
                  onStart={generateTest}
                />
              </div>
            </div>
          </div>
        ) : null}

        {testStatus === 'IN_PROGRESS' && (
          <TestRunner 
            questions={questions} 
            onFinish={finishTest} 
            mode={JSON.parse(sessionStorage.getItem('currentConfig') || '{}').mode || 'Exam'} 
          />
        )}

        {testStatus === 'COMPLETED' && (
          <TestResults questions={questions} answers={answers} onHome={goHome} />
        )}
      </main>
    </div>
  );
}
