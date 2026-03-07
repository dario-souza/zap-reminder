'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Clock, 
  Search, 
  Plus, 
  Calendar, 
  Trash2,
  Edit,
  Send,
  X
} from 'lucide-react'
import { useScheduledMessages, useContacts, useMessages } from '@/hooks'
import type { Message } from '@/types'

export default function AgendamentosPage() {
  const { scheduledMessages, sentMessages, cancelledMessages, loading, refetch, sendNow, cancel } = useScheduledMessages()
  const { contacts } = useContacts()
  const { schedule } = useMessages()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newMessage, setNewMessage] = useState({
    chatId: '',
    body: '',
    scheduledAt: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return scheduledMessages
    const term = searchTerm.toLowerCase()
    return scheduledMessages.filter((msg) => {
      const contact = contacts.find(c => c.chat_id === msg.chat_id)
      return (
        msg.body.toLowerCase().includes(term) ||
        contact?.name.toLowerCase().includes(term) ||
        contact?.phone.includes(term)
      )
    })
  }, [scheduledMessages, contacts, searchTerm])

  const getContact = (chatId: string) => {
    return contacts.find(c => c.chat_id === chatId)
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const handleSendNow = async (msg: Message) => {
    try {
      await sendNow(msg.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    }
  }

  const handleCancel = async (msg: Message) => {
    try {
      await cancel(msg.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar')
    }
  }

  const handleCreate = async () => {
    if (!newMessage.chatId || !newMessage.body || !newMessage.scheduledAt) return
    
    setIsCreating(true)
    setError(null)
    
    try {
      await schedule({
        chatId: newMessage.chatId,
        body: newMessage.body,
        scheduledAt: new Date(newMessage.scheduledAt).toISOString()
      })
      setNewMessage({ chatId: '', body: '', scheduledAt: '' })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento')
    } finally {
      setIsCreating(false)
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Agendamentos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gerencie suas mensagens agendadas.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {scheduledMessages.length}
              </p>
              <p className="text-sm text-slate-500">Pendentes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {sentMessages.length}
              </p>
              <p className="text-sm text-slate-500">Enviadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {cancelledMessages.length}
              </p>
              <p className="text-sm text-slate-500">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar agendamentos..."
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
            Novo Agendamento
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Criar Novo Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Destinatário</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={newMessage.chatId}
                onChange={(e) => setNewMessage({ ...newMessage, chatId: e.target.value })}
              >
                <option value="">Selecione um contato</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.chat_id}>
                    {contact.name} - {contact.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Mensagem</label>
              <textarea
                className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
                value={newMessage.body}
                onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                placeholder="Digite sua mensagem..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Data e Hora</label>
              <Input
                type="datetime-local"
                value={newMessage.scheduledAt}
                onChange={(e) => setNewMessage({ ...newMessage, scheduledAt: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newMessage.chatId || !newMessage.body || !newMessage.scheduledAt}
                className="bg-green-500 hover:bg-green-600"
              >
                {isCreating ? 'Criando...' : 'Criar Agendamento'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mensagens Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-slate-500 mb-4">
                Crie um novo agendamento para enviar mensagens no futuro.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Agendamento
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {contact?.name || 'Desconhecido'}
                        </span>
                        <span className="text-sm text-slate-500">
                          ({contact?.phone || msg.chat_id})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          msg.status === 'pending' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : msg.status === 'sent'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {msg.status === 'pending' ? 'Pendente' : msg.status === 'sent' ? 'Enviada' : 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {msg.body}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {msg.scheduled_at ? formatDate(msg.scheduled_at) : '-'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {msg.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleSendNow(msg)}>
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleCancel(msg)}
                      >
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
