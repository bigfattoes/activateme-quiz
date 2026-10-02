// POST /api/result — counts one finished quiz (no personal data).
import { db, handle, json, readJson, cleanId, cleanAnswers, clean, HttpError } from "../../lib/server.js";

export const onRequestPost = handle(async ({ request, env }) => {
  const body = await readJson(request);
  const result = cleanId(body.result);
  if (!result) throw new HttpError(400, "Missing result");
  const runnerUps = Array.isArray(body.runnerUps) ? body.runnerUps : [];
  await (await db(env))
    .prepare("INSERT INTO results (result, runner_up_1, runner_up_2, answers, source) VALUES (?, ?, ?, ?, ?)")
    .bind(result, cleanId(runnerUps[0]), cleanId(runnerUps[1]), cleanAnswers(body.answers), clean(body.source, 40))
    .run();
  return json({ ok: true });
});
