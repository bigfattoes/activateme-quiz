// GET /api/admin/stats — totals for the admin page (password required).
import { db, handle, json, requireAdmin } from "../../../lib/server.js";

export const onRequestGet = handle(async ({ request, env }) => {
  await requireAdmin(request, env);
  const d = await db(env);
  const [results, signups, totals] = await d.batch([
    d.prepare("SELECT result, COUNT(*) AS count FROM results GROUP BY result ORDER BY count DESC"),
    d.prepare("SELECT result, COUNT(*) AS count FROM signups GROUP BY result ORDER BY count DESC"),
    d.prepare(
      `SELECT
        (SELECT COUNT(*) FROM results) AS quizzes,
        (SELECT COUNT(*) FROM signups) AS signups,
        (SELECT COUNT(*) FROM signups WHERE opt_in_clubs = 1) AS opt_in_clubs,
        (SELECT COUNT(*) FROM signups WHERE opt_in_news = 1) AS opt_in_news`
    )
  ]);
  return json({ ok: true, totals: totals.results[0], results: results.results, signups: signups.results });
});
