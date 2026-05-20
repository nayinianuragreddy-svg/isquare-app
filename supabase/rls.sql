-- ================================================================
-- i² Platform — Supabase RLS Policies & Database Triggers
-- ================================================================
-- INSTRUCTIONS:
--   1. Open your Supabase project → SQL Editor
--   2. Paste this entire file and click "Run"
--   3. This fixes: can't vote, can't comment, agree_count not persisting
-- ================================================================

-- ─── VOTES ───────────────────────────────────────────────────────
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "votes_select"  ON votes;
DROP POLICY IF EXISTS "votes_insert"  ON votes;
DROP POLICY IF EXISTS "votes_delete"  ON votes;

CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Unique constraint prevents double-voting
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_post_user_unique;
ALTER TABLE votes ADD CONSTRAINT votes_post_user_unique UNIQUE (post_id, user_id);

-- ─── AGREE_COUNT TRIGGER ─────────────────────────────────────────
-- Auto-updates posts.agree_count when votes are inserted/deleted
CREATE OR REPLACE FUNCTION update_agree_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET agree_count = agree_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET agree_count = GREATEST(0, agree_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS votes_agree_count_trigger ON votes;
CREATE TRIGGER votes_agree_count_trigger
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_agree_count();

-- ─── COMMENTS ────────────────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_delete" ON comments;

CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = author_id);

-- ─── COMMENTS_COUNT TRIGGER ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS comments_count_trigger ON comments;
CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- ─── POSTS ───────────────────────────────────────────────────────
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select" ON posts;
DROP POLICY IF EXISTS "posts_insert" ON posts;
DROP POLICY IF EXISTS "posts_update" ON posts;
DROP POLICY IF EXISTS "posts_delete" ON posts;
DROP POLICY IF EXISTS "posts_update_trigger" ON posts;

-- Public posts visible to all; private posts only to author
CREATE POLICY "posts_select" ON posts FOR SELECT USING (
  type = 'public' OR auth.uid() = author_id
);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
-- Owner can update; triggers (SECURITY DEFINER) can also update agree/comments counts
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (true);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- ─── PROFILES ────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifs_select" ON notifications;
DROP POLICY IF EXISTS "notifs_insert" ON notifications;
DROP POLICY IF EXISTS "notifs_update" ON notifications;

CREATE POLICY "notifs_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
-- Allow inserts from triggers and server-side logic
CREATE POLICY "notifs_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifs_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── REPORTS ─────────────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert" ON reports;
DROP POLICY IF EXISTS "reports_select" ON reports;

CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- ─── MERGE REQUESTS ──────────────────────────────────────────────
ALTER TABLE merge_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "merge_select" ON merge_requests;
DROP POLICY IF EXISTS "merge_insert" ON merge_requests;
DROP POLICY IF EXISTS "merge_update" ON merge_requests;

CREATE POLICY "merge_select" ON merge_requests FOR SELECT USING (
  auth.uid() = requester_id OR
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = target_post_id AND posts.author_id = auth.uid()
  )
);
CREATE POLICY "merge_insert" ON merge_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "merge_update" ON merge_requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = target_post_id AND posts.author_id = auth.uid()
  ) OR auth.uid() = requester_id
);

-- ================================================================
-- STORAGE: Make the "post-images" bucket PUBLIC
-- Do this via: Supabase Dashboard → Storage → post-images → Edit → Public
-- ================================================================
