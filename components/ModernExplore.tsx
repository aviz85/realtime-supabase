'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface ModernExploreProps {
  user: User
}

export default function ModernExplore({ user }: ModernExploreProps) {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    todayPosts: 0,
    onlineUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [trendingPosts, setTrendingPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
    loadRecentUsers()
    loadTrendingPosts()
  }, [])

  const loadStats = async () => {
    try {
      // Get total posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })

      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get today's posts
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      setStats({
        totalPosts: postsCount || 0,
        totalUsers: usersCount || 0,
        todayPosts: todayCount || 0,
        onlineUsers: Math.floor(Math.random() * 10) + 1, // Simulated for demo
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error loading recent users:', error)
      } else {
        setRecentUsers(data || [])
      }
    } catch (error) {
      console.error('Error loading recent users:', error)
    }
  }

  const loadTrendingPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error loading trending posts:', error)
      } else {
        setTrendingPosts(data || [])
      }
    } catch (error) {
      console.error('Error loading trending posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading explore...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-3">
          <span>🔍</span>
          <span>Explore</span>
        </h1>
        <p className="text-gray-600">Discover what's happening in your community</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Posts</p>
              <p className="text-3xl font-bold">{stats.totalPosts}</p>
            </div>
            <div className="text-4xl opacity-80">📝</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Community</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today</p>
              <p className="text-3xl font-bold">{stats.todayPosts}</p>
            </div>
            <div className="text-4xl opacity-80">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Online</p>
              <p className="text-3xl font-bold">{stats.onlineUsers}</p>
            </div>
            <div className="text-4xl opacity-80">🟢</div>
          </div>
        </div>
      </div>

      {/* New Members */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <span>👋</span>
          <span>New Members</span>
        </h2>

        {recentUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-gray-600">No new members yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recentUsers.map((profile) => (
              <div key={profile.id} className="bg-white/50 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl font-bold">
                    {profile.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{profile.username}</h3>
                <p className="text-xs text-gray-500">
                  Joined {getTimeAgo(profile.created_at)}
                </p>
                {profile.bio && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{profile.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Posts */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <span>📈</span>
          <span>Recent Activity</span>
        </h2>

        {trendingPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-gray-600">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendingPosts.map((post, index) => (
              <div key={post.id} className="bg-white/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {post.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{post.username}</h3>
                      <span className="text-xs text-gray-500">{getTimeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span>#{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fun Facts */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 flex items-center justify-center space-x-2">
            <span>✨</span>
            <span>Community Insights</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">Most Active Day</h3>
              <p className="text-sm text-purple-100">Today seems to be buzzing with activity!</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">🌟</div>
              <h3 className="font-semibold mb-1">Growing Community</h3>
              <p className="text-sm text-purple-100">New members are joining every day!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}