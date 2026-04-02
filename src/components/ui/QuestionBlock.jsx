export function QuestionBlock({ number, questionData, selectedOption, onSelect }) {
    if (!questionData) return null;

    // Ensure we have an options array
    const options = questionData.options || [];

    return (
        <div className="space-y-6">
            <h4 className="font-bold text-[#151941] text-xl flex gap-4 leading-tight">
                <span className="text-indigo-600 opacity-30 font-black">
                    {String(number).padStart(2, '0')}
                </span>
                {questionData.text || questionData.question}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 md:ml-12">
                {options.map((opt, i) => {
                    // 1. Identify the ID and the Text
                    // If opt is an object, use its properties; otherwise fallback to index/value
                    const optionId = typeof opt === 'object' ? opt.id : i;
                    const displayValue = typeof opt === 'object' ? opt.option_text : opt;

                    // 2. Check selection based on ID for technical accuracy
                    const isSelected = selectedOption === optionId;

                    return (
                        <label
                            key={optionId}
                            className={`flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all group 
                                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/50'
                                }`}
                        >
                            <input
                                type="radio"
                                name={`q-${questionData.id}`}
                                checked={isSelected}
                                // 3. Pass the optionId back to the parent state
                                onChange={() => onSelect(optionId)}
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