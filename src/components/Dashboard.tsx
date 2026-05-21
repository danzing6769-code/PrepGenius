import React from 'react';
import { AttemptRecord } from '../types';
import { History, Target, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  history: AttemptRecord[];
  loading: boolean;
}

export function Dashboard({ history, loading }: DashboardProps) {
  if (loading) {
     return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest mt-10">Loading Performance Data...</div>;
  }

  if (history.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center p-10 h-96 text-slate-400">
         <Target size={48} className="mb-4 text-slate-200" />
         <p className="font-semibold text-lg text-slate-600 mb-2">No Test Data Yet</p>
         <p className="text-sm">Complete your first mock test to unlock performance insights.</p>
       </div>
     );
  }

  // Calculate insights
  const avgAccuracy = Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length);
  const totalQuestions = history.reduce((acc, obj) => acc + obj.totalQuestions, 0);
  
  // Sort reverse for chart (oldest to newest)
  const chartData = [...history].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return a.createdAt.toMillis() - b.createdAt.toMillis();
    }
    return 0;
  }).map((h, i) => ({
    name: `Test ${i + 1}`,
    score: h.score,
    accuracy: h.accuracy,
    exam: h.examType,
    date: h.date,
  }));

  const topScore = Math.max(...chartData.map(d => d.score));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 lg:space-y-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
           <TrendingUp size={20} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Performance Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between mb-4 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-widest">Avg. Accuracy</span>
            <Target size={16} />
          </div>
          <span className="text-5xl font-bold">{avgAccuracy}%</span>
          <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full transition-all" style={{width: `${avgAccuracy}%`}}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-widest">Total Qs Attempted</span>
             <History size={16} />
          </div>
          <span className="text-5xl font-bold text-slate-800">{totalQuestions}</span>
          <p className="text-sm font-medium text-slate-500 mt-4">Across {history.length} tests</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-widest">Highest Score</span>
             <Trophy size={16} className="text-amber-500" />
          </div>
          <span className="text-5xl font-bold text-slate-800">{topScore}</span>
          <p className="text-sm font-medium text-slate-500 mt-4">Keep pushing your limits!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Accuracy Progression</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden flex flex-col h-full">
           <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0 flex items-center">
             <History size={18} className="mr-2 text-slate-400" />
             Recent History
           </h3>
           <div className="space-y-4 overflow-y-auto pr-2 flex-grow scrollbar-thin">
             {history.slice(0, 8).map((record, i) => (
               <div key={record.id || i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors">
                 <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                   <span className="font-bold text-sm tracking-tighter">{record.examType}</span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-slate-800 truncate">{record.difficulty} Mock</p>
                   <p className="text-xs font-semibold text-slate-500 mt-0.5">{record.date}</p>
                 </div>
                 <div className="text-right shrink-0">
                   <p className={`text-xs font-bold px-2 py-1 rounded-lg inline-block mb-1 ${record.accuracy >= 80 ? 'bg-emerald-50 text-emerald-600' : record.accuracy >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                     {record.accuracy}%
                   </p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.score} Marks</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
