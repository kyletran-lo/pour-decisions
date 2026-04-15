"use client";

type QuizStepProps<T extends string> = {
  label: string;
  options: readonly {
    emoji: string;
    label: string;
    value: T;
  }[];
  selected: T;
  onSelect: (value: T) => void;
};

export default function QuizStep<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: QuizStepProps<T>) {
  return (
    <fieldset>
      <legend className="text-2xl font-black tracking-tight text-[#111111]">
        {label}
      </legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = option.value === selected;
          const isSurpriseOption =
            option.label.toLowerCase() === "surprise me" ||
            option.value === "surprise";

          return (
            <button
              aria-pressed={isSelected}
              className={`flex min-h-16 items-center gap-3 rounded-[20px] px-5 py-4 text-left text-lg font-black shadow-[0_10px_26px_rgba(18,26,21,0.06)] transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97] ${
                isSurpriseOption
                  ? "mx-auto w-full max-w-[260px] justify-center sm:col-span-2"
                  : ""
              } ${
                isSelected
                  ? "bg-[#053f35] text-white shadow-[0_16px_32px_rgba(5,63,53,0.22)]"
                  : "bg-[#f6f7f4] text-[#171c19] hover:bg-[#eef2eb]"
              }`}
              key={option.value}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-xl leading-none">
                {option.emoji}
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
