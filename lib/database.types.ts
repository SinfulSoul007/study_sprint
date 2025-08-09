export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      problems: {
        Row: {
          id: number
          question_no: number
          title: string
          difficulty: 'Easy' | 'Medium' | 'Hard'
          description: string | null
          content_html: string | null
          acceptance_rate: string | null
          is_premium: boolean | null
          question_link: string | null
          solution_link: string | null
          title_slug: string | null
          tags: string[] | null
          hints: string[] | null
          likes: number | null
          dislikes: number | null
          similar_questions: any[] | null
          starter_code: string | null
          test_cases: any[] | null
          company_tags: string[] | null
          has_solution: boolean | null
          has_video_solution: boolean | null
          category_title: string | null
          last_updated: string | null
          created_at: string
        }
        Insert: {
          id?: number
          question_no: number
          title: string
          difficulty: 'Easy' | 'Medium' | 'Hard'
          description?: string | null
          content_html?: string | null
          acceptance_rate?: string | null
          is_premium?: boolean | null
          question_link?: string | null
          solution_link?: string | null
          title_slug?: string | null
          tags?: string[] | null
          hints?: string[] | null
          likes?: number | null
          dislikes?: number | null
          similar_questions?: any[] | null
          starter_code?: string | null
          test_cases?: any[] | null
          company_tags?: string[] | null
          has_solution?: boolean | null
          has_video_solution?: boolean | null
          category_title?: string | null
          last_updated?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          question_no?: number
          title?: string
          difficulty?: 'Easy' | 'Medium' | 'Hard'
          description?: string | null
          content_html?: string | null
          acceptance_rate?: string | null
          is_premium?: boolean | null
          question_link?: string | null
          solution_link?: string | null
          title_slug?: string | null
          tags?: string[] | null
          hints?: string[] | null
          likes?: number | null
          dislikes?: number | null
          similar_questions?: any[] | null
          starter_code?: string | null
          test_cases?: any[] | null
          company_tags?: string[] | null
          has_solution?: boolean | null
          has_video_solution?: boolean | null
          category_title?: string | null
          last_updated?: string | null
          created_at?: string
        }
      }
      submissions: {
        Row: {
          id: number
          user_id: string
          problem_id: number
          code: string
          language: string
          status: 'pending' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded'
          runtime_ms: number | null
          memory_kb: number | null
          test_results: Json | null
          submitted_at: string
        }
        Insert: {
          id?: number
          user_id: string
          problem_id: number
          code: string
          language?: string
          status?: 'pending' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded'
          runtime_ms?: number | null
          memory_kb?: number | null
          test_results?: Json | null
          submitted_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          problem_id?: number
          code?: string
          language?: string
          status?: 'pending' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded'
          runtime_ms?: number | null
          memory_kb?: number | null
          test_results?: Json | null
          submitted_at?: string
        }
      }
      sprints: {
        Row: {
          id: number
          user_id: string
          problem_id: number
          duration_minutes: number
          started_at: string
          finished_at: string | null
          completed: boolean
          submission_id: number | null
        }
        Insert: {
          id?: number
          user_id: string
          problem_id: number
          duration_minutes?: number
          started_at?: string
          finished_at?: string | null
          completed?: boolean
          submission_id?: number | null
        }
        Update: {
          id?: number
          user_id?: string
          problem_id?: number
          duration_minutes?: number
          started_at?: string
          finished_at?: string | null
          completed?: boolean
          submission_id?: number | null
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_submissions: number
          accepted_submissions: number
          current_streak: number
          max_streak: number
          easy_solved: number
          medium_solved: number
          hard_solved: number
          total_runtime_minutes: number
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_submissions?: number
          accepted_submissions?: number
          current_streak?: number
          max_streak?: number
          easy_solved?: number
          medium_solved?: number
          hard_solved?: number
          total_runtime_minutes?: number
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_submissions?: number
          accepted_submissions?: number
          current_streak?: number
          max_streak?: number
          easy_solved?: number
          medium_solved?: number
          hard_solved?: number
          total_runtime_minutes?: number
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 