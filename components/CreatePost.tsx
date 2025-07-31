'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface CreatePostProps {
  user?: User
}

export default function CreatePost({ user }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            content: content.trim(),
            user_id: user.id,
            username: user.user_metadata?.username || user.email,
          },
        ])

      if (error) {
        console.error('Error creating post:', error)
      } else {
        setContent('')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {content.length}/500 characters
          </span>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
} 