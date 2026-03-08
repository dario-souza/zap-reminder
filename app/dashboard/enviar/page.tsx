'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, X, Smile, Variable, Send, Calendar, Minus } from 'lucide-react'
import { useContacts, useMessages } from '@/hooks'
import type { Contact, CreateMessageDto } from '@/types'
import { getChatId } from '@/types'

export default function EnviarPage() {
  const router = useRouter()
  const { contacts, loading: contactsLoading } = useContacts()
  const { send, sendNow } = useMessages()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [message, setMessage] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  const characterCount = message.length
  const maxCharacters = 1024

  const handleSchedule = () => {
    router.push('/dashboard/agendamentos')
  }

  const handleSend = async () => {
    if (selectedContacts.length === 0 || !message) return
    
    setIsSending(true)
    setError(null)
    setSuccess(null)

    try {
      for (const contact of selectedContacts) {
        await send({
          chatId: getChatId(contact.phone),
          body: message,
          contactId: contact.id,
        })
      }
      setSuccess(`${selectedContacts.length} mensagem(s) enviada(s) com sucesso!`)
      setMessage('')
      setSelectedContacts([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectAll = () => {
    setSelectedContacts([...filteredContacts])
    setSearchTerm('')
    setIsSearchOpen(false)
  }

  if (contactsLoading) {
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
          Enviar Mensagem
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Envie mensagens para seus contatos de forma rápida.
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Para quem deseja enviar?
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

          <div className="flex flex-col gap-3">
            <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Sua Mensagem
            </label>
            <Textarea
              placeholder="Escreva sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-y min-h-[150px]"
            />
            <div className="flex justify-between items-center text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <button className="hover:text-green-500 transition-colors flex items-center gap-1" type="button">
                  <Smile className="w-[18px] h-[18px]" />
                  <span>Emojis</span>
                </button>
                <button className="hover:text-green-500 transition-colors flex items-center gap-1" type="button">
                  <Variable className="w-[18px] h-[18px]" />
                  <span>Variáveis</span>
                </button>
              </div>
              <span className={characterCount > maxCharacters ? 'text-red-500' : ''}>
                {characterCount}/{maxCharacters} caracteres
              </span>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSchedule}
              className="flex items-center gap-2"
              type="button"
            >
              <Calendar className="w-5 h-5" />
              Agendar
            </Button>
            <Button
              onClick={handleSend}
              disabled={selectedContacts.length === 0 || !message || isSending}
              className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
              type="button"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">-</p>
              <p className="text-sm text-slate-500">Enviadas hoje</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">-</p>
              <p className="text-sm text-slate-500">Agendadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Minus className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">-</p>
              <p className="text-sm text-slate-500">Falhas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
