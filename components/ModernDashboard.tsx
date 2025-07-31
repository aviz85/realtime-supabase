'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ModernFeed from './ModernFeed'
import ModernChat from './ModernChat'
import ModernProfile from './ModernProfile'
import ModernExplore from './ModernExplore'
import ThemeToggle from './ThemeToggle'

interface ModernDashboardProps {
  user: User
}

type View = 'feed' | 'chat' | 'profile' | 'explore'

export default function ModernDashboard({ user }: ModernDashboardProps) {
  const [activeView, setActiveView] = useState<View>('feed')
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const views = [
    { id: 'feed', name: 'Feed', icon: '🏠', description: 'Latest posts' },
    { id: 'explore', name: 'Explore', icon: '🔍', description: 'Discover content' },
    { id: 'chat', name: 'Chat', icon: '💬', description: 'Global chat' },
    { id: 'profile', name: 'Profile', icon: '👤', description: 'Your profile' },
  ] as const

  const renderView = () => {
    switch (activeView) {
      case 'feed':
        return <ModernFeed user={user} />
      case 'chat':
        return <ModernChat user={user} />
      case 'profile':
        return <ModernProfile user={user} onSignOut={handleSignOut} />
      case 'explore':
        return <ModernExplore user={user} />
      default:
        return <ModernFeed user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-300">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/30 shadow-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Social
              </h1>
            </div>

            {/* User Info & Theme Toggle */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">
                    {user.user_metadata?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-24 space-y-2">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as View)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    activeView === view.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md hover:scale-102'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{view.icon}</span>
                    <div>
                      <p className="font-semibold">{view.name}</p>
                      <p className={`text-xs transition-colors ${
                        activeView === view.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {view.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="transition-all duration-500 ease-in-out">
              {renderView()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}