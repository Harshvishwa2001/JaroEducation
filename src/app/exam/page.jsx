"use client"

import React, { useState, useEffect } from 'react'
import Header from '../component/Header'
import { CheckCircle2, Trophy, Clock, PlayCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation';

export default function ExamPage() {
  const [step, setStep] = useState('loading');
  const [candidate, setCandidate] = useState(null);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 1. Check for data in localStorage
    const savedData = localStorage.getItem('candidate_info');

    if (savedData) {
      setCandidate(JSON.parse(savedData));
      setStep('info');
    } else {
      // 2. Fallback if no data is found (useful for development)
      setStep('info');
    }
  }, []);

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#151941] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className='bg-linear-to-b from-[#474f83] to-[#151941] min-h-screen text-white pb-20'>
      <div className="container max-w-4xl mx-auto py-12 px-6">

        {/* --- SECTION 1: CANDIDATE INFO --- */}
        {step === 'info' && (
          <div className="animate-in fade-in zoom-in-95 duration-500 bg-white rounded-[40px] p-8 md:p-14 shadow-2xl text-slate-800 border border-white/20">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-black text-[#151941] uppercase italic tracking-wide leading-none">
                Welcome, {candidate?.name || 'Candidate'}!
              </h3>
              <p className="text-slate-400 font-bold mt-4 text-xs uppercase tracking-[0.3em]">Verify your profile details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <InfoBox label="Registered Email" value={candidate?.email || 'Not Provided'} />
              <InfoBox label="Contact Number" value={candidate?.mobile || 'Not Provided'} />
              <InfoBox label="Specialization" value={`${candidate?.course || 'BCA'} - ${candidate?.uni || 'University'}`} />
              <InfoBox label="Scholarship Level" value={candidate?.level || 'MBA'} highlight />
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setStep('quiz')}
                className="group w-full md:w-auto px-16 h-16 bg-gradient-to-r from-indigo-600 to-[#151941] hover:scale-[1.02] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto active:scale-95"
              >
                Start Assessment <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* --- SECTION 2: QUIZ ASSESSMENT --- */}
        {step === 'quiz' && (
          <div className="animate-in slide-in-from-bottom-12 duration-700 bg-white rounded-[40px] p-8 md:p-14 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center mb-10 border-b pb-6 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-[#151941] uppercase tracking-tighter">Live Assessment</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Level</p>
                <p className="text-sm font-bold text-indigo-600">{candidate?.level || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-12">
              <QuestionBlock number={1} question="Which document is essential for the Grant verification process?" />
              <QuestionBlock number={2} question="What is the maximum duration to claim the scholarship voucher?" />
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-center md:justify-end">
              <button
                onClick={() => setStep('result')}
                className="w-full md:w-auto px-12 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
              >
                Submit My Answers <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* --- SECTION 3: RESULT & VOUCHER --- */}
        {step === 'result' && (
          <div className="animate-in zoom-in-95 duration-500 bg-[#e4e6f5] backdrop-blur-xl border border-white/10 rounded-[50px] p-12 text-center shadow-2xl" >
            <h2 className="text-2xl font-bold text-black tracking-wider mb-4">🎊Congratulations, Rahul Patil!🎊</h2>


            <div>
              <h1 className='p-5 text-slate-800 text-xl font-medium'>Your Evaluation Score</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                <StatBox label="Profile Strength: " value="32/40" />
                <StatBox label="Intent Score: " value="30/40" />
                <StatBox label="Timing Advantage: " value="15/20" />
                <StatBox label="Total Score: " value="75/100" color="text-emerald-400" />
              </div>
            </div>

            <div className='grid grid-cols-2 mb-6'>
              <div>
                <p className="text-black font-light max-w-md mx-auto">You’ve unlocked your <br />
                  <span className='font-bold'>Career Acceleration Grant.</span></p>
                <img src="/image/lottery.png" alt="lottery" className='mt-2' />
              </div>

              <div className="flex flex-col items-center space-y-4">
                {/* Header Info */}
                <div className="text-center space-y-1">
                  <p className='text-slate-700 font-semibold text-sm'>
                    Valid for <span className='text-red-600 font-black italic'>72 hours</span> only
                  </p>
                  <p className='text-slate-700 font-semibold text-sm'>
                    Top <span className='text-red-600 font-black italic'>100</span> Candidate Selection
                  </p>
                </div>

                {/* THE GOLDEN CARD */}
                <div className="relative group w-full max-w-[340] mx-auto h-30 overflow-hidden rounded-[24px] shadow-2xl border-4 border-[#bf9b30]">

                  {/* Background Image Layer */}
                  <img
                    src="/image/golden.jpg"
                    alt="Golden Grant Frame"
                    className='absolute inset-0 w-full h-full object-cover brightness-110'
                  />

                  {/* Subtle Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-white/60 z-10"></div>

                  {/* THE TROPHY (Left Aligned) */}
                  <img
                    src="/image/trophy.png"
                    alt="Grant Trophy"
                    className='absolute top-1/2 left-4 md:left-2 -translate-y-1/2 h-24 w-auto z-20 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] animate-pulse'
                    style={{ animationDuration: '4s' }}
                  />

                  {/* TEXT CONTENT (Right Aligned) */}
                  <div className="absolute right-4 top-10 -translate-y-1/2 z-20 text-right max-w-50 md:max-w-65">
                    <h1 className='text-[#151941] font-bold text-xl md:text-2xl tracking-tighter leading-none mb-2'>
                      Merit Tier Candidate
                    </h1>
                    <p className='absolute left-1 text-slate-800 font-medium text-left text-sm leading-tight tracking-wider'>
                      You performed better than <br />
                      <span className='text-red-700 text-lg md:text-xl font-black'>78%</span> of applicants
                    </p>
                  </div>

                  {/* Decorative Shine Effect */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-30 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
                </div>
              </div>
            </div>

            <div className='bg-[#901824] w-full h-20 px-10 rounded-xl flex items-center justify-between'>
              <img src="/image/time.png" alt="time" className='absolute w-14 flex items-center justify-between mt-1 animate-spin animation-duration-[3s]' />
              <h1 className='text-xl px-20'>Offer Expires in: </h1>
              <div className="flex items-center gap-2 md:gap-4">
                <TimerBlock value={String(timeLeft.days).padStart(2, '0')} label="days" />
                <span className="text-white/50 text-xl font-black mb-5">:</span>
                <TimerBlock value={String(timeLeft.hours).padStart(2, '0')} label="hrs" />
                <span className="text-white/50 text-xl font-black mb-5">:</span>
                <TimerBlock value={String(timeLeft.minutes).padStart(2, '0')} label="min" />
                <span className="text-white/50 text-xl font-black mb-5">:</span>
                <TimerBlock value={String(timeLeft.seconds).padStart(2, '0')} label="sec" />
              </div>
            </div>

            <div className='flex items-center justify-center gap-4 mt-10'>
              <button
                className='group w-3xl h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 transition-all hover:opacity-95 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3'>
                Start Assessment
              </button>
              <button
                onClick={() => router.push('/')}
                className='group w-full h-16 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 transition-all hover:opacity-95 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3'>
                Exit the Portal
              </button>
            </div>
          </div>
        )}



      </div>
    </div>
  )
}

function TimerBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white text-3xl md:text-4xl font-bold leading-none">
        {value}
      </span>
      <span className="text-white/90 text-[10px] md:text-xs font-normal mt-1">
        {label}
      </span>
    </div>
  );
}

// Helper Components
function InfoBox({ label, value, highlight }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-lg'}`}>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-[#151941]'}`}>{value}</span>
    </div>
  )
}

function QuestionBlock({ number, question }) {
  return (
    <div className="space-y-6">
      <h4 className="font-bold text-[#151941] text-xl flex gap-4 leading-tight">
        <span className="text-indigo-600 opacity-30 font-black">0{number}</span>
        {question}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 md:ml-12">
        {['Direct Grant', 'Fee Waiver', 'Course Access', 'Placement Aid'].map((opt, i) => (
          <label key={i} className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all group">
            <input type="radio" name={`q${number}`} className="accent-indigo-600 w-5 h-5" />
            <span className="text-sm font-bold text-slate-600 group-hover:text-[#151941]">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function StatBox({ label, value, color = "text-white" }) {
  return (
    <div className="bg-slate-800 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
      <h4 className={`text-3xl font-black mb-1 ${color}`}>{value}</h4>
      <span className="text-[10px] font-black text-indigo-200/50 uppercase tracking-widest">{label}</span>
    </div>
  )
}