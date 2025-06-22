-- Add blacklisted tokens table for JWT token management

CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    reason TEXT DEFAULT 'logout',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_token_id ON blacklisted_tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_expires_at ON blacklisted_tokens(expires_at);
