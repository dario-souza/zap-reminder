export interface Contact {
  id: string
  user_id: string
  name: string
  phone: string
  email?: string
  created_at: string
  updated_at: string
}

export const getChatId = (phone: string): string => {
  return `${phone}@c.us`
}

export interface CreateContactDto {
  name: string
  phone: string
  email?: string
}

export interface UpdateContactDto {
  name?: string
  phone?: string
  email?: string
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled' | 'SCHEDULED' | 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED'
export type MessageType = 'instant' | 'scheduled' | 'recurring'

export interface Message {
  id: string
  user_id: string
  phone: string
  content: string
  body?: string
  chat_id?: string
  type?: MessageType
  status: MessageStatus
  contact_id?: string
  scheduled_at?: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
  job_id?: string
  wa_message_id?: string
  error?: string
  created_at: string
  updated_at: string
  recurrence_type?: string
  recurrence_cron?: string
  reminder_days?: number
  is_reminder?: boolean
  reminder_sent?: boolean
  next_send_at?: string
  parent_message_id?: string
}

export interface CreateMessageDto {
  chatId: string
  body: string
  contactId?: string
  templateId?: string
  scheduledAt?: string
  recurrenceType?: string
  recurrenceCron?: string
}

export interface BatchMessageDto {
  recipients: { chatId: string; body: string; contactId?: string }[]
  name?: string
}

export type TemplateCategory = 'general' | 'marketing' | 'event' | 'reminder'

export interface Template {
  id: string
  user_id: string
  name: string
  content: string
  category: TemplateCategory
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTemplateDto {
  name: string
  content: string
}

export interface UpdateTemplateDto {
  name?: string
  content?: string
}

export type SessionStatus = 'stopped' | 'starting' | 'scan_qr_code' | 'working' | 'failed'

export interface Session {
  id: string
  user_id: string
  session_name: string
  status: SessionStatus
  qr_code?: string
  phone_number?: string
  push_name?: string
  connected_at?: string
  created_at: string
  updated_at: string
}

export type ConfirmationStatus = 'pending' | 'confirmed' | 'denied'

export interface Confirmation {
  id: string
  user_id: string
  contact_name: string
  contact_phone: string
  event_date: string
  status: ConfirmationStatus
  message_content?: string
  response?: string
  replied_at?: string
  created_at: string
  updated_at: string
}

export interface CreateConfirmationDto {
  contactName: string
  contactPhone: string
  eventDate: string
  messageContent?: string
}

export interface MessageStats {
  total_sent: number
  total_delivered: number
  total_read: number
  total_failed: number
  total_scheduled: number
  total_cancelled: number
  total_batch_sent: number
  total_rsvp_sent: number
  total_rsvp_confirmed: number
  total_rsvp_cancelled: number
}

export interface WhatsAppStatus {
  session?: Session
  connected: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
