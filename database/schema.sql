CREATE TABLE IF NOT EXISTS adigun_memory (
  memory_key TEXT PRIMARY KEY,
  memory_value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS adigun_automation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_adigun_automation_log_created ON adigun_automation_log(created_at);
