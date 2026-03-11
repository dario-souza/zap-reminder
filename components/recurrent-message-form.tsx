'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Search, X, Plus } from 'lucide-react'
import { Contact } from '@/types'
import { useContacts } from '@/hooks'

interface RecurrentMessageFormProps {
  contacts: Contact[]
  selectedContacts: Contact[]
  contactSearchTerm: string
  isSearchOpen: boolean
  message: string
  scheduledAt: string
  recurrenceType: 'NONE' | 'WEEKLY' | 'MONTHLY'
  isCreating: boolean
  onContactSearchChange: (term: string) => void
  onSearchOpenChange: (open: boolean) => void
  onAddContact: (contact: Contact) => void
  onRemoveContact: (contactId: string) => void
  onMessageChange: (message: string) => void
  onScheduledAtChange: (date: string) => void
  onRecurrenceTypeChange: (type: 'NONE' | 'WEEKLY' | 'MONTHLY') => void
  onCreate: () => void
  onCancel: () => void
  onClearSearch: () => void
}

export function RecurrentMessageForm({
  contacts,
  selectedContacts,
  contactSearchTerm,
  isSearchOpen,
  message,
  scheduledAt,
  recurrenceType,
  isCreating,
  onContactSearchChange,
  onSearchOpenChange,
  onAddContact,
  onRemoveContact,
  onMessageChange,
  onScheduledAtChange,
  onRecurrenceTypeChange,
  onCreate,
  onCancel,
  onClearSearch
}: RecurrentMessageFormProps) {
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.phone.includes(contactSearchTerm)
  )

  return (
    <Card className="border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle>Criar Nova Mensagem Recorrente</CardTitle>
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
              value={contactSearchTerm}
              onChange={(e) => {
                onContactSearchChange(e.target.value)
                onSearchOpenChange(true)
              }}
              onFocus={() => onSearchOpenChange(true)}
              className="pl-10"
            />
            
            {isSearchOpen && contactSearchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {filteredContacts.length === 0 ? (
                  <div className="p-3 text-sm text-slate-500 text-center">
                    Nenhum contato encontrado
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        onAddContact(contact)
                        onContactSearchChange('')
                        onSearchOpenChange(false)
                      }}
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
                    onClick={() => onRemoveContact(contact.id)}
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
              <Button variant="ghost" size="sm" onClick={onClearSearch}>
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
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Data e Hora</label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => onScheduledAtChange(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700">Frequência</label>
            <select
              value={recurrenceType}
              onChange={(e) => onRecurrenceTypeChange(e.target.value as any)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="NONE">Nenhuma</option>
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onCreate}
            disabled={isCreating || selectedContacts.length === 0 || !message || !scheduledAt}
            className="bg-green-500 hover:bg-green-600"
          >
            {isCreating ? 'Criando...' : 'Criar Recorrente'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}