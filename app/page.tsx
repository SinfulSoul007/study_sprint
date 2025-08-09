import Link from 'next/link'
import Header from '@/components/layout/Header'
import { 
  Timer, 
  Target, 
  TrendingUp, 
  Code2, 
  Clock, 
  Award,
  ArrowRight,
  Play 
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Timer,
      title: "Timed Sprints",
      description: "25-minute focused coding sessions with problems tailored to your level"
    },
    {
      icon: Target,
      title: "Curated Problems",
      description: "2000+ LeetCode problems organized by difficulty and topic"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your streak, success rate, and improvement over time"
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Unlock badges and compete with friends on leaderboards"
    }
  ]

  const stats = [
    { label: "Active Problems", value: "2,900+" },
    { label: "Success Rate", value: "73%" },
    { label: "Avg. Sprint Time", value: "18min" },
    { label: "Community Members", value: "10K+" }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              LeetCode meets
              <span className="text-yellow-400"> Pomodoro</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Master algorithms through bite-sized, timed coding sprints. 
              Track your progress and build unstoppable momentum.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/problems"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors inline-flex items-center justify-center"
              >
                <Play className="mr-2" size={20} />
                Start Coding Now
              </Link>
              <Link 
                href="/sprint"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors inline-flex items-center justify-center"
              >
                <Timer className="mr-2" size={20} />
                Try a Sprint
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-12" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why StudySprint Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Combine the proven Pomodoro Technique with structured coding practice 
              for maximum learning efficiency.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to coding mastery
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code2 className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Choose a Problem</h3>
              <p className="text-gray-600">
                Browse our curated collection of coding challenges filtered by difficulty and topic.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Start Your Sprint</h3>
              <p className="text-gray-600">
                Set a 25-minute timer and focus solely on solving the problem with our built-in editor.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Track Progress</h3>
              <p className="text-gray-600">
                Review your solution, see your improvement metrics, and build your streak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Level Up Your Coding Skills?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers who are improving their problem-solving skills 
            with focused, timed practice sessions.
          </p>
          <Link 
            href="/problems"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Your First Sprint
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">StudySprint</span>
              </div>
              <p className="text-gray-400 mb-4">
                The smart way to practice coding. Focused sprints, curated problems, 
                and progress tracking all in one place.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/problems" className="hover:text-white">Problems</Link></li>
                <li><Link href="/sprint" className="hover:text-white">Sprint Mode</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 StudySprint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
