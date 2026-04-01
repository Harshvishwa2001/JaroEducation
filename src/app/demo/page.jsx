'use client'
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Loader2,
    PlayCircle,
    Trophy
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ExamPortal() {
    const [step, setStep] = useState(0); // 0: Loading, 1: Error, 2: Info, 3: Quiz, 4: Result
    const [candidate, setCandidate] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorDetails, setErrorDetails] = useState({ title: '', msg: '' });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 1. Verify Email on Load
    useEffect(() => {
        const verifyCandidate = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            let emailEncoded = urlParams.get('email');

            if (!emailEncoded) {
                showError("Invalid Link", "No email provided in the URL.");
                return;
            }

            try {
                const email = atob(emailEncoded);
                const response = await fetch(`${API_BASE_URL}/candidates?email=${encodeURIComponent(email)}`);
                console.log("Email id",response)
                const result = await response.json();

                if (response.ok && result.data) {
                    if (parseInt(result.data.submitted_at) === 1) {
                        showError("Exam Already Completed", "You have already submitted this assessment.");
                        return;
                    }
                    setCandidate(result.data);
                    setStep(2); // Show Info Section
                } else {
                    showError("Candidate Not Found", "We couldn't find an assessment for this email.");
                }
            } catch (err) {
                showError("Error", "Failed to verify link or connect to server.");
            }
        };

        verifyCandidate();
    }, []);

    const showError = (title, msg) => {
        setErrorDetails({ title, msg });
        setStep(1);
    };

    // 2. Fetch Questions
    const startExam = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidate_id: candidate.id,
                    level: candidate.course_name || "MBA"
                })
            });
            const result = await response.json();

            if (response.ok) {
                setQuestions(result.data);
                setStep(3); // Show Quiz
            } else {
                toast.error(result.message || "Failed to load questions");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Submit Answers
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const answers = [];

        questions.forEach(q => {
            const selected = formData.get(`q_${q.id}`);
            if (selected) {
                answers.push({ question_id: q.id, selected_option_id: parseInt(selected) });
            }
        });

        if (answers.length < questions.length) {
            toast.error(`Please answer all ${questions.length} questions.`);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/submit-answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidate_id: candidate.id, answers })
            });
            const result = await response.json();

            if (response.ok) {
                setResults(result.data);
                setStep(4); // Show Results
            } else {
                toast.error(result.message || "Submission failed");
            }
        } catch (err) {
            toast.error("Network error during submission.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#151941] text-white p-6 font-sans relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        JARO SCHOLARSHIP EXAM
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Assessment Portal</p>
                </header>

                {/* STEP 0: LOADING */}
                {step === 0 && (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
                    </div>
                )}

                {/* STEP 1: ERROR */}
                {step === 1 && (
                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-[40px] text-center">
                        <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-2">{errorDetails.title}</h2>
                        <p className="text-slate-400">{errorDetails.msg}</p>
                    </div>
                )}

                {/* STEP 2: INFO */}
                {step === 2 && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 text-slate-900 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6">Welcome, <span className="text-indigo-600">{candidate.name}</span>!</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <InfoBox label="Email" value={candidate.email} />
                            <InfoBox label="Exam Level" value={candidate.course_name || "MBA"} highlight />
                            <InfoBox label="University" value={candidate.university} />
                            <InfoBox label="Mobile" value={candidate.mobile} />
                        </div>
                        <button
                            onClick={startExam}
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><PlayCircle /> Start Exam Now</>}
                        </button>
                    </div>
                )}

                {/* STEP 3: QUIZ */}
                {step === 3 && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 md:p-12 text-slate-900 shadow-2xl">
                        <div className="flex justify-between items-center mb-10 border-b pb-5">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-indigo-600" /> Assessment</h3>
                            <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-black uppercase">5 Questions</span>
                        </div>
                        <div className="space-y-12">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {idx + 1}</p>
                                    <h4 className="text-xl font-semibold leading-snug">{q.question}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map(opt => (
                                            <label key={opt.id} className="relative flex items-center p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                                                <input type="radio" name={`q_${q.id}`} value={opt.id} className="mr-3 accent-indigo-600" required />
                                                <span className="font-medium text-slate-700">{opt.option_text}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-12 w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> Submit Assessment</>}
                        </button>
                    </form>
                )}

                {/* STEP 4: RESULT */}
                {step === 4 && (
                    <div className="bg-white rounded-[40px] p-12 text-slate-900 text-center shadow-2xl">
                        <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-black mb-2 uppercase">Assessment Complete!</h2>
                        <p className="text-slate-500 mb-10">Results have been synced with your profile.</p>

                        <div className="grid grid-cols-3 gap-4 mb-10">
                            <ResultStat label="Points" value={results.total_points_earned} />
                            <ResultStat label="Accuracy" value={`${results.correct_percentage}%`} />
                            <ResultStat label="Correct" value={`${results.total_correct}/${results.total_solved}`} />
                        </div>

                        <div className="bg-indigo-600 p-8 rounded-3xl text-white">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Voucher Code</p>
                            <h3 className="text-4xl font-mono font-black tracking-[0.2em]">{results.voucher_code}</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-components for cleaner code
function InfoBox({ label, value, highlight }) {
    return (
        <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
            <p className={`font-bold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>{value || '...'}</p>
        </div>
    );
}

function ResultStat({ label, value }) {
    return (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-2xl font-black text-slate-900">{value}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    );
}