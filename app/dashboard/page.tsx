import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RealtimeFeed from '@/components/RealtimeFeed'
import CreatePost from '@/components/CreatePost'
import UserProfile from '@/components/UserProfile'
import RealtimeChat from '@/components/RealtimeChat'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left sidebar - User profile */}
          <div className="lg:col-span-1">
            <UserProfile user={data.user} />
          </div>

          {/* Main content - Feed */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost user={data.user} />
            <RealtimeFeed user={data.user} />
          </div>

          {/* Right sidebar - Chat */}
          <div className="lg:col-span-1">
            <RealtimeChat user={data.user} />
          </div>
        </div>
      </div>
    </div>
  )
} 