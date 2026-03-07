'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  Search, 
  Plus, 
  Calendar,
  Trash2,
  Edit,
  X,
  Check,
  HelpCircle
} from 'lucide-react'
import { useConfirmations } from '@/hooks'

export default function ConfirmacoesPage() {
  const { confirmations, loading, create, update, remove } = useConfirmations()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newConfirmation, setNewConfirmation] = useState({
    contactName: '',
    contactPhone: '',
    eventDate: '',
    messageContent: ''
  })
  const [isCreating, setIsCreating] = useState(false)

  const filteredConfirmations = useMemo(() => {
    if (!searchTerm) return confirmations
    const term = searchTerm.toLowerCase()
    return confirmations.filter(conf =>
      conf.contact_name.toLowerCase().includes(term) ||
      conf.contact_phone.includes(term)
    )
  }, [confirmations, searchTerm])

  const pendingCount = confirmations.filter(c => c.status === 'pending').length
  const confirmedCount = confirmations.filter(c => c.status === 'confirmed').length
  const deniedCount = confirmations.filter(c => c.status === 'denied').length

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const handleCreate = async () => {
    if (!newConfirmation.contactName || !newConfirmation.contactPhone || !newConfirmation.eventDate) return
    
    setIsCreating(true)
    try {
      await create({
        contactName: newConfirmation.contactName,
        contactPhone: newConfirmation.contactPhone.replace(/\D/g, ''),
        eventDate: new Date(newConfirmation.eventDate).toISOString(),
        messageContent: newConfirmation.messageContent
      })
      setNewConfirmation({ contactName: '', contactPhone: '', eventDate: '', messageContent: '' })
      setShowForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'CONFIRMED' | 'DENIED') => {
    try {
      await update(id, { status })
    } catch (err) {
      console.error(err)
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
          Confirmações
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gerencie confirmações de comparecimento aos seus eventos.
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
              <p className="text-sm text-slate-500">Pendentes</p>
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
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{deniedCount}</p>
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
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Confirmação
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Criar Confirmação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nome do Contato</label>
              <Input
                className="mt-1"
                value={newConfirmation.contactName}
                onChange={(e) => setNewConfirmation({ ...newConfirmation, contactName: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Telefone</label>
              <Input
                className="mt-1"
                value={newConfirmation.contactPhone}
                onChange={(e) => setNewConfirmation({ ...newConfirmation, contactPhone: e.target.value })}
                placeholder="11999999999"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Data do Evento</label>
              <Input
                type="date"
                className="mt-1"
                value={newConfirmation.eventDate}
                onChange={(e) => setNewConfirmation({ ...newConfirmation, eventDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Mensagem (opcional)</label>
              <Input
                className="mt-1"
                value={newConfirmation.messageContent}
                onChange={(e) => setNewConfirmation({ ...newConfirmation, messageContent: e.target.value })}
                placeholder="Mensagem adicional..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newConfirmation.contactName || !newConfirmation.contactPhone || !newConfirmation.eventDate}
                className="bg-green-500 hover:bg-green-600"
              >
                {isCreating ? 'Criando...' : 'Criar'}
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
            <CheckCircle className="w-5 h-5" />
            Lista de Confirmações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConfirmations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhuma confirmação encontrada
              </h3>
              <p className="text-slate-500 mb-4">
                Crie confirmações de comparecimento para seus eventos.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Confirmação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConfirmations.map((conf) => (
                <div
                  key={conf.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {conf.contact_name}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({conf.contact_phone})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Data: {formatDate(conf.event_date)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        conf.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : conf.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {conf.status === 'pending' ? 'Pendente' : conf.status === 'confirmed' ? 'Confirmado' : 'Recusado'}
                      </span>
                    </div>
                    {conf.message_content && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {conf.message_content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(conf.event_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        Enviada: {formatDateTime(conf.created_at)}
                      </div>
                      {conf.replied_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Respondida: {formatDateTime(conf.replied_at)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {conf.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-green-500"
                          onClick={() => handleUpdateStatus(conf.id, 'CONFIRMED')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleUpdateStatus(conf.id, 'DENIED')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={() => remove(conf.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
