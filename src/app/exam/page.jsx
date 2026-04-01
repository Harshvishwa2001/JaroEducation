"use client"

import { AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ExamPage({ candidates, saleId }) {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState('loading');
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [hasWarned, setHasWarned] = useState(false);
  const [errorDetails, setErrorDetails] = useState({ title: '', msg: '' });
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 2,
    seconds: 59
  });

  const totalSeconds = (timeLeft.minutes * 60) + timeLeft.seconds;
  const isUrgent = totalSeconds <= 120 && timeLeft.days === 0 && timeLeft.hours === 0;

  // --- TIMER LOGIC ---
  useEffect(() => {
    const savedData = localStorage.getItem('candidate_info');
    if (savedData) {
      setCandidate(JSON.parse(savedData));
    } else if (candidates) {
      setCandidate(candidates);
    }
    setStep('info');
  }, [candidates]);

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

  // --- WARNING TOAST ---
  useEffect(() => {
    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 2 && timeLeft.seconds === 0 && !hasWarned) {
      toast.error("Hurry! Only 2 minutes remaining to complete your assessment.", {
        duration: 5000,
        position: 'top-center',
        style: { background: '#901824', color: '#fff', fontWeight: 'bold', borderRadius: '15px', border: '1px solid #ff4b5c' },
        icon: '⚠️',
      });
      setHasWarned(true);
    }
  }, [timeLeft.minutes, timeLeft.seconds, hasWarned]);

  // --- HANDLERS ---
  const handleOptionChange = (questionId, optionValue) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const handleStartExam = async () => {
    if (!candidate) {
      toast.error("Profile data not found. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidate?.sales_id || candidate?.id || "saleId",
          level: candidate.level || 'General'
        })
      });

      const result = await response.json();
      if (response.ok && result.data) {
        setQuestions(result.data);
        setStep('quiz');
      } else {
        toast.error(result.message || 'Failed to load questions.');
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className='bg-linear-to-b from-[#474f83] to-[#151941] min-h-screen text-white pb-20'>
      {isUrgent && step === 'quiz' && (
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
      )}

      <div className="container max-w-4xl mx-auto py-12 px-6">
        {step === 'info' && (
          <div>
            <div className='flex items-center justify-between -mt-12'>
              <div className='flex'>
                <div className="mt-2 rounded-lg">
                  <img src="/image/SEO 2.gif" alt="Rocket Icon" className='w-40 h-40 object-cover' />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black leading-[0.6] tracking-wide bg-linear-to-b from-[#ffffff] to-[#6d79c5] bg-clip-text text-transparent mt-16">
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
                  onClick={handleStartExam}
                  disabled={loading}
                  className="group w-full md:w-auto px-16 h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black hover:scale-[1.02] rounded-2xl font-bold tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto active:scale-95 disabled:opacity-70"
                >
                  {loading ? <div className="h-5 w-5 border-2 border-black border-t-transparent animate-spin rounded-full" /> : "Start Assessment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'quiz' && (
          <div>
            <div className='flex items-center justify-between'>
              <h1 className="text-3xl md:text-5xl font-black leading-[0.6] tracking-wide bg-linear-to-b from-[#ffffff] to-[#6d79c5] bg-clip-text text-transparent px-10 py-4">
                Udaan <br />
                <span className='text-2xl md:text-3xl'>Kamyabi ki</span>
              </h1>
              <div className="flex items-center gap-3 pr-10">
                <span className={`text-[12px] font-black uppercase tracking-widest transition-colors duration-500 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white/80'}`}>
                  {isUrgent ? 'Hurry! Time Left :' : 'Time Left :'}
                </span>
                <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isUrgent ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/10 border-white/10'}`}>
                  <TimerSegment value={String(timeLeft.minutes).padStart(2, '0')} label="min" isUrgent={isUrgent} />
                  <span className={`text-xl font-bold mb-4 transition-colors ${isUrgent ? 'text-red-500' : 'text-white'}`}>:</span>
                  <TimerSegment value={String(timeLeft.seconds).padStart(2, '0')} label="sec" isUrgent={isUrgent} />
                </div>
              </div>
            </div>

            <div className="animate-in slide-in-from-bottom-12 duration-700 bg-white rounded-[40px] p-8 md:p-10 shadow-2xl text-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Clock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-[#151941] leading-tight">Complete to unlock your career grant</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Assessment in progress</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-indigo-600">{currentQuestionIndex + 1} <span className="text-slate-300 text-sm">/ {questions.length}</span></p>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-10 overflow-hidden">
                <div className="h-full bg-linear-to-r from-[#f3d57a] to-[#face49] transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
              </div>

              <div className="min-h-35 animate-in fade-in slide-in-from-right-8 duration-500" key={currentQuestionIndex}>
                <QuestionBlock
                  number={currentQuestionIndex + 1}
                  questionData={questions[currentQuestionIndex]}
                  selectedOption={selectedAnswers[questions[currentQuestionIndex]?.id]}
                  onSelect={(val) => handleOptionChange(questions[currentQuestionIndex].id, val)}
                />
              </div>

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
                  className="w-full md:w-auto px-12 h-14 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black rounded-xl font-bold tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="animate-in zoom-in-95 duration-500 bg-[#e4e6f5] backdrop-blur-xl border border-white/10 rounded-[50px] p-12 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-black tracking-wider mb-4">🎊Congratulations, {candidate?.name || 'Rahul Patil'}!🎊</h2>
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
                <p className="text-black font-light max-w-md mx-auto">You’ve unlocked your <br /> <span className='font-bold'>Career Acceleration Grant.</span></p>
                <img src="/image/lottery.png" alt="lottery" className='mt-2' />
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center space-y-1">
                  <p className='text-slate-700 font-semibold text-sm'>Valid for <span className='text-red-600 font-black italic'>72 hours</span> only</p>
                  <p className='text-slate-700 font-semibold text-sm'>Top <span className='text-red-600 font-black italic'>100</span> Candidate Selection</p>
                </div>
                <div className="relative group w-full max-w-[340] mx-auto h-30 overflow-hidden rounded-[24px] shadow-2xl border-4 border-[#bf9b30]">
                  <img src="/image/golden.jpg" alt="Golden Grant Frame" className='absolute inset-0 w-full h-full object-cover brightness-110' />
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-white/60 z-10"></div>
                  <img src="/image/trophy.png" alt="Grant Trophy" className='absolute top-1/2 left-4 md:left-2 -translate-y-1/2 h-24 w-auto z-20 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] animate-pulse' style={{ animationDuration: '4s' }} />
                  <div className="absolute right-4 top-10 -translate-y-1/2 z-20 text-right max-w-50 md:max-w-65">
                    <h1 className='text-[#151941] font-bold text-xl md:text-2xl tracking-tighter leading-none mb-2'>Merit Tier Candidate</h1>
                    <p className='absolute left-1 text-slate-800 font-medium text-left text-sm leading-tight tracking-wider'>You performed better than <br /> <span className='text-red-700 text-lg md:text-xl font-black'>78%</span> of applicants</p>
                  </div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-30 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
                </div>
              </div>
            </div>
            <div className='bg-[#901824] w-full h-20 px-10 rounded-xl flex items-center justify-between'>
              <img src="/image/time.png" alt="time" className='absolute w-14 animate-spin duration-[3000ms]' />
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
              <button className='group w-full h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98]'>Claim Grant Now</button>
              <button onClick={() => router.push('/')} className='group w-full h-16 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98]'>Exit the Portal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---
function TimerSegment({ value, label, isUrgent }) {
  return (
    <div className="flex flex-col items-center min-w-8">
      <span className={`text-2xl font-mono font-black tabular-nums transition-colors ${isUrgent ? 'text-red-500' : 'text-white'}`}>{value}</span>
      <span className={`text-[8px] font-bold uppercase tracking-widest ${isUrgent ? 'text-red-400' : 'text-indigo-200'}`}>{label}</span>
    </div>
  );
}

function TimerBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white text-3xl md:text-4xl font-bold leading-none">{value}</span>
      <span className="text-white/90 text-[10px] md:text-xs font-normal mt-1">{label}</span>
    </div>
  );
}

function InfoBox({ label, value, highlight }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-lg'}`}>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-[#151941]'}`}>{value}</span>
    </div>
  )
}

function QuestionBlock({ number, questionData, selectedOption, onSelect }) {
  if (!questionData) return null;
  
  // FIXED: Access the options correctly whether they are strings or objects
  const options = questionData.options || [];

  return (
    <div className="space-y-6">
      <h4 className="font-bold text-[#151941] text-xl flex gap-4 leading-tight">
        <span className="text-indigo-600 opacity-30 font-black">{String(number).padStart(2, '0')}</span>
        {questionData.text || questionData.question}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 md:ml-12">
        {options.map((opt, i) => {
          // Logic to handle if 'opt' is an object {id, option_text} or a simple string
          const displayValue = typeof opt === 'object' ? opt.option_text : opt;
          
          return (
            <label key={i} className={`flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all group ${selectedOption === displayValue ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/50'}`}>
              <input 
                type="radio" 
                name={`q-${questionData.id}`} 
                checked={selectedOption === displayValue} 
                onChange={() => onSelect(displayValue)} 
                className="accent-indigo-600 w-5 h-5" 
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-[#151941]">
                {displayValue}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value, color = "text-white" }) {
  return (
    <div className="bg-slate-800 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
      <h4 className={`text-3xl font-black mb-1 ${color}`}>{value}</h4>
      <span className="text-[10px] font-black text-indigo-200/50 uppercase tracking-widest">{label}</span>
    </div>
  )
}