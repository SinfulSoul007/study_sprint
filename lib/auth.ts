import { supabase } from './supabase'
import { Database } from './database.types'

type User = Database['public']['Tables']['users']['Row']

export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username
        }
      }
    })
    
    if (error) throw error
    return data
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get user profile from our users table
  getUserProfile: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  },

  // Create or update user profile
  upsertUserProfile: async (user: Database['public']['Tables']['users']['Insert']) => {
    const { data, error } = await supabase
      .from('users')
      .upsert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
} 