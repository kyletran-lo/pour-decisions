import { cookies } from "next/headers";
import {
  hasAdminCookie,
  isAdminHistoryConfigured,
} from "@/lib/admin-auth";
import {
  isSubmissionHistoryConfigured,
  listSubmissionHistory,
} from "@/lib/submission-history";

type AdminHistoryPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminHistoryPage({
  searchParams,
}: AdminHistoryPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const isAdminConfigured = isAdminHistoryConfigured();
  const isSupabaseConfigured = isSubmissionHistoryConfigured();
  const isConfigured = isAdminConfigured && isSupabaseConfigured;
  const isAllowed = isConfigured && hasAdminCookie(cookieStore);
  const submissions = isAllowed ? await listSubmissionHistory() : [];

  return (
    <main className="min-h-screen bg-[#f8faf7] px-5 py-8 text-[#111111]">
      <section className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[#dfe8e2] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#17443b]">
              Pour Decisions
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Submission history
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#5a625d]">
              Every completed recommendation lands here for review.
            </p>
          </div>

          {isAllowed ? (
            <form action="/api/admin/logout" method="post">
              <button className="rounded-lg bg-[#111111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2f3431]">
                Sign out
              </button>
            </form>
          ) : null}
        </header>

        {!isConfigured ? (
          <div className="mt-8 rounded-lg border border-[#f1d386] bg-[#fff8df] p-5">
            <h2 className="text-2xl font-black">Finish setup first.</h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7 text-[#5a4b1f]">
              Add ADMIN_HISTORY_TOKEN, SUPABASE_URL, and SUPABASE_SECRET_KEY to
              your environment, restart the app, then come back here.
            </p>
          </div>
        ) : null}

        {isConfigured && !isAllowed ? (
          <form
            action="/api/admin/login"
            className="mt-8 grid max-w-md gap-4 rounded-lg border border-[#dfe8e2] bg-white p-5 shadow-[0_18px_45px_rgba(17,24,20,0.08)]"
            method="post"
          >
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-[#17443b]">
                Admin token
              </span>
              <input
                className="min-h-12 rounded-lg border border-[#cfd8d2] px-4 text-base font-semibold outline-none transition focus:border-[#17443b]"
                name="token"
                type="password"
              />
            </label>
            {params.error ? (
              <p className="rounded-lg bg-[#fff1f1] px-4 py-3 text-sm font-black text-[#9d202b]">
                That token did not match.
              </p>
            ) : null}
            <button className="min-h-12 rounded-lg bg-[#053f35] px-5 py-3 text-base font-black text-white transition hover:bg-[#032e27]">
              Open history
            </button>
          </form>
        ) : null}

        {isAllowed ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#17443b]">
                {submissions.length} saved
              </p>
            </div>

            {submissions.length ? (
              <div className="grid gap-4">
                {submissions.map((submission) => (
                  <article
                    className="rounded-lg border border-[#dfe8e2] bg-white p-5 shadow-[0_18px_45px_rgba(17,24,20,0.08)]"
                    key={submission.id}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.14em] text-[#17443b]">
                          {formatDate(submission.createdAt)}
                        </p>
                        <h2 className="mt-2 text-2xl font-black">
                          {submission.recommendation.top_pick.name}
                        </h2>
                        <p className="mt-2 max-w-3xl font-semibold leading-7 text-[#5a625d]">
                          {submission.recommendation.top_pick.reason}
                        </p>
                      </div>
                      <div className="grid min-w-48 gap-2 text-sm font-black text-[#111111]">
                        <span>Drink: {submission.quizAnswers.drink_type}</span>
                        {submission.quizAnswers.drink_category ? (
                          <span>
                            Type: {submission.quizAnswers.drink_category}
                          </span>
                        ) : null}
                        <span>Vibe: {submission.quizAnswers.vibe}</span>
                        <span>
                          Budget: ${submission.quizAnswers.budget_max}
                          {submission.quizAnswers.budget_max === 20 ? "+" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <section className="rounded-lg bg-[#f8faf7] p-4">
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#17443b]">
                          Backup
                        </h3>
                        <p className="mt-2 text-lg font-black">
                          {submission.recommendation.backup_pick.name}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#5a625d]">
                          {submission.recommendation.backup_pick.reason}
                        </p>
                      </section>

                      <section className="rounded-lg bg-[#f8faf7] p-4">
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#17443b]">
                          Menu items
                        </h3>
                        <p className="mt-2 text-lg font-black">
                          {submission.menuItems.length} submitted
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#5a625d]">
                          {submission.menuItems
                            .slice(0, 6)
                            .map((item) => item.name)
                            .join(", ")}
                          {submission.menuItems.length > 6 ? ", ..." : ""}
                        </p>
                      </section>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#dfe8e2] bg-white p-5">
                <h2 className="text-2xl font-black">No submissions yet.</h2>
                <p className="mt-3 font-semibold leading-7 text-[#5a625d]">
                  New recommendations will appear here after guests finish the
                  quiz.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
