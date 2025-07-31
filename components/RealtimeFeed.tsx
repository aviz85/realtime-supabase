'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Post {
  id: string
  content: string
  user_id: string
  username: string
  created_at: string
}

interface RealtimeFeedProps {
  user?: User
}

export default function RealtimeFeed({ user }: RealtimeFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial posts
    fetchPosts()

    // Set up realtime subscription
    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Realtime change:', payload)
          
          if (payload.eventType === 'INSERT') {
            setPosts((currentPosts) => [payload.new as Post, ...currentPosts])
          } else if (payload.eventType === 'DELETE') {
            setPosts((currentPosts) => 
              currentPosts.filter((post) => post.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            setPosts((currentPosts) =>
              currentPosts.map((post) =>
                post.id === payload.new.id ? (payload.new as Post) : post
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting post:', error)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Live Feed</h2>
      
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            onDelete={handleDeletePost}
          />
        ))
      )}
    </div>
  )
}

interface PostCardProps {
  post: Post
  currentUser?: User
  onDelete: (postId: string) => void
}

function PostCard({ post, currentUser, onDelete }: PostCardProps) {
  const isOwnPost = currentUser?.id === post.user_id

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">
              {post.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{post.username}</h3>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        
        {isOwnPost && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
      </div>
    </div>
  )
} 