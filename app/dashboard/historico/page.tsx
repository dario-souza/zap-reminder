'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  History, 
  Search, 
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter
} from 'lucide-react'
import { useMessageHistory, useContacts, useMessages } from '@/hooks'
import type { Message, MessageStatus } from '@/types'
import { getChatId } from '@/types'

export default function HistoricoPage() {
  const { 
    sentMessages, 
    deliveredMessages, 
    readMessages, 
    failedMessages,
    totalSent,
    totalDelivered,
    totalRead,
    totalFailed,
    loading,
    refetch 
  } = useMessageHistory()
  
  const { messages } = useMessages()
  const { contacts } = useContacts()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getContact = (phone: string | undefined) => {
    if (!phone) return null
    const cleanPhone = phone.replace('@c.us', '').replace('@g.us', '')
    return contacts.find(c => c.phone === cleanPhone)
  }

  const filteredMessages = useMemo(() => {
    let filtered = messages

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(m => {
        const contact = getContact(m.phone)
        return (
          (m.content || m.body || '').toLowerCase().includes(term) ||
          contact?.name.toLowerCase().includes(term) ||
          contact?.phone.includes(term)
        )
      })
    }

    return filtered
  }, [messages, statusFilter, searchTerm, contacts])

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'read':
        return <Eye className="w-4 h-4 text-purple-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusLabel = (status: MessageStatus) => {
    switch (status) {
      case 'sent': return 'Enviada'
      case 'delivered': return 'Entregue'
      case 'read': return 'Lida'
      case 'failed': return 'Falhou'
      default: return 'Pendente'
    }
  }

  const getMessageType = (message: Message) => {
    if (message.recurrence_type && message.recurrence_type !== 'NONE') {
      return 'Recorrente'
    }
    if (message.scheduled_at) {
      return 'Agendada'
    }
    return 'Normal'
  }

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'delivered':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'read':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Histórico
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Histórico completo de todas as mensagens enviadas.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalSent}</p>
              <p className="text-sm text-slate-500">Enviadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalDelivered}</p>
              <p className="text-sm text-slate-500">Entregues</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalRead}</p>
              <p className="text-sm text-slate-500">Lidas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalFailed}</p>
              <p className="text-sm text-slate-500">Falhas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="sent">Enviada</option>
              <option value="delivered">Entregue</option>
              <option value="read">Lida</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Todas as Mensagens ({filteredMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhuma mensagem encontrada
              </h3>
              <p className="text-slate-500">
                As mensagens enviadas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => {
                const contact = getContact(msg.phone)
                return (
                  <div
                    key={msg.id}
                    className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {contact?.name || 'Desconhecido'}
                        </span>
                        <span className="text-sm text-slate-500">
                          ({contact?.phone || msg.phone || '-'})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(msg.status)}`}>
                          {getStatusIcon(msg.status)}
                          {getStatusLabel(msg.status)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {getMessageType(msg)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {msg.content || msg.body}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Send className="w-4 h-4" />
                          {formatDateTime(msg.sent_at)}
                        </div>
                        {msg.delivered_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {formatDateTime(msg.delivered_at)}
                          </div>
                        )}
                        {msg.read_at && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatDateTime(msg.read_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
