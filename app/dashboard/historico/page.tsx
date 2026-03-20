'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  History,
  Search,
  Send,
  Calendar,
  Repeat,
  Users,
  Clock,
} from 'lucide-react'
import { useMessages, useContacts, useConfirmations } from '@/hooks'
import type { Message, Contact, Confirmation } from '@/types'
import { getChatId } from '@/types'

type MessageType = 'normal' | 'scheduled' | 'recurring' | 'confirmation'
type FilterType = 'all' | MessageType

interface HistoryItem {
  id: string
  type: MessageType
  contactName: string
  contactPhone: string
  content: string
  date: string
  status?: string
}

export default function HistoricoPage() {
  const { messages, refetch } = useMessages()
  const { contacts } = useContacts()
  const { confirmations } = useConfirmations()

  useEffect(() => {
    refetch()
  }, [refetch])

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')

  const getContact = (phone: string | undefined) => {
    if (!phone) return { name: 'Desconhecido', phone: '-' }
    const cleanPhone = phone.replace('@c.us', '').replace('@g.us', '')
    const contact = contacts.find((c: Contact) => c.phone === cleanPhone)
    return contact || { name: 'Desconhecido', phone: cleanPhone }
  }

  const historyItems: HistoryItem[] = useMemo(() => {
    const items: HistoryItem[] = []

    messages.forEach((msg: Message) => {
      if (msg.status !== 'sent') return
      
      const contact = getContact(msg.phone)

      let type: MessageType = 'normal'
      if (msg.recurrence_type && msg.recurrence_type !== 'NONE') {
        type = 'recurring'
      } else if (msg.scheduled_at) {
        type = 'scheduled'
      }

      items.push({
        id: msg.id,
        type,
        contactName: contact.name,
        contactPhone: contact.phone,
        content: msg.content || msg.body || '',
        date: msg.created_at,
        status: msg.status,
      })
    })

    confirmations.forEach((conf: Confirmation) => {
      items.push({
        id: conf.id,
        type: 'confirmation',
        contactName: conf.contact_name,
        contactPhone: conf.contact_phone,
        content: conf.message_content || '',
        date: conf.created_at,
        status: conf.status,
      })
    })

    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [messages, contacts, confirmations])

  const filteredItems = useMemo(() => {
    let items = historyItems

    if (typeFilter !== 'all') {
      items = items.filter((item) => item.type === typeFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(
        (item) =>
          item.content.toLowerCase().includes(term) ||
          item.contactName.toLowerCase().includes(term) ||
          item.contactPhone.includes(term),
      )
    }

    return items
  }, [historyItems, searchTerm, typeFilter])

  const stats = useMemo(() => {
    const normal = messages.filter(
      (m: Message) =>
        !m.scheduled_at && (!m.recurrence_type || m.recurrence_type === 'NONE'),
    ).length

    const scheduled = messages.filter((m: Message) => m.scheduled_at).length

    const recurring = messages.filter(
      (m: Message) => m.recurrence_type && m.recurrence_type !== 'NONE',
    ).length

    const confirmation = confirmations.length

    return { normal, scheduled, recurring, confirmation }
  }, [messages, confirmations])

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

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'normal':
        return <Send className="w-4 h-4" />
      case 'scheduled':
        return <Calendar className="w-4 h-4" />
      case 'recurring':
        return <Repeat className="w-4 h-4" />
      case 'confirmation':
        return <Users className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: MessageType) => {
    switch (type) {
      case 'normal':
        return 'Normal'
      case 'scheduled':
        return 'Agendada'
      case 'recurring':
        return 'Recorrente'
      case 'confirmation':
        return 'Confirmação'
    }
  }

  const getTypeColor = (type: MessageType) => {
    switch (type) {
      case 'normal':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'recurring':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'confirmation':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Histórico
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Histórico completo de todos os tipos de envio.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.normal}
              </p>
              <p className="text-sm text-slate-500">Normal</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.scheduled}
              </p>
              <p className="text-sm text-slate-500">Agendados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Repeat className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.recurring}
              </p>
              <p className="text-sm text-slate-500">Recorrentes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.confirmation}
              </p>
              <p className="text-sm text-slate-500">Confirmações</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar no histórico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FilterType)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="normal">Normal</option>
              <option value="scheduled">Agendado</option>
              <option value="recurring">Recorrente</option>
              <option value="confirmation">Confirmação</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Todos os Envios ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhum envio encontrado
              </h3>
              <p className="text-slate-500">Os envios aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.contactName}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({item.contactPhone})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(item.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
