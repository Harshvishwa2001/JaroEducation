"use client"

import React, { useState, useEffect } from 'react'
import Header from '../component/Header'
import { CheckCircle2, Trophy, Clock, PlayCircle, AlertTriangle, ChevronRight, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ExamPage() {
  const [step, setStep] = useState('loading');
  const [candidate, setCandidate] = useState(null);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 2,
    seconds: 59
  });

  const totalSeconds = (timeLeft.minutes * 60) + timeLeft.seconds;
  const isUrgent = totalSeconds <= 120;
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    if (timeLeft.minutes === 2 && timeLeft.seconds === 0 && !hasWarned) {
      toast.error("Hurry! Only 2 minutes remaining to complete your assessment.", {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#901824',
          color: '#fff',
          fontWeight: 'bold',
          borderRadius: '15px',
          border: '1px solid #ff4b5c'
        },
        icon: '⚠️',
      });
      setHasWarned(true);
    }
  }, [timeLeft.minutes, timeLeft.seconds]);

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

  // Add this state at the top of your component
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Sample dynamic questions (usually fetched from your API)
  const questions = [
    { id: 1, text: "Which document is essential for the Grant verification process?" },
    { id: 2, text: "What is the maximum duration to claim the scholarship voucher?" },
    { id: 3, text: "Which tier offers the highest career acceleration support?" }
  ];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('result');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#151941] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  {
    isUrgent && (
      <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 duration-500">
        <div className="bg-[#901824] border-2 border-red-500 text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-full animate-pulse">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-medium uppercase tracking-widest text-xs">Urgent Warning</p>
            <p className="text-sm font-medium opacity-90">Assessment ends in less than 2 minutes!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-linear-to-b from-[#474f83] to-[#151941] min-h-screen text-white pb-20'>
      {/* <Header /> */}
      <div className="container max-w-4xl mx-auto py-12 px-6">

        {/* --- SECTION 1: CANDIDATE INFO --- */}
        {step === 'info' && (
          <div>
            <div className='flex items-center justify-between -mt-12'>
              <div className='flex'>
                <div className="mt-2 rounded-lg">
                  <img src="/image/SEO 2.gif" alt="Rocket Icon" className='w-40 h-40 object-cover' />
                </div>

                <div>
                  <h1 className="text-3xl md:text-5xl font-black leading-[0.6] tracking-wide bg-linear-to-b from-[#ffffff]  to-[#6d79c5] bg-clip-text text-transparent mt-16">
                    Udaan <br />
                    <span className='text-2xl md:text-3xl'>Kamyabi ki</span>
                  </h1>
                </div>
              </div>
              <div className='pr-10'>
                <img src="/image/lottery.png" alt="lottery" className='w-60 mt-10' />
              </div>
            </div>

            <div className="animate-in fade-in zoom-in-95 duration-500 bg-white rounded-[40px] p-8 md:p-14 shadow-2xl text-slate-800 border border-white/20">
              <div className="text-center mb-10">
                <h3 className="text-4xl font-black text-[#151941] uppercase italic tracking-wide leading-none">
                  Welcome, {candidate?.name || 'Candidate'}!
                </h3>
                <p className="text-slate-400 font-bold mt-4 text-xs uppercase tracking-[0.3em]">Verify your profile details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <InfoBox label="Registered Email" value={candidate?.email || 'Testing@gmail.com'} />
                <InfoBox label="Contact Number" value={candidate?.mobile || '1234567890'} />
                <InfoBox label="University" value={`${candidate?.course || 'BCA'} - ${candidate?.uni || 'University'}`} />
                <InfoBox label="Course:" value={candidate?.level || 'MBA'} highlight />
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={() => setStep('quiz')}
                  className="group w-full md:w-auto px-16 h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black hover:scale-[1.02] rounded-2xl font-bold tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto active:scale-95"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION 2: QUIZ ASSESSMENT --- */}
        {step === 'quiz' && (
          <div>
            <div className='flex items-center justify-between'>
              <h1 className="text-3xl md:text-5xl font-black leading-[0.6] tracking-wide bg-linear-to-b from-[#ffffff]  to-[#6d79c5] bg-clip-text text-transparent px-10 py-4">
                Udaan <br />
                <span className='text-2xl md:text-3xl'>Kamyabi ki</span>
              </h1>
              <div className="flex items-center gap-3 pr-10">
                <span className={`text-[12px] font-black uppercase tracking-widest transition-colors duration-500 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white/80'}`}>
                  {isUrgent ? 'Hurry! Time Left :' : 'Time Left :'}
                </span>

                <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isUrgent
                  ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-white/10 border-white/10'
                  }`}>

                  <TimerSegment
                    value={String(timeLeft.minutes).padStart(2, '0')}
                    label="min"
                    isUrgent={isUrgent}
                  />

                  <span className={`text-xl font-bold mb-4 transition-colors ${isUrgent ? 'text-red-500' : 'text-white'}`}>:</span>

                  <TimerSegment
                    value={String(timeLeft.seconds).padStart(2, '0')}
                    label="sec"
                    isUrgent={isUrgent}
                  />
                </div>
              </div>
            </div>

            <div className="animate-in slide-in-from-bottom-12 duration-700 bg-white rounded-[40px] p-8 md:p-10 shadow-2xl text-slate-800">

              {/* Header with Progress Bar */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Clock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-[#151941] leading-tight">
                      Complete to unlock your personalized career grant
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Assessment in progress</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-indigo-600">{currentQuestionIndex + 1} <span className="text-slate-300 text-sm">/ {questions.length}</span></p>
                </div>
              </div>

              {/* Dynamic Progress Line */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-10 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#f3d57a] to-[#face49] transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Display only ONE question based on the index */}
              <div className="min-h-35 animate-in fade-in slide-in-from-right-8 duration-500" key={currentQuestionIndex}>
                <QuestionBlock
                  number={currentQuestionIndex + 1}
                  question={questions[currentQuestionIndex].text}
                />
              </div>

              {/* Navigation Footer */}
              <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  className={`text-sm font-bold uppercase tracking-widest ${currentQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-indigo-600'}`}
                >
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  className="w-full md:w-auto px-12 h-14 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black  hover:bg-[#f6de97] rounded-xl font-bold tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}

                </button>
              </div>
            <div className='mt-4 space-y-2'>
              <p>🔒 Your responses are secure & used only for grant evaluation.</p>
              <p>💰 Grant will be revealed immediately after completion.</p>
            </div>
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
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-30 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
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

function TimerSegment({ value, label, isUrgent }) {
  return (
    <div className="flex flex-col items-center min-w-8">
      <span className={`text-2xl font-mono font-black tabular-nums transition-colors ${isUrgent ? 'text-red-500' : 'text-white'}`}>
        {value}
      </span>
      <span className={`text-[8px] font-bold uppercase tracking-widest ${isUrgent ? 'text-red-400' : 'text-indigo-200'}`}>
        {label}
      </span>
    </div>
  );
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