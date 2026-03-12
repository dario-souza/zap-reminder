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
import { useScheduledMessages, useContacts, useMessages } from '@/hooks'
import type { Message, Contact } from '@/types'
import { getChatId } from '@/types'
import { RecurrentMessageItem } from '@/components/recurrent-message-item'
import { RecurrentMessageForm } from '@/components/recurrent-message-form'

export default function RecorrentesPage() {
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
  const { contacts, loading: contactsLoading } = useContacts()
  const { schedule, send } = useMessages()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ativas' | 'criar'>('ativas')

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
    // Mostra todas as mensagens recorrentes que não estão canceladas
    return recurringMessages.filter((msg) => 
      (msg.status !== 'CANCELLED' && msg.status !== 'cancelled')
    )
  }, [recurringMessages])

  const filteredMessages = useMemo(() => {
    // Mostra todas as mensagens recorrentes ativas (que têm recurrence_type != NONE)
    let messagesToShow = activeRecurringMessages;
    
    // Aplica filtro de busca somente se houver termo
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      messagesToShow = messagesToShow.filter((msg) => {
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
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    }
  }

  const handleCancel = async (msg: Message) => {
    try {
      await cancel(msg.id)
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar')
    }
  }

  const handleCreate = async () => {
    if (selectedContacts.length === 0 || !message || !scheduledAt) return
    
    setIsCreating(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Obter a data de agendamento e converter para o formato correto
      const scheduledDate = new Date(scheduledAt)
      
      // Para mensagens recorrentes, precisamos gerar o cron pattern
      let cronPattern = ''
      if (recurrenceType !== 'NONE') {
        if (recurrenceType === 'WEEKLY') {
          // Cron para semana: minutos hora dia_mes mes dia_semana
          // Exemplo: 0 9 * * 1 (às 9h toda segunda-feira)
          cronPattern = `0 ${scheduledDate.getHours()} * * ${scheduledDate.getDay()}`
        } else if (recurrenceType === 'MONTHLY') {
          // Cron para mês: minutos hora dia_mes mes dia_semana
          // Exemplo: 0 9 1 * * (às 9h no primeiro dia de cada mês)
          cronPattern = `0 ${scheduledDate.getHours()} ${scheduledDate.getDate()} * *`
        }
      }

      for (const contact of selectedContacts) {
        await schedule({
          chatId: getChatId(contact.phone),
          body: message,
          contactId: contact.id,
          scheduledAt: scheduledDate.toISOString(),
          recurrenceType,
          recurrenceCron: cronPattern
        })
      }
      setMessage('')
      setScheduledAt('')
      setRecurrenceType('NONE')
      setSelectedContacts([])
      setSuccess(`${selectedContacts.length} mensagem(s) recorrente(s) criada(s) com sucesso!`)
      await refetch()
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
                  {filteredMessages.map((msg) => {
                    const contact = getContact(msg.phone) ?? null
                    return (
                      <RecurrentMessageItem
                        key={msg.id}
                        message={msg}
                        contact={contact}
                        onSendNow={handleSendNow}
                        onCancel={handleCancel}
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
            scheduledAt={scheduledAt}
            recurrenceType={recurrenceType}
            isCreating={isCreating}
            onContactSearchChange={setContactSearchTerm}
            onSearchOpenChange={setIsSearchOpen}
            onAddContact={addContact}
            onRemoveContact={removeContact}
            onMessageChange={setMessage}
            onScheduledAtChange={setScheduledAt}
            onRecurrenceTypeChange={setRecurrenceType}
            onCreate={handleCreate}
            onCancel={() => {
              setMessage('')
              setScheduledAt('')
              setRecurrenceType('NONE')
              setSelectedContacts([])
            }}
            onClearSearch={clearSearch}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}