// GET /api/admin/export?type=signups|results — CSV download (password required).
import { db, handle, requireAdmin, toCsv, HttpError } from "../../../lib/server.js";

const EXPORTS = {
  signups: {
    sql: "SELECT * FROM signups ORDER BY id",
    columns: ["id", "created_at", "updated_at", "email", "kid_name", "result", "runner_up_1", "runner_up_2",
              "opt_in_clubs", "opt_in_news", "answers", "source"]
  },
  results: {
    sql: "SELECT * FROM results ORDER BY id",
    columns: ["id", "created_at", "result", "runner_up_1", "runner_up_2", "answers", "source"]
  }
};

export const onRequestGet = handle(async ({ request, env }) => {
  await requireAdmin(request, env);
  const type = new URL(request.url).searchParams.get("type") || "signups";
  const exp = EXPORTS[type];
  if (!exp) throw new HttpError(400, "Unknown export");
  const { results } = await (await db(env)).prepare(exp.sql).all();
  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(exp.columns, results), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="activateme-quiz-${type}-${date}.csv"`,
      "cache-control": "no-store"
    }
  });
});
