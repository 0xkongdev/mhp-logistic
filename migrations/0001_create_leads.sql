CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL CHECK(length(full_name) BETWEEN 1 AND 100),
  phone TEXT NOT NULL CHECK(length(phone) BETWEEN 1 AND 30),
  need TEXT NOT NULL CHECK(length(need) BETWEEN 1 AND 500),
  source_path TEXT NOT NULL CHECK(length(source_path) BETWEEN 1 AND 200),
  email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK(email_status IN ('pending', 'sent', 'failed')),
  email_message_id TEXT,
  email_error TEXT,
  created_at TEXT NOT NULL,
  email_updated_at TEXT
);

CREATE INDEX leads_created_at_idx ON leads(created_at DESC);
