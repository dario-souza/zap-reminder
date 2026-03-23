export interface WhatsAppStatus {
  connected: boolean
  status: 'stopped' | 'starting' | 'scan_qr_code' | 'working' | 'failed'
  phone?: string
  pushName?: string
  sessionName?: string
}

export interface QRCodeResponse {
  qr?: string
  status?: string
  connected?: boolean
  error?: string
}
