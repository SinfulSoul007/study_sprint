'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { 
  Timer, 
  Play, 
  Target,
  Zap,
  TrendingUp
} from 'lucide-react'

type Problem = Database['public']['Tables']['problems']['Row']

export default function SprintLandingPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [recentProblems, setRecentProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
      return
    }
    
    if (isAuthenticated) {
      fetchRecentProblems()
    }
  }, [isAuthenticated, authLoading])

  const fetchRecentProblems = async () => {
    try {
      // Get some random easy/medium problems for quick sprints
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .in('difficulty', ['Easy', 'Medium'])
        .order('question_no', { ascending: true })
        .limit(12)
      
      if (error) throw error
      
      setRecentProblems(data || [])
    } catch (error) {
      console.error('Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Timer className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ready for a Sprint?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose a problem and start a focused 25-minute coding session. 
            Build momentum and improve your problem-solving skills.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Focused Practice</h3>
            <p className="text-gray-600">25-minute sprints help you stay focused and productive</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Sessions</h3>
            <p className="text-gray-600">Short bursts are more effective than long marathon sessions</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your improvement and build coding streaks</p>
          </div>
        </div>

        {/* Quick Start Problems */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
            <Link 
              href="/problems"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse all problems →
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProblems.map((problem) => (
              <div key={problem.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">#{problem.question_no}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                    {problem.title}
                  </h3>
                  
                  {problem.acceptance_rate && (
                    <div className="text-sm text-gray-600 mb-4">
                      {problem.acceptance_rate} acceptance rate
                    </div>
                  )}
                  
                  <Link
                    href={`/sprint/${problem.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                  >
                    <Play size={16} className="mr-2" />
                    Start Sprint
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Can't decide? Let's pick one for you!
          </h2>
          <p className="text-blue-100 mb-6">
            Start with a random problem that matches your skill level
          </p>
          <button
            onClick={() => {
              if (recentProblems.length > 0) {
                const randomProblem = recentProblems[Math.floor(Math.random() * recentProblems.length)]
                router.push(`/sprint/${randomProblem.id}`)
              }
            }}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Random Sprint
          </button>
        </div>
      </div>
    </div>
  )
} 