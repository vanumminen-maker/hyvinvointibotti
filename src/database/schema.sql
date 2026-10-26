-- PostgreSQL tietokantarakenne Hyvinvointibotille

CREATE TABLE IF NOT EXISTS users (
  discord_id   VARCHAR(30) PRIMARY KEY,
  username     VARCHAR(100),
  total_points INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_logs (
  id          SERIAL PRIMARY KEY,
  discord_id  VARCHAR(30) REFERENCES users(discord_id),
  category    VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  logged_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_pool (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  total_points    INTEGER DEFAULT 0,
  total_donations INTEGER DEFAULT 0
);

INSERT INTO community_pool (id, total_points, total_donations)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS aquarium_items (
  id           SERIAL PRIMARY KEY,
  item_key     VARCHAR(50) NOT NULL,
  item_type    VARCHAR(20) NOT NULL,
  item_name    VARCHAR(100) NOT NULL,
  emoji        VARCHAR(10),
  color        VARCHAR(20),
  size         INTEGER,
  pos_x        INTEGER,
  pos_y        INTEGER,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations_log (
  id         SERIAL PRIMARY KEY,
  item_name  VARCHAR(100) NOT NULL,
  cost       INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
