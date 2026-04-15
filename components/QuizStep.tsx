"use client";

type QuizStepProps<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  getOptionLabel?: (value: T) => string;
  isOptionDisabled?: (value: T) => boolean;
};

export default function QuizStep<T extends string>({
  label,
  options,
  selected,
  onSelect,
  getOptionLabel = (value) => value,
  isOptionDisabled = () => false,
}: QuizStepProps<T>) {
  return (
    <fieldset>
      <legend className="text-2xl font-black tracking-tight text-[#111111]">
        {label}
      </legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = option === selected;
          const isDisabled = isOptionDisabled(option);

          return (
            <button
              aria-pressed={isSelected}
              disabled={isDisabled}
              className={`min-h-16 rounded-[20px] px-5 py-4 text-left text-lg font-black shadow-[0_10px_26px_rgba(18,26,21,0.06)] transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97] ${
                isSelected
                  ? "bg-[#053f35] text-white shadow-[0_16px_32px_rgba(5,63,53,0.22)]"
                  : isDisabled
                    ? "cursor-not-allowed bg-[#eef0ed] text-[#8b928d] opacity-55 shadow-none hover:translate-y-0"
                    : "bg-[#f6f7f4] text-[#171c19] hover:bg-[#eef2eb]"
              }`}
              key={option}
              onClick={() => onSelect(option)}
              type="button"
            >
              {getOptionLabel(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
