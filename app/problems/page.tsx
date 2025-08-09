'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { 
  Search, 
  Filter, 
  Play, 
  ExternalLink,
  Clock,
  TrendingUp
} from 'lucide-react'

type Problem = Database['public']['Tables']['problems']['Row']

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [tagFilter, setTagFilter] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isClient, setIsClient] = useState(false)
  
  const ITEMS_PER_PAGE = 50

  const difficulties = ['All', 'Easy', 'Medium', 'Hard']
  const commonTags = ['All', 'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Tree', 'Graph', 'Sorting', 'Binary Search']

  useEffect(() => {
    setIsClient(true)
    fetchProblems()
  }, [])

  useEffect(() => {
    if (isClient) {
      filterProblems()
    }
  }, [searchTerm, difficultyFilter, tagFilter, problems, isClient])

  const fetchProblems = async () => {
    try {
      console.log('🔄 Fetching problems from database...')
      
      // First, get the total count
      const { count: totalCount } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true })
      
      console.log(`📊 Total problems in database: ${totalCount}`)
      
      if (!totalCount) {
        console.log('❌ No problems found in database')
        setProblems([])
        return
      }
      
      // If we have more than 1000 problems, fetch in batches
      if (totalCount > 1000) {
        console.log('📦 Fetching problems in batches...')
        
        const allProblems: any[] = []
        const batchSize = 1000
        const totalBatches = Math.ceil(totalCount / batchSize)
        
        for (let i = 0; i < totalBatches; i++) {
          const start = i * batchSize
          const end = start + batchSize - 1
          
          console.log(`🔄 Fetching batch ${i + 1}/${totalBatches} (${start} to ${end})`)
          
          const { data: batchData, error } = await supabase
            .from('problems')
            .select('*')
            .order('question_no', { ascending: true })
            .range(start, end)
          
          if (error) {
            console.error(`❌ Error fetching batch ${i + 1}:`, error)
            throw error
          }
          
          if (batchData) {
            allProblems.push(...batchData)
            console.log(`✅ Batch ${i + 1} loaded: ${batchData.length} problems`)
          }
        }
        
        console.log(`🎉 Successfully loaded all ${allProblems.length} problems!`)
        setProblems(allProblems)
        
      } else {
        // If less than 1000, fetch normally
        const { data, error } = await supabase
          .from('problems')
          .select('*')
          .order('question_no', { ascending: true })
        
        if (error) throw error
        
        console.log(`✅ Loaded ${data?.length || 0} problems from database`)
        setProblems(data || [])
      }
      
    } catch (error) {
      console.error('❌ Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProblems = useCallback(() => {
    if (!isClient) return
    
    console.log('🔍 Filtering problems:', { searchTerm, difficultyFilter, tagFilter, totalProblems: problems.length })
    
    let filtered = problems.filter(problem => {
      const matchesSearch = searchTerm === '' || problem.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter
      const matchesTag = tagFilter === 'All' || (problem.tags && problem.tags.includes(tagFilter))
      
      return matchesSearch && matchesDifficulty && matchesTag
    })
    
    console.log(`✅ Filtered to ${filtered.length} problems`)
    setFilteredProblems(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [problems, searchTerm, difficultyFilter, tagFilter, isClient])

  // Get paginated problems
  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredProblems.slice(startIndex, endIndex)
  }, [filteredProblems, currentPage])

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const toggleTag = (tag: string) => {
    setTagFilter(prev => 
      prev === tag ? 'All' : tag
    )
  }

  if (!isClient || loading) {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coding Problems
          </h1>
          <p className="text-gray-600">
            Choose from {problems.length}+ curated problems to practice your skills
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => setDifficultyFilter(difficulty)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    difficultyFilter === difficulty
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty === 'All' ? 'All' : difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    tagFilter === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          <div className="grid gap-3">
            {paginatedProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-gray-500 text-sm font-medium">
                        #{problem.question_no}
                      </span>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                        {problem.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {problem.difficulty}
                      </span>
                      {problem.acceptance_rate && (
                        <span className="text-xs text-gray-500">
                          {problem.acceptance_rate} accepted
                        </span>
                      )}
                    </div>
                    
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {problem.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Link
                    href={`/sprint/${problem.id}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Start Sprint
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProblems.length)} of {filteredProblems.length} problems
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 