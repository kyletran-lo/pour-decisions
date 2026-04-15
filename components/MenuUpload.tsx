"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AnalyzeMenuResponse, DrinkType } from "@/types";

const drinkChips: { label: string; value: Exclude<DrinkType, "surprise"> }[] = [
  { label: "Cocktails", value: "cocktail" },
  { label: "Wine", value: "wine" },
  { label: "Beer", value: "beer" },
  { label: "Sake", value: "sake" },
];

const drinkEmoji: Record<Exclude<DrinkType, "surprise">, string> = {
  cocktail: "🍸",
  wine: "🍷",
  beer: "🍺",
  sake: "🍶",
};

export default function MenuUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinding, setIsFinding] = useState(false);
  const [selectedDrink, setSelectedDrink] =
    useState<Exclude<DrinkType, "surprise"> | null>(null);

  const canSubmit = Boolean(file && selectedDrink && !isLoading && !isFinding);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    setError("");

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl("");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Use a menu photo so I can read the drinks.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDrink) {
      setError("Choose what you are drinking first.");
      return;
    }

    if (!file) {
      setError("Scan your menu first.");
      return;
    }

    setIsFinding(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 450));
    setIsFinding(false);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analyze-menu", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as AnalyzeMenuResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "The menu could not be read.");
      }

      if (!payload.items?.length) {
        throw new Error("No drinks found. Try a clearer photo of the drink menu.");
      }

      sessionStorage.setItem("pour-decisions:menu", JSON.stringify(payload.items));
      sessionStorage.setItem("pour-decisions:drink-type", selectedDrink);
      router.push("/quiz");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went sideways. Try one more photo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-5 sm:max-w-xl">
        <nav className="flex items-center justify-between">
          <Image
            alt="Pour Decisions"
            className="h-16 w-16 rounded-[22px] object-contain shadow-[0_12px_34px_rgba(0,0,0,0.14)]"
            height={96}
            src="/pour-decisions-logo.png"
            unoptimized
            width={96}
          />
          <p className="rounded-full bg-[#f3f5f1] px-4 py-2 text-sm font-black text-[#17443b] shadow-[0_8px_20px_rgba(18,26,21,0.05)]">
            Takes 5 seconds
          </p>
        </nav>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="text-center">
            <h1 className="mx-auto max-w-sm text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              Stop guessing your drink.
            </h1>
            <p className="mx-auto mt-5 max-w-xs text-xl font-semibold leading-7 text-[#5a625d]">
              Snap the menu. We&apos;ll tell you what to order.
            </p>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-[#17443b]">
              1 perfect pick
            </p>
          </div>

          <div className="mt-10">
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.16em] text-[#6b736e]">
              What are you drinking?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {drinkChips.map((drink) => {
                const isSelected = selectedDrink === drink.value;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`flex min-h-16 items-center justify-center gap-2 rounded-full px-4 py-4 text-center text-base font-black transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97] ${
                      isSelected
                        ? "bg-[#053f35] text-white shadow-[0_16px_32px_rgba(5,63,53,0.22)]"
                        : "bg-[#f6f7f4] text-[#171c19] shadow-[0_8px_24px_rgba(18,26,21,0.07)] hover:bg-[#eef2eb] hover:shadow-[0_12px_28px_rgba(18,26,21,0.10)]"
                    }`}
                    key={drink.value}
                    onClick={() => setSelectedDrink(drink.value)}
                    type="button"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center text-xl leading-none">
                      {drinkEmoji[drink.value]}
                    </span>
                    <span>{drink.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form
            className="mt-9 rounded-[32px] bg-white p-3 shadow-[0_26px_80px_rgba(17,24,20,0.15)] transition duration-200"
            onSubmit={handleSubmit}
          >
            <label
              className={`block cursor-pointer overflow-hidden rounded-[28px] p-5 text-center transition duration-200 ease-out hover:-translate-y-1 active:scale-[0.97] ${
                previewUrl
                  ? "bg-[#053f35] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_55px_rgba(5,63,53,0.20)]"
                  : "bg-[radial-gradient(circle_at_top,_#fff7d7_0%,_#eef8ef_44%,_#f9fbf7_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_45px_rgba(5,63,53,0.10)]"
              }`}
            >
              <input
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                type="file"
              />
              <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[24px]">
                {previewUrl ? (
                  <div className="w-full">
                    <img
                      alt="Uploaded drink menu preview"
                      className="h-full max-h-[360px] w-full rounded-[24px] object-cover shadow-[0_22px_50px_rgba(0,0,0,0.30)]"
                      src={previewUrl}
                    />
                    <div className="pt-5 text-white">
                      <p className="text-3xl font-black tracking-tight">
                        Menu ready ✅
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white/75">
                        Tap to rescan
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="px-6">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] bg-white text-6xl shadow-[0_20px_50px_rgba(17,24,20,0.14)]">
                      📸
                    </div>
                    <p className="mt-7 text-3xl font-black tracking-tight text-[#111111]">
                      Scan your menu 📸
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#626b65]">
                      Snap or upload in 2 seconds
                    </p>
                  </div>
                )}
              </div>
            </label>

            <div className="mt-5">
              <button
                className="min-h-16 w-full rounded-[22px] bg-[#053f35] px-6 py-4 text-lg font-black text-white shadow-[0_16px_30px_rgba(5,63,53,0.28)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#032e27] hover:shadow-[0_20px_36px_rgba(5,63,53,0.34)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#c8cdc8] disabled:text-white/80 disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0"
                disabled={!canSubmit}
                type="submit"
              >
                {isFinding
                  ? "Finding your drink 🍸"
                  : isLoading
                    ? "Reading menu..."
                    : "Get my drink 🍸"}
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl bg-[#fff1f1] px-4 py-3 text-center text-sm font-bold text-[#9d202b]">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}
