import { HelpCircleIcon, Phone } from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white">
            <div className="max-w-full px-20 h-20 flex items-center justify-between">
                <img src="/image/examLogo.png" alt="JaroEducation" className="w-45 object-cover"/>

                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3 ">
                        <div className="h-8 w-8 rounded-3xl bg-linear-to-br from-[#2c3363] to-[#191d49] flex items-center justify-center text-white">
                            <HelpCircleIcon size={20} strokeWidth={2} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-900 ">
                            Help
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}