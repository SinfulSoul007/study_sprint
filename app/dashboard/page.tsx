'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { 
  Target, 
  Clock, 
  Award, 
  TrendingUp,
  Calendar,
  Code,
  CheckCircle,
  XCircle,
  Timer,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type UserStats = Database['public']['Tables']['user_stats']['Row']
type Submission = Database['public']['Tables']['submissions']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']

interface RecentActivity {
  submissions: (Submission & { problems: { title: string; difficulty: string } })[]
  sprints: (Sprint & { problems: { title: string; difficulty: string } })[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    submissions: [],
    sprints: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dashboard is now public - load data if user is authenticated
    if (user) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [user, isAuthenticated, authLoading])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError
      }

      setStats(statsData)

      // Fetch recent submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          problems:problem_id (
            title,
            difficulty
          )
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(10)

      if (submissionsError) throw submissionsError

      // Fetch recent sprints
      const { data: sprintsData, error: sprintsError } = await supabase
        .from('sprints')
        .select(`
          *,
          problems:problem_id (
            title,
            difficulty
          )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10)

      if (sprintsError) throw sprintsError

      setRecentActivity({
        submissions: submissionsData as any || [],
        sprints: sprintsData as any || []
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressData = () => {
    if (!stats) return []
    
    return [
      { name: 'Easy', solved: stats.easy_solved, total: 1000 },
      { name: 'Medium', solved: stats.medium_solved, total: 1000 },
      { name: 'Hard', solved: stats.hard_solved, total: 500 }
    ]
  }

  const getSuccessRate = () => {
    if (!stats || stats.total_submissions === 0) return 0
    return Math.round((stats.accepted_submissions / stats.total_submissions) * 100)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show welcome message for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sign in to track your coding progress, monitor your sprint performance, and see your improvement over time.
            </p>
            <button
              onClick={() => {
                // This will trigger the auth modal from the header
                const event = new CustomEvent('openAuthModal', { detail: 'signin' })
                window.dispatchEvent(event)
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In to View Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Track your coding progress and sprint performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.current_streak || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Max Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.max_streak || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getSuccessRate()}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(stats?.total_runtime_minutes || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Problems Solved Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Problems Solved by Difficulty</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getProgressData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="solved" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Submissions</span>
                <span className="font-semibold">{stats?.total_submissions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accepted Solutions</span>
                <span className="font-semibold text-green-600">{stats?.accepted_submissions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Easy Problems</span>
                <span className="font-semibold text-green-500">{stats?.easy_solved || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Medium Problems</span>
                <span className="font-semibold text-yellow-500">{stats?.medium_solved || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hard Problems</span>
                <span className="font-semibold text-red-500">{stats?.hard_solved || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              {recentActivity.submissions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No submissions yet</p>
              ) : (
                recentActivity.submissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {submission.status === 'accepted' ? (
                        <CheckCircle className="text-green-600" size={16} />
                      ) : (
                        <XCircle className="text-red-600" size={16} />
                      )}
                      <div>
                        <p className="font-medium text-sm">{submission.problems?.title}</p>
                        <p className="text-xs text-gray-500">{submission.problems?.difficulty}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      submission.status === 'accepted' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Sprints */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sprints</h3>
            <div className="space-y-3">
              {recentActivity.sprints.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sprints yet</p>
              ) : (
                recentActivity.sprints.slice(0, 5).map((sprint) => (
                  <div key={sprint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Timer className="text-blue-600" size={16} />
                      <div>
                        <p className="font-medium text-sm">{sprint.problems?.title}</p>
                        <p className="text-xs text-gray-500">{sprint.problems?.difficulty}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sprint.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sprint.completed ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 