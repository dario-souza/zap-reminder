'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  MessageCircle,
  LogOut,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  Smartphone,
  Link2,
  Unlink,
  Clock,
  Download,
  Upload,
  Bell,
  Search,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRCodeModal } from '@/components/whatsapp/qrcode-modal'
import {
  ConfirmDialog,
  ContactForm,
  MessageForm,
  ContactsList,
  MessagesList,
  StatsCards,
  TemplateForm,
  TemplatesList,
  ReminderForm,
  ConfirmationsList,
} from './components'
import { useDashboardData } from './hooks/useDashboardData'

export default function DashboardPage() {
  const {
    user,
    contacts,
    messages,
    templates,
    confirmations,
    whatsappStatus,
    cronStatus,
    loading,
    error,
    success,
    refresh,
    handleLogout,
    handleDelete,
    handleDeleteAll,
    handleSendNow,
    handleImportCSV,
    showSuccess,
    showError,
    checkWhatsappConnection,
    checkCronStatus,
  } = useDashboardData()

  const scheduledMessages = useMemo(
    () => messages.filter((m) => m.status === 'SCHEDULED' && m.isReminder !== true),
    [messages],
  )

  const sentMessages = useMemo(
    () => messages.filter((m) => ['SENT', 'DELIVERED', 'READ'].includes(m.status)),
    [messages],
  )
  const deliveredMessages = useMemo(
    () => messages.filter((m) => m.status === 'DELIVERED'),
    [messages],
  )
  const readMessages = useMemo(
    () => messages.filter((m) => m.status === 'READ'),
    [messages],
  )

  const [isAddingContact, setIsAddingContact] = useState(false)
  const [editingContact, setEditingContact] = useState<any>(null)
  const [isAddingMessage, setIsAddingMessage] = useState(false)
  const [isAddingTemplate, setIsAddingTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)

  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<
    'contact' | 'message' | 'template' | 'confirmation' | null
  >(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteAllType, setDeleteAllType] = useState<
    'contacts' | 'messages' | 'templates' | null
  >(null)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  const [isCheckingWhatsapp, setIsCheckingWhatsapp] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)

  const [searchTermContacts, setSearchTermContacts] = useState('')

  const filteredContacts = useMemo(() => {
    if (!searchTermContacts) return contacts
    const term = searchTermContacts.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.phone.includes(term) ||
        (contact.email && contact.email.toLowerCase().includes(term)),
    )
  }, [contacts, searchTermContacts])

  const openDeleteModal = (
    id: string,
    type: 'contact' | 'message' | 'template' | 'confirmation',
  ) => {
    setItemToDelete(id)
    setDeleteType(type)
  }

  const onDelete = async () => {
    if (!itemToDelete || !deleteType) return
    setIsDeleting(true)
    await handleDelete(itemToDelete, deleteType)
    setItemToDelete(null)
    setDeleteType(null)
    setIsDeleting(false)
  }

  const onDeleteAll = async () => {
    if (!deleteAllType) return
    setIsDeletingAll(true)
    await handleDeleteAll(deleteAllType)
    setDeleteAllType(null)
    setIsDeletingAll(false)
  }

  const onImportCSV = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleImportCSV(file)
    e.target.value = ''
  }

  const onSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingTest(true)
    try {
      const { messagesApi } = await import('@/lib/api')
      await messagesApi.sendTestMessage(
        testPhone,
        testMessage || 'Teste ZapReminder! 🚀',
      )
      showSuccess('Mensagem de teste enviada com sucesso!')
      setTestPhone('')
      setTestMessage('')
    } catch (err: any) {
      showError(err.message || 'Erro ao enviar mensagem de teste')
    } finally {
      setIsSendingTest(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">ZapReminder</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Bem-vindo, {user.name}!</h1>

        {(error || success) && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              error
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-600 border border-green-200'
            }`}
          >
            {error ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            <span>{error || success}</span>
          </div>
        )}

        <StatsCards
          contactsCount={contacts.length}
          messagesCount={messages.length}
          sentCount={sentMessages.length}
          scheduledCount={scheduledMessages.length}
        />

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Status do WhatsApp</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {whatsappStatus?.connected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const { messagesApi } = await import('@/lib/api')
                    await messagesApi.disconnectWhatsApp()
                    checkWhatsappConnection()
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Desconectar
                </Button>
              )}
              <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                onClick={checkWhatsappConnection}
                disabled={isCheckingWhatsapp}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isCheckingWhatsapp ? 'animate-spin' : ''}`}
                />
                Verificar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!whatsappStatus ? (
              <p className="text-gray-500">
                Clique em "Verificar" para verificar a conexão...
              </p>
            ) : whatsappStatus.connected ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">
                      ✅ WhatsApp conectado!
                    </p>
                    {whatsappStatus.profile?.pushName && (
                      <p className="text-green-700 text-sm">
                        {whatsappStatus.profile.pushName} (
                        {whatsappStatus.profile.id?.split('@')[0]})
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-green-700 text-sm">
                  Sua integração está funcionando. Você pode enviar mensagens
                  para seus contatos.
                </p>

                <form
                  onSubmit={onSendTestMessage}
                  className="mt-4 space-y-3"
                >
                  <p className="text-sm font-medium text-gray-700">
                    Enviar mensagem de teste:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Telefone (ex: 11999999999)"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Mensagem (opcional)"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isSendingTest || !testPhone}
                      className="bg-green-500 hover:bg-green-600 cursor-pointer"
                    >
                      {isSendingTest ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">
                  ❌ WhatsApp desconectado
                </p>
                <p className="text-red-700 text-sm mb-4">
                  Para enviar mensagens via WhatsApp, você precisa conectar sua
                  conta.
                </p>
                <Button
                  onClick={() => setIsQRCodeModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Conectar WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Agendamento Automático</CardTitle>
            </div>
            <Button
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={checkCronStatus}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            {!cronStatus ? (
              <p className="text-gray-500">Carregando status...</p>
            ) : cronStatus.isRunning ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">
                      ✅ Cron Job Ativo
                    </p>
                    <p className="text-green-700 text-sm">
                      Verificando mensagens agendadas a cada minuto
                    </p>
                  </div>
                </div>
                <p className="text-green-700 text-sm">
                  O sistema enviará automaticamente as mensagens agendadas
                  quando chegar o horário.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-yellow-800 font-medium">
                      ⚠️ Cron Job Parado
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Mensagens agendadas não serão enviadas automaticamente
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {messages.filter((m) => m.status === 'SCHEDULED').length}
                </p>
                <p className="text-sm text-blue-700">Agendadas</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {sentMessages.length}
                </p>
                <p className="text-sm text-green-700">Enviadas</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {deliveredMessages.length}
                </p>
                <p className="text-sm text-blue-700">Entregues</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {readMessages.length}
                </p>
                <p className="text-sm text-purple-700">Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <QRCodeModal
          open={isQRCodeModalOpen}
          onOpenChange={setIsQRCodeModalOpen}
          onConnected={() => {
            checkWhatsappConnection()
            showSuccess('WhatsApp conectado com sucesso!')
          }}
        />

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="scheduled">Agendamentos</TabsTrigger>
            <TabsTrigger value="reminders">Lembretes</TabsTrigger>
            <TabsTrigger value="confirmations">Confirmações</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Minhas Mensagens</CardTitle>
                <div className="flex gap-2">
                  {messages.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllType('messages')}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Todas
                    </Button>
                  )}
                  <Dialog
                    open={isAddingMessage}
                    onOpenChange={setIsAddingMessage}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Mensagem
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-125">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Mensagem</DialogTitle>
                        <DialogDescription>
                          Escreva sua mensagem e escolha quando enviar
                        </DialogDescription>
                      </DialogHeader>
                      <MessageForm
                        contacts={contacts}
                        onSuccess={(msg) => {
                          showSuccess(msg)
                          setIsAddingMessage(false)
                          refresh()
                        }}
                        onError={showError}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <MessagesList
                  messages={messages}
                  onDelete={(id) => openDeleteModal(id, 'message')}
                  onSendNow={handleSendNow}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Mensagens Agendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem agendada</p>
                    <p className="text-sm mt-1">
                      Agende uma mensagem na aba &quot;Mensagens&quot;
                    </p>
                  </div>
                ) : (
                  <MessagesList
                    messages={scheduledMessages}
                    onDelete={(id) => openDeleteModal(id, 'message')}
                    onSendNow={handleSendNow}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Lembretes com Confirmação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 mb-4 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Lembrete
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Lembrete</DialogTitle>
                      <DialogDescription>
                        Agende um lembrete de confirmação para enviar X dias
                        antes da consulta
                      </DialogDescription>
                    </DialogHeader>
                    <ReminderForm
                      contacts={contacts}
                      onSuccess={(msg) => {
                        showSuccess(msg)
                        refresh()
                      }}
                      onError={showError}
                    />
                  </DialogContent>
                </Dialog>

                <MessagesList
                  messages={messages.filter((m) => m.isReminder === true)}
                  onDelete={(id) => openDeleteModal(id, 'message')}
                  onSendNow={handleSendNow}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="confirmations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmações de Comparecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConfirmationsList
                  confirmations={confirmations}
                  onDelete={(id) => openDeleteModal(id, 'confirmation')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meus Contatos</CardTitle>
                <div className="flex gap-2">
                  {contacts.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllType('contacts')}
                      className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Todos
                    </Button>
                  )}
                  <Dialog
                    open={isAddingContact}
                    onOpenChange={(open) => {
                      setIsAddingContact(open)
                      if (!open) setEditingContact(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Contato
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingContact
                            ? 'Editar Contato'
                            : 'Adicionar Novo Contato'}
                        </DialogTitle>
                        <DialogDescription>
                          Preencha os dados do contato abaixo
                        </DialogDescription>
                      </DialogHeader>
                      <ContactForm
                        contact={editingContact}
                        onSuccess={() => {
                          showSuccess(
                            editingContact
                              ? 'Contato atualizado com sucesso!'
                              : 'Contato adicionado com sucesso!',
                          )
                          setIsAddingContact(false)
                          setEditingContact(null)
                          refresh()
                        }}
                        onError={showError}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const { contactsApi } = await import('@/lib/api')
                      contactsApi.exportCSV()
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById('csv-import-input')?.click()
                    }
                    className="text-green-600 border-green-300 hover:bg-green-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                  <input
                    id="csv-import-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={onImportCSV}
                  />
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar contato por nome, telefone ou email..."
                    value={searchTermContacts}
                    onChange={(e) => setSearchTermContacts(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchTermContacts && filteredContacts.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum contato encontrado para &quot;{searchTermContacts}&quot;
                  </p>
                ) : (
                  <ContactsList
                    contacts={filteredContacts}
                    onDelete={(id) => openDeleteModal(id, 'contact')}
                    onEdit={(contact) => {
                      setEditingContact(contact)
                      setIsAddingContact(true)
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meus Templates</CardTitle>
                <div className="flex gap-2">
                  {templates.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllType('templates')}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Todos
                    </Button>
                  )}
                  <Dialog
                    open={isAddingTemplate}
                    onOpenChange={(open) => {
                      setIsAddingTemplate(open)
                      if (!open) setEditingTemplate(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate
                            ? 'Editar Template'
                            : 'Criar Novo Template'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingTemplate
                            ? 'Altere os dados do template abaixo'
                            : 'Crie um modelo de mensagem para reuse'}
                        </DialogDescription>
                      </DialogHeader>
                      <TemplateForm
                        template={editingTemplate}
                        onSuccess={(msg) => {
                          showSuccess(msg)
                          setIsAddingTemplate(false)
                          setEditingTemplate(null)
                          refresh()
                        }}
                        onError={showError}
                        onCancel={() => {
                          setIsAddingTemplate(false)
                          setEditingTemplate(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <TemplatesList
                  templates={templates}
                  onDelete={(id) => openDeleteModal(id, 'template')}
                  onEdit={(template) => {
                    setEditingTemplate(template)
                    setIsAddingTemplate(true)
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={!!itemToDelete}
          onOpenChange={(open) => !open && setItemToDelete(null)}
          title="Confirmar Exclusão"
          description={`Tem certeza que deseja excluir este ${deleteType === 'contact' ? 'contato' : deleteType === 'message' ? 'mensagem' : deleteType === 'template' ? 'template' : 'confirmação'}? Esta ação não pode ser desfeita.`}
          onConfirm={onDelete}
          isLoading={isDeleting}
          confirmText="Excluir"
        />

        <ConfirmDialog
          open={!!deleteAllType}
          onOpenChange={(open) => !open && setDeleteAllType(null)}
          title={`⚠️ Excluir Todos os ${deleteAllType === 'contacts' ? 'Contatos' : deleteAllType === 'messages' ? 'Mensagens' : 'Templates'}`}
          description={`ATENÇÃO: Esta ação excluirá permanentemente todos os seus ${deleteAllType === 'contacts' ? contacts.length : deleteAllType === 'messages' ? messages.length : templates.length} ${deleteAllType === 'contacts' ? 'contatos' : deleteAllType === 'messages' ? 'mensagens' : 'templates'}. Esta ação não pode ser desfeita.`}
          onConfirm={onDeleteAll}
          isLoading={isDeletingAll}
          confirmText="Excluir Todos"
          variant="danger"
        />
      </main>
    </div>
  )
}
