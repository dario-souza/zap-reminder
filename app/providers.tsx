'use client'

import { QueryProvider, AuthProvider } from '@/components/providers'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </AuthProvider>
  )
}
