import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { User, X } from 'lucide-react'
import { useContacts } from '@/hooks'
import type { Contact } from '@/types'

interface ConfirmationFormProps {
  onSubmit: (data: {
    contactId?: string
    contactName: string
    contactPhone: string
    eventDate: string
    sendAt?: string
    messageContent?: string
    confirmationResponseMessage?: string
    cancellationResponseMessage?: string
  }) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function ConfirmationForm({ onSubmit, onCancel, isSubmitting }: ConfirmationFormProps) {
  const { contacts } = useContacts()
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPhone, setCustomPhone] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [sendDate, setSendDate] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [confirmationResponseMessage, setConfirmationResponseMessage] = useState('')
  const [cancellationResponseMessage, setCancellationResponseMessage] = useState('')

  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm) return []
    const term = contactSearchTerm.toLowerCase()
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(term) || c.phone.includes(term)
    ).slice(0, 5)
  }, [contacts, contactSearchTerm])

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setCustomName(contact.name)
    setCustomPhone(contact.phone)
    setContactSearchTerm('')
    setIsContactDropdownOpen(false)
  }, [])

  const handleClearContact = useCallback(() => {
    setSelectedContact(null)
    setCustomName('')
    setCustomPhone('')
  }, [])

  const handleSubmit = async () => {
    const name = customName.trim()
    const phone = customPhone.replace(/\D/g, '')
    if (!name || !phone || !eventDate) return

    await onSubmit({
      contactId: selectedContact?.id,
      contactName: name,
      contactPhone: phone,
      eventDate: new Date(eventDate).toISOString(),
      sendAt: sendDate ? new Date(sendDate).toISOString() : undefined,
      messageContent: messageContent || undefined,
      confirmationResponseMessage: confirmationResponseMessage || undefined,
      cancellationResponseMessage: cancellationResponseMessage || undefined,
    })
  }

  const isValid = customName.trim() && customPhone.replace(/\D/g, '') && eventDate

  return (
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
          <p className="text-xs text-slate-500 mt-1">Ou preencha manualmente:</p>
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
              min={new Date().toISOString().split('T')[0]}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Mensagem ao confirmar
            </label>
            <Textarea
              className="mt-1 min-h-[80px]"
              value={confirmationResponseMessage}
              onChange={(e) => setConfirmationResponseMessage(e.target.value)}
              placeholder="Obrigado por confirmar! {{contact_name}}, vemos você no evento!"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enviada quando o contato responder &quot;Sim&quot;
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Mensagem ao recusar
            </label>
            <Textarea
              className="mt-1 min-h-[80px]"
              value={cancellationResponseMessage}
              onChange={(e) => setCancellationResponseMessage(e.target.value)}
              placeholder="Sentimos muito que não possa comparecer. {{contact_name}}, esperamos você na próxima!"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enviada quando o contato responder &quot;Não&quot;
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="bg-green-500 hover:bg-green-600"
          >
            {isSubmitting ? 'Criando...' : 'Criar Confirmação'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
