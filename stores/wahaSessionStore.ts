import { create } from 'zustand'

export type WahaSessionStatus =
  | 'STOPPED'
  | 'STARTING'
  | 'SCAN_QR_CODE'
  | 'WORKING'
  | 'FAILED'

interface WAHASessionState {
  sessionName: string | null
  status: WahaSessionStatus
  qrCode: string | null
  isModalOpen: boolean

  setSessionName: (name: string | null) => void
  setStatus: (status: WahaSessionStatus) => void
  setQrCode: (qr: string | null) => void
  openModal: () => void
  closeModal: () => void
  reset: () => void
}

export const useWAHASessionStore = create<WAHASessionState>((set) => ({
  sessionName: null,
  status: 'STOPPED',
  qrCode: null,
  isModalOpen: false,

  setSessionName: (name) => set({ sessionName: name }),
  setStatus: (status) => set({ status }),
  setQrCode: (qrCode) => set({ qrCode }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, qrCode: null }),
  reset: () =>
    set({ sessionName: null, status: 'STOPPED', qrCode: null, isModalOpen: false }),
}))
