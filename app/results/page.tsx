"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import DrinkCard from "@/components/DrinkCard";
import type { RecommendResponse } from "@/types";

export default function ResultsPage() {
  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(
    null
  );

  useEffect(() => {
    const storedRecommendation = sessionStorage.getItem(
      "pour-decisions:recommendation"
    );

    if (!storedRecommendation) {
      return;
    }

    try {
      setRecommendation(JSON.parse(storedRecommendation) as RecommendResponse);
    } catch {
      sessionStorage.removeItem("pour-decisions:recommendation");
    }
  }, []);

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
            href="/quiz"
          >
            Change vibe
          </Link>
        </nav>

        {recommendation ? (
          <div className="flex flex-1 flex-col justify-center py-10">
            <header className="text-center">
              <p className="mb-5 inline-flex rounded-full bg-[#fff4d8] px-4 py-2 text-sm font-black text-[#111111]">
                Order this.
              </p>
              <h1 className="mx-auto max-w-sm text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                Your drink is picked.
              </h1>
              <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-[#17443b]">
                1 perfect pick
              </p>
            </header>

            <div className="mt-9 grid gap-4">
              <DrinkCard
                featured
                label="Top pick"
                pick={recommendation.top_pick}
              />
              <DrinkCard label="Backup pick" pick={recommendation.backup_pick} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                className="inline-flex min-h-16 items-center justify-center rounded-[22px] bg-[#053f35] px-6 py-4 text-lg font-black text-white shadow-[0_16px_30px_rgba(5,63,53,0.28)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#032e27] hover:shadow-[0_20px_36px_rgba(5,63,53,0.34)] active:scale-[0.97]"
                href="/"
              >
                Try another menu
              </Link>
              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-[20px] bg-[#f6f7f4] px-5 py-3 text-base font-black text-[#171c19] shadow-[0_8px_24px_rgba(18,26,21,0.07)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#eef2eb] hover:shadow-[0_12px_28px_rgba(18,26,21,0.10)] active:scale-[0.97]"
                href="/quiz"
              >
                Pick a different vibe
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mb-5 inline-flex rounded-full bg-[#fff1f1] px-4 py-2 text-sm font-black text-[#9d202b]">
              No recommendation yet.
            </p>
            <h1 className="max-w-sm text-5xl font-black leading-[0.95] tracking-tight">
              Let&apos;s read a menu first.
            </h1>
            <Link
              className="mt-8 inline-flex min-h-16 w-full items-center justify-center rounded-[22px] bg-[#053f35] px-6 py-4 text-lg font-black text-white shadow-[0_16px_30px_rgba(5,63,53,0.28)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#032e27] hover:shadow-[0_20px_36px_rgba(5,63,53,0.34)] active:scale-[0.97]"
              href="/"
            >
              Upload menu
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
