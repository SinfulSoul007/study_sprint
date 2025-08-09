const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function syncProblemsFromJSON() {
  console.log('🚀 Starting LeetCode problems sync...')
  
  try {
    // Read the leetcode-api JSON file
    const jsonPath = path.join(__dirname, '../leetcode-api/data/leetcode_questions.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ leetcode_questions.json not found at:', jsonPath)
      process.exit(1)
    }
    
    console.log('📖 Reading LeetCode problems JSON...')
    const rawData = fs.readFileSync(jsonPath, 'utf8')
    const problemsData = JSON.parse(rawData)
    
    console.log(`📊 Found ${problemsData.length} problems in JSON`)
    
    // Transform the data to match our schema
    const transformedProblems = problemsData.map(item => {
      const question = item.data.question
      if (!question) return null
      
      // Extract tags from topicTags
      const tags = question.topicTags ? question.topicTags.map(tag => tag.name) : []
      
      // Clean HTML content for description
      const description = question.content ? 
        stripHtmlAndFormat(question.content) : 
        'Problem description not available.'
      
      // Parse stats if available
      let stats = {}
      try {
        if (question.stats) {
          stats = JSON.parse(question.stats)
        }
      } catch (e) {
        console.warn(`Failed to parse stats for problem ${question.questionFrontendId}`)
      }
      
      return {
        question_no: parseInt(question.questionFrontendId),
        title: question.title,
        difficulty: question.difficulty,
        description: description,
        content_html: question.content, // Keep original HTML for rich display
        acceptance_rate: stats.acRate || null,
        is_premium: question.isPaidOnly || false,
        question_link: question.url || `https://leetcode.com/problems/${question.titleSlug}/`,
        title_slug: question.titleSlug || null,
        tags: tags,
        hints: question.hints || [],
        likes: question.likes || 0,
        dislikes: question.dislikes || 0,
        similar_questions: question.similarQuestions ? JSON.parse(question.similarQuestions) : [],
        starter_code: generateStarterCode(question.title, question.difficulty, tags),
        test_cases: generateTestCases(question.title, question.content),
        company_tags: question.companyTags ? question.companyTags.map(tag => tag.name) : [],
        has_solution: question.hasSolution || false,
        has_video_solution: question.hasVideoSolution || false,
        category_title: question.categoryTitle || 'Algorithms',
        last_updated: new Date().toISOString()
      }
    }).filter(Boolean) // Remove null entries
    
    console.log(`✅ Transformed ${transformedProblems.length} problems`)
    
    // Insert/update problems in batches
    const batchSize = 50
    let processed = 0
    let inserted = 0
    let updated = 0
    
    for (let i = 0; i < transformedProblems.length; i += batchSize) {
      const batch = transformedProblems.slice(i, i + batchSize)
      
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(transformedProblems.length/batchSize)}...`)
      
      try {
        const { data, error } = await supabase
          .from('problems')
          .upsert(batch, { 
            onConflict: 'question_no',
            ignoreDuplicates: false 
          })
          .select('question_no')
        
        if (error) {
          console.error('❌ Error upserting batch:', error)
          continue
        }
        
        processed += batch.length
        console.log(`✅ Successfully processed ${batch.length} problems (Total: ${processed}/${transformedProblems.length})`)
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error('❌ Batch processing error:', error)
      }
    }
    
    // Get final stats
    const { count, error: countError } = await supabase
      .from('problems')
      .select('*', { count: 'exact', head: true })
    
    if (!countError) {
      console.log(`🎉 Sync complete! Total problems in database: ${count}`)
    }
    
    console.log(`📈 Processed: ${processed} problems`)
    
  } catch (error) {
    console.error('💥 Fatal error during sync:', error)
    process.exit(1)
  }
}

function stripHtmlAndFormat(html) {
  if (!html) return 'Problem description not available.'
  
  // Basic HTML stripping and formatting
  let text = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  // Limit length for database storage
  if (text.length > 2000) {
    text = text.substring(0, 1997) + '...'
  }
  
  return text
}

function generateStarterCode(title, difficulty, tags) {
  // Generate appropriate starter code based on problem characteristics
  if (tags.includes('Linked List')) {
    return `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def ${toCamelCase(title)}(self, head):
        """
        ${title}
        
        Args:
            head: ListNode - The head of the linked list
            
        Returns:
            ListNode - Modified linked list
        """
        # Your solution here
        pass`
  }
  
  if (tags.includes('Binary Tree') || tags.includes('Tree')) {
    return `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def ${toCamelCase(title)}(self, root):
        """
        ${title}
        
        Args:
            root: TreeNode - The root of the binary tree
            
        Returns:
            # Modify return type as needed
        """
        # Your solution here
        pass`
  }
  
  if (tags.includes('Array') || title.toLowerCase().includes('array')) {
    return `class Solution:
    def ${toCamelCase(title)}(self, nums):
        """
        ${title}
        
        Args:
            nums: List[int] - The input array
            
        Returns:
            # Modify return type as needed
        """
        # Your solution here
        pass`
  }
  
  // Default template
  return `class Solution:
    def ${toCamelCase(title)}(self, ${getDefaultParams(title)}):
        """
        ${title}
        
        Difficulty: ${difficulty}
        
        Args:
            # Modify parameters as needed
            
        Returns:
            # Modify return type as needed
        """
        # Your solution here
        pass`
}

function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase())
}

function getDefaultParams(title) {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('two sum') || titleLower.includes('target')) {
    return 'nums, target'
  }
  if (titleLower.includes('string') || titleLower.includes('substring')) {
    return 's'
  }
  if (titleLower.includes('array') || titleLower.includes('nums')) {
    return 'nums'
  }
  if (titleLower.includes('tree') || titleLower.includes('node')) {
    return 'root'
  }
  if (titleLower.includes('list')) {
    return 'head'
  }
  
  return 'input_param'
}

function generateTestCases(title, content) {
  // Extract examples from HTML content if possible
  const testCases = []
  
  if (content) {
    // Try to extract examples from HTML
    const exampleRegex = /<strong[^>]*>Input:<\/strong>\s*([^<]+)[\s\S]*?<strong[^>]*>Output:<\/strong>\s*([^<]+)/gi
    let match
    
    while ((match = exampleRegex.exec(content)) !== null && testCases.length < 3) {
      testCases.push({
        input: match[1].trim(),
        expected_output: match[2].trim(),
        explanation: `Test case extracted from problem examples`
      })
    }
  }
  
  // Add default test case if none found
  if (testCases.length === 0) {
    testCases.push({
      input: "# Add your test input here",
      expected_output: "# Add expected output here", 
      explanation: "Basic test case - modify as needed"
    })
  }
  
  return testCases
}

// Run the sync
if (require.main === module) {
  syncProblemsFromJSON()
    .then(() => {
      console.log('✅ LeetCode problems sync completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Sync failed:', error)
      process.exit(1)
    })
}

module.exports = { syncProblemsFromJSON } 