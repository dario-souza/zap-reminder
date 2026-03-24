'use client'

import { useState, useMemo, useCallback } from 'react'
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
  X,
  Filter
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useScheduledMessages, useContacts, useMessages } from '@/hooks'
import type { Message, Contact } from '@/types'
import { getChatId } from '@/types'

type StatusFilter = 'all' | 'scheduled' | 'pending' | 'sent' | 'cancelled'

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: 'Pendente', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    pending: { label: 'Pendente', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    SCHEDULED: { label: 'Agendada', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    scheduled: { label: 'Agendada', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    SENT: { label: 'Enviada', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    sent: { label: 'Enviada', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    CANCELLED: { label: 'Cancelada', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    cancelled: { label: 'Cancelada', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    class: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' 
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
      {config.label}
    </span>
  )
}

function ContactSearch({ 
  contacts, 
  searchTerm, 
  onSearchChange, 
  onSelectContact,
  selectedContacts,
  onRemoveContact 
}: {
  contacts: Contact[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onSelectContact: (contact: Contact) => void
  selectedContacts: Contact[]
  onRemoveContact: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const filteredContacts = useMemo(() => {
    if (!searchTerm) return []
    const term = searchTerm.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.phone.includes(term)
    ).slice(0, 5)
  }, [contacts, searchTerm])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar contatos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-10"
        />
        {isOpen && filteredContacts.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className="w-full p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {contact.name}
                </span>
                <span className="text-sm text-slate-500">{contact.phone}</span>
              </button>
            ))}
          </div>
        )}
        {isOpen && searchTerm && filteredContacts.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 z-10">
            <p className="text-sm text-slate-500 text-center">Nenhum contato encontrado</p>
          </div>
        )}
      </div>
      
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600"
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {contact.name}
              </span>
              <button
                onClick={() => onRemoveContact(contact.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MessageCard({ 
  message, 
  contact,
  onSendNow, 
  onCancel 
}: { 
  message: Message
  contact: Contact | null | undefined
  onSendNow: () => void
  onCancel: () => void
}) {
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

  const isPending = message.status === 'pending'
  const isScheduled = message.status === 'scheduled'

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {contact?.name || 'Desconhecido'}
          </span>
          <span className="text-sm text-slate-500">
            ({contact?.phone || message.phone || '-'})
          </span>
          <StatusBadge status={message.status} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
          {message.content}
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          {formatDate(message.scheduled_at || message.next_send_at)}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {(isPending || isScheduled) && (
          <>
            <Button variant="ghost" size="icon" onClick={onSendNow}>
              <Send className="w-4 h-4" />
            </Button>
          </>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-500"
          onClick={onCancel}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function AgendamentosPage() {
  const { 
    scheduledMessages, 
    sentScheduledMessages, 
    cancelledScheduledMessages,
    totalScheduled, 
    totalSentScheduled, 
    totalCancelledScheduled,
    loading, 
    refetch, 
    sendNow, 
    cancel,
    deleteAllScheduled,
    isDeletingAllScheduled,
  } = useScheduledMessages()
  
  const { contacts, isLoading: contactsLoading } = useContacts()
  const { schedule, send } = useMessages()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [message, setMessage] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const addContact = useCallback((contact: Contact) => {
    if (!selectedContacts.find((c) => c.id === contact.id)) {
      setSelectedContacts([...selectedContacts, contact])
    }
    setContactSearchTerm('')
  }, [selectedContacts])

  const removeContact = useCallback((contactId: string) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== contactId))
  }, [selectedContacts])

  const filteredMessages = useMemo(() => {
    let messages = [...scheduledMessages, ...sentScheduledMessages, ...cancelledScheduledMessages]
    
    if (statusFilter !== 'all') {
      messages = messages.filter((msg) => {
        if (statusFilter === 'scheduled') {
          return msg.status === 'scheduled'
        }
        if (statusFilter === 'pending') {
          return msg.status === 'pending'
        }
        if (statusFilter === 'sent') {
          return msg.status === 'sent'
        }
        if (statusFilter === 'cancelled') {
          return msg.status === 'cancelled'
        }
        return true
      })
    }
    
    if (!searchTerm) return messages
    
    const term = searchTerm.toLowerCase()
    return messages.filter((msg) => {
      const contact = contacts.find((c: Contact) => c.phone === msg.phone?.replace('@c.us', ''))
      return (
        msg.content?.toLowerCase().includes(term) ||
        contact?.name.toLowerCase().includes(term) ||
        contact?.phone.includes(term)
      )
    })
  }, [scheduledMessages, sentScheduledMessages, cancelledScheduledMessages, statusFilter, searchTerm, contacts])

  const getContact = useCallback((phone: string | undefined) => {
    if (!phone) return null
    const cleanPhone = phone.replace('@c.us', '').replace('@g.us', '')
    return contacts.find((c: Contact) => c.phone === cleanPhone)
  }, [contacts])

  const handleSendNow = useCallback(async (msg: Message) => {
    try {
      await send({
        chatId: getChatId(msg.phone || ''),
        body: msg.content || '',
        contactId: msg.contact_id,
        type: 'instant',
      })
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    }
  }, [send, refetch])

  const handleCancel = useCallback(async (msg: Message) => {
    try {
      await cancel(msg.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar')
    }
  }, [cancel])

  const handleDeleteAll = useCallback(() => {
    setShowDeleteAllDialog(true)
  }, [])

  const handleConfirmDeleteAll = useCallback(async () => {
    try {
      await deleteAllScheduled()
      await refetch()
      setShowDeleteAllDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar todas')
    }
  }, [deleteAllScheduled, refetch, isDeletingAllScheduled])

  const handleCreate = useCallback(async () => {
    if (selectedContacts.length === 0 || !message || !scheduledAt) return
    
    setIsCreating(true)
    setError(null)
    
    try {
      for (const contact of selectedContacts) {
        await schedule({
          chatId: getChatId(contact.phone),
          body: message,
          contactId: contact.id,
          scheduledAt: new Date(scheduledAt).toISOString(),
          type: 'scheduled',
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
  }, [selectedContacts, message, scheduledAt, schedule, refetch])

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
                {totalScheduled}
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
                {totalSentScheduled}
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
                {totalCancelledScheduled}
              </p>
              <p className="text-sm text-slate-500">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar agendamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="all">Todos</option>
            <option value="scheduled">Agendadas</option>
            <option value="pending">Pendentes</option>
            <option value="sent">Enviadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
        
        <Button 
          className="bg-green-500 hover:bg-green-600"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>
      </div>

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
              <ContactSearch
                contacts={contacts}
                searchTerm={contactSearchTerm}
                onSearchChange={setContactSearchTerm}
                onSelectContact={addContact}
                selectedContacts={selectedContacts}
                onRemoveContact={removeContact}
              />
              
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
              {filteredMessages.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={handleDeleteAll}
                    disabled={isDeletingAllScheduled}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeletingAllScheduled ? 'Deletando...' : 'Deletar Todas'}
                  </Button>
                </div>
              )}
              {filteredMessages.map((msg) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  contact={getContact(msg.phone)}
                  onSendNow={() => handleSendNow(msg)}
                  onCancel={() => handleCancel(msg)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar todas as mensagens agendadas? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeleteAll}
              disabled={isDeletingAllScheduled}
            >
              {isDeletingAllScheduled ? 'Deletando...' : 'Deletar Todas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
