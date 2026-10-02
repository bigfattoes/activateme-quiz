-- For reference only: the quiz creates these tables automatically
-- the first time it runs (see lib/server.js). You don't need to run this.

CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  result TEXT NOT NULL,          -- top match, e.g. "football"
  runner_up_1 TEXT,
  runner_up_2 TEXT,
  answers TEXT,                  -- JSON, e.g. {"age":"4-6","energy":"walls",...}
  source TEXT                    -- from ?src= in the link, e.g. "ig-story"
);
CREATE INDEX IF NOT EXISTS results_result ON results(result);

CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  email TEXT NOT NULL,
  kid_name TEXT NOT NULL DEFAULT '',
  result TEXT,
  runner_up_1 TEXT,
  runner_up_2 TEXT,
  answers TEXT,
  opt_in_clubs INTEGER NOT NULL DEFAULT 0,  -- 1 = ticked "Send me club info"
  opt_in_news INTEGER NOT NULL DEFAULT 0,   -- 1 = ticked "ActivateMe news"
  source TEXT,
  UNIQUE(email, kid_name)        -- same parent + same kid = one row (updated)
);
