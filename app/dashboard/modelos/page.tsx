'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2,
  Edit,
  Copy,
  Check
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTemplates } from '@/hooks'
import type { Template } from '@/types'

export default function ModelosPage() {
  const { templates, loading, create, update, remove } = useTemplates()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>('general')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const filteredTemplates = useMemo(() => {
    if (!searchTerm) return templates
    const term = searchTerm.toLowerCase()
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(term) ||
        template.body.toLowerCase().includes(term)
    )
  }, [templates, searchTerm])

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const handleCopyContent = (template: Template) => {
    navigator.clipboard.writeText(template.body)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return

    setIsSaving(true)
    try {
      if (editingTemplate) {
        await update(editingTemplate.id, {
          name: newTemplateName,
          body: newTemplateContent,
          category: newTemplateCategory,
        })
      } else {
        await create({
          name: newTemplateName,
          body: newTemplateContent,
          category: newTemplateCategory,
        })
      }
      setIsDialogOpen(false)
      setEditingTemplate(null)
      setNewTemplateName('')
      setNewTemplateContent('')
      setNewTemplateCategory('general')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setNewTemplateName(template.name)
    setNewTemplateContent(template.body)
    setNewTemplateCategory(template.category)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingTemplate(null)
      setNewTemplateName('')
      setNewTemplateContent('')
      setNewTemplateCategory('general')
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
          Modelos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Crie e gerencie modelos de mensagens.
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar modelos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600">
                <Plus className="w-5 h-5 mr-2" />
                Novo Modelo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Modelo' : 'Criar Novo Modelo'}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? 'Altere os dados do modelo abaixo'
                    : 'Crie um modelo de mensagem para reuse'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nome do Modelo
                  </label>
                  <Input
                    placeholder="Ex: saudacao, lembrete, confirmação..."
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Categoria
                  </label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value)}
                  >
                    <option value="general">Geral</option>
                    <option value="marketing">Marketing</option>
                    <option value="event">Evento</option>
                    <option value="reminder">Lembrete</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mensagem
                  </label>
                  <Textarea
                    placeholder="Escreva sua mensagem aqui... Use {{nome}} para variáveis."
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                    rows={6}
                    className="mt-1 resize-y"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {newTemplateContent.length}/1024 caracteres. Use {'{{nome}}'} para variáveis.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveTemplate}
                    disabled={!newTemplateName.trim() || !newTemplateContent.trim() || isSaving}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isSaving ? 'Salvando...' : editingTemplate ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Meus Modelos ({filteredTemplates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhum modelo encontrado
              </h3>
              <p className="text-slate-500 mb-4">
                Crie modelos de mensagens para reuse em seus envios.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Modelo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {template.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {template.category === 'general' ? 'Geral' : 
                         template.category === 'marketing' ? 'Marketing' :
                         template.category === 'event' ? 'Evento' : 'Lembrete'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {template.body}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Criado em {formatDate(template.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopyContent(template)}
                      title="Copiar conteúdo"
                    >
                      {copiedId === template.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(template)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={() => handleDelete(template.id)}
                      title="Excluir"
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
