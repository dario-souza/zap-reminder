import { memo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationCard } from './ConfirmationCard'
import { Plus, CheckCircle, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Confirmation } from '@/types'

interface ConfirmationListProps {
  confirmations: Confirmation[]
  onSendNow: (id: string) => void
  onDelete: (id: string) => void
  onDeleteAll: () => void
  isSendingNow: boolean
  onNewClick: () => void
}

export const ConfirmationList = memo(function ConfirmationList({
  confirmations,
  onSendNow,
  onDelete,
  onDeleteAll,
  isSendingNow,
  onNewClick,
}: ConfirmationListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'single' | 'all'
    confirmationId?: string
  }>({ open: false, type: 'single' })

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, type: 'single', confirmationId: id })
  }, [])

  const handleDeleteAllClick = useCallback(() => {
    setDeleteDialog({ open: true, type: 'all' })
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteDialog.type === 'single' && deleteDialog.confirmationId) {
      onDelete(deleteDialog.confirmationId)
    } else if (deleteDialog.type === 'all') {
      onDeleteAll()
    }
    setDeleteDialog({ open: false, type: 'single' })
  }, [deleteDialog, onDelete, onDeleteAll])

  const handleCancelDelete = useCallback(() => {
    setDeleteDialog({ open: false, type: 'single' })
  }, [])

  if (confirmations.length === 0) {
    return (
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Nenhuma confirmação encontrada
          </h3>
          <p className="text-slate-500 mb-4">
            Crie confirmações de presença para seus eventos.
          </p>
          <Button className="bg-green-500 hover:bg-green-600" onClick={onNewClick}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Confirmação
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Lista de Confirmações ({confirmations.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={handleDeleteAllClick}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {confirmations.map((conf) => (
              <ConfirmationCard
                key={conf.id}
                confirmation={conf}
                onSendNow={onSendNow}
                onDelete={handleDeleteClick}
                isSendingNow={isSendingNow}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {deleteDialog.type === 'all' ? 'Excluir Todas as Confirmações' : 'Excluir Confirmação'}
            </DialogTitle>
            <DialogDescription>
              {deleteDialog.type === 'all'
                ? `Tem certeza que deseja excluir as ${confirmations.length} confirmações? Esta ação não pode ser desfeita.`
                : 'Tem certeza que deseja excluir esta confirmação? Esta ação não pode ser desfeita.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})