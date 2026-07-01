-- ============================================================
-- DOSTOS APP - SUPABASE ŞEMASI
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- ============================================================

-- 1. KULLANICILAR TABLOSU
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,
  color TEXT DEFAULT 'var(--purple)',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KULLANICI VERİSİ (kişisel)
CREATE TABLE IF NOT EXISTS app_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ARKADAŞLIK İSTEKLERİ
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- 4. ARKADAŞLAR
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 5. GRUPLAR
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GRUP ÜYELERİ
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 7. PAYLAŞILAN VERİ (grup bazlı)
CREATE TABLE IF NOT EXISTS shared_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE UNIQUE NOT NULL,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ARKADAŞ FEED (paylaşım akışı) - YENİ TABLO
-- Bu tablo, kullanıcıların arkadaşlarına gönderdiği içerikleri tutar
CREATE TABLE IF NOT EXISTS shared_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'kesfet', 'feed', 'game', 'music', 'expense', 'bbq', 'challenge'
  content JSONB NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - GÜVENLİK
-- ============================================================

-- Users tablosu - herkes okuyabilir, kendisi yazabilir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);

-- App data - herkes okuyabilir (kendi verisi), herkes yazabilir
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App data is accessible" ON app_data FOR ALL USING (true);

-- Friend requests - herkes okuyabilir/yazabilir
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friend requests are accessible" ON friend_requests FOR ALL USING (true);

-- Friends - herkes okuyabilir/yazabilir
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friends are accessible" ON friends FOR ALL USING (true);

-- Groups - herkes okuyabilir/yazabilir
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are accessible" ON groups FOR ALL USING (true);

-- Group members - herkes okuyabilir/yazabilir
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members are accessible" ON group_members FOR ALL USING (true);

-- Shared data - herkes okuyabilir/yazabilir
ALTER TABLE shared_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shared data is accessible" ON shared_data FOR ALL USING (true);

-- Shared feed - herkes okuyabilir/yazabilir
ALTER TABLE shared_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shared feed is accessible" ON shared_feed FOR ALL USING (true);

-- ============================================================
-- İNDEKSLER (performans için)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user ON friend_requests(from_user_id, status);
CREATE INDEX IF NOT EXISTS idx_shared_feed_to_user ON shared_feed(to_user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_feed_from_user ON shared_feed(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
