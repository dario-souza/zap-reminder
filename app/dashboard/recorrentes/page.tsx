'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Repeat, 
  Search, 
  Plus, 
  Calendar,
  Trash2,
  Edit,
  Play,
  Pause,
  X
} from 'lucide-react'
import { useMessages, useContacts } from '@/hooks'

export default function RecorrentesPage() {
  const { messages, loading: messagesLoading } = useMessages()
  const { contacts, loading: contactsLoading } = useContacts()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  const loading = messagesLoading || contactsLoading

  const recurrentMessages = useMemo(() => {
    return messages.filter(m => m.type === 'batch' || m.type === 'scheduled')
  }, [messages])

  const getContact = (chatId: string) => {
    return contacts.find(c => c.chat_id === chatId)
  }

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return recurrentMessages
    const term = searchTerm.toLowerCase()
    return recurrentMessages.filter(m => {
      const contact = getContact(m.chat_id)
      return (
        m.body.toLowerCase().includes(term) ||
        contact?.name.toLowerCase().includes(term) ||
        contact?.phone.includes(term)
      )
    })
  }, [recurrentMessages, searchTerm, contacts])

  const activeCount = 0
  const pausedCount = 0

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
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
          Recorrentes
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Mensagens que se repetem automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeCount}</p>
              <p className="text-sm text-slate-500">Ativas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Pause className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pausedCount}</p>
              <p className="text-sm text-slate-500">Pausadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Repeat className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{recurrentMessages.length}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar mensagens recorrentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Recorrência
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Criar Mensagem Recorrente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Funcionalidade em desenvolvimento. Em breve você poderá criar mensagens recorrentes.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setShowForm(false)}
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Mensagens Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Repeat className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhuma mensagem recorrente
              </h3>
              <p className="text-slate-500 mb-4">
                Crie mensagens que se repetem automaticamente.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Recorrência
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => {
                const contact = getContact(msg.chat_id)
                return (
                  <div
                    key={msg.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {contact?.name || 'Desconhecido'}
                        </span>
                        <span className="text-sm text-slate-500">
                          ({contact?.phone || msg.chat_id})
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {msg.type === 'batch' ? 'Lote' : 'Agendada'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {msg.body}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {msg.scheduled_at ? `Agendada: ${formatDate(msg.scheduled_at)}` : '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
