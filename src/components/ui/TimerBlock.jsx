export function TimerBlock({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-white text-3xl md:text-4xl font-bold leading-none">{value}</span>
            <span className="text-white/90 text-[10px] md:text-xs font-normal mt-1">{label}</span>
        </div>
    );
}