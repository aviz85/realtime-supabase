'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string
  avatar_url?: string
  bio?: string
  website?: string
  created_at: string
}

interface ModernProfileProps {
  user: User
  onSignOut: () => void
}

export default function ModernProfile({ user, onSignOut }: ModernProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<{ id: string; content: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: '',
    bio: '',
    website: '',
  })
  const supabase = createClient()

  const loadProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      } else if (data) {
        setProfile(data)
        setEditData({
          username: data.username || '',
          bio: data.bio || '',
          website: data.website || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, user.id])

  const loadUserPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading posts:', error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }, [supabase, user.id])

  useEffect(() => {
    loadProfile()
    loadUserPosts()
  }, [user, loadProfile, loadUserPosts])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: editData.username,
          bio: editData.bio,
          website: editData.website,
        })

      if (error) {
        console.error('Error updating profile:', error)
      } else {
        setProfile({
          id: user.id,
          username: editData.username,
          bio: editData.bio,
          website: editData.website,
          created_at: profile?.created_at || new Date().toISOString(),
        })
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getJoinedDate = () => {
    const date = new Date(profile?.created_at || user.created_at)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-10"></div>
          
          <div className="relative flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-3xl font-bold">
                {(profile?.username || user.email)?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {editing ? (
                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      minLength={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      maxLength={200}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={editData.website}
                      onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                      className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profile?.username || 'User'}
                      </h1>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-white/50 text-gray-700 rounded-xl font-medium hover:bg-white/80 transition-all duration-300 border border-gray-200"
                    >
                      Edit Profile
                    </button>
                  </div>

                  {profile?.bio && (
                    <p className="text-gray-700 mb-4 leading-relaxed">{profile.bio}</p>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Joined {getJoinedDate()}</span>
                    </div>
                    
                    {profile?.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 text-center shadow-xl border border-white/20">
          <div className="text-3xl font-bold text-purple-600 mb-2">{posts.length}</div>
          <div className="text-sm text-gray-600">Posts</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 text-center shadow-xl border border-white/20">
          <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 text-center shadow-xl border border-white/20">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
      </div>

      {/* User Posts */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <span>📝</span>
          <span>Your Posts</span>
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Share your first post to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white/50 rounded-2xl p-4 border border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{post.content}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
        <button
          onClick={onSignOut}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}