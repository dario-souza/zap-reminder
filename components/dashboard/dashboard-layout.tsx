'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  user?: {
    name?: string | null
    email?: string | null
  }
  onLogout?: () => void
}

export function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
