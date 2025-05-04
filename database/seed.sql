CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_name ON users (name);

CREATE TABLE IF NOT EXISTS calendars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    default_color TEXT NOT NULL,
    default_start_hour INTEGER DEFAULT 9,
    is_default_calendar BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON calendars (user_id);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title_encrypted TEXT NOT NULL,
    title_iv TEXT NOT NULL,
    title_tag TEXT NOT NULL,
    description_encrypted TEXT NOT NULL,
    description_iv TEXT NOT NULL,
    description_tag TEXT NOT NULL,
    location_encrypted TEXT NOT NULL,
    location_iv TEXT NOT NULL,
    location_tag TEXT NOT NULL,
    event_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_date ON events (event_date);

CREATE TABLE IF NOT EXISTS event_visibilities (
    event_id TEXT NOT NULL,
    calendar_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, calendar_id),
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (calendar_id) REFERENCES calendars (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_participants (
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT "attendee" CHECK (role IN ('attendee', 'organizer')),
    status TEXT DEFAULT "pending" CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
