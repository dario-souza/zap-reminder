import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

type AuthStore = {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },
    }),
    { name: 'auth' }
  )
)
