const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { syncProblemsFromJSON } = require('./sync-leetcode-problems')

async function updateLeetCodeData() {
  console.log('🔄 Starting LeetCode data update process...')
  
  return new Promise((resolve, reject) => {
    const leetcodeApiPath = path.join(__dirname, '../leetcode-api')
    
    // Check if leetcode-api directory exists
    if (!fs.existsSync(leetcodeApiPath)) {
      console.error('❌ leetcode-api directory not found!')
      return reject(new Error('leetcode-api directory not found'))
    }
    
    console.log('📡 Fetching latest LeetCode problems from API...')
    
    // Run the Python download script
    exec('python3 -m src.utils.download', {
      cwd: leetcodeApiPath,
      timeout: 600000 // 10 minutes timeout
    }, async (error, stdout, stderr) => {
      
      if (error) {
        console.error('❌ Error running LeetCode API update:', error)
        return reject(error)
      }
      
      if (stderr) {
        console.warn('⚠️ Warnings from LeetCode API update:', stderr)
      }
      
      console.log('📊 LeetCode API update output:')
      console.log(stdout)
      
      try {
        // Now sync the updated data to our database
        console.log('\n🔄 Syncing updated data to database...')
        await syncProblemsFromJSON()
        
        console.log('✅ Complete data update process finished successfully!')
        resolve()
        
      } catch (syncError) {
        console.error('❌ Error syncing to database:', syncError)
        reject(syncError)
      }
    })
  })
}

// Schedule function for daily updates
function scheduleDaily() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0) // Set to midnight
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime()
  
  console.log(`⏰ Scheduling next update for: ${tomorrow.toISOString()}`)
  console.log(`⏱️ Time until next update: ${Math.round(msUntilMidnight / 1000 / 60)} minutes`)
  
  setTimeout(() => {
    console.log('🌙 Midnight update starting...')
    updateLeetCodeData()
      .then(() => {
        console.log('🌅 Midnight update completed!')
        // Schedule the next one
        scheduleDaily()
      })
      .catch((error) => {
        console.error('💥 Midnight update failed:', error)
        // Still schedule the next one
        scheduleDaily()
      })
  }, msUntilMidnight)
}

// Run immediately if called directly
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--schedule')) {
    console.log('📅 Starting daily scheduler...')
    scheduleDaily()
    
    // Keep process alive
    setInterval(() => {
      console.log(`💓 Scheduler heartbeat: ${new Date().toISOString()}`)
    }, 60 * 60 * 1000) // Log every hour
    
  } else {
    // Run once
    updateLeetCodeData()
      .then(() => {
        console.log('✅ One-time update completed!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('💥 Update failed:', error)
        process.exit(1)
      })
  }
}

module.exports = { updateLeetCodeData, scheduleDaily } 