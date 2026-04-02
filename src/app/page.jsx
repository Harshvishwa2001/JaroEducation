'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from './component/Header';
import RegisterSucess from './component/RegisterSucess';
import ExamPage from './exam/ExamClient';

export default function Home() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [salesData, setSalesData] = useState(null);
  const [levelCategory, setLevelCategory] = useState(''); // Added for Shadcn Select
  const [isLoading, setIsLoading] = useState(false);
  const [candidateData, setCandidateData] = useState(null); // Store all data for the exam
  const today = new Date().toISOString().split('T')[0];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // Check if sales data or candidate info already exists
    const savedCandidate = localStorage.getItem('candidate_info');
    const savedSales = localStorage.getItem('sales_person');
    if (savedSales || savedCandidate) {
      if (savedSales) {
        setSalesData(JSON.parse(savedSales));
      }
      setStep(2);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true);
    const emailStr = email.trim();

    if (!emailStr || !emailStr.includes("@")) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    const loadingToast = toast.loading('Verifying Sales ID...');

    try {
      const response = await fetch(`${API_BASE_URL}/sales?search=${encodeURIComponent(emailStr)}`);
      const result = await response.json();

      if (response.ok && result.data && result.data.length > 0) {
        const matchID = result.data.find(s => s.email.toLowerCase() === emailStr.toLowerCase()) || result.data[0];
        setSalesData(matchID); // Save employee data
        localStorage.setItem('sales_person', JSON.stringify(matchID));
        toast.success('Sales Agent Verified Successfully!', { id: loadingToast });
        setStep(2); // Auto-navigate to Registration
      } else {
        toast.error("Employee ID not found", { id: loadingToast });
      }
    } catch (error) {
      console.log(error);
      toast.error("Network error occurred.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  }

  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      sales_id: salesData?.id || 1,
      name: formData.get('name'),
      email: formData.get('email'),
      mobile: formData.get('mobile'),
      level: levelCategory,
      university: formData.get('university'),
      course_name: formData.get('course_name'),
      date_scholarship: formData.get('date_scholarship'),
      date_completion: formData.get('date_completion')
    };

    setCandidateData(payload); // Save data for Step 4
    const loadingToast = toast.loading('Registering Candidate...');

    try {
      const response = await fetch(`${API_BASE_URL}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      localStorage.setItem('candidate_info', JSON.stringify(result.email || payload));
      if (response.ok || response.status === 201) {
        toast.success('Registration Successful! Exam link sent to candidate.', { id: loadingToast });
        setStep(3); // Auto-navigate to Success
      } else {
        let errorMsg = result.message || 'Registration failed';
        if (result.errors && Array.isArray(result.errors)) {
          errorMsg = result.errors.join(', ');
        }
        toast.error(errorMsg, { id: loadingToast });
      }
    } catch (err) {
      toast.error('Network error occurred. Please try again.', { id: loadingToast });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("salesData", salesData?.id)

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];

    if (selectedDate < today) {
      toast.error("Please select a current or future date");
      e.target.value = ""; // Reset the field
      return;
    }
  };

  return (
    <div className=''>
      <Header />

      {/* Step 1: Verification */}
      {step === 1 && (
        <div className="bg-linear-to-b from-[#474f83] to-[#151941] min-h-screen flex items-center justify-center p-6 md:p-30 overflow-hidden">
          <div className="w-full max-w-7xl gap-16 items-center grid grid-cols-2">
            <div className="flex flex-col items-center space-y-1 text-center">
              <div className="relative -top-10">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
                <img src="/image/SEO 2.gif" alt="SEO 2" className="relative w-50 md:w-60 drop-shadow-2xl" />
              </div>
              <div className="relative -top-10">
                <h1 className="text-6xl md:text-8xl font-black leading-[0.6] tracking-wide bg-linear-to-b from-[#ffffff] to-[#6d79c5] bg-clip-text text-transparent">
                  Udaan <br />
                  <span className='text-5xl md:text-6xl'>Kamyabi ki</span>
                </h1>
                <p className='text-white text-sm tracking-widest'>Carrer Acceleration Grant Engine</p>
              </div>
            </div>

            <div className="bg-[#e3e5f5] backdrop-blur-xl w-full max-w-2xl mx-auto lg:ml-auto rounded-[48px] border border-white/20 relative overflow-hidden group transition-all">
              <div className="p-8 md:p-12 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-black uppercase tracking-tighter">Verification</h3>
                  <div className="h-1 w-12 bg-[#474f83] rounded-full" />
                </div>
                <form onSubmit={onSubmit}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[14px] font-medium text-slate-800 ml-1">Enter your Employee E-mail ID:</p>
                      <input
                        type="email"
                        name='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@jaroeducation.com"
                        className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-black placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#474f83] transition-all"
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black rounded-2xl font-normal text-xl tracking-wide shadow-xl shadow-indigo-900/20 active:scale-[0.98] transition-all hover:opacity-85 hover:-translate-y-0.5">
                      {isLoading ? 'Verifying...' : 'Verify Identity'}
                    </button>
                  </div>
                </form>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">Contact HR if you're unable to access your ID</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Registration */}
      {step === 2 && (
        <div className='bg-linear-to-b from-[#474f83] to-[#151941] min-h-screen'>
          <div className='py-20'>
            <section className="bg-[#e3e5f5] backdrop-blur-2xl w-full max-w-6xl mx-auto rounded-[40px] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] border border-white/20 overflow-hidden group transition-all">
              <div className="p-8 md:p-12 ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-400 pb-8">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-black tracking-tighter uppercase italic">Candidate Registration</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Fill in details to begin assessment</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#f8fafc] px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Employees:</span>
                    <span className="text-sm font-bold text-black">{salesData?.name || "Harsh Vishwakarma"} : {salesData?.email}</span>
                  </div>
                </div>

                <form onSubmit={onRegisterSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input name="name" type="text" className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-semibold text-black focus:ring-4 focus:ring-indigo-500/10 focus:border-[#474f83] outline-none transition-all" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input name="email" type="email" className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-semibold text-black focus:ring-4 focus:ring-indigo-500/10 focus:border-[#474f83] outline-none transition-all" placeholder="admin@gmail.com" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <input name="mobile" type="tel" className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-semibold text-black focus:ring-4 focus:ring-indigo-500/10 focus:border-[#474f83] outline-none transition-all" placeholder="10-digit number" pattern="[0-9]{10}" required />
                    </div>
                    <div className="relative group w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Level Category</label>
                      <Select onValueChange={setLevelCategory} required>
                        <SelectTrigger className="w-full h-14 px-6 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:border-[#474f83] border-solid">
                          <SelectValue placeholder="Select Level..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="MBA">MBA — Master of Business</SelectItem>
                          <SelectItem value="BCA">BCA — Bachelor of Applications</SelectItem>
                          <SelectItem value="MCA">MCA — Master of Applications</SelectItem>
                          <SelectItem value="Bsc IT">Bsc IT — Science in Tech</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">University</label>
                      <input name="university" type="text" className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-semibold text-black focus:ring-4 focus:ring-indigo-500/10 focus:border-[#474f83] outline-none transition-all" placeholder="University Name" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
                      <input name="course_name" type="text" className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-semibold text-black focus:ring-4 focus:ring-indigo-500/10 focus:border-[#474f83] outline-none transition-all" placeholder="Course Name" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Scholarship</label>
                      <input name="date_scholarship" type="date" className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-semibold text-black outline-none uppercase" onChange={handleDateChange} min={today} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Completion Date</label>
                      <input name="date_completion" type="date" className="w-full h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-semibold text-black outline-none uppercase" onChange={handleDateChange} min={today + 1} required />
                    </div>
                  </div>
                  <div className="pt-6 flex justify-end">
                    <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 h-16 bg-linear-to-r from-[#f3d57a] to-[#face49] text-black rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/30 transition-all hover:opacity-95 hover:-translate-y-1">
                      {isLoading ? 'Registering...' : 'Register Candidate'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && <RegisterSucess candidate={candidateData?.name} setStep={setStep} />}
      {step === 4 && <ExamPage candidates={candidateData} saleId={salesData?.id} />}
    </div>
  )
}