export function TimerSegment({ value, label, isUrgent }) {
    return (
        <div className="flex flex-col items-center min-w-8">
            <span className={`text-2xl font-mono font-black tabular-nums transition-colors ${isUrgent ? 'text-red-500' : 'text-white'}`}>{value}</span>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${isUrgent ? 'text-red-400' : 'text-indigo-200'}`}>{label}</span>
        </div>
    );
}