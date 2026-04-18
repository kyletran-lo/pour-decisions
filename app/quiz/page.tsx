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

const menuDrinkTypes = ["cocktail", "wine", "beer", "sake"] as const;
type MenuDrinkType = (typeof menuDrinkTypes)[number];

const drinkTypeLabels: Record<DrinkType, string> = {
  cocktail: "🍸 Cocktails",
  wine: "🍷 Wine",
  beer: "🍺 Beer",
  sake: "🍶 Sake",
  surprise: "🎲 Surprise me",
};

const categoryLabels: Record<string, string> = {
  surprise: "🎲 Surprise me",
  Whiskey: "🥃 Whiskey",
  Vodka: "🍸 Vodka",
  Tequila: "🍹 Tequila",
  Mezcal: "🔥 Mezcal",
  Gin: "🌿 Gin",
  Rum: "🍍 Rum",
  Brandy: "🍷 Brandy",
  Spritz: "✨ Spritz",
  Martini: "🍸 Martini",
  Margarita: "🍋 Margarita",
  IPA: "🍺 IPA",
  Lager: "🍺 Lager",
  Pilsner: "🍺 Pilsner",
  Stout: "☕ Stout",
  Porter: "🍺 Porter",
  Wheat: "🌾 Wheat",
  Sour: "🍒 Sour",
  Saison: "🌾 Saison",
  Cider: "🍎 Cider",
  "Pale Ale": "🍺 Pale ale",
  Red: "🍷 Red",
  White: "🥂 White",
  Rose: "🌸 Rose",
  Sparkling: "🥂 Sparkling",
  Orange: "🍊 Orange",
  Dessert: "🍯 Dessert",
  Junmai: "🍶 Junmai",
  Ginjo: "🍶 Ginjo",
  Daiginjo: "🍶 Daiginjo",
  Nigori: "🍶 Nigori",
};

const categoryRules: Array<{
  label: string;
  drinkTypes: readonly MenuDrinkType[];
  aliases: readonly string[];
}> = [
  {
    label: "Whiskey",
    drinkTypes: ["cocktail"],
    aliases: ["whiskey", "whisky", "bourbon", "rye", "scotch"],
  },
  {
    label: "Vodka",
    drinkTypes: ["cocktail"],
    aliases: ["vodka"],
  },
  {
    label: "Tequila",
    drinkTypes: ["cocktail"],
    aliases: ["tequila", "blanco", "reposado", "anejo", "añejo"],
  },
  {
    label: "Mezcal",
    drinkTypes: ["cocktail"],
    aliases: ["mezcal"],
  },
  {
    label: "Gin",
    drinkTypes: ["cocktail"],
    aliases: ["gin"],
  },
  {
    label: "Rum",
    drinkTypes: ["cocktail"],
    aliases: ["rum", "daiquiri", "mojito"],
  },
  {
    label: "Brandy",
    drinkTypes: ["cocktail"],
    aliases: ["brandy", "cognac"],
  },
  {
    label: "Spritz",
    drinkTypes: ["cocktail"],
    aliases: ["spritz", "aperol", "campari"],
  },
  {
    label: "Martini",
    drinkTypes: ["cocktail"],
    aliases: ["martini"],
  },
  {
    label: "Margarita",
    drinkTypes: ["cocktail"],
    aliases: ["margarita"],
  },
  {
    label: "IPA",
    drinkTypes: ["beer"],
    aliases: ["ipa", "india pale ale", "hazy"],
  },
  {
    label: "Pale Ale",
    drinkTypes: ["beer"],
    aliases: ["pale ale"],
  },
  {
    label: "Lager",
    drinkTypes: ["beer"],
    aliases: ["lager", "helles"],
  },
  {
    label: "Pilsner",
    drinkTypes: ["beer"],
    aliases: ["pilsner", "pils"],
  },
  {
    label: "Stout",
    drinkTypes: ["beer"],
    aliases: ["stout"],
  },
  {
    label: "Porter",
    drinkTypes: ["beer"],
    aliases: ["porter"],
  },
  {
    label: "Wheat",
    drinkTypes: ["beer"],
    aliases: ["wheat", "hefeweizen", "witbier"],
  },
  {
    label: "Sour",
    drinkTypes: ["beer"],
    aliases: ["sour", "gose", "lambic"],
  },
  {
    label: "Saison",
    drinkTypes: ["beer"],
    aliases: ["saison", "farmhouse"],
  },
  {
    label: "Cider",
    drinkTypes: ["beer"],
    aliases: ["cider"],
  },
  {
    label: "Sparkling",
    drinkTypes: ["wine", "sake"],
    aliases: ["sparkling", "champagne", "prosecco", "cava"],
  },
  {
    label: "Rose",
    drinkTypes: ["wine"],
    aliases: ["rose", "rosé"],
  },
  {
    label: "Orange",
    drinkTypes: ["wine"],
    aliases: ["orange"],
  },
  {
    label: "White",
    drinkTypes: ["wine"],
    aliases: ["white", "chardonnay", "sauvignon blanc", "pinot grigio"],
  },
  {
    label: "Red",
    drinkTypes: ["wine"],
    aliases: ["red", "pinot noir", "cabernet", "merlot", "syrah"],
  },
  {
    label: "Dessert",
    drinkTypes: ["wine"],
    aliases: ["dessert", "port", "sherry"],
  },
  {
    label: "Daiginjo",
    drinkTypes: ["sake"],
    aliases: ["daiginjo"],
  },
  {
    label: "Ginjo",
    drinkTypes: ["sake"],
    aliases: ["ginjo"],
  },
  {
    label: "Junmai",
    drinkTypes: ["sake"],
    aliases: ["junmai"],
  },
  {
    label: "Nigori",
    drinkTypes: ["sake"],
    aliases: ["nigori"],
  },
];

