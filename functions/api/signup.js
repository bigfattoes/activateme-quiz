// POST /api/signup — saves a parent's email, kid's name, quiz result and opt-ins.
import { db, handle, json, readJson, clean, cleanId, cleanAnswers, HttpError } from "../../lib/server.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const onRequestPost = handle(async ({ request, env }) => {
  const body = await readJson(request);
  // "website" is a hidden field only bots fill in. Pretend it worked.
  if (clean(body.website)) return json({ ok: true });

  const email = clean(body.email, 120).toLowerCase();
  if (!EMAIL.test(email)) throw new HttpError(400, "Invalid email");
  const kidName = clean(body.kidName, 40);
  const runnerUps = Array.isArray(body.runnerUps) ? body.runnerUps : [];

  await (await db(env))
    .prepare(
      `INSERT INTO signups (email, kid_name, result, runner_up_1, runner_up_2, answers, opt_in_clubs, opt_in_news, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(email, kid_name) DO UPDATE SET
         updated_at = datetime('now'),
         result = excluded.result,
         runner_up_1 = excluded.runner_up_1,
         runner_up_2 = excluded.runner_up_2,
         answers = excluded.answers,
         opt_in_clubs = excluded.opt_in_clubs,
         opt_in_news = excluded.opt_in_news,
         source = excluded.source`
    )
    .bind(
      email,
      kidName,
      cleanId(body.result),
      cleanId(runnerUps[0]),
      cleanId(runnerUps[1]),
      cleanAnswers(body.answers),
      body.optInClubs === true ? 1 : 0,
      body.optInNews === true ? 1 : 0,
      clean(body.source, 40)
    )
    .run();
  return json({ ok: true });
});
