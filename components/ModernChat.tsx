'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface ChatMessage {
  id: string
  message: string
  username: string
  user_id: string
  created_at: string
}

interface ModernChatProps {
  user: User
}

export default function ModernChat({ user }: ModernChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load existing messages
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100)

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
          const newMessage = payload.new as ChatMessage
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    // Set up presence for online users
    const presenceChannel = supabase.channel('chat-presence')
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState()
        const users = Object.values(presenceState).flat().map((presence) => {
          const p = presence as { username?: string }
          return p.username || ''
        }).filter(Boolean)
        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            username: user.user_metadata?.username || user.email,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(chatChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [user, supabase, loadMessages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)

    try {
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

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return 'now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  const isMyMessage = (message: ChatMessage) => message.user_id === user.id

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-t-3xl p-6 border-b border-white/20 dark:border-gray-700/30 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2 transition-colors">
              <span>💬</span>
              <span>Global Chat</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">
              {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} online
            </p>
          </div>
          
          {/* Online Users */}
          <div className="flex items-center space-x-2">
            {onlineUsers.slice(0, 5).map((username, index) => (
              <div
                key={username}
                className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-lg"
                style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 5 - index }}
                title={username}
              >
                {username.charAt(0).toUpperCase()}
              </div>
            ))}
            {onlineUsers.length > 5 && (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-lg -ml-2">
                +{onlineUsers.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl overflow-y-auto p-6 space-y-4 transition-colors">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400 transition-colors">Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Start the conversation!</h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">Be the first to send a message in the global chat.</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = isMyMessage(message)
            const showAvatar = index === 0 || messages[index - 1]?.user_id !== message.user_id
            
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${
                  showAvatar ? 'mt-6' : 'mt-1'
                }`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  isMe ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  {showAvatar && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isMe 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-r from-green-400 to-blue-500'
                    }`}>
                      <span className="text-white text-xs font-semibold">
                        {message.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div className={`${showAvatar ? '' : isMe ? 'mr-10' : 'ml-10'}`}>
                    {showAvatar && (
                      <div className={`flex items-center space-x-2 mb-1 ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          {isMe ? 'You' : message.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                          {getTimeAgo(message.created_at)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600 transition-colors'
                    } ${!showAvatar ? 'rounded-2xl' : ''}`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-b-3xl p-6 border-t border-white/20 dark:border-gray-700/30 transition-colors">
        <form onSubmit={sendMessage} className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-4 bg-gray-50/50 dark:bg-gray-700/50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 max-h-32"
              rows={1}
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                {newMessage.length}/500 • Press Enter to send
              </span>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}