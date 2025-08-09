'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const timeoutId = setTimeout(() => {
      // Safety net to avoid indefinite loading in edge cases
      if (mounted) setLoading(false)
    }, 5000)
    
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await auth.getUserProfile(userId)
      if (userProfile) {
        setProfile(userProfile)
      } else {
        const currentUser = (await supabase.auth.getUser()).data.user
        const newProfile = await auth.upsertUserProfile({
          id: userId,
          email: currentUser?.email || '',
          username: currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || '',
          full_name: currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.username || ''
        })
        setProfile(newProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user
  }
} 