export function StatBox({ label, value, color = "text-white" }) {
  return (
    <div className="bg-slate-800 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
      <h4 className={`text-3xl font-black mb-1 ${color}`}>{value}</h4>
      <span className="text-[10px] font-black text-indigo-200/50 uppercase tracking-widest">{label}</span>
    </div>
  )
}