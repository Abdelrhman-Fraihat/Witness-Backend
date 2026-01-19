-- 1) users
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',     -- 'user' or 'admin'
  state         TEXT NOT NULL DEFAULT 'active'  -- 'active' or 'disabled'
);

CREATE TABLE crimes (
  id                BIGSERIAL PRIMARY KEY,
  title             TEXT NOT NULL,
  short_description TEXT,
  description       TEXT,
  crime_type        TEXT,
  country           TEXT NOT NULL DEFAULT 'فلسطين',
  city              TEXT NOT NULL,
  incident_date     DATE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',  -- 'pending'/'approved'/'rejected'
  reporter_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  admin_notes       TEXT,
  reviewed_by       BIGINT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ

);

CREATE TABLE crime_media (
  id         BIGSERIAL PRIMARY KEY,
  crime_id   BIGINT NOT NULL REFERENCES crimes(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image',   -- 'image' or 'video'
  url        TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
