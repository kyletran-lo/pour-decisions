import type {
  MenuItem,
  QuizAnswers,
  RecommendResponse,
  SubmissionHistoryEntry,
} from "@/types";

type SaveSubmissionInput = {
  quizAnswers: QuizAnswers;
  menuItems: MenuItem[];
  recommendation: RecommendResponse;
  metadata?: SubmissionHistoryEntry["metadata"];
};

type SubmissionHistoryRow = {
  id: string;
  created_at: string;
  quiz_answers: QuizAnswers;
  menu_items: MenuItem[];
  recommendation: RecommendResponse;
  user_agent: string | null;
};

const TABLE_NAME = "submission_history";

export function isSubmissionHistoryConfigured() {
  return Boolean(getSupabaseConfig());
}

export async function saveSubmissionHistory(input: SaveSubmissionInput) {
  const [row] = await supabaseRequest<SubmissionHistoryRow[]>("", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      quiz_answers: input.quizAnswers,
      menu_items: input.menuItems,
      recommendation: input.recommendation,
      user_agent: input.metadata?.userAgent ?? null,
    }),
  });

  return mapSubmissionHistoryRow(row);
}

export async function listSubmissionHistory(limit = 100) {
  const rows = await supabaseRequest<SubmissionHistoryRow[]>(
    `?select=*&order=created_at.desc&limit=${limit}`
  );

  return rows.map(mapSubmissionHistoryRow);
}

function mapSubmissionHistoryRow(
  row: SubmissionHistoryRow
): SubmissionHistoryEntry {
  return {
    id: row.id,
    createdAt: row.created_at,
    quizAnswers: row.quiz_answers,
    menuItems: row.menu_items,
    recommendation: row.recommendation,
    metadata: {
      userAgent: row.user_agent ?? undefined,
    },
  };
}

async function supabaseRequest<T>(query: string, init?: RequestInit) {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase submission history requires SUPABASE_URL and SUPABASE_SECRET_KEY."
    );
  }

  const response = await fetch(`${config.url}/rest/v1/${TABLE_NAME}${query}`, {
    ...init,
    headers: {
      apikey: config.key,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Supabase submission history request failed: ${response.status} ${message}`
    );
  }

  return (await response.json()) as T;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}
