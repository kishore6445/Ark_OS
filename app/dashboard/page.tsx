'use client'

import { useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { IndividualDashboard } from '@/components/individual-dashboard'
import { Vision2026 } from '@/components/vision-2026'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/lib/user-context'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('my-dashboard')
  const { currentUser, isLoading } = useUser()
  const role = (currentUser?.role ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  const isAdmin = role === 'super_admin' || role === 'superadmin' || role === 'company_admin' || role === 'companyadmin'
  const currentUserName = currentUser?.name ?? ''
  const currentUserId = currentUser?.id ?? ''

  if (isLoading) {
    return (
      <AppShell>
        <div className='flex items-center justify-center min-h-[420px]'>
          <p className='text-sm text-stone-500'>Loading dashboard...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full max-w-md grid-cols-2 mb-8'>
          <TabsTrigger value='vision-2026' className='font-bold'>
            2026 Vision
          </TabsTrigger>
          <TabsTrigger value='my-dashboard' className='font-bold'>
            My Dashboard_124
          </TabsTrigger>
        </TabsList>

        <TabsContent value='vision-2026'>
          <Vision2026 isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value='my-dashboard'>
          <IndividualDashboard
            isAdmin={isAdmin}
            currentUserName={currentUserName}
            currentUserId={currentUserId}
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}
