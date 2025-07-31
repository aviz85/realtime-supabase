'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface ChatMessage {
  id: string
  message: string
  username: string
  created_at: string
}

interface RealtimeChatProps {
  user?: User
}

export default function RealtimeChat({ user }: RealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const supabase = createClient()

  // Load existing messages
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) {
        console.error('Error loading messages:', error)
      } else {
        setMessages(data || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    // Load existing messages first
    loadMessages()

    // Set up realtime subscription for new messages
    const chatChannel = supabase.channel('chat-messages')

    chatChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('New message received:', payload)
          const newMessage = payload.new as ChatMessage
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to chat messages')
        }
      })

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [user, supabase])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setLoading(true)

    try {
      // Insert message into database (this will trigger realtime update)
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            message: newMessage.trim(),
            username: user.user_metadata?.username || user.email,
            user_id: user.id,
          },
        ])

      if (error) {
        console.error('Error sending message:', error)
      } else {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Global Chat</h3>
      
      {/* Messages */}
      <div className="h-64 overflow-y-auto mb-4 space-y-2">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {message.username}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 ml-4">{message.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
} 