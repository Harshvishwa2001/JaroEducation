"use client"

import { InfoBox } from '@/components/ui/InfoBox';
import { QuestionBlock } from '@/components/ui/QuestionBlock';
import { StatBox } from '@/components/ui/StatBox';
import { TimerBlock } from '@/components/ui/TimerBlock';
import { TimerSegment } from '@/components/ui/TimerSegment';
import { AlertCircle, Clock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import toast from 'react-hot-toast';

// --- WRAPPER FOR NEXT.JS SUSPENSE ---
export default function ExamPage(props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#151941] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <ExamPageContent {...props} />
    </Suspense>
  );
}

// --- ACTUAL COMPONENT LOGIC ---
function ExamPageContent({ candidates, email }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

  const [step, setStep] = useState('loading');
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [hasWarned, setHasWarned] = useState(false);
  const [examResult, setExamResult] = useState(null); // Added state for result
  const [timeLeft, setTimeLeft] = useState({
    days: 3, hours: 23, minutes: 2, seconds: 59
  });

  const totalSeconds = (timeLeft.minutes * 60) + timeLeft.seconds;
  const isUrgent = totalSeconds <= 120 && timeLeft.days === 0 && timeLeft.hours === 0;

  useEffect(() => {
    const autoLoadCandidate = async () => {
      const emailParam = email;
      if (emailParam) {
        try {
          const decodedEmail = atob(emailParam);
          const response = await fetch(`${API_BASE_URL}/candidates?email=${encodeURIComponent(decodedEmail)}`);
          const result = await response.json();

          if (response.ok && result.data) {
            if (parseInt(result.data.submitted_at) === 1) {
              toast.error("Exam already completed.");
              router.push('/');
              return;
            }
            setCandidate(result.data);
            setStep('info');
          } else {
            setStep('info');
          }
        } catch (e) {
          setStep('info');
        }
      } else {
        const savedData = localStorage.getItem('candidate_info');
        if (savedData) setCandidate(JSON.parse(savedData));
        else if (candidates) setCandidate(candidates);
        setStep('info');
      }
    };
    autoLoadCandidate();
  }, [email, candidates, router, API_BASE_URL]);

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
    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 2 && timeLeft.seconds === 0 && !hasWarned) {
      toast.error("Hurry! Only 2 minutes remaining.", { icon: '⚠️' });
      setHasWarned(true);
    }
  }, [timeLeft, hasWarned]);

  const handleOptionChange = (questionId, optionValue) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const handleStartExam = async () => {
    if (!candidate) return toast.error("Profile data not found.");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidate?.id || candidate?.sales_id,
          level: candidate.level || candidate.course_name || 'General'
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
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    const answersArray = Object.keys(selectedAnswers).map((qId) => ({
      question_id: parseInt(qId),
      selected_option_id: parseInt(selectedAnswers[qId])
    }));

    if (answersArray.length < questions.length) {
      return toast.error("Please answer all questions before submitting!");
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/submit-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate?.id || candidate?.sales_id,
          answers: answersArray
        })
      });

      const result = await response.json();
      if (response.ok) {
        setExamResult(result.data); // Correctly setting results
        setStep("result");
      } else {
        toast.error(result.message || "Failed to submit exam");
      }
    } catch (err) {
      toast.error("Network error during submission.");
    } finally {
      setLoading(false);
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
    <div className='bg-linear-to-b from-[#474f83] to-[#151941] min-h-screen text-white pb-10 md:pb-20'>
      {/* Urgent Warning - Responsive width */}
      {isUrgent && step === 'quiz' && (
        <div className="fixed top-5 md:top-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-auto animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#901824] border-2 border-red-500 text-white px-4 md:px-8 py-3 md:py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 md:gap-4">
            <div className="bg-white/20 p-2 rounded-full animate-pulse shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="font-medium uppercase tracking-widest text-[10px] md:text-xs">Urgent Warning</p>
              <p className="text-xs md:text-sm font-medium opacity-90">Assessment ends in less than 2 minutes!</p>
            </div>
          </div>
        </div>
      )}

      <div className="container max-w-4xl mx-auto py-6 md:py-12 px-4 md:px-6">
        {/* STEP: INFO */}
        {step === 'info' && (
          <div className="space-y-6">
            <div className='flex flex-col md:flex-row items-center justify-between gap-6 md:-mt-12'>
              <div className='flex items-center gap-2 md:gap-0'>
                <div className="mt-2 rounded-lg shrink-0">
                  <img src="/image/SEO 2.gif" alt="Rocket Icon" className='w-24 h-24 md:w-40 md:h-40 object-cover' />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold leading-tight md:leading-[0.6] tracking-wide bg-linear-to-b from-[#ffffff] to-[#6d79c5] bg-clip-text text-transparent md:mt-16">
                    Udaan <br />
                    <span className='text-xl md:text-3xl'>Kamyabi ki</span>
                  </h1>
                </div>
              </div>
              <div className='md:pr-10'>
                <img src="/image/lottery.png" alt="lottery" className='w-40 md:w-60 mt-4 md:mt-10' />
              </div>
            </div>

            <div className="animate-in fade-in zoom-in-95 duration-500 bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-14 shadow-2xl text-slate-800 border border-white/20">
              <div className="text-center mb-8 md:mb-10">
                <h3 className="text-2xl md:text-4xl font-bold text-[#151941] uppercase italic tracking-wide leading-tight md:leading-none">
                  Welcome, {candidate?.name || 'Candidate'}!
                </h3>
                <p className="text-slate-400 font-bold mt-3 md:mt-4 text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em]">Verify your profile details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 md:mb-10">
                <InfoBox label="Registered Email" value={candidate?.email || '...'} />
                <InfoBox label="Contact Number" value={candidate?.mobile || '...'} />
                <InfoBox label="University" value={`${candidate?.course_name || '...'} - ${candidate?.university || '...'}`} />
                <InfoBox label="Course Level:" value={candidate?.level || candidate?.course_name || 'MBA'} highlight />
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={handleStartExam}
                  disabled={loading}
                  className="group w-full md:w-auto px-10 md:px-16 h-14 md:h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black hover:scale-[1.02] rounded-2xl font-bold tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 mx-auto active:scale-95 disabled:opacity-70"
                >
                  {loading ? <div className="h-5 w-5 border-2 border-black border-t-transparent animate-spin rounded-full" /> : "Start Assessment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: QUIZ */}
        {step === 'quiz' && (
          <div className="space-y-6">
            <div className='flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0'>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight md:leading-[0.6] tracking-wide bg-linear-to-b from-[#ffffff] to-[#6d79c5] bg-clip-text text-transparent md:px-10 py-2 md:py-4 text-center md:text-left">
                Udaan <br />
                <span className='text-xl md:text-3xl'>Kamyabi ki</span>
              </h1>
              <div className="flex items-center gap-3 md:pr-10">
                <span className={`text-[10px] md:text-[12px] font-bold uppercase tracking-widest transition-colors duration-500 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white/80'}`}>
                  {isUrgent ? 'Hurry!' : 'Time Left :'}
                </span>
                <div className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isUrgent ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/10 border-white/10'}`}>
                  <TimerSegment value={String(timeLeft.minutes).padStart(2, '0')} label="min" isUrgent={isUrgent} />
                  <span className={`text-lg md:text-xl font-bold mb-3 md:mb-4 transition-colors ${isUrgent ? 'text-red-500' : 'text-white'}`}>:</span>
                  <TimerSegment value={String(timeLeft.seconds).padStart(2, '0')} label="sec" isUrgent={isUrgent} />
                </div>
              </div>
            </div>

            <div className="animate-in slide-in-from-bottom-12 duration-700 bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-2xl text-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 bg-indigo-50 rounded-xl">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base md:text-xl font-bold text-[#151941] leading-tight">Unlock your career grant</h3>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Assessment in progress</p>
                  </div>
                </div>
                <div className="w-full md:w-auto text-right border-t md:border-t-0 pt-2 md:pt-0">
                  <p className="text-lg md:text-xl font-bold text-indigo-600">{currentQuestionIndex + 1} <span className="text-slate-300 text-sm">/ {questions.length}</span></p>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8 md:mb-10 overflow-hidden">
                <div className="h-full bg-linear-to-r from-[#f3d57a] to-[#face49] transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
              </div>

              <div className="min-h-[250px] md:min-h-35 animate-in fade-in slide-in-from-right-8 duration-500" key={currentQuestionIndex}>
                <QuestionBlock
                  number={currentQuestionIndex + 1}
                  questionData={questions[currentQuestionIndex]}
                  selectedOption={selectedAnswers[questions[currentQuestionIndex]?.id]}
                  onSelect={(val) => handleOptionChange(questions[currentQuestionIndex].id, val)}
                />
              </div>

              <div className="mt-10 md:mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  className={`text-sm font-bold uppercase tracking-widest w-full md:w-auto ${currentQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-indigo-600'}`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full md:w-auto px-12 h-14 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black rounded-xl font-bold tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? 'Submitting...' : currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: RESULT */}
        {step === 'result' && (
          <div className="animate-in zoom-in-95 duration-500 bg-[#e4e6f5] backdrop-blur-xl border border-white/10 rounded-[30px] md:rounded-[50px] p-6 md:p-12 text-center shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-wider mb-6">🎊Congratulations, {candidate?.name}!🎊</h2>

            <div className="mb-8">
              <h1 className='pb-5 text-slate-800 text-lg md:text-xl font-medium'>Your Evaluation Score</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                <StatBox label="Questions Solved" value={`${examResult?.total_solved || 0}`} />
                <StatBox label="Correct Answers" value={`${examResult?.total_correct || 0}`} />
                <StatBox label="Points Earned" value={`${examResult?.total_points_earned || 0}`} />
                <StatBox label="Accuracy" value={`${examResult?.correct_percentage || 0}%`} color="text-emerald-600" />
              </div>
            </div>

            {examResult?.voucher_code && (
              <div className="mb-8">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Your Unique Voucher</p>
                <div className="inline-block bg-white px-6 py-2 rounded-full border-2 border-dashed border-indigo-200 text-indigo-600 font-mono font-bold mt-2 text-sm md:text-base">
                  {examResult.voucher_code}
                </div>
              </div>
            )}

            <div className='flex flex-col md:grid md:grid-cols-2 gap-8 mb-8 text-left'>
              <div className="text-center md:text-left">
                <p className="text-black font-light text-base md:text-lg">You’ve unlocked your <br /> <span className='font-bold text-[#151941]'>Career Acceleration Grant.</span></p>
                <img src="/image/lottery.png" alt="lottery" className='mt-4 w-40 md:w-auto mx-auto md:mx-0' />
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center space-y-1">
                  <p className='text-slate-700 font-semibold text-xs md:text-sm'>Valid for <span className='text-red-600 font-bold italic'>72 hours</span> only</p>
                  <p className='text-slate-700 font-semibold text-xs md:text-sm'>Top <span className='text-red-600 font-bold italic'>100</span> Candidate Selection</p>
                </div>
                {/* Responsive Golden Card */}
                <div className="relative group w-full max-w-[340px] h-[120px] md:h-30 overflow-hidden rounded-[24px] shadow-2xl border-4 border-[#bf9b30] shrink-0">
                  <img src="/image/golden.jpg" alt="Golden Grant Frame" className='absolute inset-0 w-full h-full object-cover brightness-110' />
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-white/60 z-10"></div>
                  <img src="/image/trophy.png" alt="Grant Trophy" className='absolute top-1/2 left-2 md:left-2 -translate-y-1/2 h-16 md:h-24 w-auto z-20 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] animate-pulse' />
                  <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 text-right w-[60%] md:w-auto">
                    <h1 className='text-[#151941] font-bold text-sm md:text-xl tracking-tighter leading-none mb-1 md:mb-2'>Merit Tier Candidate</h1>
                    <p className='text-slate-800 font-medium text-[10px] md:text-sm leading-tight tracking-tight'>Performed better than <br /> <span className='text-red-700 text-sm md:text-xl font-bold'>{examResult?.correct_percentage}%</span> applicants</p>
                  </div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-30 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
                </div>
              </div>
            </div>

            {/* Responsive Timer Bar */}
            <div className='relative bg-[#901824] w-full min-h-[60px] md:h-20 px-4 md:px-10 rounded-xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 py-3 md:py-0'>
              <img src="/image/time.png" alt="time" className='hidden md:block absolute left-4 w-12 animate-spin duration-3000' />
              <h1 className='text-sm md:text-xl md:px-20'>Offer Expires in: </h1>
              <div className="flex items-center gap-2 md:gap-4">
                <TimerBlock value={String(timeLeft.days).padStart(2, '0')} label="days" />
                <span className="text-white/50 text-base md:text-xl font-bold mb-3 md:mb-5">:</span>
                <TimerBlock value={String(timeLeft.hours).padStart(2, '0')} label="hrs" />
                <span className="text-white/50 text-base md:text-xl font-bold mb-3 md:mb-5">:</span>
                <TimerBlock value={String(timeLeft.minutes).padStart(2, '0')} label="min" />
                <span className="text-white/50 text-base md:text-xl font-bold mb-3 md:mb-5">:</span>
                <TimerBlock value={String(timeLeft.seconds).padStart(2, '0')} label="sec" />
              </div>
            </div>

            <div className='flex flex-col md:flex-row items-center justify-center gap-4 mt-8 md:mt-10'>
              <button className='group w-full h-14 md:h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98]'>Claim Grant Now</button>
              <button onClick={() => setStep(1)} className='group w-full h-14 md:h-16 bg-white text-black rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98]'>Exit the Portal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}