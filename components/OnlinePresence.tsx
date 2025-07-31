'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface OnlineUser {
  id: string
  username: string
  online_at: string
}

interface OnlinePresenceProps {
  user?: User
}

export default function OnlinePresence({ user }: OnlinePresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const roomChannel = supabase.channel('online-users')

    // Listen for presence changes
    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = roomChannel.presenceState()
        const users = Object.values(presenceState).flat().map((presence: any) => ({
          id: presence.id,
          username: presence.username,
          online_at: presence.online_at,
        }))
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await roomChannel.track({
            id: user.id,
            username: user.user_metadata?.username || user.email,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      roomChannel.unsubscribe()
    }
  }, [user])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Online Users</h3>
      
      {onlineUsers.length === 0 ? (
        <p className="text-gray-500 text-sm">No users online</p>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map((onlineUser) => (
            <div key={onlineUser.id} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">{onlineUser.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 