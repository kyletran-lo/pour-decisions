"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QuizStep from "@/components/QuizStep";
import type {
  DrinkType,
  MenuItem,
  RecommendResponse,
  Vibe,
} from "@/types";

const drinkTypes = [
  "cocktail",
  "wine",
  "beer",
  "sake",
  "surprise",
] as const;

const drinkTypeLabels: Record<DrinkType, string> = {
  cocktail: "🍸 Cocktails",
  wine: "🍷 Wine",
  beer: "🍺 Beer",
  sake: "🍶 Sake",
  surprise: "🎲 Surprise me",
};

const vibes = [
  "easy & smooth",
  "sweet & fun",
  "strong & bold",
  "fresh & light",
] as const;

export default function QuizPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [drinkType, setDrinkType] = useState<DrinkType>("surprise");
  const [vibe, setVibe] = useState<Vibe>("fresh & light");
  const [budgetMax, setBudgetMax] = useState(18);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedMenu = sessionStorage.getItem("pour-decisions:menu");

    if (!storedMenu) {
      return;
    }

    try {
      const parsed = JSON.parse(storedMenu) as MenuItem[];
      setMenuItems(parsed);
    } catch {
      sessionStorage.removeItem("pour-decisions:menu");
    }

    const storedDrinkType = sessionStorage.getItem("pour-decisions:drink-type");

    if (
      storedDrinkType === "beer" ||
      storedDrinkType === "wine" ||
      storedDrinkType === "cocktail" ||
      storedDrinkType === "sake"
    ) {
      setDrinkType(storedDrinkType);
    }
  }, []);

  const menuCount = menuItems.length;
  const budgetLabel = useMemo(() => `$${budgetMax}`, [budgetMax]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!menuItems.length) {
      setError("Upload a drink menu first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizAnswers: {
            drink_type: drinkType,
            vibe,
            budget_max: budgetMax,
          },
          menuItems,
        }),
      });

      const payload = (await response.json()) as RecommendResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "No pick came back.");
      }

      sessionStorage.setItem(
        "pour-decisions:recommendation",
        JSON.stringify(payload)
      );
      router.push("/results");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The drink pick failed. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 pb-8 pt-5 text-[#111111]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col sm:max-w-xl">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <Image
              alt="Pour Decisions"
              className="h-24 w-24 rounded-[28px] object-contain shadow-[0_12px_34px_rgba(0,0,0,0.14)] transition duration-200 active:scale-[0.97]"
              height={160}
              src="/pour-decisions-cocktail-logo.png"
              unoptimized
              width={160}
            />
          </Link>
          <Link
            className="rounded-full bg-[#f3f5f1] px-4 py-2 text-sm font-black text-[#17443b] shadow-[0_8px_20px_rgba(18,26,21,0.05)] transition duration-200 active:scale-[0.97]"
            href="/"
          >
            New scan
          </Link>
        </nav>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="text-center">
            <p className="mx-auto mb-5 inline-flex rounded-full bg-[#fff4d8] px-4 py-2 text-sm font-black text-[#111111]">
              {menuCount
                ? `${menuCount} drink${menuCount === 1 ? "" : "s"} found`
                : "Menu needed"}
            </p>
            <h1 className="mx-auto max-w-sm text-5xl font-black leading-[0.95] tracking-tight">
              What sounds good?
            </h1>
            <p className="mx-auto mt-4 max-w-xs text-lg font-semibold leading-7 text-[#5a625d]">
              Set the mood and budget. We&apos;ll handle the order.
            </p>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-[#17443b]">
              1 perfect pick
            </p>
          </div>

          <form
            className="mt-9 flex flex-col gap-8 rounded-[30px] bg-white p-4 shadow-[0_24px_70px_rgba(17,24,20,0.13)]"
            onSubmit={handleSubmit}
          >
            <div className="rounded-[26px] bg-[#fbfcfa] p-5">
              <QuizStep
                label="🍸 What are you in the mood for?"
                getOptionLabel={(value) => drinkTypeLabels[value]}
                onSelect={setDrinkType}
                options={drinkTypes}
                selected={drinkType}
              />
            </div>

            <div className="rounded-[26px] bg-[#fbfcfa] p-5">
              <QuizStep
                label="✨ What&apos;s your vibe?"
                onSelect={setVibe}
                options={vibes}
                selected={vibe}
              />
            </div>

            <label className="block rounded-[26px] bg-[#fbfcfa] p-5">
              <span className="text-2xl font-black tracking-tight text-[#111111]">
                Max budget
              </span>
              <div className="mt-5 flex items-center gap-4">
                <input
                  className="h-3 flex-1 accent-[#053f35]"
                  max="60"
                  min="6"
                  onChange={(event) => setBudgetMax(Number(event.target.value))}
                  type="range"
                  value={budgetMax}
                />
                <span className="min-w-20 rounded-[18px] bg-[#111111] px-4 py-3 text-center text-xl font-black text-white">
                  {budgetLabel}
                </span>
              </div>
            </label>

            {error ? (
              <p className="rounded-2xl bg-[#fff1f1] px-4 py-3 text-center text-sm font-bold text-[#9d202b]">
                {error}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-16 w-full items-center justify-center rounded-[22px] bg-[#053f35] px-6 py-4 text-lg font-black text-white shadow-[0_16px_30px_rgba(5,63,53,0.28)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#032e27] hover:shadow-[0_20px_36px_rgba(5,63,53,0.34)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#c8cdc8] disabled:text-white/80 disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Picking..." : "Tell me what to order"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
