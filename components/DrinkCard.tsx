"use client";

import type { RecommendationPick } from "@/types";

type DrinkCardProps = {
  label: string;
  pick: RecommendationPick;
  featured?: boolean;
};

export default function DrinkCard({ label, pick, featured }: DrinkCardProps) {
  return (
    <article
      className={`rounded-[28px] p-6 shadow-[0_18px_45px_rgba(17,24,20,0.10)] transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97] ${
        featured
          ? "bg-[#053f35] text-white hover:shadow-[0_22px_52px_rgba(5,63,53,0.22)]"
          : "bg-[#f6f7f4] text-[#111111] hover:shadow-[0_22px_52px_rgba(17,24,20,0.14)]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            className={`text-sm font-black uppercase tracking-[0.16em] ${
              featured ? "text-[#f6c35f]" : "text-[#17443b]"
            }`}
          >
            {label}
          </p>
          <h2 className="mt-3 text-4xl font-black leading-none tracking-tight">
            {pick.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <span
            className={`rounded-full px-4 py-2 text-sm font-black ${
              featured ? "bg-white/12 text-white" : "bg-white text-[#111111]"
            }`}
          >
            {pick.type}
          </span>
          <span className="rounded-full bg-[#f6c35f] px-4 py-2 text-sm font-black text-[#111111]">
            {pick.price}
          </span>
        </div>
      </div>

      <p
        className={`mt-6 text-2xl font-black leading-8 ${
          featured ? "text-white" : "text-[#222722]"
        }`}
      >
        {pick.reason}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {pick.vibe_match.map((match) => (
          <span
            className={`rounded-full px-4 py-2 text-sm font-black ${
              featured
                ? "bg-white/12 text-white"
                : "bg-white text-[#343b36] shadow-[0_8px_20px_rgba(17,24,20,0.06)]"
            }`}
            key={match}
          >
            {match}
          </span>
        ))}
        <span
          className={`rounded-full px-4 py-2 text-sm font-black ${
            featured
              ? "bg-white/12 text-white"
              : "bg-white text-[#343b36] shadow-[0_8px_20px_rgba(17,24,20,0.06)]"
          }`}
        >
          {pick.confidence} confidence
        </span>
      </div>
    </article>
  );
}
