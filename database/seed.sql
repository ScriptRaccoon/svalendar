-- users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- calendars table
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

-- index for calendars per user
CREATE INDEX IF NOT EXISTS idx_calendar_user_id ON calendars (user_id);

-- calendar events table with encryption, isolated from calendars
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title_encrypted TEXT NOT NULL,
    description_encrypted TEXT NOT NULL,
    location_encrypted TEXT NOT NULL,
    event_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    color TEXT NOT NULL,
    link_encrypted TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- index for events by date
CREATE INDEX IF NOT EXISTS idx_date ON events (event_date);

-- table for coupling events with calendars (many-to-many relationship)
CREATE TABLE IF NOT EXISTS event_visibilities (
    event_id TEXT NOT NULL,
    calendar_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, calendar_id),
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (calendar_id) REFERENCES calendars (id) ON DELETE CASCADE
);

-- table for event participants (many-to-many relationship between users and events)
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

-- table for blocked users (many-to-many relationship between users)
CREATE TABLE IF NOT EXISTS blocked_users (
    user_id TEXT NOT NULL,
    blocked_user_id TEXT NOT NULL CHECK (user_id != blocked_user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, blocked_user_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- table for event templates in calendars: similar to events but
-- with associated user, and without specified date.
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title_encrypted TEXT NOT NULL,
    description_encrypted TEXT NOT NULL,
    location_encrypted TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    color TEXT NOT NULL,
    link_encrypted TEXT NOT NULL,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- index for templates by user
CREATE INDEX IF NOT EXISTS idx_template_user_id ON templates (user_id);