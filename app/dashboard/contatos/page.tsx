'use client'

import { useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Plus, 
  Trash2,
  Edit,
  Upload,
  Download,
  Phone,
  Mail,
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useContacts } from '@/hooks'
import { contactsApi } from '@/lib/api'
import type { Contact } from '@/types'

export default function ContatosPage() {
  const { contacts, isLoading: loading, create, update, remove, refetch } = useContacts()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts
    const term = searchTerm.toLowerCase()
    return contacts.filter(
      (contact: Contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.phone.includes(term) ||
        contact.email?.toLowerCase().includes(term)
    )
  }, [contacts, searchTerm])

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const sanitizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '')
  }

  const handleSaveContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return

    setIsSaving(true)
    try {
      const contactData = {
        name: newContactName.trim(),
        phone: sanitizePhone(newContactPhone.trim()),
        email: newContactEmail.trim() || undefined,
      }

      if (editingContact) {
        await update({ id: editingContact.id, data: contactData })
      } else {
        await create(contactData)
      }
      handleCloseDialog()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setNewContactName(contact.name)
    setNewContactPhone(contact.phone)
    setNewContactEmail(contact.email || '')
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAll = async () => {
    setIsDeletingAll(true)
    try {
      for (const contact of contacts) {
        await remove(contact.id)
      }
      setIsDeleteAllDialogOpen(false)
    } catch (err) {
      console.error('Erro ao deletar todos:', err)
    } finally {
      setIsDeletingAll(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingContact(null)
    setNewContactName('')
    setNewContactPhone('')
    setNewContactEmail('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseDialog()
    } else {
      setIsDialogOpen(true)
    }
  }

  const handleExportCSV = async () => {
    try {
      await contactsApi.exportCSV()
    } catch (err) {
      console.error('Erro ao exportar:', err)
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        setImportResult({ success: false, message: 'Arquivo CSV vazio ou sem dados' })
        setImporting(false)
        return
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
      const nameIndex = headers.indexOf('name')
      const phoneIndex = headers.indexOf('phone')
      const emailIndex = headers.indexOf('email')
      const notesIndex = headers.indexOf('notes')

      if (nameIndex === -1 || phoneIndex === -1) {
        setImportResult({ success: false, message: 'CSV deve ter colunas: name, phone' })
        setImporting(false)
        return
      }

      const contactsToImport = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values[nameIndex] && values[phoneIndex]) {
          contactsToImport.push({
            name: values[nameIndex],
            phone: values[phoneIndex],
            email: emailIndex !== -1 ? values[emailIndex] || undefined : undefined,
            notes: notesIndex !== -1 ? values[notesIndex] || undefined : undefined,
          })
        }
      }

      if (contactsToImport.length === 0) {
        setImportResult({ success: false, message: 'Nenhum contato válido encontrado' })
        setImporting(false)
        return
      }

      if (contactsToImport.length > 500) {
        setImportResult({ success: false, message: 'Máximo de 500 contatos por importação' })
        setImporting(false)
        return
      }

      const csvContent = 'name,phone,email\n' + contactsToImport.map((c: any) => 
        `"${c.name}","${c.phone}","${c.email || ''}"`
      ).join('\n')
      
      const result = await contactsApi.importCSV(csvContent)
      setImportResult({ success: true, message: `${result.success} contatos importados com sucesso!` })
      await refetch()
    } catch (err) {
      console.error('Erro ao importar:', err)
      setImportResult({ success: false, message: 'Erro ao importar contatos' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Contatos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gerencie seus contatos para envio de mensagens.
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar contatos por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              ref={fileInputRef}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? 'Importando...' : 'Importar'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={contacts.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            {contacts.length > 0 && (
              <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar Todos
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja excluir todos os {contacts.length} contatos? Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteAllDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAll}
                      disabled={isDeletingAll}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {isDeletingAll ? 'Deletando...' : 'Deletar Todos'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Contato
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingContact ? 'Editar Contato' : 'Novo Contato'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingContact 
                      ? 'Altere os dados do contato abaixo'
                      : 'Adicione um novo contato para suas mensagens'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nome *
                    </label>
                    <Input
                      placeholder="Nome completo"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Telefone *
                    </label>
                    <Input
                      placeholder="11999999999"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Somente números com DDD
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveContact}
                      disabled={!newContactName.trim() || !newContactPhone.trim() || isSaving}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {isSaving ? 'Salvando...' : editingContact ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {importResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${importResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {importResult.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{importResult.message}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-6 w-6 p-0"
            onClick={() => setImportResult(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Meus Contatos ({filteredContacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhum contato encontrado
              </h3>
              <p className="text-slate-500 mb-4">
                Adicione contatos para enviar mensagens ou importe via CSV.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Contato
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact: Contact) => (
                <div
                  key={contact.id}
                  className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {contact.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Criado em {formatDate(contact.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(contact)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(contact.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{formatPhone(contact.phone)}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
