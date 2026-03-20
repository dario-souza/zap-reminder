'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Search, X } from 'lucide-react'
import { Contact } from '@/types'
import { useState } from 'react'

export type RecurrenceFrequency = 'NONE' | 'WEEKLY' | 'MONTHLY'

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

interface RecurrentMessageFormProps {
  contacts: Contact[]
  selectedContacts: Contact[]
  contactSearchTerm: string
  isSearchOpen: boolean
  message: string
  recurrenceType: RecurrenceFrequency
  recurrenceDateTime: string
  recurrenceDayOfWeek: number
  recurrenceHour: number
  recurrenceMinute: number
  isCreating: boolean
  onContactSearchChange: (term: string) => void
  onSearchOpenChange: (open: boolean) => void
  onAddContact: (contact: Contact) => void
  onRemoveContact: (contactId: string) => void
  onMessageChange: (message: string) => void
  onRecurrenceTypeChange: (type: RecurrenceFrequency) => void
  onRecurrenceDateTimeChange: (value: string) => void
  onRecurrenceDayOfWeekChange: (day: number) => void
  onRecurrenceHourChange: (hour: number) => void
  onRecurrenceMinuteChange: (minute: number) => void
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
  recurrenceType,
  recurrenceDateTime,
  recurrenceDayOfWeek,
  recurrenceHour,
  recurrenceMinute,
  isCreating,
  onContactSearchChange,
  onSearchOpenChange,
  onAddContact,
  onRemoveContact,
  onMessageChange,
  onRecurrenceTypeChange,
  onRecurrenceDateTimeChange,
  onRecurrenceDayOfWeekChange,
  onRecurrenceHourChange,
  onRecurrenceMinuteChange,
  onCreate,
  onCancel,
  onClearSearch,
}: RecurrentMessageFormProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(contactSearchTerm)

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      contact.phone.includes(localSearchTerm)
  )

  const isFormValid =
    selectedContacts.length > 0 &&
    message.trim() !== '' &&
    recurrenceType !== 'NONE' &&
    (recurrenceType === 'MONTHLY' ? recurrenceDateTime !== '' : recurrenceDayOfWeek >= 0)

  return (
    <Card className="border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle>Criar Nova Mensagem Recorrente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Destinatário</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar contatos..."
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value)
                onContactSearchChange(e.target.value)
                onSearchOpenChange(true)
              }}
              onFocus={() => onSearchOpenChange(true)}
              className="pl-10"
            />

            {isSearchOpen && localSearchTerm && (
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
                        setLocalSearchTerm('')
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
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
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

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Frequência</label>
            <select
              value={recurrenceType}
              onChange={(e) => onRecurrenceTypeChange(e.target.value as RecurrenceFrequency)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="NONE">Nenhuma</option>
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>

          {recurrenceType === 'WEEKLY' && (
            <div>
              <label className="text-sm font-medium text-slate-700">Dia da semana</label>
              <select
                value={recurrenceDayOfWeek}
                onChange={(e) => onRecurrenceDayOfWeekChange(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value={-1} disabled>Selecione</option>
                {WEEKDAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {recurrenceType === 'WEEKLY' && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">Hora</label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={recurrenceHour}
                  onChange={(e) => onRecurrenceHourChange(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Minutos</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={recurrenceMinute}
                  onChange={(e) => onRecurrenceMinuteChange(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {recurrenceType === 'MONTHLY' && (
            <div className="col-span-3">
              <label className="text-sm font-medium text-slate-700">Dia e hora</label>
              <Input
                type="datetime-local"
                value={recurrenceDateTime}
                onChange={(e) => onRecurrenceDateTimeChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>

        {recurrenceType === 'WEEKLY' && recurrenceDayOfWeek >= 0 && (
          <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-md p-3">
            Toda <strong>{WEEKDAY_OPTIONS.find((o) => o.value === recurrenceDayOfWeek)?.label}</strong> às{' '}
            <strong>{String(recurrenceHour).padStart(2, '0')}:{String(recurrenceMinute).padStart(2, '0')}</strong>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onCreate}
            disabled={isCreating || !isFormValid}
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
