import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  authApi,
  contactsApi,
  messagesApi,
  templatesApi,
  confirmationsApi,
} from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
}

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
}

interface Message {
  id: string
  content: string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'SCHEDULED'
  scheduledAt?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  recurrenceType?: 'NONE' | 'MONTHLY'
  reminderDays?: number
  isReminder?: boolean
  contactIds?: string[]
  contact: {
    name: string
    phone: string
  }
}

interface Template {
  id: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

interface Confirmation {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'DENIED'
  contactName: string
  contactPhone: string
  eventDate: string
  messageContent?: string
  response?: string
  respondedAt?: string
  createdAt: string
}

interface WhatsAppStatus {
  connected: boolean
  configured: boolean
  profile?: {
    pushName?: string
    id?: string
  }
}

interface CronStatus {
  isRunning: boolean
}

interface DashboardData {
  user: User | null
  contacts: Contact[]
  messages: Message[]
  templates: Template[]
  confirmations: Confirmation[]
  whatsappStatus: WhatsAppStatus | null
  cronStatus: CronStatus | null
  loading: boolean
  error: string | null
  success: string | null
}

interface DashboardActions {
  refresh: () => Promise<void>
  loadData: () => Promise<void>
  checkWhatsappConnection: () => Promise<void>
  checkCronStatus: () => Promise<void>
  handleLogout: () => Promise<void>
  handleDelete: (id: string, type: 'contact' | 'message' | 'template' | 'confirmation') => Promise<void>
  handleDeleteAll: (type: 'contacts' | 'messages' | 'templates') => Promise<void>
  handleSendNow: (messageId: string) => Promise<void>
  handleImportCSV: (file: File) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

export function useDashboardData(): DashboardData & DashboardActions {
  const router = useRouter()
  
  const [user, setUser] = useState<User | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null)
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [contactsData, messagesData, templatesData, confirmationsData] =
        await Promise.all([
          contactsApi.getAll(),
          messagesApi.getAll(),
          templatesApi.getAll(),
          confirmationsApi.getAll(),
        ])
      setContacts(contactsData)
      setMessages(messagesData)
      setTemplates(templatesData)
      setConfirmations(confirmationsData)
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkWhatsappConnection = useCallback(async () => {
    try {
      const status = await messagesApi.checkWhatsAppStatus()
      setWhatsappStatus(status)
    } catch (err: any) {
      console.error('Erro ao verificar WhatsApp:', err)
      setWhatsappStatus({ connected: false, configured: false })
    }
  }, [])

  const checkCronStatus = useCallback(async () => {
    try {
      const status = await messagesApi.getCronStatus()
      setCronStatus(status)
    } catch (err: any) {
      console.error('Erro ao verificar status do cron:', err)
    }
  }, [])

  const showSuccess = useCallback((message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }, [])

  const showError = useCallback((message: string) => {
    setError(message)
    setTimeout(() => setError(null), 3000)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
    }
  }, [router])

  const handleDelete = useCallback(async (id: string, type: 'contact' | 'message' | 'template' | 'confirmation') => {
    try {
      if (type === 'contact') {
        await contactsApi.delete(id)
        showSuccess('Contato excluído com sucesso!')
      } else if (type === 'message') {
        await messagesApi.delete(id)
        showSuccess('Mensagem excluída com sucesso!')
      } else if (type === 'template') {
        await templatesApi.delete(id)
        showSuccess('Template excluído com sucesso!')
      } else if (type === 'confirmation') {
        await confirmationsApi.delete(id)
        showSuccess('Confirmação excluída com sucesso!')
      }
      loadData()
    } catch (err: any) {
      showError(err.message || `Erro ao excluir`)
    }
  }, [loadData, showSuccess, showError])

  const handleDeleteAll = useCallback(async (type: 'contacts' | 'messages' | 'templates') => {
    try {
      if (type === 'contacts') {
        await contactsApi.deleteAll()
        showSuccess('Todos os contatos foram excluídos com sucesso!')
      } else if (type === 'messages') {
        await messagesApi.deleteAll()
        showSuccess('Todas as mensagens foram excluídas com sucesso!')
      } else if (type === 'templates') {
        await templatesApi.deleteAll()
        showSuccess('Todos os templates foram excluídos com sucesso!')
      }
      loadData()
    } catch (err: any) {
      showError(err.message || `Erro ao excluir`)
    }
  }, [loadData, showSuccess, showError])

  const handleSendNow = useCallback(async (messageId: string) => {
    try {
      await messagesApi.sendNow(messageId)
      showSuccess('Mensagem enviada com sucesso!')
      loadData()
    } catch (err: any) {
      showError(err.message || 'Erro ao enviar mensagem')
    }
  }, [loadData, showSuccess, showError])

  const handleImportCSV = useCallback(async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string
        const result = await contactsApi.importCSV(csvContent)
        showSuccess(
          `Importação concluída: ${result.success} contatos importados, ${result.failed} falharam`,
        )
        loadData()
      } catch (err: any) {
        showError(err.message || 'Erro ao importar CSV')
      }
    }
    reader.readAsText(file)
  }, [loadData, showSuccess, showError])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    loadData()
    checkWhatsappConnection()
    checkCronStatus()

    const interval = setInterval(() => {
      confirmationsApi.getAll().then(setConfirmations).catch(console.error)
    }, 10000)

    return () => clearInterval(interval)
  }, [router, loadData, checkWhatsappConnection, checkCronStatus])

  return {
    user,
    contacts,
    messages,
    templates,
    confirmations,
    whatsappStatus,
    cronStatus,
    loading,
    error,
    success,
    refresh: loadData,
    loadData,
    checkWhatsappConnection,
    checkCronStatus,
    handleLogout,
    handleDelete,
    handleDeleteAll,
    handleSendNow,
    handleImportCSV,
    showSuccess,
    showError,
  }
}
