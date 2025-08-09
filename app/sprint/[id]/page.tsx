'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import CodeEditor from '@/components/sprint/CodeEditor'
import Timer from '@/components/sprint/Timer'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { Database } from '@/lib/database.types'
import toast from 'react-hot-toast'
import { 
  Play, 
  Pause, 
  Square, 
  ExternalLink, 
  Clock,
  CheckCircle,
  XCircle,
  Timer as TimerIcon
} from 'lucide-react'

type Problem = Database['public']['Tables']['problems']['Row']

export default function SprintPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sprintId, setSprintId] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProblem(parseInt(params.id as string))
    }
  }, [params.id])

  const fetchProblem = async (problemId: number) => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', problemId)
        .single()
      
      if (error) throw error
      
      setProblem(data)
      setCode(data.starter_code || getDefaultStarterCode())
    } catch (error) {
      console.error('Error fetching problem:', error)
      toast.error('Problem not found')
      router.push('/problems')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultStarterCode = () => {
    return `def solution():
    """
    Write your solution here
    """
    # Your code here
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`
  }

  const startSprint = async () => {
    if (!user || !problem) return

    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert({
          user_id: user.id,
          problem_id: problem.id,
          duration_minutes: 25
        })
        .select()
        .single()

      if (error) throw error

      setSprintId(data.id)
      setIsRunning(true)
      toast.success('Sprint started! Focus mode activated 🚀')
    } catch (error) {
      console.error('Error starting sprint:', error)
      toast.error('Failed to start sprint')
    }
  }

  const pauseSprint = () => {
    setIsRunning(false)
    toast('Sprint paused')
  }

  const stopSprint = async () => {
    if (!sprintId) return

    try {
      await supabase
        .from('sprints')
        .update({
          finished_at: new Date().toISOString(),
          completed: false
        })
        .eq('id', sprintId)

      setIsRunning(false)
      setTimeLeft(25 * 60)
      setSprintId(null)
      toast('Sprint stopped')
    } catch (error) {
      console.error('Error stopping sprint:', error)
    }
  }

  const submitSolution = async () => {
    if (!user || !problem || !code.trim()) {
      toast.error('Please write some code before submitting')
      return
    }

    try {
      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          problem_id: problem.id,
          code: code,
          language: 'python',
          status: 'accepted' // For now, we'll accept all submissions
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Update sprint if running
      if (sprintId) {
        await supabase
          .from('sprints')
          .update({
            finished_at: new Date().toISOString(),
            completed: true,
            submission_id: submission.id
          })
          .eq('id', sprintId)
      }

      setSubmitted(true)
      setIsRunning(false)
      toast.success('Solution submitted successfully! 🎉')
    } catch (error) {
      console.error('Error submitting solution:', error)
      toast.error('Failed to submit solution')
    }
  }

  const onTimeUp = async () => {
    setIsRunning(false)
    
    if (sprintId) {
      try {
        await supabase
          .from('sprints')
          .update({
            finished_at: new Date().toISOString(),
            completed: false
          })
          .eq('id', sprintId)
      } catch (error) {
        console.error('Error updating sprint:', error)
      }
    }

    toast("Time's up! Don't worry, you can keep working on the solution.", {
      duration: 5000,
      icon: '⏰'
    })
  }

  if (loading) {
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

  if (!problem) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Problem not found</h1>
            <button
              onClick={() => router.push('/problems')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Problems
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show sign-in prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TimerIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sign in to Start Sprint
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create an account or sign in to start your 25-minute focused coding sprint.
            </p>
          </div>

          {/* Problem Preview */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="border-b p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {problem.question_no}. {problem.title}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                    
                    {problem.acceptance_rate && (
                      <span className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">{problem.acceptance_rate}</span> accepted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-gray-700 leading-relaxed mb-6">
                {problem.description ? (
                  <div className="text-base">
                    {problem.description.length > 300 
                      ? `${problem.description.substring(0, 300)}...` 
                      : problem.description
                    }
                  </div>
                ) : (
                  <p>Problem description available after sign in.</p>
                )}
              </div>

              {/* Quick Info */}
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {problem.tags && problem.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🏷️ Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {problem.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{problem.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {problem.company_tags && problem.company_tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🏢 Companies</h4>
                    <div className="flex flex-wrap gap-1">
                      {problem.company_tags.slice(0, 3).map((company, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {company}
                        </span>
                      ))}
                      {problem.company_tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{problem.company_tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sign In Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => {
                  const event = new CustomEvent('openAuthModal', { detail: 'signin' })
                  window.dispatchEvent(event)
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex-1"
              >
                Sign In to Sprint
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('openAuthModal', { detail: 'signup' })
                  window.dispatchEvent(event)
                }}
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex-1"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Timer */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                #{problem.question_no}: {problem.title}
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {problem.difficulty}
              </span>
              
              {problem.acceptance_rate && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {problem.acceptance_rate} accepted
                </span>
              )}
              
              {problem.likes && problem.likes > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span>👍 {problem.likes.toLocaleString()}</span>
                  {problem.dislikes && problem.dislikes > 0 && (
                    <span>👎 {problem.dislikes.toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Timer 
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                isRunning={isRunning}
                onTimeUp={onTimeUp}
              />
              
              <div className="flex items-center space-x-2">
                {!isRunning && !sprintId ? (
                  <button
                    onClick={startSprint}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center"
                  >
                    <Play size={16} className="mr-2" />
                    Start Sprint
                  </button>
                ) : (
                  <>
                    {isRunning ? (
                      <button
                        onClick={pauseSprint}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors inline-flex items-center"
                      >
                        <Pause size={16} className="mr-2" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsRunning(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center"
                      >
                        <Play size={16} className="mr-2" />
                        Resume
                      </button>
                    )}
                    
                    <button
                      onClick={stopSprint}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center"
                    >
                      <Square size={16} className="mr-2" />
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Problem Header */}
            <div className="border-b p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {problem.question_no}. {problem.title}
                  </h2>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                    
                    {problem.acceptance_rate && (
                      <span className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">{problem.acceptance_rate}</span> accepted
                      </span>
                    )}
                    
                    {problem.likes && problem.likes > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          👍 <span className="ml-1 font-medium">{problem.likes.toLocaleString()}</span>
                        </span>
                        {problem.dislikes && problem.dislikes > 0 && (
                          <span className="flex items-center">
                            👎 <span className="ml-1 font-medium">{problem.dislikes.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {problem.question_link && (
                  <a
                    href={problem.question_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 inline-flex items-center px-3 py-1 rounded-md text-sm border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    View on LeetCode
                  </a>
                )}
              </div>
            </div>

            {/* Problem Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {problem.description && (
                    <div className="text-base leading-relaxed">
                      {problem.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Examples Section */}
              {problem.test_cases && problem.test_cases.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
                  <div className="space-y-4">
                    {problem.test_cases.slice(0, 3).map((testCase, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="font-semibold text-gray-800 mb-2">Example {index + 1}:</div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Input:</span>
                            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-gray-800">
                              {testCase.input}
                            </code>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Output:</span>
                            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-gray-800">
                              {testCase.expected_output}
                            </code>
                          </div>
                          {testCase.explanation && (
                            <div className="text-gray-600">
                              <span className="font-semibold">Explanation:</span> {testCase.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h3>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Follow the problem requirements carefully</li>
                    <li>• Consider edge cases in your solution</li>
                    <li>• Optimize for both time and space complexity</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Sections */}
            <div className="border-t bg-gray-50 p-6 space-y-6">
              {/* Topics */}
              {problem.tags && problem.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    🏷️ Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies */}
              {problem.company_tags && problem.company_tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    🏢 Companies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {problem.company_tags.slice(0, 12).map((company, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors cursor-pointer"
                      >
                        {company}
                      </span>
                    ))}
                    {problem.company_tags.length > 12 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        +{problem.company_tags.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    💡 Hints
                  </h4>
                  <div className="space-y-3">
                    {problem.hints.slice(0, 3).map((hint, index) => (
                      <details key={index} className="group">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                          <span className="mr-2">Hint {index + 1}</span>
                          <span className="text-xs text-gray-500 group-open:hidden">(Click to reveal)</span>
                        </summary>
                        <div className="mt-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200">
                          {hint}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  🎯 Follow-up
                </h4>
                <p className="text-sm text-gray-600">
                  Can you solve this problem with optimal time and space complexity? 
                  Consider different approaches and trade-offs.
                </p>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Code Editor</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Language:</span>
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">Python</span>
                  </div>
                  {submitted && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle size={16} className="mr-1" />
                      <span className="text-sm font-medium">Submitted</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <CodeEditor
              value={code}
              onChange={setCode}
              language="python"
            />
            
            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={submitSolution}
                disabled={submitted || !code.trim()}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {submitted ? (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Solution Submitted
                  </>
                ) : (
                  <>
                    <span className="mr-2">▶</span>
                    Run & Submit Solution
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 