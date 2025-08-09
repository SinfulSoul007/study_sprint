const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedProblems() {
  const problems = []
  const csvPath = path.join(process.cwd(), 'Leetcode_Questions.csv')
  
  console.log('Reading CSV file...')
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse CSV row and transform to our schema
        const problem = {
          question_no: parseInt(row.Question_No),
          title: row.Question ? row.Question.trim() : '',
          difficulty: row.Difficulty,
          acceptance_rate: row.Acceptance,
          is_premium: row.isPremium === 'TRUE',
          question_link: row.Question_Link,
          solution_link: row.Solution,
          description: generateProblemDescription(row.Question, row.Difficulty),
          // Add some basic starter code templates
          starter_code: getStarterCode(row.Question, row.Difficulty),
          // Generate some basic test cases (you'll want to enhance this)
          test_cases: generateBasicTestCases(row.Question),
          tags: extractTags(row.Question)
        }
        
        problems.push(problem)
      })
      .on('end', async () => {
        console.log(`Parsed ${problems.length} problems from CSV`)
        
        try {
          // Insert problems in batches to avoid API limits
          const batchSize = 100
          let inserted = 0
          
          for (let i = 0; i < problems.length; i += batchSize) {
            const batch = problems.slice(i, i + batchSize)
            
            console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(problems.length/batchSize)}...`)
            
            const { data, error } = await supabase
              .from('problems')
              .upsert(batch, { 
                onConflict: 'question_no',
                ignoreDuplicates: false 
              })
            
            if (error) {
              console.error('Error inserting batch:', error)
              // Continue with next batch instead of failing completely
            } else {
              inserted += batch.length
              console.log(`Successfully inserted ${batch.length} problems`)
            }
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
          console.log(`✅ Successfully seeded ${inserted} problems!`)
          resolve()
        } catch (error) {
          console.error('Error seeding problems:', error)
          reject(error)
        }
      })
      .on('error', reject)
  })
}

// Helper function to generate problem descriptions based on title
function generateProblemDescription(title, difficulty) {
  if (!title) return "Problem description not available."
  
  const titleLower = title.toLowerCase().trim()
  
  // Common LeetCode problem patterns
  const descriptions = {
    // Array problems
    'two sum': 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    
    'three sum': 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. Notice that the solution set must not contain duplicate triplets.',
    
    'container with most water': 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    
    'best time to buy and sell stock': 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction.',
    
    'maximum subarray': 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    
    // String problems
    'valid parentheses': 'Given a string `s` containing just the characters `\'(\', \')\', \'{\', \'}\', \'[\' and \']\'`, determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, open brackets must be closed in the correct order, and every close bracket has a corresponding open bracket of the same type.',
    
    'longest substring without repeating characters': 'Given a string `s`, find the length of the longest substring without repeating characters.',
    
    'longest palindromic substring': 'Given a string `s`, return the longest palindromic substring in `s`.',
    
    'valid anagram': 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
    
    // Linked List problems
    'reverse linked list': 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    
    'merge two sorted lists': 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.',
    
    'linked list cycle': 'Given `head`, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.',
    
    // Tree problems
    'binary tree inorder traversal': 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
    
    'maximum depth of binary tree': 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    
    'same tree': 'Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not. Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.',
    
    'symmetric tree': 'Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).',
    
    // Dynamic Programming
    'climbing stairs': 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    
    'house robber': 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.',
    
    'coin change': 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
    
    // Graph problems
    'number of islands': 'Given an `m x n` 2D binary grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    
    'course schedule': 'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`. Return `true` if you can finish all courses. Otherwise, return `false`.',
    
    // Search problems
    'search insert position': 'Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.',
    
    'binary search': 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.',
    
    // Math problems
    'palindrome number': 'Given an integer `x`, return `true` if `x` is palindrome integer. An integer is a palindrome when it reads the same backward as forward.',
    
    'roman to integer': 'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given a roman numeral, convert it to an integer.',
    
    'fibonacci number': 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Given `n`, calculate `F(n)`.',
    
    // Array manipulation
    'rotate array': 'Given an array, rotate the array to the right by `k` steps, where `k` is non-negative.',
    
    'remove duplicates from sorted array': 'Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.',
    
    'merge sorted array': 'You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively. Merge `nums1` and `nums2` into a single array sorted in non-decreasing order.'
  }
  
  // Check for exact matches first
  if (descriptions[titleLower]) {
    return descriptions[titleLower]
  }
  
  // Generate generic descriptions based on keywords
  if (titleLower.includes('sum') && titleLower.includes('two')) {
    return `Given an array of numbers, find two elements that sum to a target value. Return the result as specified in the problem requirements.`
  }
  
  if (titleLower.includes('palindrome')) {
    return `Determine if the given input is a palindrome (reads the same forwards and backwards). Implement an efficient solution that handles edge cases properly.`
  }
  
  if (titleLower.includes('binary tree') || titleLower.includes('tree')) {
    return `Given a binary tree, perform the required operation or analysis. Consider edge cases like empty trees, single nodes, and unbalanced trees.`
  }
  
  if (titleLower.includes('linked list') || titleLower.includes('list')) {
    return `Implement an algorithm to manipulate or analyze a linked list data structure. Handle edge cases like empty lists and single-node lists.`
  }
  
  if (titleLower.includes('array') || titleLower.includes('nums')) {
    return `Given an array of integers, implement an algorithm to solve the specified problem efficiently. Consider time and space complexity optimizations.`
  }
  
  if (titleLower.includes('string') || titleLower.includes('substring')) {
    return `Process the given string(s) according to the problem requirements. Implement an efficient solution that handles various string patterns and edge cases.`
  }
  
  if (titleLower.includes('search') || titleLower.includes('find')) {
    return `Implement a search algorithm to find the target element or pattern. Consider using appropriate search techniques like binary search for sorted data.`
  }
  
  if (titleLower.includes('sort') || titleLower.includes('sorted')) {
    return `Work with sorted data or implement a sorting algorithm. Optimize for the given constraints and consider stability requirements.`
  }
  
  if (titleLower.includes('dynamic') || titleLower.includes('dp')) {
    return `Solve this problem using dynamic programming techniques. Identify the subproblems and optimal substructure to build an efficient solution.`
  }
  
  if (titleLower.includes('graph') || titleLower.includes('node')) {
    return `Implement a graph algorithm to solve the given problem. Consider different graph representations and traversal techniques like DFS or BFS.`
  }
  
  // Default generic description
  const difficultyDescriptions = {
    'Easy': 'This is a fundamental problem that helps build core programming skills.',
    'Medium': 'This problem requires a good understanding of algorithms and data structures.',
    'Hard': 'This is an advanced problem that challenges your problem-solving abilities.'
  }
  
  return `${title}: ${difficultyDescriptions[difficulty] || 'Solve this problem efficiently.'} 

Implement your solution and consider edge cases. Think about time and space complexity optimizations.

**Note:** For the complete problem statement with examples and constraints, please refer to the original problem on LeetCode using the link provided.`
}

// Helper function to get starter code template
function getStarterCode(title, difficulty) {
  // Basic starter code templates based on common problem patterns
  const templates = {
    'Two Sum': `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your code here
    pass`,
    
    'Add Two Numbers': `# Definition for singly-linked list.
# class ListNode(object):
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def addTwoNumbers(l1, l2):
    """
    :type l1: ListNode
    :type l2: ListNode
    :rtype: ListNode
    """
    # Your code here
    pass`,
    
    default: `def solution():
    """
    Write your solution here
    """
    # Your code here
    pass`
  }
  
  return templates[title] || templates.default
}

function generateBasicTestCases(title) {
  // Generate basic test cases - you'll want to enhance this with actual test cases
  const basicTests = [
    {
      input: "Example input",
      output: "Expected output",
      explanation: "Basic test case"
    }
  ]
  
  return JSON.stringify(basicTests)
}

function extractTags(title) {
  // Extract tags based on problem title patterns
  const tags = []
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('array')) tags.push('Array')
  if (titleLower.includes('string')) tags.push('String')
  if (titleLower.includes('tree')) tags.push('Tree')
  if (titleLower.includes('linked')) tags.push('Linked List')
  if (titleLower.includes('binary')) tags.push('Binary Search')
  if (titleLower.includes('dynamic')) tags.push('Dynamic Programming')
  if (titleLower.includes('graph')) tags.push('Graph')
  if (titleLower.includes('sort')) tags.push('Sorting')
  if (titleLower.includes('hash')) tags.push('Hash Table')
  
  return tags.length > 0 ? tags : ['Algorithm']
}

// Run the seeding
if (require.main === module) {
  seedProblems()
    .then(() => {
      console.log('Seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedProblems } 