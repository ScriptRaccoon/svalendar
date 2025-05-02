CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    default_calendar_id TEXT,
    FOREIGN KEY (default_calendar_id) REFERENCES calendars (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_name ON users (name);

CREATE TABLE IF NOT EXISTS calendars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    default_color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_permissions (
    id INTEGER PRIMARY KEY,
    calendar_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'write', 'owner')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    revokable BOOLEAN DEFAULT TRUE,
    UNIQUE (user_id, calendar_id),
    FOREIGN KEY (calendar_id) REFERENCES calendars (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_id ON calendar_permissions (calendar_id);

CREATE INDEX IF NOT EXISTS idx_user_id ON calendar_permissions (user_id);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL,
    title_encrypted TEXT NOT NULL,
    title_iv TEXT NOT NULL,
    title_tag TEXT NOT NULL,
    description_encrypted TEXT NOT NULL,
    description_iv TEXT NOT NULL,
    description_tag TEXT NOT NULL,
    location_encrypted TEXT NOT NULL,
    location_iv TEXT NOT NULL,
    location_tag TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL CHECK (end_time > start_time),
    start_date TEXT GENERATED ALWAYS AS (DATE(start_time)) STORED,
    end_date TEXT GENERATED ALWAYS AS (DATE(end_time)) STORED,
    color TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (calendar_id) REFERENCES calendars (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_id ON events (calendar_id);

CREATE INDEX IF NOT EXISTS idx_start_date ON events (start_date);

CREATE INDEX IF NOT EXISTS idx_end_date ON events (end_date);