const vibes = [
  "easy & smooth",
  "sweet & fun",
  "strong & bold",
  "fresh & light",
  "surprise",
] as const;

const vibeLabels: Record<Vibe, string> = {
  "easy & smooth": "😌 Easy & smooth",
  "sweet & fun": "🍭 Sweet & fun",
  "strong & bold": "🔥 Strong & bold",
  "fresh & light": "🌿 Fresh & light",
  surprise: "🎲 Surprise me",
};

const budgetOptions = [5, 10, 15, 20] as const;

function isMenuDrinkType(value: unknown): value is MenuDrinkType {
  return menuDrinkTypes.includes(value as MenuDrinkType);
}

function getAvailableDrinkTypes(menuItems: MenuItem[]) {
  const availableDrinkTypes = new Set<MenuDrinkType>();

  menuItems.forEach((item) => {
    if (isMenuDrinkType(item.type)) {
      availableDrinkTypes.add(item.type);
    }
  });

  return availableDrinkTypes;
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasPhrase(text: string, phrase: string) {
  const normalizedPhrase = normalizeSearchText(phrase);
  const escapedPhrase = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(`(^| )${escapedPhrase}( |$)`).test(text);
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word.length <= 3
        ? word.toUpperCase()
        : `${word[0]?.toUpperCase() ?? ""}${word.slice(1).toLowerCase()}`
    )
    .join(" ");
}

function getMenuItemCategory(item: MenuItem) {
  if (!isMenuDrinkType(item.type)) {
    return null;
  }

  const searchText = normalizeSearchText(
    [
      item.category,
      item.name,
      item.description,
      ...(Array.isArray(item.tags) ? item.tags : []),
    ]
      .filter(Boolean)
      .join(" ")
  );

  const matchedRule = categoryRules.find(
    (rule) =>
      rule.drinkTypes.includes(item.type as MenuDrinkType) &&
      rule.aliases.some((alias) => hasPhrase(searchText, alias))
  );

  if (matchedRule) {
    return matchedRule.label;
  }

  if (item.category) {
    return toTitleCase(item.category);
  }

  return null;
}

function getAvailableDrinkCategories(
  menuItems: MenuItem[],
  selectedDrinkType: DrinkType
) {
  const categories = new Set<string>();

  menuItems.forEach((item) => {
    if (selectedDrinkType !== "surprise" && item.type !== selectedDrinkType) {
      return;
    }

    const category = getMenuItemCategory(item);

    if (category) {
      categories.add(category);
    }
  });

  return [...categories];
}

