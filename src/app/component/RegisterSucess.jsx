'use client'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RegisterSuccess({ candidate, setStep }) {

    return (
        <div className='bg-linear-to-b from-[#474f83] to-[#151941] min-h-screen'>
            <div className='flex-1 flex items-center justify-center p-6 py-20'>
                <div className='bg-[#e3e5f5] backdrop-blur-xl max-w-3xl w-full rounded-[40px] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20'>
                    <div className='p-10 md:p-14 text-center space-y-8'>

                        {/* Success Icon Animation */}
                        <div className='relative flex justify-center'>
                            <div className='absolute inset-0  blur-3xl rounded-full scale-150' />
                            <div className='relative bg-emerald-50 rounded-full p-6'>
                                <CheckCircle2 className='w-16 h-16 text-emerald-500' strokeWidth={2} />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className='space-y-3'>
                            <h2 className='text-2xl font-medium text-[#151941] tracking-[0.5]'>
                                Registration Successful
                            </h2>
                            <p className='text-slate-500 text-lg font-medium px-4'>
                                Scholarship program link shared to <span className="text-[#474f83] font-bold">{candidate || 'the candidate'}</span> on mail and SMS
                            </p>
                        </div>

                        {/* Call to Action */}
                        <div className='flex items-center justify-center gap-4'>
                            <button
                                onClick={() => setStep(2)}
                                className='group w-full h-16 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/40 transition-all hover:opacity-95 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3'>
                                Exit the Portal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}