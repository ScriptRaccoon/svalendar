# Svalendar

Svalendar is a calendar application for managing events and schedules.

<https://svalendar.netlify.app>

<br> 
<img src="https://github.com/user-attachments/assets/e23aea82-efe5-430a-9f1a-c0f73894925f" width="300" alt="mobile view of calendar" />

## Features

- **Mobile-Friendly**: Responsive design for mobile, tablet, and desktop devices.
- **Event Sharing**: Share events with other users who can accept or decline invitations.
- **Multiple Calendars**: Supports creating and managing separate calendars.
- **Event Templates**: Create reusable templates to quickly set up new events.
- **No Vendor Lock-In**: Does not rely on third-party services like Google or Microsoft.
- **Backup to JSON**: Allows exporting calendars to a JSON file.
- **Block Users**: Block specific users to prevent receiving event invites from them.
- **Encrypted Events**: All events are stored encrypted in the database for security.

## Tech Stack

- **Framework**: Built with [SvelteKit](https://kit.svelte.dev). Hence, the name _Svalendar_.
- **Database**: Uses SQLite for data storage.
- **Authentication**: Self-made authentication system for user management.

## Credits

- **Favicon Source**: <https://loading.io/icon/cgof25>

## Database Structure

```mermaid
erDiagram
  users {
    TEXT id PK
    TEXT name
    TEXT password_hash
    TIMESTAMP created_at
    TIMESTAMP last_login
  }
  calendars {
    TEXT id PK
    TEXT name
    TEXT user_id FK
    TIMESTAMP created_at
    TEXT default_color
    INTEGER default_start_hour
    BOOLEAN is_default_calendar
  }
  calendars ||--o{ users : "user_id"
  events {
    TEXT id PK
    TEXT title_encrypted
    TEXT description_encrypted
    TEXT location_encrypted
    TEXT event_date
    TEXT start_time
    TEXT end_time
    TEXT color
    TEXT link_encrypted
    TIMESTAMP created_at
  }
  event_visibilities {
    TEXT event_id PK, FK
    TEXT calendar_id PK, FK
    TIMESTAMP created_at
  }
  event_visibilities }o--|| events : "event_id"
  event_visibilities }o--|| calendars : "calendar_id"
  event_participants {
    TEXT event_id PK, FK
    TEXT user_id PK, FK
    TEXT role
    TEXT status
    TIMESTAMP created_at
  }
  event_participants }o--|| events : "event_id"
  event_participants }o--|| users : "user_id"
  blocked_users {
    TEXT user_id PK, FK
    TEXT blocked_user_id PK, FK
    TIMESTAMP created_at
  }
  blocked_users }o--|| users : "user_id"
  blocked_users }o--|| users : "blocked_user_id"
  templates {
    TEXT id PK
    TEXT user_id FK
    TEXT title_encrypted
    TEXT description_encrypted
    TEXT location_encrypted
    TEXT start_time
    TEXT end_time
    TEXT color
    TEXT link_encrypted
    INTEGER used_count
    TIMESTAMP created_at
  }
  templates }o--|| users : "user_id"
```
