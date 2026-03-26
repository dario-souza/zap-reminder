'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  Search,
  Plus,
  Calendar,
  Trash2,
  X,
  Check,
  HelpCircle,
  Send,
  Clock,
  User,
} from 'lucide-react'
import { useConfirmations, useContacts } from '@/hooks'
import { useAuthStore } from '@/stores/authStore'
import type { Confirmation, Contact, ConfirmationMessageStatus, ConfirmationStatus } from '@/types'

function MessageStatusBadge({ status }: { status: ConfirmationMessageStatus }) {
  const config: Record<ConfirmationMessageStatus, { label: string; class: string }> = {
    pending:    { label: 'Pendente',    class: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    queued:     { label: 'Na fila',     class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    sent:       { label: 'Enviada',     class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    delivered:   { label: 'Entregue',    class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    read:       { label: 'Lida',         class: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    failed:     { label: 'Falhou',       class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }
  const c = config[status] || config.pending
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.class}`}>{c.label}</span>
}

function ConfirmationStatusBadge({ status }: { status: ConfirmationStatus }) {
  const config: Record<ConfirmationStatus, { label: string; class: string }> = {
    pending:   { label: 'Aguardando', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    confirmed:  { label: 'Confirmado',  class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cancelled:  { label: 'Recusado',    class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }
  const c = config[status] || config.pending
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.class}`}>{c.label}</span>
}

function ConfirmationCard({
  confirmation,
  onSendNow,
  onDelete,
  isSendingNow,
}: {
  confirmation: Confirmation
  onSendNow: (id: string) => void
  onDelete: (id: string) => void
  isSendingNow: boolean
}) {
  const formatDate = (d?: string) => {
    if (!d) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(d))
  }
  const formatDateTime = (d?: string) => {
    if (!d) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(d))
  }

  const canSendNow = confirmation.status === 'pending' && ['pending', 'queued'].includes(confirmation.message_status)

  return (
    <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {confirmation.contact_name}
          </span>
          <span className="text-sm text-slate-500">{confirmation.contact_phone}</span>
        </div>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <ConfirmationStatusBadge status={confirmation.status} />
          <MessageStatusBadge status={confirmation.message_status} />
        </div>

        {confirmation.message_content && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 italic">
            &ldquo;{confirmation.message_content}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Evento: {formatDate(confirmation.event_date)}
          </span>
          {confirmation.send_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Enviar em: {formatDateTime(confirmation.send_at)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Criado: {formatDateTime(confirmation.created_at)}
          </span>
          {confirmation.responded_at && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              Respondido: {formatDateTime(confirmation.responded_at)}
              {confirmation.response && ` — "${confirmation.response}"`}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {canSendNow && (
          <Button
            variant="ghost"
            size="icon"
            className="text-green-500"
            onClick={() => onSendNow(confirmation.id)}
            disabled={isSendingNow}
            title="Enviar agora"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500"
          onClick={() => onDelete(confirmation.id)}
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function ConfirmacoesPage() {
  const user = useAuthStore((s) => s.user)
  const { confirmations, isLoading, create, removeAsync, sendNowAsync, isSendingNow, refetch, deleteAllAsync } = useConfirmations()
  const { contacts } = useContacts()

  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPhone, setCustomPhone] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [sendDate, setSendDate] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm) return []
    const term = contactSearchTerm.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term),
    ).slice(0, 5)
  }, [contacts, contactSearchTerm])

  const filteredConfirmations = useMemo(() => {
    if (!searchTerm) return confirmations
    const term = searchTerm.toLowerCase()
    return confirmations.filter(
      (c) =>
        c.contact_name.toLowerCase().includes(term) ||
        c.contact_phone.includes(term),
    )
  }, [confirmations, searchTerm])

  const pendingCount = confirmations.filter((c) => c.status === 'pending').length
  const confirmedCount = confirmations.filter((c) => c.status === 'confirmed').length
  const cancelledCount = confirmations.filter((c) => c.status === 'cancelled').length

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    setCustomName(contact.name)
    setCustomPhone(contact.phone)
    setContactSearchTerm('')
    setIsContactDropdownOpen(false)
  }

  const handleClearContact = () => {
    setSelectedContact(null)
    setCustomName('')
    setCustomPhone('')
  }

  const handleCreate = async () => {
    const name = customName.trim()
    const phone = customPhone.replace(/\D/g, '')
    if (!name || !phone || !eventDate) return

    setIsCreating(true)
    setError(null)
    try {
      await create({
        contactId: selectedContact?.id,
        contactName: name,
        contactPhone: phone,
        eventDate: new Date(eventDate).toISOString(),
        sendAt: sendDate ? new Date(sendDate).toISOString() : undefined,
        messageContent: messageContent || undefined,
      })
      setSuccess('Confirmação criada com sucesso!')
      setShowForm(false)
      setSelectedContact(null)
      setCustomName('')
      setCustomPhone('')
      setEventDate('')
      setSendDate('')
      setMessageContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar confirmação')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta confirmação?')) return
    try {
      await removeAsync(id)
      setSuccess('Confirmação excluída.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  const handleSendNow = async (id: string) => {
    try {
      await sendNowAsync(id)
      setSuccess('Mensagem enviada!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    }
  }

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null) }, 5000)
      return () => clearTimeout(t)
    }
  }, [error, success])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Confirmações</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Agende lembretes de confirmação de presença. O destinatário responde SIM ou NÃO via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingCount}</p>
              <p className="text-sm text-slate-500">Aguardando resposta</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{confirmedCount}</p>
              <p className="text-sm text-slate-500">Confirmados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{cancelledCount}</p>
              <p className="text-sm text-slate-500">Recusados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar confirmações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="bg-green-500 hover:bg-green-600" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Confirmação
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Nova Confirmação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contato</label>
              {selectedContact ? (
                <div className="flex items-center gap-2 mt-1 p-2 border rounded-lg">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedContact.name}
                  </span>
                  <span className="text-sm text-slate-500">{selectedContact.phone}</span>
                  <button onClick={handleClearContact} className="ml-auto text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative mt-1">
                  <Input
                    placeholder="Buscar contato..."
                    value={contactSearchTerm}
                    onChange={(e) => { setContactSearchTerm(e.target.value); setIsContactDropdownOpen(true) }}
                    onFocus={() => setIsContactDropdownOpen(true)}
                  />
                  {isContactDropdownOpen && filteredContacts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {filteredContacts.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectContact(c)}
                          className="w-full p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col"
                        >
                          <span className="font-medium text-slate-900 dark:text-slate-100">{c.name}</span>
                          <span className="text-sm text-slate-500">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Ou preencha manualmente:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  placeholder="Nome"
                  value={customName}
                  onChange={(e) => { setCustomName(e.target.value); setSelectedContact(null) }}
                />
                <Input
                  placeholder="Telefone"
                  value={customPhone}
                  onChange={(e) => { setCustomPhone(e.target.value); setSelectedContact(null) }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Data do Evento <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  className="mt-1"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-0.5">Exibido ao destinatário na mensagem</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quando enviar o lembrete
                </label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={sendDate}
                  onChange={(e) => setSendDate(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-0.5">Deixe vazio para enviar agora</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mensagem</label>
              <Textarea
                className="mt-1 min-h-[100px]"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Olá {{contact_name}}, confirma sua presença no dia {{event_date}}?"
              />
              <p className="text-xs text-slate-500 mt-1">
                Variáveis: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{{contact_name}}'}</code>{' '}
                <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{{event_date}}'}</code>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating || !customName || !customPhone || !eventDate}
                className="bg-green-500 hover:bg-green-600"
              >
                {isCreating ? 'Criando...' : 'Criar Confirmação'}
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Lista de Confirmações
            </CardTitle>
            {filteredConfirmations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={async () => {
                  if (!confirm('Excluir TODAS as confirmações?')) return
                  await deleteAllAsync()
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Todas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredConfirmations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhuma confirmação encontrada
              </h3>
              <p className="text-slate-500 mb-4">
                Crie confirmações de presença para seus eventos.
              </p>
              <Button className="bg-green-500 hover:bg-green-600" onClick={() => setShowForm(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Nova Confirmação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConfirmations.map((conf) => (
                <ConfirmationCard
                  key={conf.id}
                  confirmation={conf as Confirmation}
                  onSendNow={handleSendNow}
                  onDelete={handleDelete}
                  isSendingNow={isSendingNow}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
