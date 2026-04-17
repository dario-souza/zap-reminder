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
  X,
  Repeat
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useScheduledMessages, useContacts, useMessages, useMessagesRealtime } from '@/hooks'
import type { Message, Contact } from '@/types'
import { getChatId } from '@/types'
import { RecurrentMessageItem } from '@/components/recurrent-message-item'
import { RecurrentMessageForm } from '@/components/recurrent-message-form'

export default function RecorrentesPage() {
  useMessagesRealtime()
  
  const { 
    recurringMessages, 
    sentRecurringMessages, 
    cancelledRecurringMessages,
    totalRecurring,
    totalSentRecurring,
    totalCancelledRecurring,
    loading, 
    refetch, 
    sendNow, 
    cancel 
  } = useScheduledMessages()
  const { contacts, isLoading: contactsLoading } = useContacts()
  const { schedule, send, delete: deleteMessage, deleteAllRecurring, isDeleting, isDeletingAllRecurring } = useMessages()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE')
  const [recurrenceDateTime, setRecurrenceDateTime] = useState('')
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState(-1)
  const [recurrenceHour, setRecurrenceHour] = useState(9)
  const [recurrenceMinute, setRecurrenceMinute] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ativas' | 'criar'>('ativas')
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm) return contacts
    const term = contactSearchTerm.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.phone.includes(term)
    )
  }, [contacts, contactSearchTerm])

  const activeRecurringMessages = useMemo(() => {
    return recurringMessages.filter((msg: Message) =>
      msg.status !== 'cancelled'
    )
  }, [recurringMessages])

  const filteredMessages = useMemo(() => {
    let messagesToShow = activeRecurringMessages;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      messagesToShow = messagesToShow.filter((msg: Message) => {
        const contact = contacts.find(c => c.phone === msg.phone?.replace('@c.us', ''));
        return (
          msg.content?.toLowerCase().includes(term) ||
          (contact?.name && contact.name.toLowerCase().includes(term)) ||
          (contact?.phone && contact.phone.includes(term))
        );
      });
    }
    
    return messagesToShow;
  }, [activeRecurringMessages, contacts, searchTerm])

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

  const handleDelete = async (msg: Message) => {
    try {
      await deleteMessage(msg.id)
      setSuccess('Mensagem recorrente deletada com sucesso!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
    }
  }

  const handleDeleteAll = () => {
    setShowDeleteAllDialog(true)
  }

  const handleConfirmDeleteAll = async () => {
    try {
      await deleteAllRecurring()
      setShowDeleteAllDialog(false)
      setSuccess('Todas as mensagens recorrentes foram deletadas!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar todas')
    }
  }

  const handleCreate = async () => {
    if (
      selectedContacts.length === 0 ||
      !message ||
      recurrenceType === 'NONE' ||
      (recurrenceType === 'WEEKLY' && recurrenceDayOfWeek < 0) ||
      (recurrenceType === 'MONTHLY' && !recurrenceDateTime)
    ) return

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      for (const contact of selectedContacts) {
        await schedule({
          chatId: getChatId(contact.phone),
          body: message,
          contactId: contact.id,
          recurrenceType,
          recurrenceCron: '',
          recurrenceDayOfWeek: recurrenceType === 'WEEKLY' ? recurrenceDayOfWeek : undefined,
          recurrenceDayOfMonth: recurrenceType === 'MONTHLY' ? new Date(recurrenceDateTime).getDate() : undefined,
          recurrenceHour: recurrenceType === 'WEEKLY' ? recurrenceHour : new Date(recurrenceDateTime).getHours(),
          recurrenceMinute: recurrenceType === 'WEEKLY' ? recurrenceMinute : new Date(recurrenceDateTime).getMinutes(),
          type: 'recurring',
        })
      }
      setMessage('')
      setRecurrenceType('NONE')
      setRecurrenceDateTime('')
      setRecurrenceDayOfWeek(-1)
      setRecurrenceHour(9)
      setRecurrenceMinute(0)
      setSelectedContacts([])
      setSuccess(`${selectedContacts.length} mensagem(s) recorrente(s) criada(s) com sucesso!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento recorrente')
    } finally {
      setIsCreating(false)
    }
  }

  const addContact = (contact: Contact) => {
    if (!selectedContacts.find((c) => c.id === contact.id)) {
      setSelectedContacts([...selectedContacts, contact])
    }
    setContactSearchTerm('')
    setIsSearchOpen(false)
  }

  const removeContact = (contactId: string) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== contactId))
  }

  const clearSearch = () => {
    setContactSearchTerm('')
    setIsSearchOpen(false)
  }

  // Limpar mensagens de erro/sucesso após 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Mensagens Recorrentes
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gerencie mensagens que sejam enviadas automaticamente em intervalos regulares.
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
                {activeRecurringMessages.length}
              </p>
              <p className="text-sm text-slate-500">Recorrentes</p>
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
                {totalSentRecurring}
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
                {totalCancelledRecurring}
              </p>
              <p className="text-sm text-slate-500">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ativas">Mensagens Ativas</TabsTrigger>
          <TabsTrigger value="criar">Criar Nova</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ativas">
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar mensagens recorrentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Mensagens Recorrentes Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Repeat className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Nenhuma mensagem recorrente ativa encontrada
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Você pode criar uma nova mensagem recorrente para enviar mensagens automaticamente.
                  </p>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => setActiveTab('criar')}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Recorrente
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
                        disabled={isDeletingAllRecurring}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeletingAllRecurring ? 'Deletando...' : 'Deletar Todas'}
                      </Button>
                    </div>
                  )}
                  {filteredMessages.map((msg: Message) => {
                    const contact = getContact(msg.phone) ?? null
                    return (
                      <RecurrentMessageItem
                        key={msg.id}
                        message={msg}
                        contact={contact}
                        onSendNow={handleSendNow}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                      />
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="criar">
          <RecurrentMessageForm
            contacts={contacts}
            selectedContacts={selectedContacts}
            contactSearchTerm={contactSearchTerm}
            isSearchOpen={isSearchOpen}
            message={message}
            recurrenceType={recurrenceType}
            recurrenceDateTime={recurrenceDateTime}
            recurrenceDayOfWeek={recurrenceDayOfWeek}
            recurrenceHour={recurrenceHour}
            recurrenceMinute={recurrenceMinute}
            isCreating={isCreating}
            onContactSearchChange={setContactSearchTerm}
            onSearchOpenChange={setIsSearchOpen}
            onAddContact={addContact}
            onRemoveContact={removeContact}
            onMessageChange={setMessage}
            onRecurrenceTypeChange={setRecurrenceType}
            onRecurrenceDateTimeChange={setRecurrenceDateTime}
            onRecurrenceDayOfWeekChange={setRecurrenceDayOfWeek}
            onRecurrenceHourChange={setRecurrenceHour}
            onRecurrenceMinuteChange={setRecurrenceMinute}
            onCreate={handleCreate}
            onCancel={() => {
              setMessage('')
              setRecurrenceType('NONE')
              setRecurrenceDateTime('')
              setRecurrenceDayOfWeek(-1)
              setRecurrenceHour(9)
              setRecurrenceMinute(0)
              setSelectedContacts([])
            }}
            onClearSearch={clearSearch}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar todas as mensagens recorrentes? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeleteAll}
              disabled={isDeletingAllRecurring}
            >
              {isDeletingAllRecurring ? 'Deletando...' : 'Deletar Todas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}