-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problems table with enhanced LeetCode data
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  question_no INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  description TEXT,
  content_html TEXT, -- Store original HTML content for rich display
  acceptance_rate TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  question_link TEXT,
  solution_link TEXT,
  title_slug TEXT,
  tags TEXT[] DEFAULT '{}',
  hints TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  similar_questions JSONB DEFAULT '[]',
  starter_code TEXT,
  test_cases JSONB DEFAULT '[]',
  company_tags TEXT[] DEFAULT '{}',
  has_solution BOOLEAN DEFAULT FALSE,
  has_video_solution BOOLEAN DEFAULT FALSE,
  category_title TEXT DEFAULT 'Algorithms',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_tags ON problems USING GIN(tags);
CREATE INDEX idx_problems_company_tags ON problems USING GIN(company_tags);
CREATE INDEX idx_problems_title_slug ON problems(title_slug);
CREATE INDEX idx_problems_question_no ON problems(question_no);
CREATE INDEX idx_problems_is_premium ON problems(is_premium);
CREATE INDEX idx_problems_last_updated ON problems(last_updated);

-- Submissions table
CREATE TABLE public.submissions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    problem_id INTEGER REFERENCES public.problems(id) NOT NULL,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'python',
    status TEXT CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded')) DEFAULT 'pending',
    runtime_ms INTEGER,
    memory_kb INTEGER,
    test_results JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprints table
CREATE TABLE public.sprints (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    problem_id INTEGER REFERENCES public.problems(id) NOT NULL,
    duration_minutes INTEGER DEFAULT 25,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    submission_id INTEGER REFERENCES public.submissions(id)
);

-- User stats table
CREATE TABLE public.user_stats (
    user_id UUID REFERENCES public.users(id) PRIMARY KEY,
    total_submissions INTEGER DEFAULT 0,
    accepted_submissions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    total_runtime_minutes INTEGER DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view problems" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own sprints" ON public.sprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sprints" ON public.sprints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sprints" ON public.sprints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create user profile function
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username')
    );
    INSERT INTO public.user_stats (user_id) VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 