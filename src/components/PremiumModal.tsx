import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, Zap, Server, QrCode, Building2, Copy, CheckCircle2 } from 'lucide-react';

interface PremiumModalProps {
  onAcknowledge: (success: boolean) => void;
}

export function PremiumModal({ onAcknowledge }: PremiumModalProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [copiedBank, setCopiedBank] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>

        {step === 'info' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner shrink-0 relative">
              <Zap size={28} className="fill-amber-600" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-2">Unlock Pro<br/>Features</h2>
            <p className="text-slate-500 font-medium mb-6">You've reached the free limit. Upgrade to Pro for unlimited custom mock tests.</p>

            <div className="flex flex-col gap-4 mb-8 flex-1">
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} className="text-green-600 font-bold" />
                 </div>
                 <p className="text-slate-700 font-semibold text-sm">Unlimited Subject & Full Tests</p>
              </div>
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} className="text-green-600 font-bold" />
                 </div>
                 <p className="text-slate-700 font-semibold text-sm">Access to ALL Subtopics & Chapters</p>
              </div>
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} className="text-green-600 font-bold" />
                 </div>
                 <p className="text-slate-700 font-semibold text-sm">Priority Server Processing</p>
              </div>
            </div>

            <div className="mt-auto shrink-0 space-y-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">₹199</span>
                <span className="text-sm font-bold text-slate-400">/ lifetime</span>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-4 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/10 transition-all flex justify-center items-center gap-2"
              >
                Upgrade to Pro
              </button>
              
              <div className="flex justify-center items-center gap-4 mt-2 mb-1">
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                   BHIM UPI
                 </div>
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                   GPay
                 </div>
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                   PhonePe
                 </div>
              </div>
              <button
                onClick={() => onAcknowledge(false)}
                className="w-full text-center py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-2 text-center">Complete Payment</h2>
            <p className="text-slate-500 font-medium mb-6 text-center text-sm">Scan QR with any UPI App to pay ₹199</p>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center mb-6">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dpriyamroychowdhury%40upi%26pn%3DNEET%2520Prep%2520Pro%26am%3D199%26cu%3DINR" 
                alt="BHIM UPI QR Code" 
                className="w-48 h-48 rounded-xl shadow-sm mb-6"
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-700 tracking-widest bg-slate-200/50 px-4 py-2 rounded-lg break-all text-center">
                  priyamroychowdhury@upi
                </p>
                <button 
                  onClick={() => handleCopy("priyamroychowdhury@upi")} 
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                  aria-label="Copy UPI ID"
                >
                  {copiedBank ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button
                onClick={() => {
                  setTimeout(() => setStep('success'), 1000);
                }}
                className="w-full py-4 text-center rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 transition-all flex justify-center items-center gap-2"
              >
                I have completed the payment
              </button>
              <button
                onClick={() => setStep('info')}
                className="w-full py-2 text-center rounded-xl text-slate-500 hover:text-slate-700 font-bold transition-all"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center h-full py-8">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                <Check size={40} className="stroke-[3]" />
             </div>
             
             <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-2">Thank You!</h2>
             <p className="text-slate-500 font-medium mb-8">Your payment was successful. Pro features have been unlocked on your account.</p>

             <button
                onClick={() => {
                  localStorage.setItem('premium', 'true');
                  onAcknowledge(true);
                }}
                className="w-full py-4 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/10 transition-all flex justify-center items-center gap-2"
              >
                Start Using Pro
              </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
