'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'
import { 
  Code, 
  Timer, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'

export default function Header() {
  const { isAuthenticated, profile, signOut, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Listen for custom auth modal events
    const handleOpenAuthModal = (event: CustomEvent) => {
      const mode = event.detail as 'signin' | 'signup'
      setAuthMode(mode)
      setShowAuthModal(true)
    }
    
    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener)
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener)
    }
  }, [])

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const navigation = [
    { name: 'Problems', href: '/problems', icon: Code, requiresAuth: false },
    { name: 'Sprint', href: '/sprint', icon: Timer, requiresAuth: true },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: false },
  ]

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StudySprint</span>
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                
                if (item.requiresAuth && !isAuthenticated && isClient) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleAuthClick('signin')}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {/* Auth buttons - simplified condition */}
              {!loading && !isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              ) : isAuthenticated && profile ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User size={16} />
                    <span>{profile.username || 'User'}</span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BarChart3 className="inline w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setUserMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                
                if (item.requiresAuth && !isAuthenticated) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        handleAuthClick('signin')
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {!loading && !isAuthenticated && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-3 space-x-3">
                    <button
                      onClick={() => {
                        handleAuthClick('signin')
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('signup')
                        setMobileMenuOpen(false)
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  )
} 