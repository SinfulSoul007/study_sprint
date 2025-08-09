# StudySprint Setup Instructions

A Next.js application that combines LeetCode-style coding problems with the Pomodoro Technique for focused learning.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Vercel account (for deployment)

## 1. Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and set:
   - **Project Name**: StudySprint
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project"

### Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://xyz.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

### Step 3: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
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

-- Problems table
CREATE TABLE public.problems (
    id SERIAL PRIMARY KEY,
    question_no INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
    acceptance_rate TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    question_link TEXT,
    solution_link TEXT,
    tags TEXT[],
    starter_code TEXT,
    test_cases JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Users can read their own profile and insert/update it
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Problems are publicly readable
CREATE POLICY "Anyone can view problems" ON public.problems
    FOR SELECT USING (true);

-- Users can manage their own submissions
CREATE POLICY "Users can view own submissions" ON public.submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON public.submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their own sprints
CREATE POLICY "Users can view own sprints" ON public.sprints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sprints" ON public.sprints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sprints" ON public.sprints
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own stats
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions to automatically create user profile and stats
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username')
    );
    
    INSERT INTO public.user_stats (user_id)
    VALUES (new.id);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 2. Local Development Setup

### Step 1: Clone and Setup Environment

```bash
# Install dependencies (already done if following the guide)
npm install

# Copy environment file
cp .env.local.example .env.local
```

### Step 2: Configure Environment Variables

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Next.js Configuration
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Seed the Database

```bash
# This will populate your problems table with LeetCode questions
npm run seed
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 3. Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial StudySprint setup"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure Environment Variables:
   - Add all the variables from your `.env.local` file
   - Update `NEXTAUTH_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)

### Step 3: Deploy

Click "Deploy" and wait for the build to complete!

## 4. Features Overview

### Current Features

- ✅ **Authentication**: Sign up/sign in with Supabase Auth
- ✅ **Problem Browser**: Browse 2900+ LeetCode problems with filtering
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Database Setup**: Complete schema with RLS policies

### Coming Soon

- 🚧 **Sprint Mode**: 25-minute timed coding sessions
- 🚧 **Code Editor**: Monaco editor integration
- 🚧 **Dashboard**: Progress tracking and statistics
- 🚧 **Submissions**: Code testing and validation

## 5. Project Structure

```
study_sprint/
├── app/                    # Next.js 13+ app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── problems/         # Problems page
├── components/           # React components
│   ├── auth/            # Authentication components
│   └── layout/          # Layout components
├── lib/                 # Utility libraries
│   ├── supabase.ts     # Supabase client
│   ├── auth.ts         # Auth helpers
│   └── database.types.ts # TypeScript types
├── scripts/            # Utility scripts
│   └── seed-problems.js # Database seeding
└── Leetcode_Questions.csv # Problems data
```

## 6. Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your Supabase URL and keys in `.env.local`
   - Ensure RLS policies are set up correctly

2. **Seeding Failed**
   - Make sure your service role key is correct
   - Check that all database tables exist

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors with `npm run lint`

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Read the [Supabase documentation](https://supabase.com/docs)
- Open an issue in the repository

## 7. Next Steps

1. Complete the sprint mode functionality
2. Add code editor with syntax highlighting
3. Implement solution testing
4. Add progress tracking dashboard
5. Create social features (leaderboards, friends)

You're all set! Start building your coding skills with StudySprint! 🚀 