export default function QuizPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [drinkType, setDrinkType] = useState<DrinkType>("surprise");
  const [drinkCategory, setDrinkCategory] = useState("surprise");
  const [vibe, setVibe] = useState<Vibe>("fresh & light");
  const [budgetIndex, setBudgetIndex] = useState(2);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedMenu = sessionStorage.getItem("pour-decisions:menu");

    if (!storedMenu) {
      return;
    }

    try {
      const parsed = JSON.parse(storedMenu) as MenuItem[];
      const parsedDrinkTypes = getAvailableDrinkTypes(parsed);
      const storedDrinkType = sessionStorage.getItem(
        "pour-decisions:drink-type"
      );
      const storedDrinkCategory = sessionStorage.getItem(
        "pour-decisions:drink-category"
      );

      setMenuItems(parsed);

      if (
        isMenuDrinkType(storedDrinkType) &&
        (parsedDrinkTypes.size === 0 || parsedDrinkTypes.has(storedDrinkType))
      ) {
        setDrinkType(storedDrinkType);
        if (storedDrinkCategory) {
          setDrinkCategory(storedDrinkCategory);
        }
      } else if (parsedDrinkTypes.size === 1) {
        setDrinkType([...parsedDrinkTypes][0]);
      }
    } catch {
      sessionStorage.removeItem("pour-decisions:menu");
    }
  }, []);

  const menuCount = menuItems.length;
  const availableDrinkTypes = useMemo(
    () => getAvailableDrinkTypes(menuItems),
    [menuItems]
  );
  const availableDrinkCategories = useMemo(
    () => getAvailableDrinkCategories(menuItems, drinkType),
    [drinkType, menuItems]
  );
  const drinkCategoryOptions = useMemo(
    () => ["surprise", ...availableDrinkCategories],
    [availableDrinkCategories]
  );
  const budgetMax = budgetOptions[budgetIndex];
  const budgetLabel = budgetMax === 20 ? "$20+" : `$${budgetMax}`;
  const budgetProgress = useMemo(
    () => `${(budgetIndex / (budgetOptions.length - 1)) * 100}%`,
    [budgetIndex]
  );

  useEffect(() => {
    if (
      drinkCategory !== "surprise" &&
      !availableDrinkCategories.includes(drinkCategory)
    ) {
      setDrinkCategory("surprise");
    }
  }, [availableDrinkCategories, drinkCategory]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!menuItems.length) {
      setError("Upload a drink menu first.");
      return;
    }

    if (
      drinkType !== "surprise" &&
      availableDrinkTypes.size > 0 &&
      !availableDrinkTypes.has(drinkType)
    ) {
      setError(`${drinkTypeLabels[drinkType]} was not found on this menu.`);
      return;
    }

    if (
      drinkCategory !== "surprise" &&
      !availableDrinkCategories.includes(drinkCategory)
    ) {
      setError(`${drinkCategory} was not found on this menu.`);
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
            drink_category: drinkCategory,
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
                isOptionDisabled={(value) =>
                  value !== "surprise" &&
                  availableDrinkTypes.size > 0 &&
                  !availableDrinkTypes.has(value)
                }
                onSelect={(value) => {
                  setDrinkType(value);
                  setDrinkCategory("surprise");
                  sessionStorage.setItem("pour-decisions:drink-type", value);
                  sessionStorage.removeItem("pour-decisions:drink-category");
                }}
                options={drinkTypes}
                selected={drinkType}
              />
            </div>

            {availableDrinkCategories.length ? (
              <div className="rounded-[26px] bg-[#fbfcfa] p-5">
                <QuizStep
                  label="🥃 Which kind sounds best?"
                  getOptionLabel={(value) => categoryLabels[value] ?? value}
                  onSelect={(value) => {
                    setDrinkCategory(value);
                    sessionStorage.setItem(
                      "pour-decisions:drink-category",
                      value
                    );
                  }}
                  options={drinkCategoryOptions}
                  selected={drinkCategory}
                />
              </div>
            ) : null}

            <div className="rounded-[26px] bg-[#fbfcfa] p-5">
              <QuizStep
                label="✨ What&apos;s your vibe?"
                getOptionLabel={(value) => vibeLabels[value]}
                onSelect={setVibe}
                options={vibes}
                selected={vibe}
              />
            </div>

            <label className="block rounded-[26px] bg-[#fbfcfa] p-5">
              <span className="text-2xl font-black tracking-tight text-[#111111]">
                💰 Max budget
              </span>
              <div className="mt-5 flex items-center gap-4">
                <input
                  className="h-4 flex-1 appearance-none rounded-full bg-[#dfe8e2] accent-[#053f35] outline-none transition [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#053f35] [&::-moz-range-thumb]:shadow-[0_8px_18px_rgba(5,63,53,0.28)] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#053f35] [&::-webkit-slider-thumb]:shadow-[0_8px_18px_rgba(5,63,53,0.28)]"
                  max={budgetOptions.length - 1}
                  min="0"
                  onChange={(event) =>
                    setBudgetIndex(Number(event.target.value))
                  }
                  style={{
                    background: `linear-gradient(to right, #053f35 0%, #053f35 ${budgetProgress}, #dfe8e2 ${budgetProgress}, #dfe8e2 100%)`,
                  }}
                  step="1"
                  type="range"
                  value={budgetIndex}
                />
                <span className="min-w-24 rounded-[20px] bg-[#071512] px-5 py-4 text-center text-2xl font-black text-white shadow-[0_12px_26px_rgba(7,21,18,0.24)]">
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
