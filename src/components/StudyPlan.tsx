import React, { useState } from 'react';
import { ChapterSelection, Subject } from '../types';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, ChevronRight, BookOpen, Clock } from 'lucide-react';

interface StudyPlanProps {
  weakChapters: { subject: Subject; chapterObj: any }[]; // Replace 'any' with ChapterSelection when typing properly.
}

interface StudyTask {
  id: string;
  day: string;
  subject: Subject;
  chapter: string;
  completed: boolean;
}

export function StudyPlan({ weakChapters }: StudyPlanProps) {
  // Generate a mock schedule based on the weak chapters
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const generatedTasks: StudyTask[] = [];
    
    // Distribute weak chapters across the week
    let dayIndex = 0;
    weakChapters.forEach((wc, i) => {
      generatedTasks.push({
        id: `task-${i}`,
        day: days[dayIndex % days.length],
        subject: wc.subject,
        chapter: wc.chapterObj.name || wc.chapterObj, // Handle both object and string formats
        completed: false
      });
      dayIndex++;
    });

    // If no weak chapters are found, provide some default ones
    if (generatedTasks.length === 0) {
       generatedTasks.push(
         { id: 't1', day: 'Monday', subject: 'Physics', chapter: 'Kinematics', completed: false },
         { id: 't2', day: 'Tuesday', subject: 'Chemistry', chapter: 'Chemical Bonding', completed: false },
         { id: 't3', day: 'Wednesday', subject: 'Biology', chapter: 'Human Reproduction', completed: false },
         { id: 't4', day: 'Thursday', subject: 'Physics', chapter: 'Laws of Motion', completed: false }
       );
    }

    return generatedTasks;
  });

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const tasksByDay = tasks.reduce((acc, task) => {
    if (!acc[task.day]) acc[task.day] = [];
    acc[task.day].push(task);
    return acc;
  }, {} as Record<string, StudyTask[]>);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={24} className="text-indigo-600" />
            Weekly Study Plan
          </h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Customized based on your weak chapters</p>
        </div>
        
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {daysOrder.map(day => {
          const dayTasks = tasksByDay[day];
          if (!dayTasks || dayTasks.length === 0) return null;
          
          return (
            <div key={day} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">{day}</h4>
              <div className="space-y-3">
                {dayTasks.map(task => (
                  <label key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300'}`}>
                    <div className="shrink-0 flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)}
                        className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${
                          task.subject === 'Physics' ? 'bg-blue-50 text-blue-600' :
                          task.subject === 'Chemistry' ? 'bg-emerald-50 text-emerald-600' :
                          task.subject === 'Biology' ? 'bg-rose-50 text-rose-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {task.subject}
                        </span>
                      </div>
                      <p className={`font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                        Revise: {task.chapter}
                      </p>
                    </div>
                    
                    <div className="shrink-0 text-slate-400 hidden sm:flex items-center gap-1.5">
                       <Clock size={14} />
                       <span className="text-xs font-bold">1-2 hrs</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
