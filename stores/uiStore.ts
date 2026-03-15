import { create } from 'zustand'

type UIStore = {
  isCreateMessageModalOpen: boolean
  openCreateMessageModal: () => void
  closeCreateMessageModal: () => void

  activeMessageFilter: 'all' | 'instant' | 'scheduled' | 'recurring'
  setMessageFilter: (filter: UIStore['activeMessageFilter']) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isCreateMessageModalOpen: false,
  openCreateMessageModal: () => set({ isCreateMessageModalOpen: true }),
  closeCreateMessageModal: () => set({ isCreateMessageModalOpen: false }),

  activeMessageFilter: 'all',
  setMessageFilter: (filter) => set({ activeMessageFilter: filter }),
}))
