export function InfoBox({ label, value, highlight }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-lg'}`}>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-[#151941]'}`}>{value}</span>
    </div>
  )
}
