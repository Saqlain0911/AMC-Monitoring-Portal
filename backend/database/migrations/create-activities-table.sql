CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER, -- Remove NOT NULL
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  timestamp TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);