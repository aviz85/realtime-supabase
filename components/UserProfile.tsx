'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import OnlinePresence from './OnlinePresence'

interface UserProfileProps {
  user: User
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-600">
            {user.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {user.user_metadata?.username || 'User'}
          </h2>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <OnlinePresence user={user} />
      </div>
    </div>
  )
}

 