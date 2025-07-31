import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ModernDashboard from '@/components/ModernDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return <ModernDashboard user={data.user} />
} 