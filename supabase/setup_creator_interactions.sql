-- setup_creator_interactions.sql

-- ============================================================
-- 1. FOLLOWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Enable RLS for follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policies for follows
CREATE POLICY "Anyone can read follows" 
ON public.follows FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own follows" 
ON public.follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
ON public.follows FOR DELETE 
USING (auth.uid() = follower_id);


-- ============================================================
-- 2. CREATOR RATINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.creator_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(rater_id, creator_id)
);

-- Enable RLS for creator_ratings
ALTER TABLE public.creator_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for creator_ratings
CREATE POLICY "Anyone can read creator_ratings" 
ON public.creator_ratings FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own ratings" 
ON public.creator_ratings FOR INSERT 
WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can update their own ratings" 
ON public.creator_ratings FOR UPDATE 
USING (auth.uid() = rater_id);


-- Trigger to update updated_at on creator_ratings
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_creator_ratings_modtime ON public.creator_ratings;
CREATE TRIGGER update_creator_ratings_modtime
BEFORE UPDATE ON public.creator_ratings
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- ============================================================
-- 3. RPC FUNCTIONS FOR EASY FETCHING
-- ============================================================

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(cid UUID)
RETURNS BIGINT
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT count(*) FROM public.follows WHERE following_id = cid;
$$;

-- Function to get average rating and total ratings
CREATE OR REPLACE FUNCTION get_creator_rating_stats(cid UUID)
RETURNS TABLE (
    avg_rating NUMERIC,
    total_ratings BIGINT
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    ROUND(AVG(rating), 1) as avg_rating,
    COUNT(*) as total_ratings
  FROM public.creator_ratings 
  WHERE creator_id = cid;
$$;
