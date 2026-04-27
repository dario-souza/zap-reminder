'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  History,
  Search,
  Send,
  Calendar,
  Repeat,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useHistory, useHistoryCount, useClearHistory } from '@/hooks'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type MessageType = 'normal' | 'scheduled' | 'recurring' | 'confirmation'
type FilterType = 'all' | MessageType

const ITEMS_PER_PAGE = 10

export default function HistoricoPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')

  const { data: historyData, isLoading, isFetching } = useHistory(
    page,
    ITEMS_PER_PAGE,
    typeFilter === 'all' ? undefined : typeFilter,
    searchTerm || undefined
  )

  const { data: countData } = useHistoryCount()
  const clearHistoryMutation = useClearHistory()

  const historyItems = historyData?.data ?? []
  const totalItems = historyData?.total ?? 0
  const totalPages = historyData?.totalPages ?? 1
  const currentCount = countData?.count ?? 0
  const maxItems = countData?.limit ?? 500

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleTypeChange = (value: FilterType) => {
    setTypeFilter(value)
    setPage(1)
  }

  const handleClearHistory = () => {
    clearHistoryMutation.mutate()
  }

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'normal':
        return <Send className="w-4 h-4" />
      case 'scheduled':
        return <Calendar className="w-4 h-4" />
      case 'recurring':
        return <Repeat className="w-4 h-4" />
      case 'confirmation':
        return <Send className="w-4 h-4" />
      default:
        return <Send className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'normal':
        return 'Instantânea'
      case 'scheduled':
        return 'Agendada'
      case 'recurring':
        return 'Recorrente'
      case 'confirmation':
        return 'Confirmação'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'normal':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'recurring':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'confirmation':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Histórico
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Histórico de mensagens enviadas ({currentCount}/{maxItems})
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              Limpar Histórico
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar Histórico</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearHistory}
                className="bg-red-600 hover:bg-red-700"
                disabled={clearHistoryMutation.isPending}
              >
                {clearHistoryMutation.isPending ? 'Limpando...' : 'Sim, limpar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar no histórico..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value as FilterType)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="normal">Instantânea</option>
              <option value="scheduled">Agendada</option>
              <option value="recurring">Recorrente</option>
              <option value="confirmation">Confirmação</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Envios ({totalItems})
            {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhum envio encontrado
              </h3>
              <p className="text-slate-500">Os envios aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.phone}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.content || '-'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Criado: {formatDateTime(item.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        <span className="text-xs">Enviado: {formatDateTime(item.sent_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}