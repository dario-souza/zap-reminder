'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock, 
  Search, 
  Plus, 
  Calendar, 
  Trash2,
  Send,
  X
} from 'lucide-react'
import { useScheduledMessages, useContacts, useMessages } from '@/hooks'
import type { Message, Contact } from '@/types'
import { getChatId } from '@/types'

export default function AgendamentosPage() {
  const { scheduledMessages, sentMessages, cancelledMessages, loading, refetch, sendNow, cancel } = useScheduledMessages()
  const { contacts, loading: contactsLoading } = useContacts()
  const { schedule, send } = useMessages()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts
    const term = searchTerm.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.phone.includes(term)
    )
  }, [contacts, searchTerm])

  const addContact = (contact: Contact) => {
    if (!selectedContacts.find((c) => c.id === contact.id)) {
      setSelectedContacts([...selectedContacts, contact])
    }
    setSearchTerm('')
    setIsSearchOpen(false)
  }

  const removeContact = (contactId: string) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== contactId))
  }

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return scheduledMessages
    const term = searchTerm.toLowerCase()
    return scheduledMessages.filter((msg) => {
      const contact = contacts.find(c => c.phone === msg.phone?.replace('@c.us', ''))
      return (
        msg.content?.toLowerCase().includes(term) ||
        contact?.name.toLowerCase().includes(term) ||
        contact?.phone.includes(term)
      )
    })
  }, [scheduledMessages, contacts, searchTerm])

  const getContact = (phone: string | undefined) => {
    if (!phone) return null
    const cleanPhone = phone.replace('@c.us', '').replace('@g.us', '')
    return contacts.find(c => c.phone === cleanPhone)
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
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
      await send({
        chatId: getChatId(msg.phone || ''),
        body: msg.content || '',
        contactId: msg.contact_id,
      })
      await refetch()
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
    if (selectedContacts.length === 0 || !message || !scheduledAt) return
    
    setIsCreating(true)
    setError(null)
    
    try {
      for (const contact of selectedContacts) {
        await schedule({
          chatId: getChatId(contact.phone),
          body: message,
          contactId: contact.id,
          scheduledAt: new Date(scheduledAt).toISOString()
        })
      }
      setMessage('')
      setScheduledAt('')
      setSelectedContacts([])
      setShowForm(false)
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento')
    } finally {
      setIsCreating(false)
    }
  }

  if (loading || contactsLoading) {
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
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-700">
                Destinatário
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setIsSearchOpen(true)
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="pl-10"
                />
                
                {isSearchOpen && searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {filteredContacts.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500 text-center">
                        Nenhum contato encontrado
                      </div>
                    ) : (
                      filteredContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => addContact(contact)}
                          className="w-full p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col"
                        >
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {contact.name}
                          </span>
                          <span className="text-sm text-slate-500">{contact.phone}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedContacts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600"
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {contact.name}
                      </span>
                      <button
                        onClick={() => removeContact(contact.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedContacts.length > 0 && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500">
                    {selectedContacts.length} destinatário{selectedContacts.length > 1 ? 's' : ''} selecionado{selectedContacts.length > 1 ? 's' : ''}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedContacts([])}>
                    Limpar
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Mensagem</label>
              <Textarea
                className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Data e Hora</label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating || selectedContacts.length === 0 || !message || !scheduledAt}
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
                const contact = getContact(msg.phone)
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
                          ({contact?.phone || msg.phone || '-'})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          msg.status === 'PENDING' || msg.status === 'pending' || msg.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : msg.status === 'SENT' || msg.status === 'sent'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {msg.status === 'PENDING' || msg.status === 'pending' || msg.status === 'SCHEDULED' 
                            ? 'Pendente' 
                            : msg.status === 'SENT' || msg.status === 'sent' 
                            ? 'Enviada' 
                            : 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {msg.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(msg.scheduled_at || msg.next_send_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {(msg.status === 'PENDING' || msg.status === 'pending' || msg.status === 'SCHEDULED') && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleSendNow(msg)}>
                            <Send className="w-4 h-4" />
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
